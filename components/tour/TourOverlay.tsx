"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FADE_MS, RISE_PX, SLIDE_EASING, SLIDE_MS } from "@/lib/motion";
import { resolveCopy, type TourStep, type TourVariant } from "@/lib/tour";

/**
 * The tour's spotlight and popover.
 *
 * Spotlight is four dim panels framing the target rather than one overlay
 * with a cut-out. A box-shadow hole cannot catch clicks outside itself and a
 * clip-path hole needs `evenodd`, which is not dependable; four panels leave
 * a real gap, so the target stays fully visible AND clickable while every
 * click outside it lands on a panel instead of navigating the student away
 * mid-tour. Each panel is a plain div, so moving between steps is four
 * position transitions and nothing to go wrong.
 *
 * The target rect is re-measured every frame while the tour is open instead
 * of on scroll and resize listeners. The popover has to stay attached
 * through anything that moves its target — scrolling, a font finishing
 * loading, an image settling, the sticky header resizing — and enumerating
 * those events is how a popover ends up detached from the thing it is
 * explaining. State only updates when the numbers actually change, so an
 * idle tour re-renders zero times.
 */

const GAP = 12; // between target edge and popover
const MARGIN = 16; // minimum distance from the viewport edge
const WIDE = 300; // popover width where there is room
const NARROW_MAX = 420; // below this, stack vertically and go near-full-width
const PAD = 6; // how far the dim panels sit back from the target

type Placement = "bottom" | "top" | "right" | "left";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function sameRect(a: Rect | null, b: Rect | null): boolean {
  if (a === null || b === null) return a === b;
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

export default function TourOverlay({
  steps,
  index,
  variant,
  onNext,
  onBack,
  onSkip,
  onTargetLost,
}: {
  steps: TourStep[];
  index: number;
  variant: TourVariant;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onTargetLost: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  /**
   * The step the CARD is showing, which lags the step the SPOTLIGHT is on.
   *
   * The spec's sequence is: the old card fades out, the spotlight moves, the
   * new card fades in. Rendering the live index directly would swap the title
   * and body the instant Next was pressed — while the card is still at full
   * opacity on its way down — so the student reads a flash of the next step's
   * copy in the old step's position. Holding the old copy until the fade has
   * finished is what makes it one movement instead of two.
   */
  const [display, setDisplay] = useState(index);
  const [visible, setVisible] = useState(false);
  const step = steps[Math.min(display, steps.length - 1)];
  const liveTarget = steps[Math.min(index, steps.length - 1)].target;
  const [rect, setRect] = useState<Rect | null>(null);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
    placement: Placement;
    arrow: number;
  } | null>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<Rect | null>(null);

  // Scroll the target into view and measure it, in that order, synchronously
  // before the step's first paint.
  //
  // The order is the point. Scrolling from a passive effect and measuring
  // from a layout effect runs them the wrong way round — the measurement is
  // taken at the target's pre-scroll position, so the spotlight is placed
  // where the element used to be and only the rAF loop below drags it back.
  // On a visible tab that correction lands within a frame and looks like
  // nothing; it is still the spotlight being wrong first and right second.
  //
  // The scroll is instant, not smooth: a smooth scroll runs at the same time
  // as the spotlight's own 480ms move, and the two read as one laggy motion
  // rather than two deliberate ones.
  useLayoutEffect(() => {
    const el = document.querySelector<HTMLElement>(
      `[data-tour-id="${liveTarget}"]`,
    );
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "auto" });
    const r = el.getBoundingClientRect();
    const next: Rect = {
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    };
    if (!sameRect(rectRef.current, next)) {
      rectRef.current = next;
      setRect(next);
    }
  }, [liveTarget]);

  // Re-measure every frame; commit only on a real change. See the note above.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = document.querySelector<HTMLElement>(
        `[data-tour-id="${liveTarget}"]`,
      );
      if (!el) {
        onTargetLost();
        return;
      }
      const r = el.getBoundingClientRect();
      const next: Rect = {
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      };
      if (!sameRect(rectRef.current, next)) {
        rectRef.current = next;
        setRect(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [liveTarget, onTargetLost]);

  // Position the popover once its real size is known. Preference order is
  // below, above, right, left — below first because it keeps the popover out
  // of the way of a target the student has just been asked to look at. Under
  // NARROW_MAX the side placements are dropped entirely: at that width a card
  // beside its target leaves neither of them a readable amount of room.
  useLayoutEffect(() => {
    // Positioned against the DISPLAYED step's target, not the live one.
    // `rect` follows the spotlight, which moves the instant Next is pressed;
    // using it here would relocate the card while it is still showing the
    // previous step's words on its way out, so the student sees the old copy
    // jump. Reading the displayed step's own target keeps the card still
    // until its content has actually changed. `rect` stays in the deps so
    // scrolling and resizing still re-attach it.
    const anchor = document.querySelector<HTMLElement>(
      `[data-tour-id="${step.target}"]`,
    );
    if (!anchor || !popRef.current) return;
    const ar = anchor.getBoundingClientRect();
    const rect = {
      top: ar.top,
      left: ar.left,
      width: ar.width,
      height: ar.height,
    };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const narrow = vw < NARROW_MAX;
    const width = narrow ? Math.min(vw - MARGIN * 2, WIDE) : WIDE;
    const { height } = popRef.current.getBoundingClientRect();

    const clamp = (v: number, lo: number, hi: number) =>
      Math.max(lo, Math.min(v, hi));

    const fitsBelow = rect.top + rect.height + GAP + height <= vh - MARGIN;
    const fitsAbove = rect.top - GAP - height >= MARGIN;
    const fitsRight = !narrow && rect.left + rect.width + GAP + width <= vw - MARGIN;
    const fitsLeft = !narrow && rect.left - GAP - width >= MARGIN;

    const placement: Placement = fitsBelow
      ? "bottom"
      : fitsAbove
        ? "top"
        : fitsRight
          ? "right"
          : fitsLeft
            ? "left"
            : "bottom";

    let top: number;
    let left: number;
    if (placement === "bottom" || placement === "top") {
      top =
        placement === "bottom"
          ? rect.top + rect.height + GAP
          : rect.top - GAP - height;
      left = clamp(
        rect.left + rect.width / 2 - width / 2,
        MARGIN,
        Math.max(MARGIN, vw - width - MARGIN),
      );
    } else {
      left =
        placement === "right"
          ? rect.left + rect.width + GAP
          : rect.left - GAP - width;
      top = clamp(
        rect.top + rect.height / 2 - height / 2,
        MARGIN,
        Math.max(MARGIN, vh - height - MARGIN),
      );
    }
    // Last resort: a target taller than the viewport leaves no room either
    // side, and a popover half off-screen is worse than one overlapping.
    top = clamp(top, MARGIN, Math.max(MARGIN, vh - height - MARGIN));

    // The arrow tracks the target's centre along the popover's edge, so the
    // pairing stays readable even when the card had to be clamped sideways.
    const arrow =
      placement === "bottom" || placement === "top"
        ? clamp(rect.left + rect.width / 2 - left, 16, width - 16)
        : clamp(rect.top + rect.height / 2 - top, 16, height - 16);

    setPos({ top, left, width, placement, arrow });
  }, [rect, display, step.id, step.target]);

  // Fade the card out, let the spotlight travel, then swap the copy in.
  //
  // Timers rather than requestAnimationFrame, even though this drives an
  // animation. rAF does not fire in a hidden or backgrounded tab, and the
  // sequencing it was scheduling is what advances the card's CONTENT — so a
  // tour left in a background tab came back with the spotlight on step four
  // and the card still showing step one's words. The opacity it sets is
  // cosmetic and can afford to be paused; which step the card is on cannot.
  //
  // Every setState still runs inside a callback rather than the effect body,
  // so this remains animation sequencing rather than the render-cascade that
  // react-hooks/set-state-in-effect exists to catch.
  useEffect(() => {
    if (display === index) return;
    let swap = 0;
    const out = window.setTimeout(() => {
      setVisible(false);
      swap = window.setTimeout(
        () => setDisplay(index),
        reduced ? 0 : FADE_MS,
      );
    }, 0);
    return () => {
      clearTimeout(out);
      clearTimeout(swap);
    };
  }, [index, display, reduced]);

  // …and in, once the new copy is mounted and a position has been computed.
  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(id);
  }, [display]);

  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  /**
   * Escape closes; Tab stays inside the card.
   *
   * Without the trap a single Tab moved focus into the page behind the
   * spotlight — dimmed, non-interactive to the eye, and still focusable —
   * and the tour's own 上一步／下一步／跳過 were never reachable at all. A
   * tour that explains the interface while being unusable from the keyboard
   * is worse than no tour for the students who need it most.
   */
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
        return;
      }
      if (e.key !== "Tab") return;
      const card = popRef.current;
      if (!card) return;
      const focusables = Array.from(
        card.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ),
      ).filter((el) => el.getBoundingClientRect().width > 0);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      // Focus starts on the card itself, which is tabIndex -1 and so is not
      // in the list; from there Tab would leave the portal entirely.
      if (!active || !card.contains(active) || active === card) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onSkip],
  );

  // Give focus back to whatever opened the tour. Closing it left focus on a
  // card that no longer exists, which drops the caret to the top of the
  // document — a keyboard user who pressed the help control then had to tab
  // all the way back to where they were.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    return () => {
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Move focus to the card on every step so a keyboard user is reading the
  // step they are on, and Escape has somewhere to fire from.
  useEffect(() => {
    popRef.current?.focus({ preventScroll: true });
  }, [display]);

  if (typeof document === "undefined") return null;

  const dim = "rgba(11, 14, 17, 0.55)"; // --color-board at 55%
  const panelStyle = (s: React.CSSProperties): React.CSSProperties => ({
    position: "fixed",
    background: dim,
    ...(reduced
      ? {}
      : { transition: `all ${SLIDE_MS}ms ${SLIDE_EASING}` }),
    ...s,
  });

  const hole = rect
    ? {
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      aria-describedby="tour-body"
    >
      {hole && (
        <>
          <div style={panelStyle({ top: 0, left: 0, right: 0, height: Math.max(0, hole.top) })} />
          <div
            style={panelStyle({
              top: hole.top + hole.height,
              left: 0,
              right: 0,
              bottom: 0,
            })}
          />
          <div
            style={panelStyle({
              top: hole.top,
              left: 0,
              width: Math.max(0, hole.left),
              height: hole.height,
            })}
          />
          <div
            style={panelStyle({
              top: hole.top,
              left: hole.left + hole.width,
              right: 0,
              height: hole.height,
            })}
          />
          {/* Reinforces the cut-out using the same blue as the app's global
              focus ring, rather than introducing a colour for the tour. */}
          <div
            aria-hidden="true"
            style={panelStyle({
              top: hole.top,
              left: hole.left,
              width: hole.width,
              height: hole.height,
              background: "transparent",
              border: "2px solid var(--color-line-2)",
              borderRadius: 14,
              pointerEvents: "none",
            })}
          />
        </>
      )}

      <div
        ref={popRef}
        tabIndex={-1}
        className="fixed rounded-2xl border border-hairline bg-surface p-5 shadow-lg outline-none"
        style={{
          top: pos?.top ?? 0,
          left: pos?.left ?? 0,
          width: pos?.width ?? WIDE,
          zIndex: 1,
          opacity: pos && visible ? 1 : 0,
          transform:
            reduced || (pos && visible) ? "none" : `translateY(${RISE_PX}px)`,
          ...(reduced
            ? {}
            : {
                // Opacity and lift only. The card is at opacity 0 whenever
                // it moves between steps, so transitioning top/left animated
                // nothing a student can see — and on the very first render it
                // slid in from the corner, because the pre-positioned
                // fallback really is 0,0.
                transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
              }),
        }}
      >
        {pos && (
          <span
            aria-hidden="true"
            className="absolute h-3 w-3 rotate-45 border border-hairline bg-surface"
            style={
              pos.placement === "bottom"
                ? { top: -7, left: pos.arrow - 6, borderRight: "none", borderBottom: "none" }
                : pos.placement === "top"
                  ? { bottom: -7, left: pos.arrow - 6, borderLeft: "none", borderTop: "none" }
                  : pos.placement === "right"
                    ? { left: -7, top: pos.arrow - 6, borderRight: "none", borderTop: "none" }
                    : { right: -7, top: pos.arrow - 6, borderLeft: "none", borderBottom: "none" }
            }
          />
        )}

        <p
          id="tour-title"
          className="font-display text-base font-bold leading-snug"
        >
          {resolveCopy(step.title, variant)}
        </p>
        <p
          id="tour-body"
          className="mt-1.5 text-sm leading-relaxed text-ink-soft"
        >
          {resolveCopy(step.body, variant)}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5" aria-hidden="true">
            {steps.map((s, i) => (
              <span
                key={s.id}
                className="h-1.5 rounded-full"
                style={{
                  width: i === index ? 16 : 6,
                  background:
                    i === index ? "var(--color-ink)" : "var(--color-hairline)",
                  ...(reduced
                    ? {}
                    : { transition: `width ${FADE_MS}ms ease, background ${FADE_MS}ms ease` }),
                }}
              />
            ))}
          </span>
          <span className="sr-only" aria-live="polite">
            第 {index + 1} 步，共 {steps.length} 步
          </span>

          <span className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onSkip}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-faint transition-colors hover:text-ink"
            >
              跳過
            </button>
            {!isFirst && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-lg border border-hairline px-3 py-1.5 text-sm font-semibold transition-colors hover:border-ink"
              >
                上一步
              </button>
            )}
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg bg-ink px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {isLast ? "開始使用" : "下一步"}
            </button>
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

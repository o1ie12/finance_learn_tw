"use client";

/**
 * Full-screen train ride between stations (01-DESIGN-SYSTEM §7.3, matches
 * docs/design/Transition.dc.html).
 *
 * Every phase change, and the final onDone, comes from a setTimeout built
 * from lib/transitionTiming. CSS animations only paint what the current
 * phase says; nothing waits on an animation or paint callback, so the ride
 * completes in a background tab too. tests/transitionTiming.test.ts reads
 * this file and fails if a frame-callback or end-event API appears here.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import {
  transitionSchedule,
  type TransitionMode,
  type TransitionPhase,
} from "@/lib/transitionTiming";

import { createPortal } from "react-dom";

import "./train-transition.css";

export type TrainTransitionProps = {
  from: {
    lineColor: string;
    stationName: string;
    lineEnName: string;
    stationCode: string;
  };
  to: {
    lineName: string;
    lineColor: string;
    stationName: string;
    blurb: string;
  };
  /**
   * The student's character drawn from behind (hair covers the face). It is
   * laid out in a 120:175 box; an <svg> child is stretched to fill it.
   */
  character: ReactNode;
  /** Full rides already watched. At 3 or more the ride is a 400ms crossfade. */
  seenFullRides: number;
  /** Called exactly once: at the end, on 跳過, or on Escape. */
  onDone(): void;
  /** Called once, just before onDone, only when a full ride played to the end. */
  onFullRideComplete?(): void;
};

type View = { mode: TransitionMode | null; phase: TransitionPhase | "idle" };

// A typing user keeps their caret: we do not pull focus onto 跳過.
const NON_TEXT_INPUTS = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLTextAreaElement) return !el.readOnly && !el.disabled;
  if (el instanceof HTMLInputElement) {
    return !NON_TEXT_INPUTS.has(el.type) && !el.readOnly && !el.disabled;
  }
  return el instanceof HTMLElement && el.isContentEditable;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* Train art, in 1280x720 stage units (see --u in the CSS). */
const TRAIN_WINDOWS: { x: number; w: number }[] = [
  { x: 60, w: 150 },
  { x: 240, w: 150 },
  { x: 650, w: 150 },
  { x: 830, w: 150 },
  { x: 1010, w: 110 },
];

function u(n: number): string {
  return `calc(var(--u) * ${n})`;
}

export default function TrainTransition({
  from,
  to,
  character,
  seenFullRides,
  onDone,
  onFullRideComplete,
}: TrainTransitionProps) {
  const [view, setView] = useState<View>({ mode: null, phase: "idle" });
  const doneRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const skipRef = useRef<HTMLButtonElement>(null);
  const latest = useRef({ onDone, onFullRideComplete, seenFullRides });

  useEffect(() => {
    latest.current = { onDone, onFullRideComplete, seenFullRides };
  });

  const finish = useCallback((fullRide: boolean) => {
    if (doneRef.current) return;
    doneRef.current = true;
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    if (fullRide) latest.current.onFullRideComplete?.();
    latest.current.onDone();
  }, []);

  // The schedule is fixed at mount: a prop or media change mid-ride does
  // not restart it.
  useEffect(() => {
    if (doneRef.current) return;
    const schedule = transitionSchedule({
      reducedMotion: prefersReducedMotion(),
      seenFullRides: latest.current.seenFullRides,
    });
    const timers = schedule.steps.map((step) =>
      window.setTimeout(
        () => setView({ mode: schedule.mode, phase: step.phase }),
        step.atMs,
      ),
    );
    timers.push(
      window.setTimeout(
        () => finish(schedule.mode === "full"),
        schedule.doneAtMs,
      ),
    );
    timersRef.current = timers;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, [finish]);

  // Focus 跳過 so Enter or Space skips, unless the student is mid-typing.
  // Hand focus back to where it was if that element is still on the page.
  useEffect(() => {
    const previous = document.activeElement;
    if (isTypingTarget(previous)) return;
    skipRef.current?.focus({ preventScroll: true });
    return () => {
      if (previous instanceof HTMLElement && previous.isConnected) {
        previous.focus({ preventScroll: true });
      }
    };
  }, []);

  // A modal: while the ride plays, the page behind it is inert, so a screen
  // reader cannot wander into it. The overlay is portaled to <body> so it is
  // never inside the element made inert.
  useEffect(() => {
    const behind = [document.getElementById("content"), document.querySelector<HTMLElement>(".g-topbar")].filter(
      (el): el is HTMLElement => !!el,
    );
    const was = behind.map((el) => el.inert);
    behind.forEach((el) => {
      el.inert = true;
    });
    return () => {
      behind.forEach((el, i) => {
        el.inert = was[i];
      });
    };
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      finish(false);
    } else if (e.key === "Tab") {
      // 跳過 is the only control; keep focus inside the dialog.
      e.preventDefault();
      skipRef.current?.focus();
    }
  };

  const nextLine = `${to.lineName} · ${to.stationName}`;
  const vars = {
    "--tt-from-line": from.lineColor,
    "--tt-to-line": to.lineColor,
    "--tt-fade-ms":
      view.mode === "reduced" ? "120ms" : view.mode === "short" ? "400ms" : undefined,
  } as CSSProperties;

  const overlay = (
    <div
      className="tt-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="前往下一站"
      data-mode={view.mode ?? "pending"}
      data-phase={view.phase}
      style={vars}
      onKeyDown={onKeyDown}
    >
      <div className="tt-stage" aria-hidden="true">
        <div className="tt-tunnel" />

        <div className="tt-train">
          <div className="tt-train-body" />
          <div className="tt-train-stripe" />
          {TRAIN_WINDOWS.map((w) => (
            <div
              key={w.x}
              className="tt-train-window"
              style={{ left: u(w.x), width: u(w.w) }}
            />
          ))}
          <div className="tt-train-door" />
          <div className="tt-train-door-window" style={{ left: u(432) }} />
          <div className="tt-train-door-window" style={{ left: u(526) }} />
        </div>

        <div className="tt-speed tt-speed-1" />
        <div className="tt-speed tt-speed-2" />
        <div className="tt-speed tt-speed-3" />

        <div className="tt-glass tt-glass-l" />
        <div className="tt-glass tt-glass-r" />
        <div className="tt-door-header" />
        <div className="tt-door tt-door-l" />
        <div className="tt-door tt-door-r" />
        <div className="tt-door-label">往 {to.lineName}</div>

        <div className="tt-floor" />
        <div className="tt-edge" />

        <div className="tt-character">{character}</div>

        <div className="tt-sign">
          <span className="tt-sign-bar" />
          <span className="tt-sign-text">
            <span className="tt-sign-name">{from.stationName}</span>
            <span className="tt-sign-en">
              {from.lineEnName} · {from.stationCode}
            </span>
          </span>
          <span className="tt-sign-bar" />
        </div>
      </div>

      <div className="tt-card" aria-hidden="true">
        <span className="tt-card-label">下一站</span>
        <span className="tt-card-title">{nextLine}</span>
        <span className="tt-card-blurb">{to.blurb}</span>
      </div>

      <p className="tt-sr-only" aria-live="polite">
        {view.phase === "idle" ? "" : `下一站：${nextLine}。${to.blurb}`}
      </p>

      <button
        ref={skipRef}
        type="button"
        className="tt-skip"
        onClick={() => finish(false)}
      >
        跳過
      </button>
    </div>
  );
  // The ride only ever mounts after a click (never in a server render), so
  // <body> is there; the guard keeps a server render from crashing.
  return typeof document === "undefined" ? overlay : createPortal(overlay, document.body);
}

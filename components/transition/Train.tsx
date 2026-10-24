"use client";

/**
 * The train ride on the Part E design (06 E11): on the platform (E9.2) the
 * doors open, the character (from behind) walks in, the doors close, the
 * train leaves with a stripe in the destination line's color, and the
 * arrival card shows the destination's sign. Timing from lib/transitionTiming
 * (01 §7.3): every phase change and the end are setTimeouts, never a frame
 * or animation-end callback, so it finishes in a hidden tab too. 跳過 from
 * the first moment; after three full rides it is a 400ms crossfade, under
 * reduced motion a 120ms one. Nothing waits on it.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Character } from "@/components/art/Character";
import type { Look } from "@/components/art/look";
import { Scene } from "@/components/art/scenes";
import { Sign } from "@/components/ui/Bits";
import { transitionSchedule, type TransitionMode, type TransitionPhase } from "@/lib/transitionTiming";
import s from "./train.module.css";

export interface TrainProps {
  look: Look;
  to: { lineName: string; lineColor: string; stationName: string; blurb: string; signCode: string };
  seenFullRides: number;
  onDone(): void;
  onFullRideComplete?(): void;
}

type View = { mode: TransitionMode | null; phase: TransitionPhase | "idle" };

const reduced = () => typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Train({ look, to, seenFullRides, onDone, onFullRideComplete }: TrainProps) {
  const [view, setView] = useState<View>({ mode: null, phase: "idle" });
  const done = useRef(false);
  const timers = useRef<number[]>([]);
  const skip = useRef<HTMLButtonElement>(null);
  const latest = useRef({ onDone, onFullRideComplete, seenFullRides });
  useEffect(() => {
    latest.current = { onDone, onFullRideComplete, seenFullRides };
  });

  const finish = useCallback((full: boolean) => {
    if (done.current) return;
    done.current = true;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    if (full) latest.current.onFullRideComplete?.();
    latest.current.onDone();
  }, []);

  // Fixed at mount: a prop or media change mid-ride does not restart it.
  useEffect(() => {
    const schedule = transitionSchedule({ reducedMotion: reduced(), seenFullRides: latest.current.seenFullRides });
    const ts = schedule.steps.map((st) => window.setTimeout(() => setView({ mode: schedule.mode, phase: st.phase }), st.atMs));
    // The overlay stays up until the next page replaces it, so the arrival
    // card is still on screen while the station loads.
    ts.push(window.setTimeout(() => finish(schedule.mode === "full"), schedule.doneAtMs));
    timers.current = ts;
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, [finish]);

  // 跳過 takes focus; the screen behind is inert while the ride plays.
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    skip.current?.focus({ preventScroll: true });
    const shell = document.querySelector<HTMLElement>(".fl-shell");
    const behind = shell ? [...shell.children].filter((el): el is HTMLElement => el instanceof HTMLElement && !el.hasAttribute("data-train")) : [];
    const was = behind.map((el) => el.inert);
    behind.forEach((el) => (el.inert = true));
    return () => {
      behind.forEach((el, i) => (el.inert = was[i]));
      if (before?.isConnected) before.focus({ preventScroll: true });
    };
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      finish(false);
    } else if (e.key === "Tab") {
      e.preventDefault();
      skip.current?.focus();
    }
  };

  const overlay = (
    <div
      className={s.ride}
      data-train
      data-mode={view.mode ?? "pending"}
      data-phase={view.phase}
      role="dialog"
      aria-modal="true"
      aria-label={`前往 ${to.stationName}`}
      style={{ "--dest": to.lineColor } as CSSProperties}
      onKeyDown={onKeyDown}
    >
      <div className={s.stage} aria-hidden="true">
        <Scene kind="platform" className={s.scene} />
        <svg className={s.train} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" focusable="false">
          <defs>
            <clipPath id="tr-doorway">
              <rect x="139" y="278" width="112" height="150" rx="6" />
            </clipPath>
            <clipPath id="tr-tunnel">
              <rect x="0" y="266" width="390" height="174" />
            </clipPath>
          </defs>
          {/* The car, seen through the open doorway; it leaves to the left. */}
          <g clipPath="url(#tr-doorway)">
            <g className={s.car}>
              <rect x="60" y="282" width="270" height="150" rx="10" fill="#E9EEF2" />
              <rect x="78" y="300" width="50" height="48" rx="6" fill="#33414E" />
              <rect x="262" y="300" width="50" height="48" rx="6" fill="#33414E" />
              <rect x="160" y="296" width="70" height="136" rx="4" fill="#C9D2DA" />
              <rect x="168" y="306" width="24" height="46" rx="3" fill="#33414E" />
              <rect x="198" y="306" width="24" height="46" rx="3" fill="#33414E" />
              <rect x="60" y="376" width="270" height="12" fill="var(--dest)" />
            </g>
            <g className={s.speed}>
              <rect x="150" y="318" width="80" height="3" rx="1.5" fill="#fff" />
              <rect x="170" y="350" width="60" height="3" rx="1.5" fill="#fff" />
              <rect x="150" y="382" width="90" height="3" rx="1.5" fill="#fff" />
            </g>
          </g>
          {/* The platform doors slide 76 units outward. */}
          <g clipPath="url(#tr-tunnel)">
            <rect className={s.doorL} x="139" y="278" width="56" height="150" fill="#3A4A58" />
            <rect className={s.doorR} x="195" y="278" width="56" height="150" fill="#3A4A58" />
          </g>
        </svg>
        <div className={s.figure}>
          <Character look={look} facing="back" width={182} rim />
        </div>
      </div>

      <div className={s.card} aria-hidden={view.phase !== "card"}>
        <span className={s.cardLabel}>下一站</span>
        <Sign name={to.stationName} code={to.signCode} style={{ "--line": to.lineColor } as CSSProperties} />
        {to.blurb ? <span className={s.cardBlurb}>{to.blurb}</span> : null}
      </div>

      <p className="sr-only" aria-live="polite">
        {view.phase === "idle" ? "" : `前往 ${to.stationName}`}
      </p>
      <button ref={skip} type="button" className={s.skip} onClick={() => finish(false)}>
        跳過
      </button>
    </div>
  );
  // Inside the Part E shell, so its tokens (and dark mode) apply.
  const host = typeof document === "undefined" ? null : document.querySelector(".fl-shell");
  return host ? createPortal(overlay, host) : overlay;
}

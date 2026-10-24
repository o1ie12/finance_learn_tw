"use client";

/**
 * Starting a station (2026-10-24 redesign): the page blurs, a ticket gate
 * rises, the student swipes the 錢途 學習卡 onto the reader (or presses 直接感應),
 * it beeps, and an MRT car in the line's color crosses with 「出發囉！」; then
 * the station opens. With `gate={false}` it is only the car (after a month,
 * riding on to the next station). Every phase is a setTimeout, never an
 * animation event, so a hidden tab still finishes; 跳過 goes straight on;
 * reduced motion shows the car without the slide. Sound is a bonus, never the
 * only signal.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import s from "./metroRide.module.css";

type Phase = "gate" | "beep" | "car";

export interface MetroRideProps {
  /** The line's color, for the car's stripe and the reader's accent. */
  color: string;
  lineName: string;
  enName: string;
  /** Where the car is going, e.g. 卡片站 (CR02). */
  station: string;
  code: string;
  gate?: boolean;
  onDone(): void;
  onClose?(): void;
}

const CAR_MS = 2200;
/** Reduced motion, or the low-end flag (06 E17): the short, still version. */
const reduced = () =>
  document.documentElement.hasAttribute("data-lowend") ||
  (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

function beep() {
  try {
    const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const Ctx = W.AudioContext ?? W.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [0, 0.16].forEach((at) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = 1320;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.11);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + at);
      o.stop(ctx.currentTime + at + 0.12);
    });
  } catch {
    /* no sound is fine */
  }
}

export function MetroRide({ color, lineName, enName, station, code, gate = true, onDone, onClose }: MetroRideProps) {
  const [phase, setPhase] = useState<Phase>(gate ? "gate" : "car");
  const [drag, setDrag] = useState({ dx: 0, dy: 0, on: false });
  const start = useRef<{ x: number; y: number } | null>(null);
  const timers = useRef<number[]>([]);
  const done = useRef(false);
  const latest = useRef(onDone);
  useEffect(() => {
    latest.current = onDone;
  });

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    timers.current.forEach((t) => window.clearTimeout(t));
    latest.current();
  }, []);

  const ride = useCallback(() => {
    setPhase("car");
    timers.current.push(window.setTimeout(finish, reduced() ? 900 : CAR_MS));
  }, [finish]);

  // Without a gate the car leaves at once.
  useEffect(() => {
    if (!gate) timers.current.push(window.setTimeout(finish, reduced() ? 900 : CAR_MS));
    const ts = timers.current;
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, [gate, finish]);

  const tapIn = () => {
    if (phase !== "gate") return;
    beep();
    setDrag({ dx: 0, dy: 0, on: false });
    setPhase("beep");
    timers.current.push(window.setTimeout(ride, 650));
  };

  // The page behind is inert; Esc closes the gate (not the car).
  useEffect(() => {
    const host = document.querySelector<HTMLElement>(".fl-shell");
    const behind = host ? [...host.children].filter((el): el is HTMLElement => el instanceof HTMLElement && !el.hasAttribute("data-metro-ride")) : [];
    const was = behind.map((el) => el.inert);
    behind.forEach((el) => (el.inert = true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose && !done.current) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      behind.forEach((el, i) => (el.inert = was[i]));
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (phase !== "gate") return;
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag((d) => ({ ...d, on: true }));
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    setDrag({ dx: e.clientX - start.current.x, dy: e.clientY - start.current.y, on: true });
  };
  const up = () => {
    if (!start.current) return;
    start.current = null;
    if (drag.dx > 170 && Math.abs(drag.dy) < 160) tapIn();
    else setDrag({ dx: 0, dy: 0, on: false });
  };

  const through = phase !== "gate";
  const overlay = (
    <div className={s.ride} data-metro-ride role="dialog" aria-modal="true" aria-label={`前往 ${station}`} style={{ "--ride": color } as CSSProperties}>
      {onClose && phase === "gate" ? (
        <button type="button" className={s.close} onClick={onClose} aria-label="關閉">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ) : null}
      {phase === "car" ? (
        <button type="button" className={s.skip} onClick={finish}>
          跳過
        </button>
      ) : null}

      {phase !== "car" ? (
        <div className={s.gate}>
          <div className={s.gateHead}>
            <div>
              <div className={s.kicker}>
                {lineName} · {code} {station}
              </div>
              <h2 className={s.title}>{through ? "嗶！進站成功" : "刷卡進站"}</h2>
            </div>
            <span className={s.hint}>{through ? "列車進站中" : "拖曳卡片，或按直接感應"}</span>
          </div>
          <div className={s.stage}>
            {!through ? (
              <div className={s.swipe} aria-hidden="true">
                <span>滑動刷卡</span>
                <small>SWIPE TO BOARD</small>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            ) : null}
            <div className={s.reader} data-ok={through || undefined}>
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M8.5 16.5a6 6 0 0 0 0-9M12 19a9.5 9.5 0 0 0 0-14M15.5 21.5a13 13 0 0 0 0-19" />
              </svg>
              <span>{through ? "✓ 嗶！" : "感應區"}</span>
            </div>
            <div
              className={s.card}
              data-dragging={drag.on || undefined}
              data-through={through || undefined}
              style={drag.on ? { transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(-3deg)` } : undefined}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
            >
              <span className={s.cardStripe} aria-hidden="true" />
              <span className={s.cardName}>錢途 學習卡</span>
              <span className={s.cardSub}>FINLINE · STUDENT</span>
            </div>
          </div>
          <div className={s.gateFoot}>
            <span>把卡片拖到右邊的感應區</span>
            <button type="button" className={s.tap} onClick={tapIn} disabled={through}>
              直接感應
            </button>
          </div>
        </div>
      ) : (
        <div className={s.lane} aria-live="polite">
          <span className={s.streak} aria-hidden="true" />
          <span className={s.streak2} aria-hidden="true" />
          <div className={s.car}>
            <span className={s.carStripe} aria-hidden="true" />
            <span className={s.carSkirt} aria-hidden="true" />
            <span className={s.windows} aria-hidden="true">
              <i />
              <i />
              <b />
            </span>
            <span className={s.carText}>
              <small>
                {lineName} · {enName}
              </small>
              <strong>出發囉！</strong>
            </span>
            <span className={s.cab} aria-hidden="true" />
          </div>
          <p className="sr-only">
            前往 {station}，{code}
          </p>
        </div>
      )}
    </div>
  );
  const host = typeof document === "undefined" ? null : document.querySelector(".fl-shell");
  return host ? createPortal(overlay, host) : overlay;
}

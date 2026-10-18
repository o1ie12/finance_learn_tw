"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FLASH_MS, scheduleCount } from "./countSteps";
import { formatWith, type NumberFormat } from "./format";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** True when the viewer asked for reduced motion. False during SSR. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(REDUCED_QUERY).matches : false),
    () => false,
  );
}

type Flash = "gain" | "loss" | null;

export interface AnimatedNumberProps {
  value: number;
  /** A preset ("money" | "number" | "percent", default "money") or a formatter (client callers only). */
  format?: NumberFormat | ((n: number) => string);
  /** Flash --good-ink on gain, --bad on loss. Default true. */
  flash?: boolean;
  /** Spoken before the value, e.g. 現金, so the live text reads "現金 NT$12,000". */
  label?: string;
  /**
   * Own a polite live region. Default true. Pass false when a parent
   * announces one status line for several numbers (the play top bar).
   */
  live?: boolean;
  className?: string;
}

/**
 * A number that counts from its old value to the new one over 500ms
 * (01 §7.2) and flashes gain/loss color for 600ms.
 *
 * - Steps are scheduled with setTimeout, and a final timeout at 500ms always
 *   writes the exact value, so a hidden tab (where rAF never fires) still
 *   ends on the right number.
 * - Under prefers-reduced-motion the new value renders immediately (the
 *   color flash, which is not motion, stays).
 * - The visible digits are aria-hidden; screen readers get only the final
 *   value ("label value"), through a visually hidden span that is a polite
 *   live region unless `live={false}`.
 */
export function AnimatedNumber({ value, format = "money", flash = true, label, live = true, className }: AnimatedNumberProps) {
  const reduced = usePrefersReducedMotion();
  const [target, setTarget] = useState(value);
  const [shown, setShown] = useState(value);
  const [flashKind, setFlashKind] = useState<Flash>(null);
  const shownRef = useRef(value);

  // Adjust state while rendering when the prop changes (React's documented
  // pattern; avoids a setState inside the effect body).
  if (!Object.is(value, target)) {
    setTarget(value);
    if (flash) setFlashKind(value > target ? "gain" : "loss");
  }

  useEffect(() => {
    const from = shownRef.current;
    if (from === value) return;
    const cancelCount = scheduleCount(
      from,
      value,
      (n) => {
        shownRef.current = n;
        setShown(n);
      },
      { reduced },
    );
    const flashTimer = window.setTimeout(() => setFlashKind(null), FLASH_MS);
    return () => {
      cancelCount();
      window.clearTimeout(flashTimer);
    };
  }, [value, reduced]);

  const display = reduced ? value : shown;
  const classes = ["g-anim-num", flashKind && `g-anim-num--${flashKind}`, className].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      <span aria-hidden="true">{formatWith(format, display)}</span>
      <span className="sr-only" aria-live={live ? "polite" : undefined}>
        {label ? `${label} ${formatWith(format, value)}` : formatWith(format, value)}
      </span>
    </span>
  );
}

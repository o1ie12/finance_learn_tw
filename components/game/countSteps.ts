/**
 * The pure stepping logic behind AnimatedNumber (01 §7.2): count from the
 * old value to the new one over 500ms, flash for 600ms. Kept free of React
 * and the DOM so a fake-timer test can prove the final value lands exactly
 * at 500ms (tests/uiRules.test.ts).
 */

export const COUNT_MS = 500;
export const FLASH_MS = 600;
export const COUNT_STEPS = 12;

const easeOut = (t: number) => 1 - (1 - t) ** 3;

export interface CountStep {
  /** Milliseconds after the change. */
  at: number;
  value: number;
}

/**
 * The frames to show between `from` and `to`. The last frame is always the
 * exact target at COUNT_MS, so the number never rests on a rounded midpoint.
 */
export function countSteps(from: number, to: number, steps = COUNT_STEPS, durationMs = COUNT_MS): CountStep[] {
  if (Object.is(from, to)) return [];
  const whole = Number.isInteger(from) && Number.isInteger(to);
  const out: CountStep[] = [];
  for (let i = 1; i < steps; i++) {
    const n = from + (to - from) * easeOut(i / steps);
    out.push({ at: (durationMs * i) / steps, value: whole ? Math.round(n) : n });
  }
  out.push({ at: durationMs, value: to });
  return out;
}

interface TimerApi {
  setTimeout: (fn: () => void, ms: number) => unknown;
  clearTimeout: (id: never) => void;
}

/**
 * Schedule a count with plain timeouts (never requestAnimationFrame, which
 * a hidden tab never fires). `reduced` jumps straight to the target.
 * Returns a cancel function.
 */
export function scheduleCount(
  from: number,
  to: number,
  show: (n: number) => void,
  opts: { reduced?: boolean; timers?: TimerApi } = {},
): () => void {
  const timers: TimerApi = opts.timers ?? {
    setTimeout: (fn, ms) => globalThis.setTimeout(fn, ms),
    clearTimeout: (id) => globalThis.clearTimeout(id),
  };
  const frames = opts.reduced ? (Object.is(from, to) ? [] : [{ at: 0, value: to }]) : countSteps(from, to);
  const ids = frames.map((f) => timers.setTimeout(() => show(f.value), f.at));
  return () => ids.forEach((id) => timers.clearTimeout(id as never));
}

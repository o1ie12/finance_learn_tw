/**
 * Schedule for the train transition between stations (01-DESIGN-SYSTEM §7.3).
 *
 * Pure: no DOM, no timers. `<TrainTransition>` turns each step into a
 * setTimeout, so the transition finishes even in a hidden tab where the
 * browser has stopped painting. The CSS animation lengths in
 * components/transition/train-transition.css are written to land exactly on
 * the next step; change both together.
 */

export type TransitionMode = "full" | "short" | "reduced";

export type TransitionPhase =
  | "doorsOpen" // 0.0s  doors slide 76px outward, 600ms
  | "walkIn" // 0.5s    character walks into the door, 700ms ease-in
  | "doorsClose" // 1.2s doors close, 500ms
  | "depart" // 1.7s     train leaves, 900ms; speed lines fade in
  | "card"; // 2.3s      next-station card fades up, 300ms

export type TransitionStep = { atMs: number; phase: TransitionPhase };

export type TransitionSchedule = {
  mode: TransitionMode;
  steps: TransitionStep[];
  doneAtMs: number;
};

/** After this many full rides, later rides skip straight to the card. */
export const FULL_RIDES_BEFORE_SHORT = 3;

/** Full ride, total 2.6s. */
export const FULL_DONE_MS = 2600;
/** Crossfade to the card once the student has seen enough full rides. */
export const SHORT_DONE_MS = 400;
/** prefers-reduced-motion: fades become 120ms, nothing moves (01 §4). */
export const REDUCED_DONE_MS = 120;

const FULL_STEPS: readonly TransitionStep[] = [
  { atMs: 0, phase: "doorsOpen" },
  { atMs: 500, phase: "walkIn" },
  { atMs: 1200, phase: "doorsClose" },
  { atMs: 1700, phase: "depart" },
  { atMs: 2300, phase: "card" },
];

export function transitionSchedule(opts: {
  reducedMotion: boolean;
  seenFullRides: number;
}): TransitionSchedule {
  // Reduced motion wins over everything: no ride, however new the student.
  if (opts.reducedMotion) {
    return {
      mode: "reduced",
      steps: [{ atMs: 0, phase: "card" }],
      doneAtMs: REDUCED_DONE_MS,
    };
  }
  if (opts.seenFullRides >= FULL_RIDES_BEFORE_SHORT) {
    return {
      mode: "short",
      steps: [{ atMs: 0, phase: "card" }],
      doneAtMs: SHORT_DONE_MS,
    };
  }
  return {
    mode: "full",
    steps: FULL_STEPS.map((s) => ({ ...s })),
    doneAtMs: FULL_DONE_MS,
  };
}

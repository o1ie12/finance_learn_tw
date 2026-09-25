/**
 * The app's interactive-chrome motion language, in one place.
 *
 * The mode toggle established these values and the onboarding tour matches
 * them deliberately: two controls that both move things around the screen
 * should move at the same speed and on the same curve, or the app feels
 * like it was assembled from parts. Anything that animates in response to a
 * click — a thumb sliding, a spotlight moving to its next target — uses
 * these rather than picking its own.
 *
 * Not for content transitions (page loads, reveals), which are a different
 * problem with different timings.
 */

/** Travel time for a control that moves between two resting positions. */
export const SLIDE_MS = 480;

/**
 * iOS's standard easing: quick to commit, long gentle settle, no overshoot.
 * A plain ease reads mechanical next to it.
 */
export const SLIDE_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

/** Opacity-only fades. Short enough not to feel like a wait. */
export const FADE_MS = 180;

/**
 * How far a popover travels as it fades in. Small on purpose — this is an
 * orienting movement, not an entrance.
 */
export const RISE_PX = 10;

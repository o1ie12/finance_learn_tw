/**
 * The onboarding tour's content and identity.
 *
 * Steps anchor to elements by a stable attribute, never by coordinates: the
 * engine looks up `[data-tour-id="…"]` at runtime, so a visual redesign only
 * has to carry the same ids onto its new components and none of this changes.
 * That is the whole reason the targets are named constants — a typo between
 * the step list and the JSX would silently become a skipped step, and
 * TOUR_TARGETS makes both sides refer to the same string.
 *
 * One tour, not two. 學習 and 模擬 render the same RouteNetworkView with a
 * variant, so the anchor points exist in both. Copy is mode-aware only where
 * the underlying thing genuinely differs — what a "stop" is — and shared
 * everywhere else, because writing two versions of a sentence that describes
 * the same control is how the two drift apart.
 */

/**
 * Bumping this shows the tour again to students who have already seen it.
 * Compared against `tutorialSeenVersion` in the student profile, so changing
 * the tour's content never needs a migration — the stored number simply
 * falls behind the code's.
 */
export const CURRENT_TUTORIAL_VERSION = 2; // 2: the game home (character, today's stop, map)

/** Which destination is on screen. Mirrors RouteNetworkView's variant. */
export type TourVariant = "learn" | "simulate";

/** A string, or one per variant when the two genuinely differ. */
export type TourCopy = string | Record<TourVariant, string>;

export function resolveCopy(copy: TourCopy, variant: TourVariant): string {
  return typeof copy === "string" ? copy : copy[variant];
}

/**
 * The `data-tour-id` values, referenced by both the step list and the JSX
 * that carries the attribute.
 */
export const TOUR_TARGETS = {
  character: "character",
  modeToggle: "mode-toggle",
  routeMap: "route-map",
  nextCard: "next-card",
  stats: "stats",
  help: "help",
} as const;

export interface TourStep {
  id: string;
  /** The `data-tour-id` of the element this step points at. */
  target: string;
  title: TourCopy;
  body: TourCopy;
}

/**
 * The game home's three-step highlight (01 §6.3): your character, today's
 * stop, the map. The mode toggle and the replay control now live in the
 * settings menu, so they are no longer steps.
 */
export const TOUR_STEPS: TourStep[] = [
  {
    id: "character",
    target: TOUR_TARGETS.character,
    title: "這是你的角色",
    body: "角色的心情會跟著你的財務狀況變：有預備金就安心，卡債變多就緊張。和買了什麼無關。",
  },
  {
    id: "next",
    target: TOUR_TARGETS.nextCard,
    title: "今日一站",
    body: "每天一站，十幾分鐘。看懂、做一個任務，再回到你的人生遊戲過一個月。",
  },
  {
    id: "map",
    target: TOUR_TARGETS.routeMap,
    title: "路線圖",
    body: "十二條線就是你的世界。點一條線看它下一站在哪、會解鎖什麼。設定選單裡可以重看這段說明。",
  },
];

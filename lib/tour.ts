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
export const CURRENT_TUTORIAL_VERSION = 1;

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

export const TOUR_STEPS: TourStep[] = [
  {
    id: "mode",
    target: TOUR_TARGETS.modeToggle,
    title: "切換模式",
    body: "這是切換模式的地方。學習會帶你完整讀過內容再模擬；模擬讓你直接跳進去模擬，需要時再回來讀。",
  },
  {
    id: "map",
    target: TOUR_TARGETS.routeMap,
    title: { learn: "你的路線圖", simulate: "模擬列表" },
    body: {
      learn: "這是你的路線圖，每條線都有自己的站點，點進去就能開始。",
      simulate: "這裡列出每條線的模擬，點一個就直接開始。",
    },
  },
  {
    id: "next",
    target: TOUR_TARGETS.nextCard,
    title: "下一步",
    body: {
      learn: "這張卡片會告訴你下一步該做什麼，不用自己找進度。",
      simulate: "這張卡片會直接帶你到還沒完成的模擬。",
    },
  },
  {
    id: "stats",
    target: TOUR_TARGETS.stats,
    // Written as shared copy in the spec, split here because the 站完成 tile
    // genuinely is not rendered in 模擬 — the grid drops to two columns. A
    // student in 模擬 being told this row records their 站點 would look for
    // something that is not on the screen, which is the exact mismatch the
    // spec asks the step list to avoid.
    title: "你的進度",
    body: {
      learn: "這裡記錄你完成的站點、模擬，還有拿到的證書。",
      simulate: "這裡記錄你完成的模擬，還有拿到的證書。",
    },
  },
  {
    id: "help",
    target: TOUR_TARGETS.help,
    title: "隨時重看",
    body: "忘記了嗎？隨時點這裡重新看一次。",
  },
];

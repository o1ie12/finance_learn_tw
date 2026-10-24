import { moodFromStress, type Mood } from "@/components/art/look";
import type { EventResolution, PublicLifeState } from "@/lib/lifeGame/types";
import type { TurnView } from "@/lib/lifeGame/view";

/**
 * The character's mood during a turn (06 E10.4, E8.6): it follows the game,
 * never a button. An event's result decides first (insured → happy, a cost
 * of a month's living or more → stressed); then cash under one month of
 * bills → worried; else the stress level. Pure, from server numbers only.
 */
export function turnMood(
  state: PublicLifeState,
  view: TurnView,
  resolutions: EventResolution[] | null,
): Mood {
  if (resolutions?.length) {
    if (resolutions.some((r) => r.covered > 0)) return "happy";
    if (resolutions.some((r) => r.paid >= view.essentials && r.paid > 0)) return "stressed";
  }
  const base = moodFromStress(view.stress.level);
  if (base === "stressed") return base;
  if (state.accounts.cash < view.billsTotal) return "worried";
  return base;
}

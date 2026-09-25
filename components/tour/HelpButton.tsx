"use client";

import { useTour } from "@/components/tour/TourProvider";
import { TOUR_TARGETS } from "@/lib/tour";

/**
 * Replays the onboarding tour, from any page.
 *
 * Deliberately always available rather than only on a first visit: the tour
 * auto-shows once, and without a way back in, a student who skipped it or
 * forgot it has no route to the explanation at all. It is also the tour's
 * own last step, which is why it carries a tour id.
 *
 * Styled off the header's nav links — same rounding, same muted ink, same
 * hover wash — because this is header chrome, not a feature worth
 * announcing. Focus styling comes from the global focus-visible rule.
 */
export default function HelpButton({ signedIn }: { signedIn: boolean }) {
  const { start } = useTour();

  // A visitor has no destination to be toured around and no profile to
  // record having seen it, so the control would be a dead end for them.
  if (!signedIn) return null;

  return (
    <button
      type="button"
      onClick={start}
      data-tour-id={TOUR_TARGETS.help}
      aria-label="重新觀看導覽"
      title="重新觀看導覽"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-black/5 hover:text-ink"
    >
      <svg
        viewBox="0 0 20 20"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="7.6" />
        <path d="M7.9 7.7a2.2 2.2 0 1 1 2.6 2.5v1.2" />
        <circle cx="10.2" cy="14.3" r="0.55" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );
}

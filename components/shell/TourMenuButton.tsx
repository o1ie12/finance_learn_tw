"use client";

import { useTourOptional } from "@/components/tour/TourProvider";

/** 「看使用說明」 row in the game shell's settings menu: replays the tour. */
export default function TourMenuButton() {
  const tour = useTourOptional();
  // Outside the provider (should not happen: the root layout wraps every
  // route group), hide the row rather than break the page.
  if (!tour) return null;
  return (
    <button type="button" onClick={tour.start}>
      看使用說明
    </button>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useTour } from "@/components/tour/TourProvider";

/**
 * Opens the tour on a destination page, for the two reasons it should open
 * by itself: a student who has never seen this version, and a replay that
 * had to travel here from another page.
 *
 * Rendered by RouteNetworkView because that is where the student's profile
 * already is — no extra query, and no mirror cookie to keep in step with the
 * stored value.
 *
 * The `?tour=1` case exists because the help control sits in the header on
 * every page, while the tour's targets only exist on a destination. Pressing
 * it elsewhere routes here and hands the request over through the URL, which
 * survives the navigation without any shared client state. The parameter is
 * stripped immediately so a reload, a bookmark or a shared link does not
 * replay the tour forever.
 */
export default function TourAutoStart({
  seenVersion,
}: {
  seenVersion: number | undefined;
}) {
  const { start, autoStart } = useTour();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    if (params.get("tour") === "1") {
      params.delete("tour");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (qs ? `?${qs}` : ""),
      );
      start();
      return;
    }
    autoStart(seenVersion);
  }, [start, autoStart, seenVersion]);

  return null;
}

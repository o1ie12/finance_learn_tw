"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { StudentMode } from "@/lib/types";

/**
 * The persistent 學習 / 模擬 switch in the header.
 *
 * The lit segment is the student's STORED mode, read from the same
 * non-httpOnly mirror cookie the header uses for its logo link — not the
 * current route. Those can disagree: a sim_first student who clicks 我的進度
 * is looking at the dashboard while every line still behaves sim_first for
 * them. Lighting 學習 there would tell them something the rest of the app
 * contradicts the moment they open a line.
 *
 * Read after mount rather than during render, because the server has no
 * cookie access and would otherwise disagree with the client — the same
 * reason SiteHeader resolves its logo link this way. Until then the route is
 * a reasonable stand-in.
 *
 * Selecting a segment does two things in one action: persists the mode and
 * navigates. A student is not choosing a setting and then separately going
 * somewhere; those are the same intent.
 *
 * Deliberately never shows "sim_first" or "full" — that is system language.
 */

// Mirrors lib/session.ts MODE_COOKIE.
const MODE_COOKIE = "fs_mode";

// Thumb travel time. Also paced against the route change below, so the
// motion is not cut off mid-slide. Slow enough to read as a deliberate
// movement rather than a flash — at 300ms the slide and the page swap landed
// almost together and the whole thing blinked.
const SLIDE_MS = 480;

// 模擬 leads: it is the mode the product wants students in by default, and
// the left segment is the one read first and reached for first.
const SEGMENTS: Array<{ mode: StudentMode; label: string; href: string }> = [
  { mode: "sim_first", label: "模擬", href: "/simulate" },
  { mode: "full", label: "學習", href: "/dashboard" },
];

export default function ModeToggle({
  signedIn,
  placement = "header",
}: {
  signedIn: boolean;
  /**
   * "page" is the prominent one, rendered beside a page's own title where
   * there is room for it to be seen. "header" is the compact fallback for
   * every other route.
   *
   * The header copy hides itself on the two destinations, so exactly one
   * switcher is ever on screen — two would compete, and the page one wins
   * because it is where the eye already is.
   */
  placement?: "header" | "page";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState<StudentMode | null>(null);
  const [storedMode, setStoredMode] = useState<StudentMode | null>(null);

  useEffect(() => {
    const hit = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${MODE_COOKIE}=`));
    const v = hit?.slice(MODE_COOKIE.length + 1);
    if (v === "sim_first" || v === "full") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStoredMode(v);
    }
  }, [pathname]);

  // Landing on a destination some other way — the 我的進度 link, a bookmark,
  // a shared URL — makes the route and the stored mode disagree, and then the
  // toggle would show one thing while the lines behave like another. Writing
  // the route's mode once keeps a single truth. Only fires on a genuine
  // mismatch, so it is not a write per page view.
  useEffect(() => {
    if (placement !== "page") return;
    const onDest =
      pathname.startsWith("/simulate") || pathname.startsWith("/dashboard");
    if (!onDest) return;
    const routeIs: StudentMode = pathname.startsWith("/simulate")
      ? "sim_first"
      : "full";
    if (storedMode === null || storedMode === routeIs) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStoredMode(routeIs);
    void fetch("/api/mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: routeIs }),
    }).catch(() => undefined);
  }, [pathname, placement, storedMode]);

  // Only students have a mode to switch. Showing this to a visitor who cannot
  // persist a choice would be a control that silently does half of its job.
  if (!signedIn) return null;

  const isDestination =
    pathname.startsWith("/simulate") || pathname.startsWith("/dashboard");
  if (placement === "header" && isDestination) return null;

  const big = placement === "page";

  const routeMode: StudentMode = pathname.startsWith("/simulate")
    ? "sim_first"
    : "full";

  // On a destination page the route wins, and the stored mode is brought up
  // to match (see the reconcile effect). Arriving at 學習 by any means — the
  // 我的進度 link, a bookmark, a shared URL — is choosing 學習, so the thumb
  // should never sit on 模擬 while you are looking at the other page. On
  // every other route there is no page to contradict, so the stored value is
  // what to show.
  const activeMode = isDestination ? routeMode : (storedMode ?? routeMode);

  async function pick(mode: StudentMode, href: string) {
    if (busy) return;
    setBusy(mode);

    // Move the thumb first, on the click itself. Waiting for the network put
    // the slide ~250ms late and navigation then cut it off after about a
    // third of its travel — the control looked like it stuttered rather than
    // moved. Optimistic here is safe: the value is re-read from the database
    // on the next load, so a failed write self-corrects.
    setStoredMode(mode);

    // Fire and forget. Nothing on screen depends on the response, and a
    // failed write should not strand the student on the page they are
    // leaving.
    void fetch("/api/mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    }).catch(() => undefined);

    // Let the slide play before the route swap unmounts this component and
    // remounts it on the next page. Short enough to read as instant, long
    // enough that the motion is seen rather than implied.
    await new Promise((r) => setTimeout(r, SLIDE_MS * 0.75));

    // push only. router.refresh() here re-fetches the route being left and
    // races the navigation — the write landed but the page never changed.
    router.push(href);
    setBusy(null);
  }

  const activeIndex = SEGMENTS.findIndex((seg) => seg.mode === activeMode);

  // Filled track rather than a hairline outline, so this reads as a two-state
  // control rather than another pair of nav links — it sat beside 路線 /
  // 我的進度 in identical styling and disappeared into them.
  //
  // The white thumb is one element that slides, rather than a background that
  // appears on whichever button is active. That is the whole difference
  // between a control that snaps and one that feels physical: the eye tracks
  // a single object moving instead of one thing vanishing and another
  // appearing. Equal-width columns are what make the travel exactly one
  // segment, so the thumb lands flush without measuring anything at runtime.
  return (
    <div
      role="group"
      aria-label="學習方式"
      className="relative inline-grid w-auto shrink-0 grid-cols-2 self-start rounded-full bg-black/[0.06] p-1"
    >
      <span
        aria-hidden="true"
        className="absolute bottom-1 top-1 left-1 rounded-full bg-surface shadow-sm motion-reduce:transition-none"
        style={{
          width: "calc((100% - 0.5rem) / 2)",
          transform: `translateX(${activeIndex * 100}%)`,
          // iOS's standard easing: quick to commit, long gentle settle, no
          // overshoot. A plain ease reads mechanical next to it.
          transition: `transform ${SLIDE_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
        }}
      />
      {SEGMENTS.map((seg) => {
        const active = seg.mode === activeMode;
        return (
          <button
            key={seg.mode}
            type="button"
            onClick={() => pick(seg.mode, seg.href)}
            aria-pressed={active}
            disabled={busy !== null}
            className={`relative z-10 rounded-full font-semibold transition-[color,transform] duration-200 active:scale-[0.97] disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100 ${
              big
                ? "px-4 py-1.5 text-sm sm:px-6 sm:py-2 sm:text-base"
                : "px-3 py-1.5 text-sm sm:px-4"
            } ${active ? "text-ink" : "text-ink-soft hover:text-ink"}`}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}

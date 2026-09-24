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

const SEGMENTS: Array<{ mode: StudentMode; label: string; href: string }> = [
  { mode: "full", label: "學習", href: "/dashboard" },
  { mode: "sim_first", label: "模擬", href: "/simulate" },
];

export default function ModeToggle({ signedIn }: { signedIn: boolean }) {
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

  // Only students have a mode to switch. Showing this to a visitor who cannot
  // persist a choice would be a control that silently does half of its job.
  if (!signedIn) return null;

  const routeMode: StudentMode = pathname.startsWith("/simulate")
    ? "sim_first"
    : "full";
  const activeMode = storedMode ?? routeMode;

  async function pick(mode: StudentMode, href: string) {
    if (busy) return;
    setBusy(mode);
    try {
      // Navigate regardless of whether the write succeeds: failing to record
      // a preference should not strand the student on the page they were
      // trying to leave. The next load re-reads mode from the database.
      await fetch("/api/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      }).catch(() => undefined);
      setStoredMode(mode);
      // push only. router.refresh() here re-fetches the route being left and
      // races the navigation — the write landed but the page never changed.
      // Moving to a different route re-renders its server components anyway.
      router.push(href);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      role="group"
      aria-label="學習方式"
      className="flex shrink-0 items-center rounded-lg border border-hairline bg-surface p-0.5"
    >
      {SEGMENTS.map((seg) => {
        const active = seg.mode === activeMode;
        return (
          <button
            key={seg.mode}
            type="button"
            onClick={() => pick(seg.mode, seg.href)}
            aria-pressed={active}
            disabled={busy !== null}
            className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 sm:px-3 ${
              active
                ? "bg-ink text-white"
                : "text-ink-soft hover:bg-black/5 hover:text-ink"
            }`}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}

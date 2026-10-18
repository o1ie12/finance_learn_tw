"use client";

import Link from "next/link";
import { useState } from "react";
import { FloatCard } from "@/components/game/FloatCard";
import { LineChip } from "@/components/game/LineChip";
import { MiniMap, type MapLineStatus } from "@/components/game/MiniMap";
import type { LineSlug } from "@/lib/lines";

export interface RouteLine {
  slug: LineSlug;
  name: string;
  color: string;
  status: "done" | "inProgress" | "open";
  statusLabel: string;
  next: string;
  unlocks: string;
  href: string;
}

/**
 * 路線圖 card + line detail card (01 §6.1 right column). Picking a chip
 * highlights its line on the mini map and fills the detail card below.
 */
export function RoutePanel({
  lines,
  initial,
  current,
}: {
  lines: RouteLine[];
  initial: LineSlug | null;
  current: { line: LineSlug; station: number } | null;
}) {
  const [picked, setPicked] = useState<LineSlug>(initial ?? lines[0].slug);
  const sel = lines.find((l) => l.slug === picked) ?? lines[0];
  const statuses: Partial<Record<LineSlug, MapLineStatus>> = {};
  for (const l of lines) statuses[l.slug] = l.status === "done" ? "done" : l.status === "inProgress" ? "active" : "open";

  return (
    <>
      <FloatCard title="路線圖" aside={<span className="gh-muted">點一條線看詳情</span>} index={3}>
        <div data-tour-id="route-map">
          <MiniMap selected={picked} current={current} statuses={statuses} />
          <div className="g-linechips" role="group" aria-label="選一條線">
            {lines.map((l) => (
              <LineChip
                key={l.slug}
                line={{ name: l.name, color: l.color }}
                status={l.statusLabel}
                selected={l.slug === picked}
                onClick={() => setPicked(l.slug)}
              />
            ))}
          </div>
        </div>
      </FloatCard>
      <FloatCard as="section" titleAs="h3" index={4}>
        <div aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="gh-detail-head">
            <span className="gh-dot" style={{ background: sel.color }} aria-hidden="true" />
            <span className="gh-detail-name">{sel.name}</span>
            <span className="gh-detail-status">{sel.statusLabel}</span>
          </div>
          <p style={{ margin: 0, fontSize: 14 }}>{sel.next}</p>
          <p className="gh-muted">{sel.unlocks}</p>
          <div className="gh-links">
            <Link href={sel.href}>看全部站點</Link>
          </div>
        </div>
      </FloatCard>
    </>
  );
}

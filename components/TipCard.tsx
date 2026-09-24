import type { ReactNode } from "react";

/**
 * 先想一下 — a core station's key point, surfaced inside the simulation for
 * students in sim_first mode who have not read the stations.
 *
 * Deviates from the brief on one point. It specified a `--color-board`
 * background, but that token is the dark 情報站 split-flap block, and
 * components/lesson.tsx deliberately keeps its two callout styles distinct
 * ("常見錯誤 — deliberately lighter than 情報站 … so the two callout styles
 * stay visually distinct on the same page"). A third heavy dark block would
 * collide with the first. This uses the light left-border treatment the app
 * already applies to line-coloured asides, which keeps all three readable
 * together and matches the rest of the simulation screen.
 *
 * Never labelled "TIP".
 */
export default function TipCard({
  color,
  station,
  children,
}: {
  color: string;
  station?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded bg-surface px-4 py-3"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-ink-faint">
        先想一下{station ? ` · ${station}` : ""}
      </p>
      <div className="mt-1 text-[15px] leading-relaxed text-ink/90">
        {children}
      </div>
    </div>
  );
}

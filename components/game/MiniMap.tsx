import { LINES, type LineSlug } from "@/lib/lines";

/** How a line reads on the map. Locked lines are dashed with muted stations. */
export type MapLineStatus = "done" | "active" | "open" | "locked";

export interface MiniMapProps {
  /** Highlighted line: full opacity, others 0.3. Omit for all lines at full strength. */
  selected?: LineSlug | null;
  /** Where the character is: the line and the 1-based station number (stations include the line's terminal sim). */
  current?: { line: LineSlug; station: number } | null;
  /** Per-line status. Missing lines default to "open". */
  statuses?: Partial<Record<LineSlug, MapLineStatus>>;
  /** Accessible name. Default describes the current station. */
  label?: string;
  className?: string;
}

type Pt = readonly [number, number];

/**
 * Fixed schematic for the 320×200 viewBox: 消費線 runs east-west and 存錢線
 * north-south through the middle, 信用線 cuts the long diagonal, and the
 * other nine sit in the four quadrants. Not geography; it only has to be
 * stable so a student learns where "their" line lives.
 */
const GEOMETRY: Record<LineSlug, readonly Pt[]> = {
  qixin: [[16, 100], [304, 100]],
  cunqian: [[160, 14], [160, 186]],
  xinyong: [[44, 180], [208, 16], [244, 16]],
  zhiya: [[16, 24], [88, 24], [120, 56]],
  zuwu: [[16, 56], [60, 56], [96, 92]],
  xuedai: [[196, 56], [252, 56], [292, 16]],
  chuangye: [[184, 82], [264, 82], [296, 50]],
  touzi: [[176, 116], [220, 160], [304, 160]],
  baoshui: [[208, 128], [304, 128]],
  caiwujuece: [[176, 186], [304, 186]],
  zhapian: [[16, 132], [60, 132], [104, 176]],
  baoxian: [[76, 124], [136, 124], [136, 182]],
};

/** n evenly spaced points along a polyline, endpoints included. */
function stationPoints(points: readonly Pt[], n: number): Pt[] {
  if (n <= 1) return [points[0]];
  const segs = points.slice(1).map((p, i) => {
    const q = points[i];
    return { from: q, to: p, len: Math.hypot(p[0] - q[0], p[1] - q[1]) };
  });
  const total = segs.reduce((s, x) => s + x.len, 0);
  const out: Pt[] = [];
  for (let k = 0; k < n; k++) {
    let d = (total * k) / (n - 1);
    let i = 0;
    // The last segment absorbs any floating-point overshoot, so the final
    // station always lands on the polyline's end.
    while (i < segs.length - 1 && d > segs[i].len) {
      d -= segs[i].len;
      i++;
    }
    const seg = segs[i];
    const t = seg.len === 0 ? 0 : Math.min(1, d / seg.len);
    out.push([
      Math.round((seg.from[0] + (seg.to[0] - seg.from[0]) * t) * 10) / 10,
      Math.round((seg.from[1] + (seg.to[1] - seg.from[1]) * t) * 10) / 10,
    ]);
  }
  return out;
}

/** Mini route map of all 12 lines in their real colors (01 §5). */
export function MiniMap({ selected = null, current = null, statuses = {}, label, className }: MiniMapProps) {
  const lines = LINES.map((line) => {
    const pts = GEOMETRY[line.slug];
    return {
      line,
      pts,
      stations: stationPoints(pts, line.stationModules.length + 1),
      status: statuses[line.slug] ?? "open",
    };
  });
  // Selected line drawn last so it sits on top of crossings.
  const ordered = selected ? [...lines.filter((l) => l.line.slug !== selected), ...lines.filter((l) => l.line.slug === selected)] : lines;
  const opacityFor = (slug: LineSlug) => (selected == null || selected === slug ? 1 : 0.3);

  const currentLine = current ? lines.find((l) => l.line.slug === current.line) : undefined;
  const currentIdx = currentLine && current ? Math.max(0, Math.min(currentLine.stations.length - 1, current.station - 1)) : -1;
  const here = currentLine && currentIdx >= 0 ? currentLine.stations[currentIdx] : null;

  const selectedLine = selected ? lines.find((l) => l.line.slug === selected) : undefined;
  const ariaLabel =
    label ??
    [
      "迷你路線圖，共 12 條線",
      currentLine && current ? `目前在${currentLine.line.name}第 ${currentIdx + 1} 站` : null,
      selectedLine ? `正在看${selectedLine.line.name}` : null,
    ]
      .filter(Boolean)
      .join("。");

  // Train marker sits above the current station, kept inside the viewBox.
  const train = here ? { x: Math.max(2, Math.min(320 - 26, here[0] - 12)), y: here[1] - 26 < 2 ? here[1] + 10 : here[1] - 26 } : null;

  return (
    <svg
      viewBox="0 0 320 200"
      className={["g-minimap", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={ariaLabel}
    >
      {/* SVG art: literal colors allowed here (01 §5 note). */}
      <rect x="0" y="0" width="320" height="200" rx="12" style={{ fill: "var(--chip-off)" }} />
      {ordered.map(({ line, pts, status }) => (
        <polyline
          key={line.slug}
          className="g-minimap-line"
          points={pts.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke={line.color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={status === "locked" ? "2 9" : undefined}
          opacity={opacityFor(line.slug)}
        />
      ))}
      {ordered.map(({ line, stations, status }) => (
        <g key={line.slug} className="g-minimap-line" opacity={opacityFor(line.slug)}>
          {stations.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={4}
              style={{ fill: "var(--ink-inverse)", stroke: status === "locked" ? "var(--station-mullion)" : "var(--ink)" }}
              strokeWidth={2}
            />
          ))}
        </g>
      ))}
      {here && currentLine ? (
        <g>
          <circle cx={here[0]} cy={here[1]} r={8} strokeWidth={3} style={{ fill: "var(--ink-inverse)", stroke: "var(--ink)" }} />
          <circle cx={here[0]} cy={here[1]} r={3} fill={currentLine.line.color} />
        </g>
      ) : null}
      {train ? (
        <g>
          <rect x={train.x} y={train.y} width={24} height={16} rx={5} style={{ fill: "var(--ink)" }} />
          <rect x={train.x + 4} y={train.y + 3} width={7} height={6} rx={1.5} style={{ fill: "var(--ink-inverse)" }} />
          <rect x={train.x + 13} y={train.y + 3} width={7} height={6} rx={1.5} style={{ fill: "var(--ink-inverse)" }} />
          <rect x={train.x + 2} y={train.y + 12} width={20} height={2} rx={1} fill={currentLine?.line.color} />
        </g>
      ) : null}
    </svg>
  );
}

import Link from "next/link";
import type { RouteStation } from "@/components/RouteMap";
import type { LineMeta } from "@/lib/lines";

/**
 * The dashboard's schematic transit map: all four lines as colored tracks
 * bending out of a shared 起點 hub, stations as map nodes. Geometry is fixed
 * (a designed layout, not derived per student) — only each node's status/fill
 * changes with real progress. Pure CSS hover reveals station subtitles, so this
 * stays a server component (no client JS).
 *
 * Layout, coordinates, radii, and colors from the design handoff
 * (design_handoff_transit_dashboard). Node order per line matches
 * buildLineStations() output (station modules, then the terminal simulation).
 */

const W = 1280;
const H = 800;
const HUB = { x: 140, y: 440 };

type Side = "above" | "below" | "right";

const LAYOUT: Record<
  string,
  { d: string; nodes: { x: number; y: number; side: Side }[] }
> = {
  qixin: {
    d: "M140,440 L320,440 L500,260 L680,260 L820,200 L940,150",
    nodes: [
      { x: 500, y: 260, side: "above" },
      { x: 680, y: 260, side: "above" },
      { x: 940, y: 150, side: "right" },
    ],
  },
  cunqian: {
    d: "M140,440 L320,440 L500,620 L680,620 L900,660",
    nodes: [
      { x: 500, y: 620, side: "below" },
      { x: 900, y: 660, side: "right" },
    ],
  },
  xinyong: {
    d: "M140,440 L300,440 L300,560 L440,560 L740,340 L900,340",
    nodes: [
      { x: 440, y: 560, side: "below" },
      { x: 900, y: 340, side: "right" },
    ],
  },
  touzi: {
    d: "M140,440 L300,440 L300,320 L480,320 L740,540 L900,560",
    nodes: [
      { x: 480, y: 320, side: "below" },
      { x: 900, y: 560, side: "right" },
    ],
  },
};

function pct(v: number, total: number) {
  return `${((v / total) * 100).toFixed(2)}%`;
}

function labelTransform(side: Side) {
  if (side === "above") return "translate(-50%, -140%)";
  if (side === "below") return "translate(-50%, 26px)";
  return "translate(28px, -50%)"; // right
}

export interface MapLine {
  line: LineMeta;
  stations: RouteStation[]; // buildLineStations() output for this line
}

interface PlacedNode {
  key: string;
  x: number;
  y: number;
  side: Side;
  color: string;
  colorInk: string;
  station: RouteStation;
}

export default function TransitNetworkMap({ lines }: { lines: MapLine[] }) {
  const placed: PlacedNode[] = [];
  for (const { line, stations } of lines) {
    const layout = LAYOUT[line.slug];
    if (!layout) continue;
    layout.nodes.forEach((geo, i) => {
      const station = stations[i];
      if (!station) return;
      placed.push({
        key: station.key,
        x: geo.x,
        y: geo.y,
        side: geo.side,
        color: line.color,
        colorInk: line.colorInk,
        station,
      });
    });
  }

  return (
    <div className="rounded-[22px] border border-hairline bg-surface p-[22px]">
      {/* Header + progress pills (above the map) */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
        <p className="font-display text-[13px] font-bold uppercase tracking-[0.1em] text-ink-faint">
          路網地圖 · 滑過站名看內容
        </p>
        <ul className="flex flex-wrap gap-2">
          {lines.map(({ line, stations }) => {
            const done = stations.filter((s) => s.status === "done").length;
            return (
              <li
                key={line.slug}
                className="flex items-center gap-[7px] rounded-full bg-bg px-3 py-1.5"
              >
                <span
                  className="h-[9px] w-[9px] rounded-full"
                  style={{ background: line.color }}
                  aria-hidden="true"
                />
                <span className="font-display text-xs font-bold">
                  {line.name}
                </span>
                <span className="money text-[11px] text-ink-faint">
                  {done}/{stations.length} 站
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Map — scrolls horizontally on small screens to stay legible */}
      <div className="-mx-1 overflow-x-auto px-1">
        <div className="relative mx-auto aspect-[1280/800] w-full min-w-[620px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="absolute inset-0 h-full w-full"
            style={{ overflow: "visible" }}
            aria-hidden="true"
          >
            {lines.map(({ line }) => {
              const layout = LAYOUT[line.slug];
              if (!layout) return null;
              return (
                <path
                  key={line.slug}
                  d={layout.d}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* Hub */}
            <circle cx={HUB.x} cy={HUB.y} r={24} fill="#151a21" />
            <circle
              cx={HUB.x}
              cy={HUB.y}
              r={24}
              fill="none"
              stroke="#fff"
              strokeWidth={3}
            />

            {/* Station nodes */}
            {placed.map((n) => {
              const terminal = Boolean(n.station.terminal);
              const r = terminal ? 19 : 13;
              const status = n.station.status;
              const fill =
                status === "done"
                  ? n.color
                  : status === "current"
                    ? "#fff"
                    : "#f2f4f1";
              const stroke =
                status === "done"
                  ? "#fff"
                  : status === "current"
                    ? n.color
                    : "#e2e6df";
              const strokeWidth =
                status === "done" ? 3 : status === "current" ? 4 : 2;
              return (
                <g key={n.key} transform={`translate(${n.x},${n.y})`}>
                  {terminal && (
                    <circle
                      r={r + 6}
                      fill="none"
                      stroke={n.color}
                      strokeWidth={2}
                      opacity={0.5}
                    />
                  )}
                  {/* every node glows in its own line color */}
                  <circle r={r + 9} fill={n.color} opacity={0.14} />
                  {/* "you are here": a small train sits at the active node and
                      gently pings, so progress reads as motion, not just a dot */}
                  {status === "current" && (
                    <circle
                      className="mrt-node-ping"
                      r={r}
                      fill="none"
                      stroke={n.color}
                      strokeWidth={2}
                    />
                  )}
                  <circle
                    r={r}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                  />
                  {status === "done" && (
                    <path
                      d="M-5,0.5 L-1.5,4 L5.5,-4.5"
                      stroke="#fff"
                      strokeWidth={2.6}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  {status === "current" && (
                    <g aria-hidden="true">
                      <rect x={-5} y={-3.5} width={10} height={6.5} rx={2.5} fill={n.color} />
                      <rect x={-3} y={-1.8} width={2.6} height={2} rx={0.6} fill="#fff" />
                      <rect x={0.4} y={-1.8} width={2.6} height={2} rx={0.6} fill="#fff" />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hub label */}
          <div
            className="pointer-events-none absolute text-center"
            style={{
              left: pct(HUB.x, W),
              top: pct(HUB.y, H),
              transform: "translate(-50%, 30px)",
            }}
          >
            <span className="font-display text-[13px] font-bold">起點</span>
          </div>

          {/* Station labels — hover reveals the subtitle (pure CSS) */}
          {placed.map((n) => {
            const align = n.side === "right" ? "left" : "center";
            const status = n.station.status;
            const labelColor = status === "todo" ? undefined : n.colorInk;
            const inner = (
              <>
                <div
                  className="flex items-center gap-1.5"
                  style={{ justifyContent: align === "left" ? "flex-start" : "center" }}
                >
                  <span
                    className="font-display text-[13px] font-bold"
                    style={{ color: labelColor, whiteSpace: "nowrap" }}
                  >
                    {n.station.label}
                  </span>
                  {n.station.terminal && (
                    <span className="money rounded-full bg-bg px-1.5 py-0.5 text-[9px] font-bold text-ink-faint">
                      模擬
                    </span>
                  )}
                </div>
                <p
                  className="mt-[3px] text-[11px] text-ink-faint"
                  style={{ whiteSpace: "nowrap", textAlign: align }}
                >
                  {n.station.title}
                </p>
              </>
            );
            const style = {
              left: pct(n.x, W),
              top: pct(n.y, H),
              transform: labelTransform(n.side),
              textAlign: align,
            } as const;
            const cls =
              "group absolute block max-h-5 overflow-hidden rounded px-1 py-0.5 transition-[max-height] duration-200 ease-out hover:max-h-[60px] focus-visible:max-h-[60px]";
            return n.station.href ? (
              <Link key={n.key} href={n.station.href} className={cls} style={style}>
                {inner}
              </Link>
            ) : (
              <div key={n.key} className={cls} style={style}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

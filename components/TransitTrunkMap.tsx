"use client";

import { useState } from "react";
import Link from "next/link";
import type { RouteStation } from "@/components/RouteMap";
import type { LineMeta, LineSlug } from "@/lib/lines";

/**
 * The dedicated network map: two visible corridors leaving 起點 — an upper
 * trunk for the 4 original lines, a lower trunk for the 6 newer ones — each
 * splitting into its own lines at a branch point further out. Real transit
 * structure (shared corridors that split), not one hub with ten spokes.
 *
 * FAN_LENGTH (the diagonal segment out of each branch point) is longer than
 * the ~60px this was speced at. At 60px, adjacent lines' station rows
 * computed to overlap by up to 15 units once dot radii are accounted for —
 * measurable, not a style preference. 100px is the shortest length that
 * clears every adjacent pair (verified numerically, ~3 units of margin to
 * spare); dot radii below are also scaled down from the dashboard's old
 * single-hub map (19/13) to match this canvas being ~30% smaller (1000×600
 * vs 1400×1040), which was needed to hit that clearance at a sane length.
 */

const W = 1000;
const H = 600;
const ORIGIN = { x: 60, y: 300 };
const UPPER_BRANCH = { x: 180, y: 220 };
const LOWER_BRANCH = { x: 180, y: 380 };
const FAN_LENGTH = 100;
const STATION_SPACING = 130;
const TERMINAL_R = 11;
const STATION_R = 8;

interface LineSpec {
  slug: LineSlug;
  angleDeg: number; // negative fans up, positive fans down
  stationCount: number;
}

// Angle assignment exactly as speced: inner-to-outer angles, top-to-bottom
// in slug order, split across the two trunks.
const UPPER_SPEC: LineSpec[] = [
  { slug: "qixin", angleDeg: -35, stationCount: 3 },
  { slug: "cunqian", angleDeg: -12, stationCount: 3 },
  { slug: "xinyong", angleDeg: 12, stationCount: 3 },
  { slug: "touzi", angleDeg: 35, stationCount: 3 },
];
const LOWER_SPEC: LineSpec[] = [
  { slug: "zhapian", angleDeg: -50, stationCount: 6 },
  { slug: "xuedai", angleDeg: -30, stationCount: 6 },
  { slug: "baoshui", angleDeg: -10, stationCount: 6 },
  { slug: "zuwu", angleDeg: 10, stationCount: 6 },
  { slug: "baoxian", angleDeg: 30, stationCount: 6 },
  { slug: "chuangye", angleDeg: 50, stationCount: 6 },
];

interface LineGeometry {
  d: string;
  points: { x: number; y: number }[]; // one per station, in order
}

function buildGeometry(
  branch: { x: number; y: number },
  spec: LineSpec,
): LineGeometry {
  const rad = (spec.angleDeg * Math.PI) / 180;
  const bend = {
    x: branch.x + FAN_LENGTH * Math.cos(rad),
    y: branch.y + FAN_LENGTH * Math.sin(rad),
  };
  const bendX = Math.round(bend.x);
  const bendY = Math.round(bend.y);
  const points = Array.from({ length: spec.stationCount }, (_, i) => ({
    x: bendX + STATION_SPACING * (i + 1),
    y: bendY,
  }));
  const last = points[points.length - 1];
  const d = `M${ORIGIN.x},${ORIGIN.y} L${Math.round(branch.x)},${Math.round(branch.y)} L${bendX},${bendY} L${last.x},${last.y}`;
  return { d, points };
}

const GEOMETRY: Record<string, LineGeometry> = {};
for (const spec of UPPER_SPEC) GEOMETRY[spec.slug] = buildGeometry(UPPER_BRANCH, spec);
for (const spec of LOWER_SPEC) GEOMETRY[spec.slug] = buildGeometry(LOWER_BRANCH, spec);

export interface MapLine {
  line: LineMeta;
  stations: RouteStation[]; // buildLineStations() output for this line
}

function StationDot({ station, r }: { station: RouteStation; r: number }) {
  const status = station.status;
  const fill =
    status === "done" ? station.color : status === "current" ? "#fff" : "#f2f4f1";
  const stroke =
    status === "done" ? "#fff" : status === "current" ? station.color : "#e2e6df";
  const strokeWidth = status === "done" ? 2.5 : status === "current" ? 3 : 1.6;
  return (
    <>
      <circle r={r + 5} fill={station.color} opacity={0.14} />
      {status === "current" && (
        <circle
          className="mrt-node-ping"
          r={r}
          fill="none"
          stroke={station.color}
          strokeWidth={1.6}
        />
      )}
      <circle r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {status === "done" && (
        <path
          d="M-3.5,0.3 L-1,2.8 L4,-3.2"
          stroke="#fff"
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </>
  );
}

export default function TransitTrunkMap({ lines }: { lines: MapLine[] }) {
  const [expandedLineId, setExpandedLineId] = useState<string | null>(null);

  return (
    <div className="rounded-[22px] border border-hairline bg-surface p-[22px]">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
        <p className="font-display text-[13px] font-bold uppercase tracking-[0.1em] text-ink-faint">
          路網地圖 · 點一條線看站點
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
                <span className="font-display text-xs font-bold">{line.name}</span>
                <span className="money text-[11px] text-ink-faint">
                  {done}/{stations.length} 站
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="-mx-1 overflow-x-auto px-1">
        <div className="relative mx-auto aspect-[1000/600] w-full min-w-[720px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="absolute inset-0 h-full w-full"
            style={{ overflow: "visible" }}
            aria-hidden="true"
          >
            {/* Shared trunk corridors, drawn once beneath every line in a
                neutral tone, so the two corridors read as real structure
                even where the individual colored lines bundle together. */}
            <path
              d={`M${ORIGIN.x},${ORIGIN.y} L${UPPER_BRANCH.x},${UPPER_BRANCH.y}`}
              stroke="#d8dbdf"
              strokeWidth={10}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M${ORIGIN.x},${ORIGIN.y} L${LOWER_BRANCH.x},${LOWER_BRANCH.y}`}
              stroke="#d8dbdf"
              strokeWidth={10}
              strokeLinecap="round"
              fill="none"
            />
            <circle cx={ORIGIN.x} cy={ORIGIN.y} r={20} fill="#151a21" />
            <circle
              cx={ORIGIN.x}
              cy={ORIGIN.y}
              r={20}
              fill="none"
              stroke="#fff"
              strokeWidth={2.5}
            />

            {lines.map(({ line, stations }) => {
              const geo = GEOMETRY[line.slug];
              if (!geo) return null;
              const expanded = expandedLineId === line.slug;
              const dimmed = expandedLineId !== null && !expanded;
              return (
                <g
                  key={line.slug}
                  style={{ opacity: dimmed ? 0.4 : 1, transition: "opacity 150ms ease" }}
                >
                  {/* wide invisible hit-area so the line is easy to click;
                      the real stroke draws on top of it, unaffected */}
                  <path
                    d={geo.d}
                    stroke="transparent"
                    strokeWidth={22}
                    fill="none"
                    className="cursor-pointer"
                    onClick={() => setExpandedLineId(line.slug)}
                    aria-hidden="true"
                  />
                  <path
                    d={geo.d}
                    stroke={line.color}
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    style={{ pointerEvents: "none" }}
                  />
                  {geo.points.map((pt, i) => {
                    const station = stations[i];
                    if (!station) return null;
                    const r = station.terminal ? TERMINAL_R : STATION_R;
                    return (
                      <g key={station.key} transform={`translate(${pt.x},${pt.y})`}>
                        <StationDot station={station} r={r} />
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* Labels: terminal station name always shown; intermediate
              labels stay in the DOM but opacity:0 until their line is
              expanded, so they can fade in rather than pop. */}
          {lines.map(({ line, stations }) =>
            GEOMETRY[line.slug]
              ? GEOMETRY[line.slug].points.map((pt, i) => {
                  const station = stations[i];
                  if (!station) return null;
                  const left = `${(pt.x / W) * 100}%`;
                  const top = `${(pt.y / H) * 100}%`;

                  if (station.terminal) {
                    return (
                      <button
                        key={station.key}
                        type="button"
                        onClick={() =>
                          setExpandedLineId((prev) =>
                            prev === line.slug ? null : line.slug,
                          )
                        }
                        className="absolute whitespace-nowrap text-left"
                        style={{
                          left,
                          top,
                          transform: `translate(${TERMINAL_R + 8}px, -50%)`,
                          fontSize: 14,
                          fontWeight: 700,
                          color: line.colorInk,
                        }}
                      >
                        {station.label}
                      </button>
                    );
                  }

                  const expanded = expandedLineId === line.slug;
                  const style = {
                    left,
                    top,
                    transform: "translate(-50%, 14px)",
                    opacity: expanded ? 1 : 0,
                    transition: "opacity 150ms ease",
                    pointerEvents: expanded ? ("auto" as const) : ("none" as const),
                  };
                  const inner = (
                    <span
                      className="whitespace-nowrap text-[12px] font-semibold"
                      style={{ color: line.colorInk }}
                    >
                      {station.label}
                    </span>
                  );
                  return station.href ? (
                    <Link
                      key={station.key}
                      href={station.href}
                      className="absolute"
                      style={style}
                      tabIndex={expanded ? 0 : -1}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={station.key} className="absolute" style={style}>
                      {inner}
                    </div>
                  );
                })
              : null,
          )}
        </div>
      </div>
    </div>
  );
}

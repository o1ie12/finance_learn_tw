"use client";

import { useState } from "react";
import type { RouteStation } from "@/components/RouteMap";
import type { LineMeta } from "@/lib/lines";

/**
 * The dedicated network map, v2: two earlier attempts at drawing all 10
 * lines at once (a single-hub fan, then a trunk-and-branch layout) both
 * tested as visually tangled once real station counts and dot sizes were
 * on screen. This version doesn't try to solve that — it draws exactly one
 * line at a time. A single straight line has no crowding problem to solve,
 * at any station count, so there's no geometry to tune here.
 *
 * The legend/chip row already does the "see the whole system" job on its
 * own (10 color-coded chips, two rows); it's promoted to the primary
 * overview, with a selected-state border marking which line the render
 * area below is currently showing.
 */

const W = 1200;
const H = 200;
const ORIGIN = { x: 60, y: 100 };
const STATION_SPACING = 180;
const TERMINAL_R = 19;
const STATION_R = 13;
const FADE_MS = 150;

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
  const strokeWidth = status === "done" ? 3 : status === "current" ? 4 : 2;
  return (
    <>
      <circle r={r + 8} fill={station.color} opacity={0.14} />
      {status === "current" && (
        <circle
          className="mrt-node-ping"
          r={r}
          fill="none"
          stroke={station.color}
          strokeWidth={2}
        />
      )}
      <circle r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
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
    </>
  );
}

export default function SingleLineMap({
  lines,
  initialLineId,
}: {
  lines: MapLine[];
  initialLineId: string;
}) {
  const [displayedLineId, setDisplayedLineId] = useState(initialLineId);
  const [fading, setFading] = useState(false);

  function handleSelect(slug: string) {
    if (slug === displayedLineId || fading) return;
    setFading(true);
    setTimeout(() => {
      setDisplayedLineId(slug);
      // A frame needs to paint at opacity 0 with the *new* line already in
      // the DOM before flipping back to 1, or the fade-in never animates —
      // React batches the two setState calls otherwise.
      requestAnimationFrame(() => setFading(false));
    }, FADE_MS);
  }

  const current = lines.find((l) => l.line.slug === displayedLineId) ?? lines[0];
  const lastX = ORIGIN.x + STATION_SPACING * current.stations.length;

  return (
    <div className="rounded-[22px] border border-hairline bg-surface p-[22px]">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
        <p className="font-display text-[13px] font-bold uppercase tracking-[0.1em] text-ink-faint">
          路網地圖 · 點一條線看站點
        </p>
        <ul className="flex flex-wrap gap-2">
          {lines.map(({ line, stations }) => {
            const done = stations.filter((s) => s.status === "done").length;
            const selected = line.slug === displayedLineId;
            return (
              <li key={line.slug}>
                <button
                  type="button"
                  onClick={() => handleSelect(line.slug)}
                  aria-pressed={selected}
                  className="flex items-center gap-[7px] bg-bg"
                  style={
                    selected
                      ? {
                          border: `2px solid ${line.color}`,
                          borderRadius: 8,
                          padding: "3px 7px",
                        }
                      : {
                          border: "2px solid transparent",
                          borderRadius: 999,
                          padding: "5px 11px",
                        }
                  }
                >
                  <span
                    className="h-[9px] w-[9px] shrink-0 rounded-full"
                    style={{ background: line.color }}
                    aria-hidden="true"
                  />
                  <span className="font-display text-xs font-bold">{line.name}</span>
                  <span className="money text-[11px] text-ink-faint">
                    {done}/{stations.length} 站
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="-mx-1 overflow-x-auto px-1">
        <div
          className="relative mx-auto w-full min-w-[900px]"
          style={{
            aspectRatio: `${W} / ${H}`,
            opacity: fading ? 0 : 1,
            transition: `opacity ${FADE_MS}ms ease`,
          }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="absolute inset-0 h-full w-full"
            style={{ overflow: "visible" }}
            aria-hidden="true"
          >
            <path
              d={`M${ORIGIN.x},${ORIGIN.y} L${lastX},${ORIGIN.y}`}
              stroke={current.line.color}
              strokeWidth={6}
              strokeLinecap="round"
              fill="none"
            />

            <circle cx={ORIGIN.x} cy={ORIGIN.y} r={24} fill="#151a21" />
            <circle
              cx={ORIGIN.x}
              cy={ORIGIN.y}
              r={24}
              fill="none"
              stroke="#fff"
              strokeWidth={3}
            />

            {current.stations.map((station, i) => {
              const x = ORIGIN.x + STATION_SPACING * (i + 1);
              const r = station.terminal ? TERMINAL_R : STATION_R;
              return (
                <g key={station.key} transform={`translate(${x},${ORIGIN.y})`}>
                  <StationDot station={station} r={r} />
                </g>
              );
            })}
          </svg>

          {/* Origin label */}
          <div
            className="pointer-events-none absolute text-center"
            style={{
              left: `${(ORIGIN.x / W) * 100}%`,
              top: `${(ORIGIN.y / H) * 100}%`,
              transform: `translate(-50%, ${24 + 12}px)`,
            }}
          >
            <span className="font-display text-[13px] font-bold">起點</span>
          </div>

          {/* Station labels — always visible, directly below each dot */}
          {current.stations.map((station, i) => {
            const x = ORIGIN.x + STATION_SPACING * (i + 1);
            return (
              <div
                key={station.key}
                className="pointer-events-none absolute whitespace-nowrap text-center"
                style={{
                  left: `${(x / W) * 100}%`,
                  top: `${(ORIGIN.y / H) * 100}%`,
                  transform: `translate(-50%, ${TERMINAL_R + 12}px)`,
                }}
              >
                <span
                  className="text-[14px] font-bold"
                  style={{ color: station.status === "todo" ? undefined : station.colorInk }}
                >
                  {station.label}
                </span>
                {station.terminal && (
                  <span className="money ml-1.5 rounded-full bg-bg px-1.5 py-0.5 text-[9px] font-bold text-ink-faint">
                    模擬
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

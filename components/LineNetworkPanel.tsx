"use client";

import { useState } from "react";
import Link from "next/link";
import type { RouteStation } from "@/components/RouteMap";
import type { LineMeta } from "@/lib/lines";

/**
 * The dashboard's line map: chips pick a line, the single-line map and its
 * progress bar below show that one line only. Chips already give the "every
 * line at a glance" view (all 10, color-coded, two rows) — showing all 10
 * lines' progress bars underneath too was the same information twice, so
 * only the selected line's bar shows, changing together with the map.
 *
 * One shared `displayedLineId`: chips and station dots (click-through to
 * that station's course page) both read and write the same selection.
 */

const W = 1200;
const H = 200;
const ORIGIN = { x: 60, y: 100 };
const STATION_SPACING = 180;
const TERMINAL_R = 26;
const STATION_R = 18;
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
  const strokeWidth = status === "done" ? 3.5 : status === "current" ? 4.5 : 2.5;
  return (
    <>
      {status === "current" && (
        <circle
          className="mrt-node-ping"
          r={r}
          fill="none"
          stroke={station.color}
          strokeWidth={2.5}
        />
      )}
      <circle r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {status === "done" && (
        <path
          d="M-7,0.7 L-2,5.5 L7.5,-6"
          stroke="#fff"
          strokeWidth={3.4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </>
  );
}

export default function LineNetworkPanel({
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
  const done = current.stations.filter((s) => s.status === "done").length;
  const pct =
    current.stations.length > 0 ? Math.round((done / current.stations.length) * 100) : 0;

  return (
    <section className="rounded-[22px] border border-hairline bg-surface p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <p className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink-faint">
          路網地圖 · 點一條線看站點
        </p>
        <ul className="flex flex-wrap gap-2.5">
          {lines.map(({ line, stations }) => {
            const lineDone = stations.filter((s) => s.status === "done").length;
            const selected = line.slug === displayedLineId;
            return (
              <li key={line.slug}>
                <button
                  type="button"
                  onClick={() => handleSelect(line.slug)}
                  aria-pressed={selected}
                  className="flex items-center gap-2 bg-bg"
                  style={
                    selected
                      ? {
                          border: `2px solid ${line.color}`,
                          borderRadius: 8,
                          padding: "5px 10px",
                        }
                      : {
                          border: "2px solid transparent",
                          borderRadius: 999,
                          padding: "7px 14px",
                        }
                  }
                >
                  <span
                    className="h-[11px] w-[11px] shrink-0 rounded-full"
                    style={{ background: line.color }}
                    aria-hidden="true"
                  />
                  <span className="font-display text-sm font-bold">{line.name}</span>
                  <span className="money text-xs text-ink-faint">
                    {lineDone}/{stations.length} 站
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        style={{
          opacity: fading ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      >
        <div className="-mx-1 overflow-x-auto px-1">
          <div className="relative mx-auto w-full min-w-[900px]" style={{ aspectRatio: `${W} / ${H}` }}>
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

            {/* Stations: one click target per stop, sized well past the dot
                itself, that navigates to that station's course page. The
                box's top (not center) is anchored above the dot, with a
                same-height spacer standing in for the dot — centering the
                whole box instead put the label text over the dot itself. */}
            {current.stations.map((station, i) => {
              const x = ORIGIN.x + STATION_SPACING * (i + 1);
              const r = station.terminal ? TERMINAL_R : STATION_R;
              const dotClearance = r + 10; // half-height of the dot's hit region
              const label = (
                <>
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
                </>
              );
              const wrapperStyle = {
                left: `${(x / W) * 100}%`,
                top: `${(ORIGIN.y / H) * 100}%`,
                transform: `translate(-50%, -${dotClearance}px)`,
                width: r * 2 + 28,
              } as const;
              const spacer = (
                <span aria-hidden="true" style={{ display: "block", height: dotClearance * 2 }} />
              );
              return station.href ? (
                <Link
                  key={station.key}
                  href={station.href}
                  className="absolute flex flex-col items-center whitespace-nowrap text-center transition-opacity hover:opacity-70"
                  style={wrapperStyle}
                >
                  {spacer}
                  {label}
                </Link>
              ) : (
                <div
                  key={station.key}
                  className="pointer-events-none absolute flex flex-col items-center whitespace-nowrap text-center"
                  style={wrapperStyle}
                >
                  {spacer}
                  {label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Just the selected line's progress — the chips above already show
            every line's fraction, so repeating all 10 bars here would be
            the same information twice. */}
        <div
          className="mt-5 flex items-center gap-3 border-t border-hairline pt-4"
          style={{ padding: "12px 6px 0" }}
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: current.line.color }}
            aria-hidden="true"
          />
          <span className="w-[90px] shrink-0 text-sm font-semibold">{current.line.name}</span>
          <div
            className="relative h-2 flex-1 overflow-hidden rounded-full"
            style={{ background: "#E4E6E8" }}
          >
            <div
              className="absolute h-full rounded-full"
              style={{ width: `${pct}%`, background: current.line.color }}
            />
          </div>
          <span className="money w-[50px] shrink-0 text-right text-[13px]" style={{ color: "#565C63" }}>
            {done}/{current.stations.length}
          </span>
        </div>
      </div>
    </section>
  );
}

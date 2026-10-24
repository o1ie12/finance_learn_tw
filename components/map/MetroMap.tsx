"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/Sheet";
import s from "./map.module.css";

export interface MapStation {
  key: string;
  label: string;
  title: string;
  status: "done" | "current" | "todo";
  href?: string;
  terminal?: boolean;
  meta?: string;
}
export interface MapLine {
  slug: string;
  name: string;
  vars: CSSProperties;
  color: string;
  progress: string;
  stations: MapStation[];
}

const ROW = 52; // px between lines
const TOP = 34;
const HUB_X = 84; // the shared 起點 bar every line leaves from
const GAP = 38; // px between stations
const DOT = 10; // radius: a 20px dot

const STATUS_WORD: Record<MapStation["status"], string> = { done: "已完成", current: "從這裡繼續", todo: "還沒去" };

/**
 * 路線 (06 E8.7): the twelve lines as 6px strokes leaving one 起點 bar, a
 * 20px dot per station (done filled with a check, the one place to continue
 * ringed in --signal-deep, the rest open). Larger than the screen, it pans by drag; + / − zoom with
 * buttons (the gesture alternative, E14.7). A dot opens a sheet with the
 * station and 上車. The map is aria-hidden: the list under it is the
 * accessible version, a 44px row per line.
 */
export function MetroMap({ lines }: { lines: MapLine[] }) {
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState<string | null>(null);
  const [open, setOpen] = useState<{ line: MapLine; st: MapStation } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const most = Math.max(...lines.map((l) => l.stations.length));
  const width = HUB_X + 24 + most * GAP;
  const height = TOP * 2 + (lines.length - 1) * ROW;

  const pick = (slug: string) => {
    const next = focus === slug ? null : slug;
    setFocus(next);
    const i = lines.findIndex((l) => l.slug === slug);
    if (next && scroller.current) scroller.current.scrollTo({ top: Math.max((TOP + i * ROW) * zoom - 80, 0), behavior: "smooth" });
  };

  return (
    <div className={s.map}>
      <div ref={scroller} className={s.scroller}>
        <svg
          className={s.svg}
          width={width * zoom}
          height={height * zoom}
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
          focusable="false"
        >
          <rect x={HUB_X - 5} y={TOP - 14} width={10} height={height - TOP * 2 + 28} rx={5} className={s.hub} />
          {lines.map((l, i) => {
            const y = TOP + i * ROW;
            const dim = focus && focus !== l.slug;
            const endX = HUB_X + 24 + (l.stations.length - 1) * GAP;
            return (
              <g key={l.slug} opacity={dim ? 0.25 : 1} style={l.vars}>
                <text x={HUB_X - 14} y={y + 5} textAnchor="end" className={s.lineName}>
                  {l.name}
                </text>
                <path d={`M${HUB_X} ${y}H${endX}`} className={s.stroke} strokeWidth={6} strokeLinecap="round" />
                {l.stations.map((st, j) => {
                  const x = HUB_X + 24 + j * GAP;
                  return (
                    <g key={st.key} className={s.dot} onClick={() => setOpen({ line: l, st })}>
                      {st.status === "current" ? <circle cx={x} cy={y} r={DOT + 3} className={s.ring} /> : null}
                      <circle
                        cx={x}
                        cy={y}
                        r={st.terminal ? DOT + 1 : DOT}
                        className={st.status === "done" ? s.dotDone : s.dotOpen}
                        strokeWidth={3}
                      />
                      {st.status === "done" ? (
                        <path d={`M${x - 4.5} ${y + 0.5}l3 3 6-6.5`} fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                      ) : null}
                      {/* A 44px hit region around each 20px dot. */}
                      <rect x={x - GAP / 2} y={y - 22} width={GAP} height={44} fill="transparent" />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        <ul className={s.list} aria-label="12 條路線" data-list>
          {lines.map((l) => (
            <li key={l.slug} style={l.vars}>
              <Link href={`/line/${l.slug}`} className={s.listRow}>
                <span className={s.swatch} aria-hidden="true" />
                <span className={s.listName}>{l.name}</span>
                <span className={s.listMeta}>{l.progress}</span>
                <Icon name="chevron" size={20} />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={s.zoom}>
        <button type="button" className={s.zoomBtn} onClick={() => setZoom((z) => Math.min(z + 0.5, 2))} aria-label="放大地圖" disabled={zoom >= 2}>
          +
        </button>
        <button type="button" className={s.zoomBtn} onClick={() => setZoom((z) => Math.max(z - 0.5, 1))} aria-label="縮小地圖" disabled={zoom <= 1}>
          −
        </button>
      </div>

      <div className={s.chips} role="group" aria-label="聚焦一條線">
        {lines.map((l) => (
          <button
            key={l.slug}
            type="button"
            className={s.chip}
            style={l.vars}
            aria-pressed={focus === l.slug}
            onClick={() => pick(l.slug)}
          >
            {l.name}
          </button>
        ))}
      </div>

      {open ? (
        <Sheet label={open.st.label} onClose={() => setOpen(null)}>
          <div style={open.line.vars} className={s.sheet}>
            <p className={s.sheetLine}>
              {open.line.name} · {open.st.terminal ? "終點站" : "車站"}
            </p>
            <h2 className={s.sheetTitle}>{open.st.label}</h2>
            <p className={s.sheetBody}>{open.st.title}</p>
            <p className={s.sheetStatus}>
              {STATUS_WORD[open.st.status]}
              {open.st.meta ? ` · ${open.st.meta}` : ""}
            </p>
            {open.st.href ? <Button href={open.st.href}>上車</Button> : <p className={s.sheetBody}>這一站即將推出。</p>}
            <Button variant="secondary" onClick={() => setOpen(null)}>
              關閉
            </Button>
          </div>
        </Sheet>
      ) : null}
    </div>
  );
}

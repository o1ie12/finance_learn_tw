"use client";

import Link from "next/link";
import { useState } from "react";
import type { BoardLine } from "@/lib/routeBoard";
import { ZONES } from "@/content/zones";
import { Icon } from "@/components/ui/icons";
import s from "./today.module.css";

/**
 * 路線圖 on 今天 (2026-10-24 redesign): the lines the student is riding get
 * full rows with a progress bar (one segment per station); one line at a
 * time opens to show its stations as a metro strip; every other line is a
 * badge in its zone. Every line can be opened, so nothing is hidden.
 */
export function RouteBoard({ lines, stationsDone, linesDone }: { lines: BoardLine[]; stationsDone: number; linesDone: number }) {
  const riding = lines.filter((l) => l.started);
  const [open, setOpen] = useState<string | null>(riding[0]?.slug ?? null);
  const toggle = (slug: string) => setOpen((o) => (o === slug ? null : slug));
  const opened = lines.find((l) => l.slug === open) ?? null;
  const totalStations = lines.reduce((a, l) => a + l.total, 0);

  return (
    <section className={`${s.card} ${s.board}`} aria-labelledby="board-h">
      <div className={s.boardHead}>
        <div>
          <h2 id="board-h" className={s.h2}>路線圖</h2>
          <p className={s.sub}>正在搭的線在上面，其他路線分成四區。點任何一條線，看它的每一站。</p>
        </div>
        <div className={s.counts}>
          <span className={s.count}><b>{stationsDone}</b> / {totalStations} 站</span>
          <span className={s.count}><b>{linesDone}</b> / {lines.length} 條線</span>
        </div>
      </div>

      {riding.length ? (
        <div className={s.riding}>
          <div className={s.kicker}>正在搭</div>
          {riding.map((l) => (
            <button
              key={l.slug}
              type="button"
              className={s.ride}
              style={l.vars}
              aria-expanded={open === l.slug}
              aria-controls="open-line"
              data-open={open === l.slug || undefined}
              onClick={() => toggle(l.slug)}
            >
              <span className={s.badge} aria-hidden="true">{l.code}</span>
              <span className={s.rideName}>
                <span>{l.name}</span>
                <small>{l.next ? `下一站 ${l.next.name}` : `${l.total} 站`}</small>
              </span>
              <span className={s.segs} role="img" aria-label={`${l.name}：完成 ${l.done} / ${l.total} 站`}>
                {l.stations.map((st) => (
                  <span key={st.code} className={s.seg} data-state={st.status} />
                ))}
              </span>
              <span className={s.rideMeta}>{l.done} / {l.total}</span>
              <span className={s.chev} data-open={open === l.slug || undefined}>
                <Icon name="chevron" size={20} />
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {opened ? (
        <div id="open-line" className={s.openLine} style={opened.vars}>
          <div className={s.openHead}>
            <span className={s.badge} aria-hidden="true">{opened.code}</span>
            <span className={s.openName}>{opened.name}</span>
            <span className={s.sub}>{opened.total} 站 · 約 {opened.minutes} 分鐘</span>
          </div>
          <ol className={s.strip} style={{ "--n": opened.total } as React.CSSProperties}>
            <span className={s.stripTrack} aria-hidden="true" />
            <span
              className={s.stripDone}
              aria-hidden="true"
              style={{ width: `calc((100% - 100% / var(--n)) * ${opened.total > 1 ? Math.min(opened.done, opened.total - 1) / (opened.total - 1) : 0})` }}
            />
            {opened.stations.map((st) => (
              <li key={st.code}>
                <Link href={st.href ?? `/line/${opened.slug}`} className={s.stop} data-state={st.status} data-terminal={st.terminal || undefined}>
                  <span className={s.dot} aria-hidden="true" />
                  <span className={s.stopName}>{st.name}</span>
                  <span className={s.stopCode}>{st.code}</span>
                  <span className="sr-only">{st.status === "done" ? "，已完成" : st.status === "next" ? "，下一站" : st.terminal && st.scenario ? "，終點模擬" : ""}</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className={s.openFoot}>
            <span className={s.promise}>{opened.promise}</span>
            <span className={s.openActions}>
              <Link href={`/line/${opened.slug}`} className={s.ghostBtn}>課程頁</Link>
              <Link href={opened.next?.href ?? opened.stations[0]?.href ?? `/line/${opened.slug}`} className={s.inkBtn}>
                {opened.complete ? "再走一次" : opened.started && opened.next ? `上車：${opened.next.name}` : "從第一站出發"}
              </Link>
            </span>
          </div>
        </div>
      ) : null}

      <div className={s.zones}>
        {ZONES.map((z) => {
          const zl = z.lines.map((slug) => lines.find((l) => l.slug === slug)!).filter((l) => l && !l.started);
          if (!zl.length) return null;
          return (
            <div key={z.name} className={s.zone}>
              <div className={s.zoneHead}><span>{z.name}</span><small>{z.en}</small></div>
              {zl.map((l) => (
                <button key={l.slug} type="button" className={s.chipLine} style={l.vars} aria-pressed={open === l.slug} onClick={() => toggle(l.slug)}>
                  <span className={s.badge} aria-hidden="true">{l.complete ? "✓" : l.code}</span>
                  <span className={s.chipText}>
                    <span>{l.name}</span>
                    <small data-done={l.complete || undefined}>{l.complete ? "已完成" : `${l.total} 站 · ${l.minutes} 分鐘`}</small>
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

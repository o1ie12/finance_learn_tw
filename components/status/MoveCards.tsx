"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import s from "./moves.module.css";

export interface MoveCardData {
  id: string;
  name: string;
  does: string;
  risk: string;
}

/**
 * 06 E8.7 行動 (and the card row of E8.6): unlocked moves as a horizontal row,
 * 280px cards with 24px of the next one peeking, scroll-snap, dots under it
 * and ‹ › buttons (the swipe alternative). Locked moves collapse behind
 * 「還沒解鎖的 (N)」, a sheet listing each with its unlock rule.
 */
export function MoveCards({ cards, locked }: { cards: MoveCardData[]; locked: { name: string; rule: string }[] }) {
  const row = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const [open, setOpen] = useState(false);
  const go = (i: number) => {
    const el = row.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };
  return (
    <div className={s.wrap}>
      <div
        ref={row}
        className={s.row}
        onScroll={(e) => setAt(Math.round(e.currentTarget.scrollLeft / 292))}
        aria-label={`${cards.length} 張行動卡`}
        role="list"
      >
        {cards.map((c) => (
          <article key={c.id} className={s.card} role="listitem" aria-labelledby={`mv-${c.id}`}>
            <h2 id={`mv-${c.id}`} className={s.name}>
              {c.name}
            </h2>
            <p className={s.does}>{c.does}</p>
            <p className={s.risk}>
              <span className={s.riskLabel}>風險</span>
              {c.risk}
            </p>
          </article>
        ))}
      </div>
      <div className={s.nav}>
        <button type="button" className={s.navBtn} onClick={() => go(Math.max(at - 1, 0))} aria-label="上一張卡" disabled={at <= 0}>
          ‹
        </button>
        <span className={s.dots} aria-hidden="true">
          {cards.map((c, i) => (
            <span key={c.id} className={i === at ? s.dotOn : s.dot} />
          ))}
        </span>
        <span className="sr-only" aria-live="polite">
          第 {Math.min(at + 1, cards.length)} 張，共 {cards.length} 張
        </span>
        <button
          type="button"
          className={s.navBtn}
          onClick={() => go(Math.min(at + 1, cards.length - 1))}
          aria-label="下一張卡"
          disabled={at >= cards.length - 1}
        >
          ›
        </button>
      </div>
      {locked.length ? (
        <Button variant="secondary" onClick={() => setOpen(true)}>
          還沒解鎖的 ({locked.length})
        </Button>
      ) : null}
      {open ? (
        <Sheet label="還沒解鎖的行動" onClose={() => setOpen(false)}>
          <h2 className={s.sheetTitle}>還沒解鎖的行動</h2>
          <ul className={s.lockedList}>
            {locked.map((l) => (
              <li key={l.name}>
                <span className={s.lockedName}>{l.name}</span>
                <span className={s.lockedRule}>{l.rule}</span>
              </li>
            ))}
          </ul>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            關閉
          </Button>
        </Sheet>
      ) : null}
    </div>
  );
}

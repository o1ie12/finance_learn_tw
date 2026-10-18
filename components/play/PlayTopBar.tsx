"use client";

import { AnimatedNumber } from "@/components/game/AnimatedNumber";
import { nt, percent1, type KeyNumbers } from "./playModel";
import s from "./play.module.css";

/**
 * 01 §6.4 top bar: month counter, the four key numbers as pills, freedom %.
 * Numbers count old → new and flash gain/loss (AnimatedNumber, 01 §7.2).
 * The pills are not live regions: five of them talking at once on every
 * step is noise. PlayScreen announces one status line per step instead
 * (playStatusLine); each pill's hidden text still reads "label value" when
 * a screen reader walks the bar.
 */
export function PlayTopBar({ month, numbers, freedomPct }: { month: number; numbers: KeyNumbers; freedomPct: number }) {
  const pills: { label: string; value: number; debt?: boolean }[] = [
    { label: "現金", value: numbers.cash },
    { label: "存款", value: numbers.savings },
    { label: "投資", value: numbers.invest },
    { label: "負債", value: numbers.debt, debt: true },
  ];
  return (
    <div className={s.topbar}>
      <p className={`g-pill ${s.monthPill}`}>
        第 <AnimatedNumber value={month} format="number" flash={false} live={false} className={s.monthNum} /> 個月
      </p>
      {/* A list, not a <dl>: the visible label is aria-hidden and the number's
          hidden text says "現金 NT$…", so each pill is read once, in one go. */}
      <ul className={s.pills} aria-label="現在的錢">
        {pills.map((p) => (
          <li key={p.label} className={`g-pill ${s.pill} ${p.debt && p.value > 0 ? s.pillDebt : ""}`}>
            <span className={s.pillLabel} aria-hidden="true">
              {p.label}
            </span>
            <span className={s.pillValue}>
              {/* Debt going up is bad news: flip the flash so it reads as a loss. */}
              <AnimatedNumber value={p.debt ? -p.value : p.value} format={p.debt ? moneyAbs : nt} label={p.label} live={false} />
            </span>
          </li>
        ))}
      </ul>
      <p className={`g-pill ${s.freedomPill}`}>
        <span className={s.pillLabel} aria-hidden="true">
          財務自由
        </span>
        <AnimatedNumber value={freedomPct} format={percent1} label="財務自由" live={false} className={s.freedomNum} />
      </p>
    </div>
  );
}

function moneyAbs(n: number): string {
  return `NT$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
}

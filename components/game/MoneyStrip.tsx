"use client";

import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/game/AnimatedNumber";
import { FLASH_MS } from "@/components/game/countSteps";
import { ntSigned } from "@/components/play/playModel";
import s from "./turn.module.css";

/**
 * 06 E8.6: the 40px strip under the rail. Two numbers only, 現金 and
 * 緊急預備金 (months of expenses); the rest live in 狀態. Cash counts to its
 * new value over 500ms and shows the change with ▲ or ▼ and a sign for
 * 600ms (E7.15: never color alone); reduced motion shows the new value at
 * once (AnimatedNumber).
 */
export function MoneyStrip({ cash, efMonths }: { cash: number; efMonths: number }) {
  const [last, setLast] = useState(cash);
  const [change, setChange] = useState<number | null>(null);
  // Adjust state while rendering when the prop changes (React's documented pattern).
  if (cash !== last) {
    setLast(cash);
    setChange(cash - last);
  }
  useEffect(() => {
    if (change === null) return;
    const t = window.setTimeout(() => setChange(null), FLASH_MS);
    return () => window.clearTimeout(t);
  }, [change]);

  return (
    <dl className={s.strip}>
      <div>
        <dt>現金</dt>
        <dd>
          <AnimatedNumber value={cash} label="現金" live={false} className={s.cash} />
          {change ? (
            <span className={`${s.change} ${change > 0 ? s.up : s.down}`} aria-hidden="true">
              {change > 0 ? "▲" : "▼"} {ntSigned(change)}
            </span>
          ) : null}
        </dd>
      </div>
      <div>
        <dt>緊急預備金</dt>
        <dd>{(Math.floor(efMonths * 10) / 10).toFixed(1)} 個月</dd>
      </div>
    </dl>
  );
}

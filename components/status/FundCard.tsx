"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { nt } from "@/components/play/playModel";
import s from "./status.module.css";

/** Segments on the bar: one per month, up to six (02 §5 counts 3 to 6 months as safe). */
const SEGMENTS = 6;

/**
 * 06 E8.7: the 緊急預備金 card. Months of basic costs as a segmented bar and
 * in words; a tap opens a sheet with how the months are counted (05 A8.3).
 */
export function FundCard({
  months,
  fund,
}: {
  months: number;
  fund: { demand: number; deposits: number; cashOver: number; essentials: number } | null;
}) {
  const [open, setOpen] = useState(false);
  const shown = (Math.floor(months * 10) / 10).toFixed(1);
  return (
    <>
      <button type="button" className={`${s.card} ${s.fund}`} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className={s.cardLabel}>緊急預備金</span>
        <span className={s.fundValue}>{shown} 個月</span>
        <span className={s.bar} aria-hidden="true">
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span key={i} className={s.seg}>
              <span className={s.segFill} style={{ width: `${Math.min(Math.max(months - i, 0), 1) * 100}%` }} />
            </span>
          ))}
        </span>
        <span className={s.cardCaption}>能撐幾個月的基本開銷 · 看怎麼算</span>
      </button>
      {open ? (
        <Sheet label="緊急預備金怎麼算" onClose={() => setOpen(false)}>
          <h2 className={s.sheetTitle}>緊急預備金怎麼算</h2>
          {fund ? (
            <dl className={s.rows}>
              <div>
                <dt>活存</dt>
                <dd>{nt(fund.demand)}</dd>
              </div>
              <div>
                <dt>定存</dt>
                <dd>{nt(fund.deposits)}</dd>
              </div>
              <div>
                <dt>現金超過 NT$5,000 的部分</dt>
                <dd>{nt(fund.cashOver)}</dd>
              </div>
              <div>
                <dt>每月基本開銷</dt>
                <dd>{nt(fund.essentials)}</dd>
              </div>
            </dl>
          ) : null}
          <p className={s.sheetBody}>前三項加起來，除以每月基本開銷，就是能撐幾個月：{shown} 個月。至少 3 個月比較安心。</p>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            關閉
          </Button>
        </Sheet>
      ) : null}
    </>
  );
}

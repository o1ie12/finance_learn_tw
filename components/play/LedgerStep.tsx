"use client";

import { useState } from "react";
import Ledger, { type CellState } from "@/components/documents/Ledger";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import type { LedgerCells, PublicLifeState } from "@/lib/lifeGame/types";
import { LEDGER_ROWS, LEDGER_TRIES, eventText, nt, parseAmount } from "./playModel";
import { Actions, ErrorLine, Notice, Row, Rows, guard } from "./ui";
import s from "./play.module.css";

/**
 * Step 6 記帳 (02 §4.1), every 3rd turn. Seven blank cells; wrong ones turn
 * --bad-soft with the server's hint. Two tries, then the answers show (the
 * month summary renders them from history). Never blocks progress.
 */
export function LedgerStep({
  state,
  busy,
  error,
  onSubmit,
}: {
  state: PublicLifeState;
  busy: boolean;
  error: string | null;
  onSubmit: (cells: Partial<LedgerCells>, hints: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<number, string>>({});
  const p = state.pending;
  const checked = p.ledgerChecked;
  const triesLeft = LEDGER_TRIES - p.ledgerTries;

  const cellState: Record<number, CellState> = {};
  const hints: Record<number, string> = {};
  LEDGER_ROWS.forEach((r, i) => {
    const c = checked?.[r.key];
    if (!c) return;
    cellState[i] = c.ok ? "ok" : "wrong";
    if (!c.ok) hints[i] = c.hint;
  });

  const submit = () => {
    const cells: Partial<LedgerCells> = {};
    LEDGER_ROWS.forEach((r, i) => {
      const n = parseAmount(values[i] ?? "");
      if (n !== null) cells[r.key] = n;
    });
    const keyedHints: Record<string, string> = {};
    LEDGER_ROWS.forEach((r, i) => {
      if (hints[i]) keyedHints[r.key] = hints[i];
    });
    onSubmit(cells, keyedHints);
  };

  const filled = LEDGER_ROWS.filter((_, i) => (values[i] ?? "").trim() !== "").length;

  return (
    <div className={s.stepBody}>
      <h2 className="g-question" tabIndex={-1} data-step-heading>
        記帳時間
      </h2>
      <p className="g-body">每三個月記一次帳。看看這個月的紀錄，把記帳表填完。</p>

      <div className={s.ledgerLayout}>
        <section className={s.receipts} aria-label="這個月的紀錄">
          <h3 className="g-label">這個月的紀錄</h3>
          <Rows>
            {p.flows.netPay > 0 ? <Row label="實發薪水" value={nt(p.flows.netPay)} /> : null}
            {p.flows.otherIncome > 0 ? <Row label="其他收入" value={nt(p.flows.otherIncome)} /> : null}
            {p.flows.sideProfit !== 0 ? <Row label="副業盈虧" value={nt(p.flows.sideProfit)} /> : null}
            <Row label="月初先存" value={nt(p.savedFirst)} />
            {p.tookBackSaving > 0 ? <Row label="拿回來付帳單" value={nt(p.tookBackSaving)} /> : null}
            <Row label="帳單合計" value={nt(p.billsTotal)} />
            {p.resolved
              .filter((r) => r.paid > 0 || r.gain > 0)
              .map((r, i) => (
                <Row
                  key={`${r.id}-${i}`}
                  label={eventText(r.id).title}
                  value={r.gain > 0 ? `收到 ${nt(r.gain)}` : `付了 ${nt(r.paid)}`}
                />
              ))}
          </Rows>
          {p.notes.length ? (
            <ul className={s.notes}>
              {p.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          ) : null}
        </section>

        <div>
          <Ledger
            data={{ rows: LEDGER_ROWS.map((r) => ({ label: r.label, value: null })) }}
            inputs={{
              values,
              onChange: (i, v) => setValues((prev) => ({ ...prev, [i]: v })),
              cellState,
              hints,
            }}
          />
          <p className="g-caption">月底現金 = 月初現金 + 收入 − 存錢 − 帳單 − 行動 − 事件</p>
        </div>
      </div>

      {checked ? (
        <Notice tone="warn" live>
          有幾格不對，看看提示再算一次。還有 {triesLeft} 次機會，之後會公布答案。
        </Notice>
      ) : (
        <p className="g-caption">有 {LEDGER_TRIES} 次機會。記帳是練習，不影響你的人生。</p>
      )}
      <ErrorLine message={error} />
      <Actions>
        <PrimaryButton onClick={guard(busy || filled === 0, submit)} aria-disabled={(busy || filled === 0) || undefined} aria-busy={busy}>
          確定
        </PrimaryButton>
      </Actions>
    </div>
  );
}

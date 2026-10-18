"use client";

import Ledger, { type CellState } from "@/components/documents/Ledger";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import type { LedgerCells, TurnRecord } from "@/lib/lifeGame/types";
import { LEDGER_ROWS, eventText, nt, ntSigned, optionLabel, isChoice } from "./playModel";
import { Actions, Notice, Row, Rows, SecondaryButton } from "./ui";
import s from "./play.module.css";

export interface LedgerResult {
  submitted: Partial<LedgerCells>;
  /** Hints from the first wrong try, keyed by cell. */
  hints: Record<string, string>;
}

/**
 * The month's changes (01 §6.4 step 6, other turns), from the server's
 * record of the finished turn. On a ledger turn it also shows the answers.
 */
export function MonthSummary({
  record,
  ledger,
  onNext,
  ride,
}: {
  record: TurnRecord;
  ledger?: LedgerResult;
  onNext: () => void;
  /** Came from a station: offer the train to the next station first. */
  ride?: { onRide: () => void; nextLabel: string | null };
}) {
  const f = record.flows;
  const change = record.netWorthEnd - record.netWorthStart;
  const income = f.netPay + f.sideProfit + f.otherIncome;

  return (
    <div className={s.stepBody}>
      <h2 className="g-question" tabIndex={-1} data-step-heading>
        第 {record.turn + 1} 個月結束了
      </h2>

      <div className={s.bigChange}>
        <span className="g-label">淨資產</span>
        <span className={`g-hero-number ${change >= 0 ? s.tone_good : s.tone_bad}`}>{ntSigned(change)}</span>
        <span className="g-caption">
          {change >= 0 ? "增加" : "減少"}：{nt(record.netWorthStart)} → {nt(record.netWorthEnd)}
        </span>
      </div>

      <Rows label="這個月的錢">
        <Row label="收入" value={nt(income)} />
        <Row label="先存起來" value={nt(record.savedFirst - record.tookBackSaving)} />
        <Row label="花掉" value={nt(f.spending)} />
        {f.interest !== 0 ? <Row label="利息" value={ntSigned(f.interest)} /> : null}
        {f.dividends > 0 ? <Row label="配息" value={ntSigned(f.dividends)} /> : null}
        {f.marketChange !== 0 ? (
          <Row label="ETF 漲跌" value={ntSigned(f.marketChange)} tone={f.marketChange > 0 ? "good" : "bad"} />
        ) : null}
        {f.writeOffs > 0 ? <Row label="收不回來的錢" value={nt(f.writeOffs)} tone="bad" /> : null}
        {record.overdueCreated > 0 ? <Row label="新的欠款" value={nt(record.overdueCreated)} tone="bad" /> : null}
      </Rows>

      {record.events.length ? (
        <div>
          <h3 className="g-label">這個月的事件</h3>
          <ul className={s.notes}>
            {record.events.map((e, i) => {
              const label = isChoice(e.id) ? optionLabel(e.id, e.option) : null;
              return (
                <li key={`${e.id}-${i}`}>
                  {eventText(e.id).title}
                  {label ? `：${label}` : ""}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {record.notes.length ? (
        <ul className={s.notes}>
          {record.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      ) : null}

      {ledger ? <LedgerAnswers record={record} result={ledger} /> : null}

      {ride?.nextLabel ? <p className="g-caption">下一站：{ride.nextLabel}</p> : null}
      <Actions>
        {ride ? (
          <>
            <PrimaryButton onClick={ride.onRide}>搭車到下一站</PrimaryButton>
            <SecondaryButton onClick={onNext}>再玩一個月</SecondaryButton>
          </>
        ) : (
          <PrimaryButton onClick={onNext}>下個月</PrimaryButton>
        )}
      </Actions>
    </div>
  );
}

function LedgerAnswers({ record, result }: { record: TurnRecord; result: LedgerResult }) {
  const values: Record<number, string> = {};
  const cellState: Record<number, CellState> = {};
  const hints: Record<number, string> = {};
  let right = 0;
  LEDGER_ROWS.forEach((r, i) => {
    const typed = result.submitted[r.key];
    const answer = record.ledger[r.key];
    values[i] = typed === undefined ? "" : String(typed);
    if (typed === answer) {
      right++;
      cellState[i] = "ok";
    } else {
      cellState[i] = "wrong";
      hints[i] = `答案是 ${nt(answer)}。${result.hints[r.key] ?? ""}`;
    }
  });
  return (
    <section aria-label="記帳結果" className={s.stepBody}>
      {right === LEDGER_ROWS.length ? (
        <Notice tone="good">全部答對！你的帳記得很清楚。</Notice>
      ) : (
        <Notice tone="info">
          答對 {right} / {LEDGER_ROWS.length} 格。看看答案，下次記帳會更快。
        </Notice>
      )}
      <Ledger
        data={{ rows: LEDGER_ROWS.map((r) => ({ label: r.label, value: null })) }}
        inputs={{ values, cellState, hints, readOnly: true, onChange: () => {} }}
      />
    </section>
  );
}

/** After fast-forward: what the autopilot year did (02 §4). */
export function FastForwardSummary({
  records,
  wanted,
  onNext,
}: {
  records: TurnRecord[];
  wanted: number;
  onNext: () => void;
}) {
  if (!records.length) {
    return (
      <div className={s.stepBody}>
        <h2 className="g-question" tabIndex={-1} data-step-heading>
          快轉沒有開始
        </h2>
        <p className="g-body">現在的狀況不適合快轉，先自己過一個月吧。</p>
        <Actions>
          <PrimaryButton onClick={onNext}>回到這個月</PrimaryButton>
        </Actions>
      </div>
    );
  }
  const first = records[0];
  const last = records[records.length - 1];
  const sum = (pick: (r: TurnRecord) => number) => records.reduce((a, r) => a + pick(r), 0);
  const change = last.netWorthEnd - first.netWorthStart;
  const events = records.flatMap((r) => r.events.map((e) => ({ turn: r.turn, e })));

  return (
    <div className={s.stepBody}>
      <h2 className="g-question" tabIndex={-1} data-step-heading>
        快轉了 {records.length} 個月
      </h2>
      {records.length < wanted ? (
        <Notice tone="warn">壓力變高或出現欠款，快轉提早停下來了。接下來換你決定。</Notice>
      ) : null}
      <div className={s.bigChange}>
        <span className="g-label">淨資產</span>
        <span className={`g-hero-number ${change >= 0 ? s.tone_good : s.tone_bad}`}>{ntSigned(change)}</span>
        <span className="g-caption">
          {nt(first.netWorthStart)} → {nt(last.netWorthEnd)}
        </span>
      </div>
      <Rows label="這段時間的錢">
        <Row label="收入" value={nt(sum((r) => r.flows.netPay + r.flows.sideProfit + r.flows.otherIncome))} />
        <Row label="先存起來" value={nt(sum((r) => r.savedFirst - r.tookBackSaving))} />
        <Row label="花掉" value={nt(sum((r) => r.flows.spending))} />
        <Row label="利息和配息" value={nt(sum((r) => r.flows.interest + r.flows.dividends))} />
        {sum((r) => r.flows.marketChange) !== 0 ? (
          <Row label="ETF 漲跌" value={ntSigned(sum((r) => r.flows.marketChange))} />
        ) : null}
      </Rows>
      <div>
        <h3 className="g-label">這段時間的事件</h3>
        {events.length ? (
          <ul className={s.notes}>
            {events.map(({ turn, e }, i) => {
              const label = isChoice(e.id) ? optionLabel(e.id, e.option) : null;
              return (
                <li key={i}>
                  第 {turn + 1} 個月：{eventText(e.id).title}
                  {label ? `，自動選了「${label}」` : ""}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="g-caption">一整段都平安無事。</p>
        )}
      </div>
      <Actions>
        <PrimaryButton onClick={onNext}>回到這個月</PrimaryButton>
      </Actions>
    </div>
  );
}

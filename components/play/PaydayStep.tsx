"use client";

import { useState } from "react";
import Payslip from "@/components/documents/Payslip";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { FAST_FORWARD_TURNS } from "@/lib/lifeGame/constants";
import type { PublicLifeState } from "@/lib/lifeGame/types";
import type { TurnView } from "@/lib/lifeGame/view";
import { nt } from "./playModel";
import { Actions, ErrorLine, Notice, PlayIcon, SecondaryButton, focusStepHeading, guard } from "./ui";
import s from "./play.module.css";

/** Fictional employer for the payslip (00 rule 6; the document carries 名稱皆為虛構). */
const COMPANY = "青禾企業股份有限公司";

/** Step 1 發薪日: the payslip (or the unemployment benefit), then 「收下」. */
export function PaydayStep({
  state,
  view,
  busy,
  error,
  onCollect,
  onFastForward,
}: {
  state: PublicLifeState;
  view: TurnView;
  busy: boolean;
  error: string | null;
  onCollect: () => void;
  onFastForward: () => void;
}) {
  const [confirmFF, setConfirmFF] = useState(false);
  const canFF = state.unlocked.includes("fastForward");

  if (confirmFF) {
    return (
      <div className={s.stepBody}>
        <h2 className="g-question" tabIndex={-1} data-step-heading>
          快轉一年？
        </h2>
        <p className="g-body">
          快轉會用你現在的計畫，自動過 {FAST_FORWARD_TURNS} 個月：
        </p>
        <ul className={s.bullets}>
          <li>每個月先存 {nt(state.plan.saveFirst)}</li>
          {state.plan.etfMonthly > 0 ? <li>每個月定期定額 {nt(state.plan.etfMonthly)}</li> : null}
          {state.plan.givingMonthly > 0 ? <li>每個月固定助人 {nt(state.plan.givingMonthly)}</li> : null}
          <li>帳單照常繳，人生事件都選最安全的選項</li>
          <li>不用記帳</li>
        </ul>
        <Notice tone="info">壓力變高或出現欠款時，快轉會自動停下來，換你自己決定。</Notice>
        <ErrorLine message={error} />
        <Actions>
          <PrimaryButton onClick={guard(busy, onFastForward)} aria-disabled={busy || undefined} aria-busy={busy}>
            {busy ? "快轉中…" : "開始快轉"}
          </PrimaryButton>
          <SecondaryButton onClick={() => {
              setConfirmFF(false);
              focusStepHeading();
            }} disabled={busy}>
            先不要
          </SecondaryButton>
        </Actions>
      </div>
    );
  }

  return (
    <div className={s.stepBody}>
      <h2 className="g-question" tabIndex={-1} data-step-heading>
        發薪日到了
      </h2>
      <p className={s.jobLine}>
        你的工作：<strong>{state.job.title}</strong>
      </p>
      {state.job.source === "starter" ? (
        <p className="g-caption">這是系統隨機分配的工作。完成職涯線可以自己選。</p>
      ) : null}

      {view.payslip ? (
        <Payslip
          data={{
            company: COMPANY,
            month: `${view.calendarMonth} 月`,
            gross: view.payslip.gross,
            pensionRate: view.payslip.pensionRate,
          }}
        />
      ) : (
        <div className={s.benefit}>
          <p className="g-label">失業給付</p>
          <p className="g-card-number">{nt(view.unemploymentBenefit ?? 0)}</p>
          {/* 就業保險法 §16: 60% of the insured salary (lib/lifeGame/constants.ts UNEMPLOYMENT_RATE). */}
          <p className="g-caption">這個月沒有薪水。失業給付是投保薪資的 60%。</p>
        </div>
      )}

      {state.sideBusiness?.active ? (
        <p className="g-caption">副業這個月的盈虧，會在收下時一起算進來。</p>
      ) : null}
      {state.pending.notes.length > 0 ? (
        <ul className={s.notes}>
          {state.pending.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      ) : null}

      <ErrorLine message={error} />
      <Actions>
        <PrimaryButton onClick={guard(busy, onCollect)} aria-disabled={busy || undefined} aria-busy={busy}>
          收下
        </PrimaryButton>
        {canFF ? (
          <SecondaryButton onClick={() => {
              setConfirmFF(true);
              focusStepHeading();
            }} disabled={busy}>
            <PlayIcon name="forward" />
            快轉一年
          </SecondaryButton>
        ) : null}
      </Actions>
    </div>
  );
}

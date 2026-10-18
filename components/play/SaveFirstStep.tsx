"use client";

import { useId, useState } from "react";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import type { PublicLifeState } from "@/lib/lifeGame/types";
import type { TurnView } from "@/lib/lifeGame/view";
import { clamp, nt, parseAmount } from "./playModel";
import { Actions, ErrorLine, Notice, guard } from "./ui";
import s from "./play.module.css";

/**
 * Step 2 先存錢 (02 §4 step 2): saving comes before bills on purpose.
 * Live formula 收入 − 存錢 = 可以花的錢, then whether what is left covers
 * this month's bills. The subtraction is only a preview of what the student
 * typed; the server moves the money.
 */
export function SaveFirstStep({
  state,
  view,
  busy,
  error,
  onSave,
}: {
  state: PublicLifeState;
  view: TurnView;
  busy: boolean;
  error: string | null;
  onSave: (amount: number, remember: boolean) => void;
}) {
  const uid = useId();
  const cash = Math.max(state.accounts.cash, 0);
  const income = state.pending.ledger.income;
  const before = cash - income;
  const [text, setText] = useState(String(clamp(state.plan.saveFirst, 0, cash)));
  const [remember, setRemember] = useState(false);

  const parsed = parseAmount(text);
  const valid = parsed !== null && parsed >= 0 && parsed <= cash;
  const amount = valid ? parsed : clamp(parsed ?? 0, 0, cash);
  const spendable = income - amount;
  const left = cash - amount;
  const enough = left >= view.billsTotal;
  const step = cash >= 1000 ? 100 : 1;

  return (
    <div className={s.stepBody}>
      <h2 className="g-question" tabIndex={-1} data-step-heading>
        先存錢，再花錢
      </h2>
      <p className="g-body">薪水一進來，先決定要存多少。剩下的才拿去付帳單和生活。</p>

      <div className={s.saveControls}>
        <label htmlFor={`${uid}-range`} className="g-label">
          這個月先存
        </label>
        <input
          id={`${uid}-range`}
          type="range"
          min={0}
          max={cash}
          step={step}
          value={amount}
          onChange={(e) => setText(e.target.value)}
          className={s.range}
          aria-valuetext={nt(amount)}
        />
        <div className={s.moneyInput}>
          <span aria-hidden="true">NT$</span>
          <input
            id={`${uid}-num`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="這個月先存的金額（新台幣）"
            aria-invalid={!valid || undefined}
            aria-describedby={!valid ? `${uid}-err` : undefined}
          />
        </div>
        {!valid ? (
          <p id={`${uid}-err`} className={s.fieldError}>
            請填 0 到 {nt(cash)} 之間的整數。
          </p>
        ) : null}
        <p className="g-caption">你的計畫：每個月先存 {nt(state.plan.saveFirst)}</p>
      </div>

      <div className={s.formula}>
        <span className={s.formulaPart}>
          <span className="g-caption">收入</span>
          <span className={s.formulaNum}>{nt(income)}</span>
        </span>
        <span className={s.formulaOp}>
          <span aria-hidden="true">−</span>
          <span className="sr-only">減</span>
        </span>
        <span className={s.formulaPart}>
          <span className="g-caption">存錢</span>
          <span className={s.formulaNum}>{nt(amount)}</span>
        </span>
        <span className={s.formulaOp}>
          <span aria-hidden="true">=</span>
          <span className="sr-only">等於</span>
        </span>
        <span className={`${s.formulaPart} ${s.formulaResult}`}>
          <span className="g-caption">可以花的錢</span>
          <span className={s.formulaNum}>{nt(spendable)}</span>
        </span>
      </div>
      {before > 0 ? (
        <p className="g-caption">加上之前留下的現金 {nt(before)}，存完手上共有 {nt(left)}。</p>
      ) : null}

      {/* Announced only when 夠/不夠 flips, not on every arrow press. */}
      <p className="sr-only" role="status">
        {enough ? "夠付帳單" : "不夠付帳單"}
      </p>
      <div>
        <p className={s.billLine}>
          這個月的帳單：<strong className="g-num">{nt(view.billsTotal)}</strong>
        </p>
        {enough ? (
          <Notice tone="good">
            <strong>夠付帳單。</strong>繳完還剩 {nt(left - view.billsTotal)}。
          </Notice>
        ) : (
          <Notice tone="warn">
            <strong>不夠付帳單。</strong>還差 {nt(view.billsTotal - left)}。可以少存一點，或到帳單那一步再拿回來。
          </Notice>
        )}
      </div>

      <label className={s.check}>
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
        <span>以後每個月都存這麼多</span>
      </label>

      <ErrorLine message={error} />
      <Actions>
        <PrimaryButton onClick={guard(busy || !valid, () => onSave(amount, remember))} aria-disabled={(busy || !valid) || undefined} aria-busy={busy}>
          存起來
        </PrimaryButton>
      </Actions>
    </div>
  );
}

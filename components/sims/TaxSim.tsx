"use client";

import { useState } from "react";
import {
  TAX_CHARACTERS,
  PERSONAL_EXEMPTION,
  STANDARD_DEDUCTION,
  type CharacterId,
  type TaxOutcome,
} from "@/lib/sims/tax";
import { formatNT } from "@/components/Money";
import { Row, SelectCard, SubmitButton, OutcomeActions } from "@/components/sims/ui";
import { useSimRun } from "@/components/sims/useSimRun";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";
import type { OutcomeTitle } from "@/lib/outcomeTitle";

export default function TaxSim({ color }: { color: string }) {
  const [character, setCharacter] = useState<CharacterId>("mingming");
  const { submitting, error, result, submit, reset } = useSimRun<TaxOutcome>("baoshui");

  if (result) {
    return (
      <TaxOutcomeView
        outcome={result.outcome}
        color={color}
        onReset={reset}
        outcomeTitle={result.outcomeTitle}
        pointsAwarded={result.pointsAwarded}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm leading-relaxed text-ink-soft">
          選一位角色，幫他／她完成一份簡化版的綜合所得稅申報。免稅額 {formatNT(PERSONAL_EXEMPTION)}、
          標準扣除額 {formatNT(STANDARD_DEDUCTION)} 已經幫你算好，你只需要看結果。
        </p>
      </section>

      <fieldset>
        <legend className="text-xl font-bold">選一位角色</legend>
        <div className="mt-4 space-y-3">
          {TAX_CHARACTERS.map((c) => (
            <SelectCard
              key={c.id}
              name="character"
              selected={character === c.id}
              onSelect={() => setCharacter(c.id)}
              color={color}
              title={c.name}
              meta={`年收入 ${formatNT(c.annualIncome)}`}
              sub={c.role}
            />
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative" role="alert">
          {error}
        </p>
      )}

      <SubmitButton
        onClick={() => submit({ character })}
        disabled={false}
        submitting={submitting}
        idleLabel="送出申報"
        disabledLabel=""
      />
    </div>
  );
}

function TaxOutcomeView({
  outcome,
  color,
  onReset,
  outcomeTitle,
  pointsAwarded,
}: {
  outcome: TaxOutcome;
  color: string;
  onReset: () => void;
  outcomeTitle: OutcomeTitle | null;
  pointsAwarded: number;
}) {
  return (
    <div className="space-y-8">
      <PlatformPanel color={outcome.isRefund ? color : "#c8102e"} eyebrow={`${outcome.character.name} 的報稅結果`}>
        <h2 className="text-4xl font-black">
          {outcome.isRefund ? "退稅 " : "補稅 "}
          <span className="money">{formatNT(Math.abs(outcome.balance))}</span>
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-white/85">
          {outcome.isRefund
            ? `${outcome.character.name}全年扣繳了 ${formatNT(outcome.withheld)}，比實際應繳的稅多，多繳的部分會退回來。`
            : `${outcome.character.name}全年只扣繳了 ${formatNT(outcome.withheld)}，比實際應繳的稅少，差額要在申報時補上。`}
        </p>
        <StampReveal outcomeTitle={outcomeTitle} pointsAwarded={pointsAwarded} />
      </PlatformPanel>

      <section aria-labelledby="calc-heading">
        <h3 id="calc-heading" className="text-lg font-bold">
          稅是怎麼算出來的？
        </h3>
        <dl className="mt-3 rounded-2xl border border-hairline bg-surface px-5 py-3">
          <Row label="年收入" value={outcome.character.annualIncome} />
          <Row label="免稅額" value={PERSONAL_EXEMPTION} sign="minus" />
          <Row label="標準扣除額" value={STANDARD_DEDUCTION} sign="minus" />
          <Row label="薪資所得特別扣除額" value={outcome.salaryDeduction} sign="minus" />
          <div className="border-t border-hairline" />
          <Row label="綜合所得淨額" value={outcome.netIncome} strong />
          <Row
            label={`應納稅額（適用稅率 ${(outcome.bracketRate * 100).toFixed(0)}%）`}
            value={outcome.taxOwed}
            strong
          />
        </dl>
      </section>

      <section aria-labelledby="balance-heading">
        <h3 id="balance-heading" className="text-lg font-bold">
          跟已經扣繳的稅一比較
        </h3>
        <dl className="mt-3 rounded-2xl border border-hairline bg-surface px-5 py-3">
          <Row label="應納稅額" value={outcome.taxOwed} />
          <Row label="全年已扣繳" value={outcome.withheld} sign="minus" />
          <div className="border-t border-hairline" />
          <Row
            label={outcome.isRefund ? "可退稅金額" : "需補繳金額"}
            value={Math.abs(outcome.balance)}
            strong
            tone={outcome.isRefund ? "positive" : "negative"}
          />
        </dl>
      </section>

      <p className="rounded-lg bg-line-1/10 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        ⚠️ 免稅額、扣除額與稅率級距為教學用途的示意數字，實際申報請以財政部最新公告的申報年度資料為準。
      </p>

      <OutcomeActions onReset={onReset} resetLabel="換一位角色再試一次" />
    </div>
  );
}

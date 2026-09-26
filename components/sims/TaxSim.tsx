"use client";

import { useMemo, useState } from "react";
import {
  TAX_CHARACTERS,
  TAX_YEAR,
  DEDUCTION_OPTIONS,
  METHOD_OPTIONS,
  payslipFor,
  payslipChoices,
  type CharacterId,
  type TaxMethod,
  type TaxFilingOutcome,
} from "@/lib/sims/taxFiling";
import { formatNT } from "@/components/Money";
import { Row, SelectCard, SubmitButton, OutcomeActions } from "@/components/sims/ui";
import { useSimRun } from "@/components/sims/useSimRun";
import CoachPanel from "@/components/CoachPanel";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";
import type { OutcomeTitle } from "@/lib/outcomeTitle";

/**
 * 報稅實作模擬.
 *
 * Three commitments, each revealed only after the student has made it. The
 * previous version let them pick a character and then showed a finished
 * return — nothing was asked, so nothing could be learned from being wrong.
 * Here the take-home guess, the deduction choice and the method choice are
 * each answered before the real figure appears, which is the only way the
 * gap between what they expected and what is true registers as anything.
 */

type Step = "character" | "payslip" | "deductions" | "method";

export default function TaxSim({ color }: { color: string }) {
  const [step, setStep] = useState<Step>("character");
  const [characterId, setCharacterId] = useState<CharacterId>("mingming");
  const [payslipGuess, setPayslipGuess] = useState<number | null>(null);
  const [deductionIds, setDeductionIds] = useState<string[]>([]);
  const [method, setMethod] = useState<TaxMethod | null>(null);
  const { submitting, error, result, submit, reset } =
    useSimRun<TaxFilingOutcome>("baoshui");

  const character = useMemo(
    () => TAX_CHARACTERS.find((c) => c.id === characterId) ?? TAX_CHARACTERS[0],
    [characterId],
  );
  const payslip = useMemo(() => payslipFor(character), [character]);
  const choices = useMemo(() => payslipChoices(payslip), [payslip]);

  function handleReset() {
    setStep("character");
    setPayslipGuess(null);
    setDeductionIds([]);
    setMethod(null);
    reset();
  }

  if (result) {
    return (
      <TaxOutcomeView
        outcome={result.outcome}
        runId={result.runId}
        color={color}
        onReset={handleReset}
        outcomeTitle={result.outcomeTitle}
        pointsAwarded={result.pointsAwarded}
      />
    );
  }

  if (step === "character") {
    return (
      <div className="space-y-8">
        <section>
          <p className="text-sm leading-relaxed text-ink-soft">
            你要幫其中一個人報 {TAX_YEAR.year} 年度的綜合所得稅（{TAX_YEAR.filedIn} 年 5 月申報）。三個人的收入差很多，算出來的結果也會差很多。
          </p>
        </section>
        <fieldset>
          <legend className="text-xl font-bold">要幫誰報？</legend>
          <div className="mt-4 space-y-3">
            {TAX_CHARACTERS.map((c) => (
              <SelectCard
                key={c.id}
                name="character"
                selected={characterId === c.id}
                onSelect={() => setCharacterId(c.id)}
                color={color}
                title={c.name}
                meta={`年收入約 ${formatNT(c.annualIncome)}`}
                sub={c.role}
              />
            ))}
          </div>
        </fieldset>
        <SubmitButton
          onClick={() => setStep("payslip")}
          disabled={false}
          submitting={false}
          idleLabel="開始報稅"
          disabledLabel=""
        />
      </div>
    );
  }

  if (step === "payslip") {
    return (
      <div className="space-y-8">
        <section>
          <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-faint">
            第一關 · 薪水單
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {character.name}的月薪是{" "}
            <span className="money font-medium text-ink">
              {formatNT(payslip.monthlySalary)}
            </span>
            。先不要往下看——你覺得每個月實際入帳多少？
          </p>
        </section>
        <fieldset>
          <legend className="text-xl font-bold">實領金額</legend>
          <div className="mt-4 space-y-3">
            {choices.map((amount) => (
              <SelectCard
                key={amount}
                name="payslip"
                selected={payslipGuess === amount}
                onSelect={() => setPayslipGuess(amount)}
                color={color}
                title={formatNT(amount)}
              />
            ))}
          </div>
        </fieldset>
        <SubmitButton
          onClick={() => setStep("deductions")}
          disabled={payslipGuess === null}
          submitting={false}
          idleLabel="就這個"
          disabledLabel="先選一個"
        />
      </div>
    );
  }

  if (step === "deductions") {
    return (
      <div className="space-y-8">
        <section>
          <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-faint">
            第二關 · 哪些可以先扣掉
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {character.name}今年的總收入是{" "}
            <span className="money font-medium text-ink">
              {formatNT(character.annualIncome)}
            </span>
            。稅不是從這個數字開始算的——有些金額要先減掉。你覺得哪些算？
          </p>
        </section>
        <fieldset className="space-y-3">
          <legend className="text-xl font-bold">可以先扣掉的（可複選）</legend>
          {DEDUCTION_OPTIONS.map((d) => {
            const on = deductionIds.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() =>
                  setDeductionIds((prev) =>
                    prev.includes(d.id)
                      ? prev.filter((x) => x !== d.id)
                      : [...prev, d.id],
                  )
                }
                aria-pressed={on}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border bg-surface p-4 text-left transition-colors"
                style={{ borderColor: on ? color : "var(--color-hairline)" }}
              >
                <span className="font-semibold text-ink">{d.label}</span>
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold text-white"
                  style={{
                    background: on ? color : "transparent",
                    borderColor: on ? color : "var(--color-hairline)",
                  }}
                >
                  {on ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </fieldset>
        <SubmitButton
          onClick={() => setStep("method")}
          disabled={deductionIds.length === 0}
          submitting={false}
          idleLabel="就這些"
          disabledLabel="至少選一個"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-faint">
          第三關 · 稅怎麼算
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          扣完之後剩下的金額叫「所得淨額」。接下來要用它算出稅金——但要怎麼算？
        </p>
      </section>
      <fieldset>
        <legend className="text-xl font-bold">你會怎麼算？</legend>
        <div className="mt-4 space-y-3">
          {METHOD_OPTIONS.map((m) => (
            <SelectCard
              key={m.id}
              name="method"
              selected={method === m.id}
              onSelect={() => setMethod(m.id)}
              color={color}
              title={m.label}
            />
          ))}
        </div>
      </fieldset>

      {error && (
        <p
          className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative"
          role="alert"
        >
          {error}
        </p>
      )}

      <SubmitButton
        onClick={() =>
          method &&
          payslipGuess !== null &&
          submit({ characterId, payslipGuess, deductionIds, method })
        }
        disabled={!method}
        submitting={submitting}
        idleLabel="送出申報"
        disabledLabel="先選一個算法"
      />
    </div>
  );
}

function StepResult({
  n,
  label,
  correct,
  children,
}: {
  n: number;
  label: string;
  correct: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl bg-surface p-5"
      style={{
        borderLeft: `4px solid ${
          correct ? "var(--color-positive)" : "var(--color-alert)"
        }`,
      }}
    >
      <p className="font-display text-xs font-bold uppercase tracking-wider text-ink-soft">
        第{["一", "二", "三"][n - 1]}關 · {label} · {correct ? "答對" : "答錯"}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink/90">{children}</p>
    </div>
  );
}

function TaxOutcomeView({
  outcome,
  runId,
  color,
  onReset,
  outcomeTitle,
  pointsAwarded,
}: {
  outcome: TaxFilingOutcome;
  runId: string;
  color: string;
  onReset: () => void;
  outcomeTitle: OutcomeTitle | null;
  pointsAwarded: number;
}) {
  const methodDef = METHOD_OPTIONS.find((m) => m.id === outcome.method);
  const coincided = !outcome.methodCorrect && outcome.taxGap === 0;

  return (
    <div className="space-y-8">
      <PlatformPanel color={color} eyebrow="申報站 · 結算">
        <p className="text-sm text-white/70">
          {outcome.isRefund ? "可以退稅" : "要補繳"}
        </p>
        <h2 className="mt-1 text-4xl font-black">
          <span className="money">{formatNT(Math.abs(outcome.balance))}</span>
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/85">
          {outcome.character.name}今年被預扣了 {formatNT(outcome.withheld)}，
          實際應納稅額是 {formatNT(outcome.taxOwed)}。三關你答對了{" "}
          {outcome.stepsCorrect} 關。
        </p>
        <StampReveal outcomeTitle={outcomeTitle} pointsAwarded={pointsAwarded} />
      </PlatformPanel>

      <StepResult n={1} label="薪水單" correct={outcome.payslipCorrect}>
        月薪 {formatNT(outcome.payslip.monthlySalary)}，實際入帳{" "}
        {formatNT(outcome.payslip.takeHome)}
        。中間差的是勞保 {formatNT(outcome.payslip.laborInsurance)}、健保{" "}
        {formatNT(outcome.payslip.healthInsurance)}、以及每月預扣的所得稅{" "}
        {formatNT(outcome.payslip.taxWithheld)}。合約上的數字從來不是入帳的數字。（勞健保金額以簡化費率估算，實際依當年費率與投保級距而定。）
      </StepResult>

      <StepResult n={2} label="扣除額" correct={outcome.deductionsCorrect}>
        可以先扣掉的是免稅額、標準扣除額和薪資所得特別扣除額。手機費這類一般生活支出不能扣——
        扣完之後的「所得淨額」是 {formatNT(outcome.netIncome)}，稅是從這個數字開始算的。
      </StepResult>

      <StepResult n={3} label="算法" correct={outcome.methodCorrect}>
        {outcome.methodCorrect ? (
          <>
            你選的算法是對的：只有超過級距的那一段才用比較高的稅率，應納稅額{" "}
            {formatNT(outcome.taxOwed)}。
          </>
        ) : coincided ? (
          <>
            你算出來的數字剛好是對的（{formatNT(outcome.taxOwed)}
            ），但算法不對。{methodDef?.why}
            換一個收入高一點的人，同樣的算法就會差很多——誤解能活這麼久，通常就是因為它偶爾會剛好算對。
          </>
        ) : (
          <>
            你的算法會算出 {formatNT(outcome.studentTax)}，實際上是{" "}
            {formatNT(outcome.taxOwed)}，差了 {formatNT(Math.abs(outcome.taxGap))}。
            {methodDef?.why}
          </>
        )}
      </StepResult>

      <section>
        <h3 className="text-lg font-bold">這份申報書</h3>
        <div className="mt-3 rounded-2xl border border-hairline bg-surface p-5">
          <dl className="divide-y divide-hairline">
            <Row label="全年收入" value={outcome.character.annualIncome} strong />
            <Row label="所得淨額" value={outcome.netIncome} />
            <Row label="應納稅額" value={outcome.taxOwed} sign="minus" />
            <Row label="已預扣" value={outcome.withheld} tone="positive" />
            <Row
              label={outcome.isRefund ? "可退稅" : "應補繳"}
              value={Math.abs(outcome.balance)}
              strong
            />
          </dl>
        </div>
      </section>

      <p className="rounded-lg bg-line-1/10 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        免稅額、扣除額與級距為 {TAX_YEAR.year} 年度（{TAX_YEAR.filedIn} 年申報）財政部公告數字；勞健保為簡化估算。實際申報請以當年度公告為準。所有情境與數字皆為教學用途，非個人化投資或財務建議。
      </p>

      <CoachPanel runId={runId} />
      <OutcomeActions onReset={onReset} resetLabel="換一個人再報一次" />
    </div>
  );
}

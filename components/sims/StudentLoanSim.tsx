"use client";

import { useMemo, useState } from "react";
import {
  computeStudentLoan,
  SCHOOL_OPTIONS,
  HOUSING_OPTIONS,
  type SchoolType,
  type HousingType,
  type StudentLoanOutcome,
} from "@/lib/sims/studentLoan";
import { formatNT } from "@/components/Money";
import { Row, SelectCard, SubmitButton, OutcomeActions } from "@/components/sims/ui";
import { useSimRun } from "@/components/sims/useSimRun";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";
import type { OutcomeTitle } from "@/lib/outcomeTitle";

export default function StudentLoanSim({
  color,
  colorInk,
}: {
  color: string;
  colorInk: string;
}) {
  const [school, setSchool] = useState<SchoolType>("public");
  const [housing, setHousing] = useState<HousingType>("dorm");
  const [loanCoversPct, setLoanCoversPct] = useState(0);

  const { submitting, error, result, submit, reset } =
    useSimRun<StudentLoanOutcome>("xuedai");

  const preview = useMemo(
    () => computeStudentLoan({ school, housing, loanCoversPct }),
    [school, housing, loanCoversPct],
  );

  if (result) {
    return (
      <StudentLoanOutcomeView
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
      <fieldset>
        <legend className="text-xl font-bold">你要念哪一種大學？</legend>
        <div className="mt-4 space-y-3">
          {SCHOOL_OPTIONS.map((o) => (
            <SelectCard
              key={o.id}
              name="school"
              selected={school === o.id}
              onSelect={() => setSchool(o.id)}
              color={color}
              title={o.label}
              meta={`${formatNT(o.tuitionPerSemester)} / 學期`}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold">住宿方式？</legend>
        <div className="mt-4 space-y-3">
          {HOUSING_OPTIONS.map((o) => (
            <SelectCard
              key={o.id}
              name="housing"
              selected={housing === o.id}
              onSelect={() => setHousing(o.id)}
              color={color}
              title={o.label}
              meta={`約 ${formatNT(o.monthlyCost)} / 月`}
            />
          ))}
        </div>
      </fieldset>

      <section aria-labelledby="loan-heading">
        <h2 id="loan-heading" className="text-xl font-bold">
          就學貸款要負擔多少比例？
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          剩下的部分假設由家裡或獎助學金支付。0% 代表完全不貸款。
        </p>
        <div className="mt-4 rounded-2xl border border-hairline bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <label htmlFor="loan-pct" className="text-sm font-medium">
              就學貸款負擔比例
            </label>
            <output htmlFor="loan-pct" className="money text-2xl font-semibold" style={{ color: colorInk }}>
              {loanCoversPct}%
            </output>
          </div>
          <input
            id="loan-pct"
            type="range"
            min={0}
            max={100}
            step={10}
            value={loanCoversPct}
            onChange={(e) => setLoanCoversPct(Number(e.target.value))}
            className="mt-3 w-full"
            style={{ accentColor: color }}
          />
          <div className="mt-1 flex justify-between text-xs text-ink-faint">
            <span>0%（不貸款）</span>
            <span>100%（全額貸款）</span>
          </div>
        </div>
      </section>

      <section aria-live="polite" className="rounded-2xl border border-hairline bg-surface p-5">
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <p className="text-xs text-ink-faint">四年總花費</p>
            <p className="money text-lg font-semibold">{formatNT(preview.grandTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">畢業時負債</p>
            <p className="money text-lg font-semibold" style={{ color: colorInk }}>
              {formatNT(preview.loanAmount)}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative" role="alert">
          {error}
        </p>
      )}

      <SubmitButton
        onClick={() => submit({ school, housing, loanCoversPct })}
        disabled={false}
        submitting={submitting}
        idleLabel="看看四年後的總帳"
        disabledLabel=""
      />
    </div>
  );
}

function StudentLoanOutcomeView({
  outcome,
  color,
  onReset,
  outcomeTitle,
  pointsAwarded,
}: {
  outcome: StudentLoanOutcome;
  color: string;
  onReset: () => void;
  outcomeTitle: OutcomeTitle | null;
  pointsAwarded: number;
}) {
  return (
    <div className="space-y-8">
      <PlatformPanel color={color} eyebrow="四年後 · 總帳">
        <h2 className="text-4xl font-black">
          <span className="money">{formatNT(outcome.grandTotal)}</span>
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-white/85">
          選擇「{outcome.school.label}」＋「{outcome.housing.label}」，四年下來的總花費大約是這個數字。
          {outcome.loanAmount > 0
            ? `其中 ${formatNT(outcome.loanAmount)} 靠就學貸款支付，畢業後大約要背這筆負債。`
            : "這次沒有動用就學貸款，畢業時沒有這筆負債。"}
        </p>
        <StampReveal outcomeTitle={outcomeTitle} pointsAwarded={pointsAwarded} />
      </PlatformPanel>

      <section aria-labelledby="breakdown-heading">
        <h3 id="breakdown-heading" className="text-lg font-bold">
          四年總花費怎麼來的？
        </h3>
        <dl className="mt-3 rounded-2xl border border-hairline bg-surface px-5 py-3">
          <Row label={`學費（${outcome.school.label} × 4 年）`} value={outcome.tuitionTotal} />
          <Row label={`住宿（${outcome.housing.label} × 4 年）`} value={outcome.housingTotal} />
          <div className="border-t border-hairline" />
          <Row label="四年總花費" value={outcome.grandTotal} strong />
        </dl>
      </section>

      {outcome.loanAmount > 0 && (
        <section aria-labelledby="loan-heading2">
          <h3 id="loan-heading2" className="text-lg font-bold">
            畢業後，這筆負債要怎麼還？
          </h3>
          <dl className="mt-3 rounded-2xl border border-hairline bg-surface px-5 py-3">
            <Row label="畢業時負債總額" value={outcome.loanAmount} />
            <Row label="估算每月還款（10 年攤還）" value={outcome.monthlyRepayment} strong />
            <Row
              label="對照：大學畢業生平均起薪"
              value={outcome.estimatedStartingSalary}
              raw={formatNT(outcome.estimatedStartingSalary)}
            />
          </dl>
          <p className="mt-3 rounded-xl bg-line-1/10 px-4 py-3 text-sm leading-relaxed text-ink-soft">
            以這個起薪估算，每月還款大約佔起薪的{" "}
            <span className="money font-semibold text-ink">{outcome.repaymentAsPctOfSalary}%</span>
            。就學貸款不是「不用還的錢」，是延後負擔，畢業當年就要開始面對還款規劃。
          </p>
        </section>
      )}

      <p className="rounded-lg bg-line-1/10 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        ⚠️ 學費、住宿費為教學用途的示意數字，實際金額請以教育部與學校最新公告為準。
      </p>

      <OutcomeActions onReset={onReset} resetLabel="換個組合再試一次" />
    </div>
  );
}

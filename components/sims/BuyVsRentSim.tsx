"use client";

import { useState } from "react";
import {
  FIGURES_NOTE,
  PROPERTY_PRICE,
  MORTGAGE_YEARS,
  type BuyVsRentOutcome,
  type HousingChoice,
} from "@/lib/sims/buyVsRent";
import type { FinancialSnapshot, CreditRecordValue } from "@/lib/studentProfile";
import { formatNT } from "@/components/Money";
import { Row, SelectCard, SubmitButton, OutcomeActions } from "@/components/sims/ui";
import { useSimRun } from "@/components/sims/useSimRun";
import CoachPanel from "@/components/CoachPanel";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";
import type { OutcomeTitle } from "@/lib/outcomeTitle";

/**
 * 買房 vs 租屋 — the capstone.
 *
 * Opens on a recap of everything the student's earlier lines produced. The
 * recap is the simulation's own first screen rather than a station before it,
 * because stations are optional in sim_first mode and this is not: the whole
 * point of the line is seeing your own numbers arrive in one place, and a
 * student who skipped the reading would otherwise never see them.
 *
 * Fields the student has not earned show their stand-in AND say so. Quietly
 * substituting a default would make the recap a lie in exactly the situation
 * where it matters most — a student who has done none of the lines would be
 * shown a financial position that is not theirs and never told.
 */

const CREDIT_LABEL: Record<CreditRecordValue, string> = {
  good: "良好",
  fair: "普通",
  poor: "不良",
};

function RecapRow({
  label,
  value,
  known,
  unknownHint,
}: {
  label: string;
  value: string;
  known: boolean;
  unknownHint: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="flex items-baseline gap-2">
        <span className={`money font-semibold ${known ? "" : "text-ink-faint"}`}>
          {value}
        </span>
        {!known && (
          <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
            {unknownHint}
          </span>
        )}
      </span>
    </div>
  );
}

export default function BuyVsRentSim({
  color,
  colorInk,
  snapshot,
}: {
  color: string;
  colorInk: string;
  snapshot: FinancialSnapshot;
}) {
  const [stage, setStage] = useState<"recap" | "choose">("recap");
  const [choice, setChoice] = useState<HousingChoice | null>(null);
  const { submitting, error, result, submit, reset } =
    useSimRun<BuyVsRentOutcome>("caiwujuece");

  function handleReset() {
    setStage("recap");
    setChoice(null);
    reset();
  }

  if (result) {
    return (
      <BuyVsRentOutcomeView
        outcome={result.outcome}
        runId={result.runId}
        color={color}
        colorInk={colorInk}
        onReset={handleReset}
        outcomeTitle={result.outcomeTitle}
        pointsAwarded={result.pointsAwarded}
      />
    );
  }

  if (stage === "recap") {
    return (
      <div className="space-y-8">
        <section>
          <p className="text-sm leading-relaxed text-ink-soft">
            在做這個決定之前，先看一次你目前的位置。下面這些數字是你在前面幾條線留下來的
            {snapshot.empty ? "——你還沒跑過任何一條，所以這次全部用預設值" : ""}。
          </p>
        </section>

        <section className="rounded-2xl border border-hairline bg-surface p-5">
          <h3 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-faint">
            你目前的財務狀況
          </h3>
          <div className="mt-2 divide-y divide-hairline">
            <RecapRow
              label="月收入"
              value={formatNT(snapshot.income.amount)}
              known={snapshot.income.known}
              unknownHint="預設值 · 未跑職涯線"
            />
            <RecapRow
              label="存款"
              value={formatNT(snapshot.savings.amount)}
              known={snapshot.savings.known}
              unknownHint="預設值 · 未跑存錢線"
            />
            <RecapRow
              label="每月結餘習慣"
              value={
                snapshot.savingsBehavior.direction === "shortfall"
                  ? `月底差 ${formatNT(snapshot.savingsBehavior.amount)}`
                  : `月底留下 ${formatNT(snapshot.savingsBehavior.amount)}`
              }
              known={snapshot.savingsBehavior.known}
              unknownHint="預設值 · 未跑消費線"
            />
            <RecapRow
              label="信用記錄"
              value={CREDIT_LABEL[snapshot.credit.record]}
              known={snapshot.credit.known}
              unknownHint="預設值 · 未跑信用線"
            />
            <RecapRow
              label="投資中的金額"
              value={
                snapshot.invested.hasInvested
                  ? formatNT(snapshot.invested.amount)
                  : "沒有投資"
              }
              known={snapshot.invested.known}
              unknownHint="預設值 · 未跑投資線"
            />
          </div>
        </section>

        <section
          className="rounded-2xl bg-surface p-5"
          style={{ borderLeft: `4px solid ${color}` }}
        >
          <p
            className="font-display text-xs font-bold uppercase tracking-wider"
            style={{ color: colorInk }}
          >
            這次要決定的事
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
            一間 {formatNT(PROPERTY_PRICE)} 的房子，買下來或是用
            租的。買的話要先付兩成頭期款，剩下的向銀行借 {MORTGAGE_YEARS} 年。
          </p>
        </section>

        <SubmitButton
          onClick={() => setStage("choose")}
          disabled={false}
          submitting={false}
          idleLabel="看我的選項"
          disabledLabel=""
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="text-xl font-bold">你決定怎麼做？</legend>
        <p className="mt-1 text-sm text-ink-soft">
          兩個都是合理的選擇。選完會用你自己的數字算給你看。
        </p>
        <div className="mt-4 space-y-3">
          <SelectCard
            name="housing"
            selected={choice === "buy"}
            onSelect={() => setChoice("buy")}
            color={color}
            title="買下來"
            meta={`頭期款 ${formatNT(Math.round(PROPERTY_PRICE * 0.2))}`}
            sub="用三十年的月付換長期穩定，還有一間屬於自己的房子。"
          />
          <SelectCard
            name="housing"
            selected={choice === "rent"}
            onSelect={() => setChoice("rent")}
            color={color}
            title="先租"
            meta="不用頭期款"
            sub="保留搬家與換工作的彈性，頭期款那筆錢還在你手上。"
          />
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
        onClick={() => choice && submit({ choice })}
        disabled={!choice}
        submitting={submitting}
        idleLabel="算算看"
        disabledLabel="先選一個"
      />
    </div>
  );
}

function BuyVsRentOutcomeView({
  outcome,
  runId,
  color,
  colorInk,
  onReset,
  outcomeTitle,
  pointsAwarded,
}: {
  outcome: BuyVsRentOutcome;
  runId: string;
  color: string;
  colorInk: string;
  onReset: () => void;
  outcomeTitle: OutcomeTitle | null;
  pointsAwarded: number;
}) {
  const bought = outcome.choice === "buy";
  // A field is a stand-in unless the stored row says it was the student's.
  // Absent (older rows) counts as a stand-in: the safe direction is to
  // under-claim.
  const standIn = (known: boolean | undefined) => known !== true;
  const tag = (known: boolean | undefined) => (standIn(known) ? "（預設值）" : "");
  const anyStandIn =
    standIn(outcome.incomeKnown) ||
    standIn(outcome.savingsKnown) ||
    standIn(outcome.creditKnown) ||
    standIn(outcome.investedKnown);
  const pct = Math.round(outcome.mortgageShareOfIncome * 100);
  const rentPct = Math.round(outcome.rentShareOfIncome * 100);
  const rateText = `${(outcome.annualRate * 100).toFixed(1)}%`;
  const extraPerMonth =
    outcome.monthlyMortgage - outcome.monthlyMortgageAtBestRate;

  return (
    <div className="space-y-8">
      <PlatformPanel color={color} eyebrow="決策站 · 你的數字">
        {bought && !outcome.canCoverDownPayment ? (
          <>
            <p className="text-sm text-white/70">頭期款還差</p>
            <h2 className="mt-1 text-4xl font-black">
              <span className="money">{formatNT(outcome.downPaymentShortfall)}</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/85">
              頭期款要 {formatNT(outcome.downPaymentRequired)}，你手上有{" "}
              {formatNT(outcome.downPaymentWithInvestments)}。這不是買不起，是還不到時候。
            </p>
          </>
        ) : bought ? (
          <>
            <p className="text-sm text-white/70">每個月要繳</p>
            <h2 className="mt-1 text-4xl font-black">
              <span className="money">{formatNT(outcome.monthlyMortgage)}</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/85">
              佔你月收入的 {pct}%，利率 {rateText}，繳 {MORTGAGE_YEARS} 年。
              {outcome.approvalLikely
                ? ""
                : "以這個比例，銀行不一定會核准。"}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-white/70">每個月房租</p>
            <h2 className="mt-1 text-4xl font-black">
              <span className="money">{formatNT(outcome.monthlyRent)}</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/85">
              佔你月收入的 {rentPct}%，而且頭期款那筆{" "}
              {formatNT(outcome.downPaymentRequired)} 還在你手上。
            </p>
          </>
        )}
        <StampReveal outcomeTitle={outcomeTitle} pointsAwarded={pointsAwarded} />
      </PlatformPanel>

      <section>
        <h3 className="text-lg font-bold">兩條路並排看</h3>
        <div className="mt-3 rounded-2xl border border-hairline bg-surface p-5">
          <dl className="divide-y divide-hairline">
            <Row label={`你的月收入${tag(outcome.incomeKnown)}`} value={outcome.income} strong />
            <Row label="買：每月房貸" value={outcome.monthlyMortgage} />
            <Row label="租：每月房租" value={outcome.monthlyRent} />
            <Row label="買：頭期款" value={outcome.downPaymentRequired} />
            <Row label={`你目前的存款${tag(outcome.savingsKnown)}`} value={outcome.savings} />
          </dl>
        </div>
      </section>

      {/* The credit consequence, chained forward from 信用線. */}
      <section
        className="rounded-2xl bg-surface p-5"
        style={{
          borderLeft: `4px solid ${
            outcome.creditRecord === "good"
              ? "var(--color-positive)"
              : "var(--color-alert)"
          }`,
        }}
      >
        <p className="font-display text-xs font-bold uppercase tracking-wider text-ink-soft">
          信用記錄的影響{tag(outcome.creditKnown)}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
          {outcome.creditRecord === "good" ? (
            <>
              你的信用記錄是「良好」，銀行開出 {rateText} 的利率——這是最好的一檔。
              信用線那三期帳單每期都全額繳清，省下的不只是當時那幾百塊利息。
            </>
          ) : (
            <>
              你的信用記錄是「{CREDIT_LABEL[outcome.creditRecord]}」，銀行開出的利率是{" "}
              {rateText}。同一間房子、同樣的收入，如果記錄是「良好」，月付會是{" "}
              {formatNT(outcome.monthlyMortgageAtBestRate)}——每個月差{" "}
              {formatNT(extraPerMonth)}，{MORTGAGE_YEARS} 年就是{" "}
              {formatNT(extraPerMonth * MORTGAGE_YEARS * 12)}。
              {outcome.creditRecord === "poor" &&
                "而且以這份記錄，核不核准本身就不是必然的。"}
            </>
          )}
        </p>
      </section>

      {outcome.opportunityCost && (
        <section
          className="rounded-2xl bg-surface p-5"
          style={{ borderLeft: `4px solid ${color}` }}
        >
          <p
            className="font-display text-xs font-bold uppercase tracking-wider"
            style={{ color: colorInk }}
          >
            那筆投資的錢
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
            你有 {formatNT(outcome.opportunityCost.amountNow)} 在投資。
            {bought
              ? "拿去付頭期款，它就不再增值了。"
              : "選擇先租，這筆錢可以繼續放著。"}
            如果放著不動 {outcome.opportunityCost.years} 年，以一個示意的年報酬率估算，大約會變成{" "}
            {formatNT(outcome.opportunityCost.valueIfLeftInvested)}。
            同一筆錢只能用一次——這是取捨，不是免費的決定。
          </p>
        </section>
      )}

      {anyStandIn && (
        <p className="rounded-lg bg-black/[0.04] px-4 py-3 text-xs leading-relaxed text-ink-soft">
          標了「預設值」的數字不是你自己的——你還沒跑過產生它的那條線。跑過再回來，這裡就會用你的數字重算。
        </p>
      )}

      <p className="rounded-lg bg-line-1/10 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        {FIGURES_NOTE}。利率與報酬率同為示意，用來比較兩條路的形狀。所有情境與數字皆為教學用途，非個人化投資或財務建議。
      </p>

      <CoachPanel runId={runId} />
      <OutcomeActions onReset={onReset} resetLabel="換一個選擇再算一次" />
    </div>
  );
}

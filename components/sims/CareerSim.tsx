"use client";

import { useMemo, useState } from "react";
import {
  INTEREST_BUCKETS,
  interestLabel,
  type InterestId,
} from "@/lib/studentProfile";
import {
  pathsForInterest,
  findPath,
  caveatFor,
  sourceNote,
  PLACEHOLDER_TAG,
} from "@/lib/sims/careers";
import {
  PROJECTION_MONTHS,
  type CareerChoiceOutcome,
} from "@/lib/sims/careerChoice";
import { formatNT } from "@/components/Money";
import { SelectCard, SubmitButton, OutcomeActions } from "@/components/sims/ui";
import { useSimRun } from "@/components/sims/useSimRun";
import CoachPanel from "@/components/CoachPanel";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";
import type { OutcomeTitle } from "@/lib/outcomeTitle";

/**
 * 職涯抉擇模擬 — pick an interest, then a path, and see the income shape.
 *
 * Two steps rather than one screen: the interest narrows which paths are
 * shown, and showing all of them at once would bury the point that the set
 * you see depends on what you said you were drawn to.
 *
 * Every figure carries a visible placeholder tag. These are illustrative
 * until real Taiwan labour-market data is sourced, and an untagged number
 * here would read as verified to a student, a teacher, or a partner in a
 * demo — which is exactly the failure mode worth avoiding.
 */
export default function CareerSim({
  color,
  colorInk,
}: {
  color: string;
  colorInk: string;
}) {
  const [interest, setInterest] = useState<InterestId | null>(null);
  const [pathId, setPathId] = useState<string | null>(null);
  const { submitting, error, result, submit, reset } =
    useSimRun<CareerChoiceOutcome>("zhiya");

  const paths = useMemo(
    () => (interest ? pathsForInterest(interest) : []),
    [interest],
  );

  function handleReset() {
    setInterest(null);
    setPathId(null);
    reset();
  }

  if (result) {
    return (
      <CareerOutcomeView
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

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm leading-relaxed text-ink-soft">
          先選一個你比較有興趣的方向，再看看那個方向裡有哪些路。每條路的準備期、起薪和成長幅度都不一樣——沒有哪一條一定比較好。
        </p>
      </section>

      <fieldset>
        <legend className="text-xl font-bold">你對哪個方向比較有興趣？</legend>
        <div className="mt-4 space-y-3">
          {INTEREST_BUCKETS.map((b) => (
            <SelectCard
              key={b.id}
              name="interest"
              selected={interest === b.id}
              onSelect={() => {
                setInterest(b.id);
                setPathId(null);
              }}
              color={color}
              title={b.label}
            />
          ))}
        </div>
      </fieldset>

      {interest && (
        <fieldset>
          <legend className="text-xl font-bold">
            {interestLabel(interest)}：這幾條路
          </legend>
          <p className="mt-1 text-sm text-ink-soft">
            準備期是開始賺錢之前的時間。有些路的數字有資料來源，有些還沒有——選完會標出來。
          </p>
          <div className="mt-4 space-y-3">
            {paths.map((p) => (
              <SelectCard
                key={p.id}
                name="path"
                selected={pathId === p.id}
                onSelect={() => setPathId(p.id)}
                color={color}
                title={p.name}
                meta={
                  p.rampMonths > 0 ? `準備期約 ${p.rampMonths} 個月` : "可以馬上開始"
                }
                sub={p.blurb}
              />
            ))}
          </div>
        </fieldset>
      )}

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
          interest && pathId && submit({ interest, pathId })
        }
        disabled={!interest || !pathId}
        submitting={submitting}
        idleLabel="看看這條路五年後"
        disabledLabel="先選一個方向和一條路"
      />
    </div>
  );
}

function IncomeShape({
  outcome,
  color,
}: {
  outcome: CareerChoiceOutcome;
  color: string;
}) {
  const max = Math.max(...outcome.points.map((p) => p.income), 1);
  return (
    <div>
      <div className="flex h-28 items-end gap-[3px]" aria-hidden="true">
        {outcome.points.map((p) => (
          <div
            key={p.month}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${Math.max(2, (p.income / max) * 100)}%`,
              background: p.income === 0 ? "var(--color-hairline)" : color,
              opacity: p.income === 0 ? 1 : 0.35 + 0.65 * (p.income / max),
            }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-ink-faint">
        <span>現在</span>
        <span>{PROJECTION_MONTHS / 12} 年後</span>
      </div>
    </div>
  );
}

function CareerOutcomeView({
  outcome,
  runId,
  color,
  colorInk,
  onReset,
  outcomeTitle,
  pointsAwarded,
}: {
  outcome: CareerChoiceOutcome;
  runId: string;
  color: string;
  colorInk: string;
  onReset: () => void;
  outcomeTitle: OutcomeTitle | null;
  pointsAwarded: number;
}) {
  // Sourcing lives on the path, not on the outcome: the outcome records what
  // the student chose, while how well-evidenced the figures are is a fact
  // about the data and can change without any stored run changing.
  const path = findPath(outcome.pathId);
  const caveat = path ? caveatFor(path) : PLACEHOLDER_TAG;
  const note = path ? sourceNote(path) : null;

  return (
    <div className="space-y-8">
      <PlatformPanel color={color} eyebrow="抉擇站 · 五年後">
        <p className="text-sm text-white/70">{outcome.pathName}，五年累積約</p>
        <h2 className="mt-1 text-4xl font-black">
          <span className="money">{formatNT(outcome.fiveYearTotal)}</span>
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/85">
          {outcome.monthsWithoutIncome > 0
            ? `前面大約 ${outcome.monthsWithoutIncome} 個月幾乎沒有收入，之後起薪約 ${formatNT(outcome.startingIncome)}，五年後成長到約 ${formatNT(outcome.laterIncome)}。`
            : `幾乎可以馬上開始賺錢，起薪約 ${formatNT(outcome.startingIncome)}，五年後成長到約 ${formatNT(outcome.laterIncome)}。`}
        </p>
        <StampReveal outcomeTitle={outcomeTitle} pointsAwarded={pointsAwarded} />
      </PlatformPanel>

      <section className="rounded-2xl border border-hairline bg-surface p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-bold">收入的形狀</h3>
          {caveat && (
            <span className="rounded-full bg-black/[0.06] px-2.5 py-1 text-xs font-semibold text-ink-soft">
              {caveat}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          灰色是還沒有收入的月份。重點不是最後的數字，是這條線什麼時候開始往上、爬得多快。
        </p>
        <div className="mt-4">
          <IncomeShape outcome={outcome} color={color} />
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
          這條路的取捨
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
          {outcome.tradeoff}
        </p>
      </section>

      <section className="rounded-2xl bg-surface p-5" style={{ borderLeft: `4px solid ${color}` }}>
        <p className="text-sm leading-relaxed text-ink-soft">
          <span className="font-semibold text-ink">接下來：</span>
          這個起薪（約 {formatNT(outcome.startingIncome)}）會成為你在
          <span className="font-semibold text-ink">消費線</span>
          要分配的錢。同一筆收入，怎麼分配會差很多。
        </p>
      </section>

      <p className="rounded-lg bg-line-1/10 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        {note}
        不論來源為何，實際收入都會因產業、地區、公司規模與個人條件而有很大差異，這裡的用途是比較不同路徑的形狀。
      </p>

      <CoachPanel runId={runId} />
      <OutcomeActions onReset={onReset} resetLabel="換一條路再看看" />
    </div>
  );
}

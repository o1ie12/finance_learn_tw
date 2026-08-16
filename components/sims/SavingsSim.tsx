"use client";

import { useMemo, useState } from "react";
import {
  computeSavings,
  temptationsFor,
  SAVINGS_GOALS,
  SAVINGS_STORAGE,
  SAVINGS_MONTHS,
  type SavingsGoalId,
  type SavingsStorageId,
  type SavingsOutcome,
  type SavingsScenario,
} from "@/lib/sims/savings";
import { formatNT } from "@/components/Money";
import { SelectCard, SubmitButton, OutcomeActions } from "@/components/sims/ui";
import { useSimRun } from "@/components/sims/useSimRun";
import CoachPanel from "@/components/CoachPanel";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";
import type { OutcomeTitle } from "@/lib/outcomeTitle";

export default function SavingsSim({
  color,
  colorInk,
}: {
  color: string;
  colorInk: string;
}) {
  const [goalId, setGoalId] = useState<SavingsGoalId>("trip");
  const [months, setMonths] = useState(12);
  const [monthlyDeposit, setMonthlyDeposit] = useState(1500);
  const [storageId, setStorageId] = useState<SavingsStorageId>("timeDeposit");
  const [responses, setResponses] = useState<boolean[]>([false, false, false]);

  const { submitting, error, result, submit, reset } =
    useSimRun<SavingsOutcome>("cunqian");

  const temptations = useMemo(() => temptationsFor(months), [months]);
  const preview = useMemo(
    () =>
      computeSavings({ goalId, months, monthlyDeposit, storageId, temptationResponses: responses }),
    [goalId, months, monthlyDeposit, storageId, responses],
  );

  if (result) {
    return (
      <SavingsOutcomeView
        outcome={result.outcome}
        runId={result.runId}
        color={color}
        onReset={reset}
        outcomeTitle={result.outcomeTitle}
        pointsAwarded={result.pointsAwarded}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Goal */}
      <fieldset>
        <legend className="text-xl font-bold">第一步：你想存到什麼？</legend>
        <p className="mt-1 text-sm text-ink-soft">選一個目標，之後看看你存不存得到。</p>
        <div className="mt-4 space-y-3">
          {SAVINGS_GOALS.map((g) => (
            <SelectCard
              key={g.id}
              name="goal"
              selected={goalId === g.id}
              onSelect={() => setGoalId(g.id)}
              color={color}
              title={g.label}
              meta={`${formatNT(g.amount)}`}
            />
          ))}
        </div>
      </fieldset>

      {/* Timeframe */}
      <fieldset>
        <legend className="text-xl font-bold">要花多久存？</legend>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {SAVINGS_MONTHS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonths(m)}
              aria-pressed={months === m}
              className={`rounded-xl border-2 px-4 py-3 text-center font-semibold transition-colors ${
                months === m
                  ? "bg-surface"
                  : "border-hairline bg-surface hover:border-ink/30"
              }`}
              style={months === m ? { borderColor: color } : undefined}
            >
              {m} 個月
            </button>
          ))}
        </div>
      </fieldset>

      {/* Monthly deposit */}
      <section aria-labelledby="dep-heading">
        <h2 id="dep-heading" className="text-xl font-bold">
          每個月存多少？
        </h2>
        <div className="mt-4 rounded-2xl border border-hairline bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <label htmlFor="deposit" className="text-sm font-medium">
              每月存入
            </label>
            <output
              htmlFor="deposit"
              className="money text-2xl font-semibold"
              style={{ color: colorInk }}
            >
              {formatNT(monthlyDeposit)}
            </output>
          </div>
          <input
            id="deposit"
            type="range"
            min={500}
            max={5000}
            step={250}
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
            className="mt-3 w-full"
            style={{ accentColor: color }}
          />
          <div className="mt-1 flex justify-between text-xs text-ink-faint">
            <span>{formatNT(500)}</span>
            <span>{formatNT(5000)}</span>
          </div>
        </div>
      </section>

      {/* Storage */}
      <fieldset>
        <legend className="text-xl font-bold">存在哪裡？</legend>
        <p className="mt-1 text-sm text-ink-soft">
          放的地方不同，利息（複利）也不同。
        </p>
        <div className="mt-4 space-y-3">
          {SAVINGS_STORAGE.map((s) => (
            <SelectCard
              key={s.id}
              name="storage"
              selected={storageId === s.id}
              onSelect={() => setStorageId(s.id)}
              color={color}
              title={s.label}
              meta={s.annualRate > 0 ? `年利率 ${(s.annualRate * 100).toFixed(1)}%` : "0% 利息"}
              sub={s.blurb}
            />
          ))}
        </div>
      </fieldset>

      {/* Temptations */}
      <fieldset>
        <legend className="text-xl font-bold">路上會遇到的誘惑</legend>
        <p className="mt-1 text-sm text-ink-soft">
          存錢的路上一定會有這些時刻。你會守住，還是買下去？
        </p>
        <div className="mt-4 space-y-3">
          {temptations.map((t, i) => (
            <div
              key={t.key}
              className="rounded-2xl border border-hairline bg-surface p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">
                  第 {t.month} 個月 · {t.label}
                </span>
                <span className="money font-semibold">{formatNT(t.amount)}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setResponses((r) => r.map((v, j) => (j === i ? false : v)))
                  }
                  aria-pressed={!responses[i]}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors ${
                    !responses[i]
                      ? "border-positive bg-positive/5 text-positive"
                      : "border-hairline hover:border-ink/30"
                  }`}
                >
                  忍住
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setResponses((r) => r.map((v, j) => (j === i ? true : v)))
                  }
                  aria-pressed={responses[i]}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors ${
                    responses[i]
                      ? "border-negative bg-negative/5 text-negative"
                      : "border-hairline hover:border-ink/30"
                  }`}
                >
                  買下去
                </button>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Live preview */}
      <section
        aria-live="polite"
        className="rounded-2xl border border-hairline bg-surface p-5"
      >
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <p className="text-xs text-ink-faint">守住計畫，最後大約有</p>
            <p className="money text-lg font-semibold" style={{ color: colorInk }}>
              {formatNT(preview.resistAll.finalAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">目標</p>
            <p className="money text-lg font-semibold">
              {formatNT(preview.goal.amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">
              {preview.resistAll.reachedGoal ? "距離目標" : "還差"}
            </p>
            <p
              className={`money text-lg font-semibold ${preview.resistAll.reachedGoal ? "text-positive" : "text-negative"}`}
            >
              {preview.resistAll.reachedGoal
                ? "已達標 ✓"
                : formatNT(Math.abs(preview.resistAll.gap))}
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
        onClick={() =>
          submit({ goalId, months, monthlyDeposit, storageId, temptationResponses: responses })
        }
        disabled={false}
        submitting={submitting}
        idleLabel="看看你存到多少"
        disabledLabel=""
      />
    </div>
  );
}

function ScenarioCard({
  s,
  color,
  highlight,
}: {
  s: SavingsScenario;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border-2 bg-surface p-4"
      style={{ borderColor: highlight ? color : "var(--color-hairline)" }}
    >
      <p className="text-sm font-medium text-ink-soft">{s.label}</p>
      <p className="money mt-1 text-xl font-semibold">{formatNT(s.finalAmount)}</p>
      <p
        className={`mt-1 text-xs font-semibold ${s.reachedGoal ? "text-positive" : "text-negative"}`}
      >
        {s.reachedGoal ? "達成目標 ✓" : `還差 ${formatNT(Math.abs(s.gap))}`}
      </p>
    </div>
  );
}

function SavingsOutcomeView({
  outcome,
  runId,
  color,
  onReset,
  outcomeTitle,
  pointsAwarded,
}: {
  outcome: SavingsOutcome;
  runId: string;
  color: string;
  onReset: () => void;
  outcomeTitle: OutcomeTitle | null;
  pointsAwarded: number;
}) {
  const { user, resistAll, giveInAll, goal } = outcome;
  const diff = resistAll.finalAmount - giveInAll.finalAmount;

  return (
    <div className="space-y-8">
      <PlatformPanel color={color} eyebrow={`目標站 · ${outcome.months} 個月後`}>
        <h2 className="text-4xl font-black">
          <span className="money">{formatNT(user.finalAmount)}</span>
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-white/85">
          你為「{goal.label}」（{formatNT(goal.amount)}）努力存錢，照你的選擇，最後大約存到這麼多。
          {user.reachedGoal ? "你達成目標了！" : `離目標還差 ${formatNT(Math.abs(user.gap))}。`}
        </p>
        <StampReveal outcomeTitle={outcomeTitle} pointsAwarded={pointsAwarded} />
      </PlatformPanel>

      <section aria-labelledby="cmp-heading">
        <h3 id="cmp-heading" className="text-lg font-bold">
          守住 vs 心動：差多少？
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          同樣每月存 {formatNT(outcome.monthlyDeposit)}、放在「{outcome.storage.label}」，差別只在有沒有守住。
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ScenarioCard s={resistAll} color={color} highlight />
          <ScenarioCard s={user} color={color} />
          <ScenarioCard s={giveInAll} color={color} />
        </div>
        <p className="mt-3 rounded-xl bg-line-3/10 px-4 py-3 text-sm leading-relaxed text-ink-soft">
          守住計畫和每次都心動，最後差了{" "}
          <span className="money font-semibold text-ink">{formatNT(diff)}</span>
          。這就是「即時滿足」的代價——每一次小小的心動，加起來會很可觀。
        </p>
      </section>

      <section aria-labelledby="int-heading">
        <h3 id="int-heading" className="text-lg font-bold">
          複利默默幫了你多少？
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          守住計畫的話，你總共存入{" "}
          <span className="money">{formatNT(resistAll.deposited)}</span>，其中有{" "}
          <span className="money font-semibold" style={{ color }}>
            {formatNT(resistAll.interest)}
          </span>{" "}
          是利息滾出來的
          {outcome.storage.annualRate === 0
            ? "——放家裡（0% 利息）就一毛都沒有。換個有利息的地方，時間會替你多做一點事。"
            : "。利率雖然不高，但時間拉長，複利會越來越有感。"}
        </p>
      </section>

      <CoachPanel runId={runId} />
      <OutcomeActions onReset={onReset} resetLabel="換個存法再試一次" />
    </div>
  );
}

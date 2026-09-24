"use client";

import { useMemo, useState } from "react";
import {
  SPEND_CATEGORIES,
  SHORTFALL_EVENT,
  type SpendingOutcome,
} from "@/lib/sims/spending";
import { formatNT } from "@/components/Money";
import { Row, SubmitButton, OutcomeActions } from "@/components/sims/ui";
import { useSimRun } from "@/components/sims/useSimRun";
import CoachPanel from "@/components/CoachPanel";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";
import type { OutcomeTitle } from "@/lib/outcomeTitle";

/**
 * 消費模擬 — divide one month's income, then meet something unplanned.
 *
 * The student allocates from zero rather than adjusting a preset split. A
 * preset would hand them the answer; an empty budget makes them produce one
 * and then live with it, which is the only way 需要 vs 想要 stops being a
 * definition and becomes a decision.
 *
 * Nothing warns them mid-allocation that they are leaving no slack. The
 * shortfall at the end is the feedback, and it lands because it was not
 * telegraphed — same reasoning as the credit-card bill not previewing its
 * interest.
 */
export default function SpendingSim({
  color,
  colorInk,
  income,
  incomeFromCareer,
}: {
  color: string;
  colorInk: string;
  income: number;
  incomeFromCareer: boolean;
}) {
  const [allocation, setAllocation] = useState<Record<string, number>>(() =>
    Object.fromEntries(SPEND_CATEGORIES.map((c) => [c.id, 0])),
  );
  const { submitting, error, result, submit, reset } =
    useSimRun<SpendingOutcome>("qixin");

  const allocated = useMemo(
    () => Object.values(allocation).reduce((a, b) => a + b, 0),
    [allocation],
  );
  const remaining = income - allocated;
  const over = remaining < 0;

  function setAmount(id: string, value: number) {
    setAllocation((prev) => ({ ...prev, [id]: Math.max(0, Math.round(value)) }));
  }

  function handleReset() {
    setAllocation(Object.fromEntries(SPEND_CATEGORIES.map((c) => [c.id, 0])));
    reset();
  }

  if (result) {
    return (
      <SpendingOutcomeView
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
          這個月你有{" "}
          <span className="money font-medium text-ink">{formatNT(income)}</span>
          {incomeFromCareer
            ? "（你在職涯線選的那條路的起薪）"
            : "（預設收入——之後去職涯線選一條路，這個數字就會變成你自己的）"}
          。要怎麼分，由你決定。
        </p>
      </section>

      <div
        className="sticky top-16 z-10 rounded-2xl border border-hairline bg-surface px-5 py-3"
        style={over ? { borderColor: "var(--color-negative)" } : undefined}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm text-ink-soft">還沒分配</span>
          <span
            className={`money text-2xl font-black ${over ? "text-negative" : ""}`}
          >
            {formatNT(remaining)}
          </span>
        </div>
        {over && (
          <p className="mt-1 text-sm text-negative">
            超過這個月的收入了，要先減掉一些。
          </p>
        )}
      </div>

      <fieldset className="space-y-3">
        <legend className="text-xl font-bold">這個月要怎麼分？</legend>
        {SPEND_CATEGORIES.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-hairline bg-surface p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="flex items-baseline gap-2">
                <span className="font-bold text-ink">{c.label}</span>
                <span className="text-xs text-ink-faint">
                  {c.kind === "need"
                    ? "需要"
                    : c.kind === "want"
                      ? "想要"
                      : "存下來"}
                </span>
              </span>
              <span className="money font-semibold">
                {formatNT(allocation[c.id])}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-soft">{c.hint}</p>
            <input
              type="range"
              min={0}
              max={income}
              step={500}
              value={allocation[c.id]}
              onChange={(e) => setAmount(c.id, Number(e.target.value))}
              aria-label={`${c.label} 金額`}
              className="mt-3 w-full"
              style={{ accentColor: color }}
            />
          </div>
        ))}
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
        onClick={() => submit({ allocation })}
        disabled={over || allocated === 0}
        submitting={submitting}
        idleLabel="就這樣過這個月"
        disabledLabel={over ? "先把超出的部分減掉" : "先分配一些看看"}
      />
    </div>
  );
}

function SpendingOutcomeView({
  outcome,
  runId,
  color,
  colorInk,
  onReset,
  outcomeTitle,
  pointsAwarded,
}: {
  outcome: SpendingOutcome;
  runId: string;
  color: string;
  colorInk: string;
  onReset: () => void;
  outcomeTitle: OutcomeTitle | null;
  pointsAwarded: number;
}) {
  const buffer = outcome.savings + outcome.unallocated;

  return (
    <div className="space-y-8">
      <PlatformPanel color={color} eyebrow="分配站 · 月底了">
        {outcome.absorbedShortfall ? (
          <>
            <h2 className="text-3xl font-black">撐過去了</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/85">
              {SHORTFALL_EVENT.detail}你手上還有{" "}
              <span className="money font-semibold text-white">
                {formatNT(buffer)}
              </span>
              ，付得出來。
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-white/70">月底差了</p>
            <h2 className="mt-1 text-4xl font-black">
              <span className="money">{formatNT(outcome.shortfallGap)}</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/85">
              {SHORTFALL_EVENT.detail}你手上只剩 {formatNT(buffer)}
              ——不是因為賺太少，是因為沒有留。
            </p>
          </>
        )}
        <StampReveal outcomeTitle={outcomeTitle} pointsAwarded={pointsAwarded} />
      </PlatformPanel>

      <section>
        <h3 className="text-lg font-bold">這個月的分配</h3>
        <div className="mt-3 rounded-2xl border border-hairline bg-surface p-5">
          <dl className="divide-y divide-hairline">
            <Row label="收入" value={outcome.income} strong />
            <Row label="需要" value={outcome.needsTotal} sign="minus" />
            <Row label="想要" value={outcome.wantsTotal} sign="minus" />
            <Row label="存起來" value={outcome.savings} tone="positive" />
            {outcome.unallocated > 0 && (
              <Row label="沒特別分配的" value={outcome.unallocated} />
            )}
          </dl>
        </div>
      </section>

      {outcome.underfunded.length > 0 && (
        <section
          className="rounded-2xl bg-surface p-5"
          style={{ borderLeft: "4px solid var(--color-alert)" }}
        >
          <p className="font-display text-xs font-bold uppercase tracking-wider text-alert">
            這幾項可能撐不住
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
            「{outcome.underfunded.join("、")}」分配得偏低。需要的東西壓到某個程度以下，省下來的錢通常會在別的地方以別的形式花掉。
          </p>
        </section>
      )}

      <section
        className="rounded-2xl bg-surface p-5"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <p
          className="font-display text-xs font-bold uppercase tracking-wider"
          style={{ color: colorInk }}
        >
          想要佔了多少
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
          這個月有 {Math.round(outcome.wantsShareOfIncome * 100)}%
          的收入花在「想要」上。沒有一個正確的比例——重點是你知不知道自己花在哪，以及出事的時候還剩多少。
        </p>
      </section>

      {!outcome.incomeFromCareer && (
        <section className="rounded-2xl border border-hairline bg-surface p-5">
          <p className="text-sm leading-relaxed text-ink-soft">
            這次用的是預設收入。去
            <span className="font-semibold text-ink">職涯線</span>
            選一條路，再回來跑一次，你分配的就會是自己那條路的收入。
          </p>
        </section>
      )}

      <p className="rounded-lg bg-line-1/10 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        所有情境與數字皆為教學用途，非個人化投資或財務建議。
      </p>

      <CoachPanel runId={runId} />
      <OutcomeActions onReset={onReset} resetLabel="換個分法再試一次" />
    </div>
  );
}

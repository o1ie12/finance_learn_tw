"use client";

import { useState } from "react";
import {
  PRICE_OPTIONS,
  PREP_OPTIONS,
  COST_SHOCK_DAY,
  PRICE_RAISE,
  computeBubbleTea,
  type PriceId,
  type PrepId,
  type BubbleTeaOutcome,
} from "@/lib/sims/bubbleTea";
import { formatNT } from "@/components/Money";
import { SelectCard, SubmitButton, OutcomeActions } from "@/components/sims/ui";
import { useSimRun } from "@/components/sims/useSimRun";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";
import CoachPanel from "@/components/CoachPanel";

export default function EntrepreneurSim({ color }: { color: string; colorInk: string }) {
  const [priceId, setPriceId] = useState<PriceId>("mid");
  const [prepId, setPrepId] = useState<PrepId>("medium");
  // Days 1–11 run in the browser so the student can see the shock arrive
  // before deciding; the server recomputes all 30 days on submit.
  const [atShock, setAtShock] = useState(false);
  const { submitting, error, result, submit, reset } = useSimRun<BubbleTeaOutcome>("chuangye");

  if (result) {
    const o = result.outcome;
    const lastDay = o.days[o.days.length - 1];
    return (
      <div className="space-y-8">
        <PlatformPanel color={o.survived ? color : "#c8102e"} eyebrow="手搖飲攤位 · 結果">
          <h2 className="text-3xl font-black">
            {o.survived ? `撐過 30 天，現金 ` : `第 ${o.bankruptDay} 天倒閉，現金 `}
            <span className="money">{formatNT(Math.max(0, o.finalCash))}</span>
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/85">
            {o.survived
              ? `30 天下來，總營收 ${formatNT(o.totalRevenue)}，總損益 ${o.totalProfit >= 0 ? "+" : ""}${formatNT(o.totalProfit)}。每天損益兩平的門檻是賣出 ${o.breakEvenCups} 杯。`
              : `現金撐不到第 30 天就見底了——每天損益兩平的門檻是賣出 ${o.breakEvenCups} 杯，跟你備料的規模與定價策略有關，換個組合再試一次看看。`}
          </p>
          <StampReveal outcomeTitle={result.outcomeTitle} pointsAwarded={result.pointsAwarded} />
        </PlatformPanel>

        <section aria-labelledby="days-heading">
          <h3 id="days-heading" className="text-lg font-bold">
            30 天現金走勢
          </h3>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-hairline bg-surface">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-ink-faint">
                  <th className="px-3 py-2 font-medium">Day</th>
                  <th className="px-3 py-2 font-medium">賣出</th>
                  <th className="px-3 py-2 font-medium">賣光沒買到</th>
                  <th className="px-3 py-2 font-medium">當日損益</th>
                  <th className="px-3 py-2 font-medium">現金</th>
                  <th className="px-3 py-2 font-medium">事件</th>
                </tr>
              </thead>
              <tbody>
                {o.days.map((d) => (
                  <tr key={d.day} className="border-b border-hairline last:border-0">
                    <td className="money px-3 py-2 text-ink-faint">{d.day}</td>
                    <td className="money px-3 py-2">{d.cupsSold}</td>
                    <td className="money px-3 py-2" style={d.lostCups > 0 ? { color: "var(--color-negative)" } : undefined}>
                      {d.lostCups > 0 ? d.lostCups : ""}
                    </td>
                    <td
                      className="money px-3 py-2"
                      style={{ color: d.profit >= 0 ? "var(--color-positive)" : "var(--color-negative)" }}
                    >
                      {d.profit >= 0 ? "+" : ""}
                      {formatNT(d.profit)}
                    </td>
                    <td className="money px-3 py-2 font-semibold">{formatNT(d.cash)}</td>
                    <td className="px-3 py-2 text-ink-soft">{d.event ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lastDay && !o.survived && (
            <p className="mt-3 rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative">
              現金在第 {o.bankruptDay} 天轉為負數，攤位撐不下去了。
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-hairline bg-surface p-5" style={{ borderLeft: `4px solid ${color}` }}>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">毛利率（漲價前）</dt>
              <dd className="money font-semibold">{o.grossMarginPct}%</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">第 {COST_SHOCK_DAY} 天的決定</dt>
              <dd className="font-semibold">{o.raisedPrice ? `漲價 ${formatNT(PRICE_RAISE)}` : "吸收成本、不漲價"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">賣光、客人沒買到</dt>
              <dd className="money font-semibold">
                {o.lostCupsTotal} 杯（少收約 {formatNT(o.lostRevenue)}）
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-ink-faint">所有數字為教學用的示意情境。</p>
        </section>

        <CoachPanel runId={result.runId} />
        <OutcomeActions
          onReset={() => {
            setAtShock(false);
            reset();
          }}
          resetLabel="換個策略再試一次"
        />
      </div>
    );
  }

  const price = PRICE_OPTIONS.find((p) => p.id === priceId)!;
  const prep = PREP_OPTIONS.find((p) => p.id === prepId)!;
  const grossMargin = price.pricePerCup - price.costPerCup;
  const breakEven = grossMargin > 0 ? Math.ceil(prep.dailyFixedCost / grossMargin) : null;

  if (atShock) {
    const sofar = computeBubbleTea({ priceId, prepId, throughDay: COST_SHOCK_DAY - 1 });
    const last = sofar.days[sofar.days.length - 1];
    const newCost = Math.round(price.costPerCup * 1.2 * 10) / 10;
    if (!sofar.survived) {
      // Closed before the shock arrives: there is no decision left to make.
      return (
        <div className="space-y-6">
          <PlatformPanel color="#c8102e" eyebrow={`手搖飲攤位 · 第 ${sofar.bankruptDay} 天`}>
            <h2 className="text-2xl font-black">還沒撐到第 {COST_SHOCK_DAY} 天，現金就見底了</h2>
          </PlatformPanel>
          <button
            type="button"
            disabled={submitting}
            onClick={() => submit({ priceId, prepId, raiseAfterShock: false })}
            className="w-full rounded-xl bg-ink px-5 py-4 text-base font-semibold text-white disabled:opacity-50"
          >
            看結算
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <PlatformPanel color={sofar.survived ? color : "#c8102e"} eyebrow={`手搖飲攤位 · 第 ${COST_SHOCK_DAY} 天`}>
          <h2 className="text-2xl font-black">茶葉批發價上漲了</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/85">
            前 {sofar.days.length} 天你賣了 {sofar.days.reduce((n, d) => n + d.cupsSold, 0)} 杯，現金{" "}
            {formatNT(last?.cash ?? 0)}
            {sofar.lostCupsTotal > 0 ? `，有 ${sofar.lostCupsTotal} 杯是客人想買卻已經賣光` : ""}。
            從今天起，每杯原料成本從 {formatNT(price.costPerCup)} 漲到約 {formatNT(newCost)}。
          </p>
        </PlatformPanel>
        <p className="text-sm leading-relaxed text-ink-soft">
          漲價 {formatNT(PRICE_RAISE)} 可以把每杯毛利賺回來，但會少一些客人；不漲價客人不會跑，但每杯賺得比較少。
        </p>
        {error && (
          <p className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative" role="alert">
            {error}
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => submit({ priceId, prepId, raiseAfterShock: true })}
            className="rounded-xl bg-ink px-5 py-4 text-base font-semibold text-white disabled:opacity-50"
          >
            漲價到 {formatNT(price.pricePerCup + PRICE_RAISE)}/杯
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => submit({ priceId, prepId, raiseAfterShock: false })}
            className="rounded-xl border border-hairline bg-surface px-5 py-4 text-base font-semibold disabled:opacity-50"
          >
            維持 {formatNT(price.pricePerCup)}/杯，吸收成本
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PlatformPanel color={color} eyebrow="手搖飲攤位">
        <h2 className="text-2xl font-black">選定價與備料規模</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-white/85">
          用 NT$5,000 起始資金經營一個手搖飲攤位，30 個模擬營業日中會遇到颱風、原料漲價、競爭對手開幕等事件。撐到最後，還是提早收攤？
        </p>
      </PlatformPanel>

      <fieldset>
        <legend className="text-xl font-bold">定價策略</legend>
        <div className="mt-4 space-y-3">
          {PRICE_OPTIONS.map((p) => (
            <SelectCard
              key={p.id}
              name="price"
              selected={priceId === p.id}
              onSelect={() => setPriceId(p.id)}
              color={color}
              title={p.label}
              meta={`毛利 ${formatNT(p.pricePerCup - p.costPerCup)}/杯 · 毛利率 ${Math.round(((p.pricePerCup - p.costPerCup) / p.pricePerCup) * 100)}%`}
              sub={`基準需求約每天 ${p.baseDemand} 杯`}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold">備料規模</legend>
        <div className="mt-4 space-y-3">
          {PREP_OPTIONS.map((p) => (
            <SelectCard
              key={p.id}
              name="prep"
              selected={prepId === p.id}
              onSelect={() => setPrepId(p.id)}
              color={color}
              title={p.label}
              meta={`固定成本 ${formatNT(p.dailyFixedCost)}/天`}
            />
          ))}
        </div>
      </fieldset>

      {breakEven !== null && (
        <p className="rounded-lg bg-line-1/10 px-4 py-3 text-xs leading-relaxed text-ink-soft">
          這個組合的損益兩平點約為每天賣出 {breakEven} 杯，備料上限是 {prep.cupsPrepped} 杯。
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative" role="alert">
          {error}
        </p>
      )}

      <SubmitButton
        onClick={() => setAtShock(true)}
        disabled={false}
        submitting={submitting}
        idleLabel="開始經營"
        disabledLabel=""
      />
    </div>
  );
}

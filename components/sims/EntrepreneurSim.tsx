"use client";

import { useState } from "react";
import {
  PRICE_OPTIONS,
  PREP_OPTIONS,
  type PriceId,
  type PrepId,
  type BubbleTeaOutcome,
} from "@/lib/sims/bubbleTea";
import { formatNT } from "@/components/Money";
import { SelectCard, SubmitButton, OutcomeActions } from "@/components/sims/ui";
import { useSimRun } from "@/components/sims/useSimRun";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";

export default function EntrepreneurSim({ color }: { color: string; colorInk: string }) {
  const [priceId, setPriceId] = useState<PriceId>("mid");
  const [prepId, setPrepId] = useState<PrepId>("medium");
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

        <OutcomeActions onReset={reset} resetLabel="換個策略再試一次" />
      </div>
    );
  }

  const price = PRICE_OPTIONS.find((p) => p.id === priceId)!;
  const prep = PREP_OPTIONS.find((p) => p.id === prepId)!;
  const grossMargin = price.pricePerCup - price.costPerCup;
  const breakEven = grossMargin > 0 ? Math.ceil(prep.dailyFixedCost / grossMargin) : null;

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
              meta={`毛利 ${formatNT(p.pricePerCup - p.costPerCup)}/杯`}
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
        onClick={() => submit({ priceId, prepId })}
        disabled={false}
        submitting={submitting}
        idleLabel="開始經營"
        disabledLabel=""
      />
    </div>
  );
}

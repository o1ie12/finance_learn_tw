"use client";

import { useState } from "react";
import {
  PRODUCTS,
  SAVINGS_POLICY,
  premiumsPaidBy,
  surrenderIrr,
  type Decision,
  type ProductId,
  type SalesPitchOutcome,
} from "@/lib/sims/salesPitch";
import { useSimRun } from "@/components/sims/useSimRun";
import { OutcomeActions } from "@/components/sims/ui";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";
import CoachPanel from "@/components/CoachPanel";
import { formatNT } from "@/components/Money";
import { TIME_DEPOSIT_1Y, pct } from "@/lib/rates";

type RoundPhase = "pitch" | "truth";

export default function InsuranceSim({ color, colorInk }: { color: string; colorInk: string }) {
  const [round, setRound] = useState(0); // index into PRODUCTS
  const [phase, setPhase] = useState<RoundPhase>("pitch");
  const [decisions, setDecisions] = useState<Record<ProductId, Decision>>(
    {} as Record<ProductId, Decision>,
  );

  const [askedForTable, setAskedForTable] = useState(false);
  const { submitting, error, result, submit, reset } = useSimRun<SalesPitchOutcome>("baoxian");

  const product = PRODUCTS[round];
  const allAnswered = round >= PRODUCTS.length;

  function decide(d: Decision) {
    if (!product) return;
    setDecisions((prev) => ({ ...prev, [product.id]: d }));
    setPhase("truth");
  }

  function next() {
    if (round + 1 >= PRODUCTS.length) {
      const complete: Record<ProductId, Decision> = { ...decisions };
      // decisions state already has every id set by this point (one per round)
      void submit({ decisions: complete, askedForTable });
      setRound(round + 1);
      return;
    }
    setRound((r) => r + 1);
    setPhase("pitch");
  }

  function playAgain() {
    setRound(0);
    setPhase("pitch");
    setDecisions({} as Record<ProductId, Decision>);
    setAskedForTable(false);
    reset();
  }

  if (result) {
    const o = result.outcome;
    return (
      <div className="space-y-8">
        <PlatformPanel color={color} eyebrow="業務員對話 · 結果">
          <h2 className="text-3xl font-black">
            {o.allDeclined ? "全部婉拒" : `買了 ${o.bought.length} 項商品`}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/85">
            {o.allDeclined
              ? "今天什麼都沒買——先搞懂再決定，是很好的開始，不買也是一種完整的選擇。"
              : `你選擇了：${o.bought.map((id) => PRODUCTS.find((p) => p.id === id)?.name).join("、")}。每個決定都可以之後重新評估。`}
          </p>
          <StampReveal outcomeTitle={result.outcomeTitle} pointsAwarded={result.pointsAwarded} />
        </PlatformPanel>

        <section aria-labelledby="recap-heading">
          <h3 id="recap-heading" className="text-lg font-bold">
            這次的每個決定
          </h3>
          <div className="mt-3 space-y-3">
            {PRODUCTS.map((p) => {
              const d = o.decisions[p.id];
              const bought = d === "buy";
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-hairline bg-surface p-4"
                  style={{ borderLeft: `4px solid ${bought ? colorInk : "var(--color-hairline)"}` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink-faint">{p.name}</p>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{ background: bought ? colorInk : "#8a8a8a" }}
                    >
                      {bought ? "買了" : "婉拒"}
                    </span>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink/90">{p.truth}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section
          className="rounded-2xl border border-hairline bg-surface p-5"
          style={{ borderLeft: `4px solid ${colorInk}` }}
        >
          <p className="font-display text-xs font-bold uppercase tracking-wider" style={{ color: colorInk }}>
            儲蓄險 · 你的決定
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/90">
            {o.savingsVerdict === "bought_without_checking" &&
              "你買了，但沒有先看解約金表。業務員說的宣告利率不是你實際拿到的報酬——解約金表才是。"}
            {o.savingsVerdict === "bought_after_checking" &&
              "你先看了解約金表才買。如果你確定這筆錢 10 年內都用不到，這是一個知情的選擇。"}
            {o.savingsVerdict === "declined" && "你婉拒了。把它當成「更好的定存」，正是這張保單最常被誤會的地方。"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            第 6 年解約：繳了 {formatNT(o.paidBy6)}，拿回 {formatNT(o.surrenderAt6)}，報酬率約 {pct(o.irrAt6)}。
            第 10 年解約：報酬率約 {pct(o.irrAt10)}。同一段時間放{TIME_DEPOSIT_1Y.bank}一年期定存是 {pct(o.depositRate)}。
          </p>
          <p className="mt-2 text-xs text-ink-faint">
            保單數字是示意用的範例，不是任何一家保險公司的商品；定存利率為{TIME_DEPOSIT_1Y.bank} {TIME_DEPOSIT_1Y.asOfLabel}牌告。
          </p>
        </section>

        <CoachPanel runId={result.runId} />
        <OutcomeActions onReset={playAgain} resetLabel="換個決定再試一次" />
      </div>
    );
  }

  if (allAnswered) {
    // decisions just got submitted in next(); show a brief loading state
    return (
      <div className="space-y-6">
        <PlatformPanel color={color} eyebrow="業務員對話">
          <h2 className="text-2xl font-black">結算中…</h2>
        </PlatformPanel>
        {error && (
          <p className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  const decidedForThisRound = product ? decisions[product.id] : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="money text-sm text-ink-faint">
          第 {round + 1} / {PRODUCTS.length} 位業務員
        </span>
      </div>

      <PlatformPanel color={color} eyebrow={`業務員對話 · ${product.name}`}>
        <h2 className="text-xl font-black">「{product.pitch}」</h2>
        {product.id === "savings" && (
          <p className="mt-3 text-[15px] leading-relaxed text-white/85">
            「每年繳 {formatNT(SAVINGS_POLICY.annualPremium)}，只要繳 {SAVINGS_POLICY.premiumYears} 年，宣告利率{" "}
            {pct(SAVINGS_POLICY.declaredRate)}，比定存高！」
          </p>
        )}
      </PlatformPanel>

      {product.id === "savings" && phase === "pitch" && !askedForTable && (
        <button
          type="button"
          onClick={() => setAskedForTable(true)}
          className="inline-flex w-full items-center justify-center rounded-xl border-2 border-dashed border-hairline bg-surface px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink"
        >
          先問一句：「可以給我看解約金表嗎？第 6 年、第 10 年解約的報酬率是多少？」
        </button>
      )}

      {product.id === "savings" && askedForTable && <SurrenderTable colorInk={colorInk} />}

      {phase === "pitch" && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => decide("buy")}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-ink px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            買
          </button>
          <button
            type="button"
            onClick={() => decide("decline")}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-hairline bg-surface px-6 py-4 text-base font-semibold text-ink transition-colors hover:border-ink"
          >
            婉拒
          </button>
        </div>
      )}

      {phase === "truth" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-hairline bg-surface p-4" style={{ borderLeft: `4px solid ${colorInk}` }}>
            <p className="font-display text-xs font-bold uppercase tracking-wider" style={{ color: colorInk }}>
              真實情況
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/90">{product.truth}</p>
            {product.id === "savings" && (
              <p className="mt-2 text-[15px] leading-relaxed text-ink/90">
                {decidedForThisRound === "buy"
                  ? askedForTable
                    ? `你看過解約金表才買：前幾年解約會虧，撐到第 10 年報酬率約 ${pct(surrenderIrr(10))}。這筆錢要確定 10 年內用不到。`
                    : `你沒看解約金表就買了。如果第 6 年急需用錢解約，繳了 ${formatNT(premiumsPaidBy(6))} 只拿回 ${formatNT(SAVINGS_POLICY.surrenderValues[5])}。`
                  : `你婉拒了。同樣的錢放定存是 ${pct(TIME_DEPOSIT_1Y.rate)}，隨時可以解約，不會因為提前用錢而虧本金。`}
              </p>
            )}
            <p className="mt-2 text-sm font-semibold text-ink-faint">
              你的決定：{decidedForThisRound === "buy" ? "買" : "婉拒"}
            </p>
          </div>
          <button
            type="button"
            onClick={next}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {round + 1 >= PRODUCTS.length ? (submitting ? "結算中…" : "看結果") : "下一位業務員"}
          </button>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}


/** The 解約金表 a student gets by asking for it — the station's one question. */
function SurrenderTable({ colorInk }: { colorInk: string }) {
  const years = [1, 2, 3, 4, 5, 6, 8, 10];
  return (
    <section className="rounded-2xl border border-hairline bg-surface p-4">
      <p className="font-display text-xs font-bold uppercase tracking-wider" style={{ color: colorInk }}>
        業務員給你的解約金表（示意範例）
      </p>
      <table className="mt-2 w-full text-sm">
        <thead>
          <tr className="text-left text-ink-faint">
            <th className="py-1 font-medium">第幾年解約</th>
            <th className="py-1 font-medium">已繳保費</th>
            <th className="py-1 font-medium">拿回（解約金）</th>
          </tr>
        </thead>
        <tbody>
          {years.map((y) => {
            const paid = premiumsPaidBy(y);
            const back = SAVINGS_POLICY.surrenderValues[y - 1];
            return (
              <tr key={y} className="border-t border-hairline">
                <td className="money py-1">{y}</td>
                <td className="money py-1">{formatNT(paid)}</td>
                <td className={`money py-1 ${back < paid ? "text-negative" : "text-positive"}`}>{formatNT(back)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-sm leading-relaxed text-ink/90">
        換算成每年的報酬率（內部報酬率，IRR）：第 6 年解約約 <span className="money font-semibold">{pct(surrenderIrr(6))}</span>，
        第 10 年解約約 <span className="money font-semibold">{pct(surrenderIrr(10))}</span>。對照：{TIME_DEPOSIT_1Y.bank}一年期定存{" "}
        <span className="money font-semibold">{pct(TIME_DEPOSIT_1Y.rate)}</span>（{TIME_DEPOSIT_1Y.asOfLabel}牌告）。
      </p>
      <p className="mt-1 text-xs text-ink-faint">宣告利率會變動、不保證；保單數字是示意用的範例，不是任何一家保險公司的商品。</p>
    </section>
  );
}

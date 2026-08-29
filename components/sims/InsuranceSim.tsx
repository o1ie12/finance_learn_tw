"use client";

import { useState } from "react";
import {
  PRODUCTS,
  type Decision,
  type ProductId,
  type SalesPitchOutcome,
} from "@/lib/sims/salesPitch";
import { useSimRun } from "@/components/sims/useSimRun";
import { OutcomeActions } from "@/components/sims/ui";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";

type RoundPhase = "pitch" | "truth";

export default function InsuranceSim({ color, colorInk }: { color: string; colorInk: string }) {
  const [round, setRound] = useState(0); // index into PRODUCTS
  const [phase, setPhase] = useState<RoundPhase>("pitch");
  const [decisions, setDecisions] = useState<Record<ProductId, Decision>>(
    {} as Record<ProductId, Decision>,
  );

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
      void submit({ decisions: complete });
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
      </PlatformPanel>

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

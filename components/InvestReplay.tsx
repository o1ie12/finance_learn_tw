"use client";

import { useState } from "react";
import { TICKERS, STARTING_CASH, REVEAL_MIN_SIM_DAYS, REVEAL_AUTO_SIM_DAYS } from "@/lib/sims/historicalReplay";
import { formatNT } from "@/components/Money";
import Sparkline from "@/components/Sparkline";
import type { SimPortfolioView } from "@/lib/simPortfolioModel";

const LINE_COLOR = "#8E44AD"; // 投資線's color — this feature only unlocks from that line

export default function InvestReplay({ initialView }: { initialView: SimPortfolioView | null }) {
  const [view, setView] = useState(initialView);
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rebalancing, setRebalancing] = useState(false);

  const total = Object.values(amounts).reduce((a, b) => a + b, 0);
  const remaining = STARTING_CASH - total;

  function setAmount(ticker: string, value: number) {
    setAmounts((a) => ({ ...a, [ticker]: Math.max(0, Math.min(value, STARTING_CASH)) }));
  }

  async function allocate() {
    setSubmitting(true);
    setError(null);
    try {
      const allocations = TICKERS.map((t) => ({ ticker: t.id, amount: amounts[t.id] ?? 0 }));
      const res = await fetch("/api/sim-portfolio/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocations }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("配置失敗，請確認總金額沒有超過 NT$100,000。");
        return;
      }
      setView(data.view);
    } catch {
      setError("網路連線出了問題，請再試一次。");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitRebalance() {
    setSubmitting(true);
    setError(null);
    try {
      const allocations = TICKERS.map((t) => ({ ticker: t.id, amount: amounts[t.id] ?? 0 }));
      const res = await fetch("/api/sim-portfolio/rebalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocations }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("調整失敗，請確認總金額沒有超過目前的投資組合價值。");
        return;
      }
      setView(data.view);
      setRebalancing(false);
      setAmounts({});
    } catch {
      setError("網路連線出了問題，請再試一次。");
    } finally {
      setSubmitting(false);
    }
  }

  async function reveal() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/sim-portfolio/reveal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError("還不能揭曉，至少要經過 30 個模擬日。");
        return;
      }
      setView(data.view);
    } catch {
      setError("網路連線出了問題，請再試一次。");
    } finally {
      setSubmitting(false);
    }
  }

  // ---- No portfolio yet: allocation screen ----
  if (!view) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-white" style={{ background: "#151a21", borderTop: `4px solid ${LINE_COLOR}` }}>
          <p className="font-display text-xs font-bold uppercase tracking-widest" style={{ color: LINE_COLOR }}>
            歷史回放投資模擬
          </p>
          <h2 className="mt-1.5 text-2xl font-black">你會被指派一個真實的歷史起點</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/85">
            用 {formatNT(STARTING_CASH)} 的模擬資金，把錢分配到六支 ETF。你不會知道自己身處哪一年——這是盲測，重點是你的配置決定，不是猜對時機。至少經過 {REVEAL_MIN_SIM_DAYS} 個模擬日後可以隨時揭曉，最晚 {REVEAL_AUTO_SIM_DAYS} 天會自動揭曉。
          </p>
        </div>

        <div className="space-y-3">
          {TICKERS.map((t) => (
            <div key={t.id} className="rounded-2xl border border-hairline bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold">
                    {t.id} <span className="font-normal text-ink-soft">{t.name}</span>
                  </p>
                  {t.note && <p className="mt-1 text-xs text-ink-faint">{t.note}</p>}
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={STARTING_CASH}
                step={1000}
                value={amounts[t.id] ?? 0}
                onChange={(e) => setAmount(t.id, Number(e.target.value))}
                className="mt-3 w-full accent-[var(--accent)]"
                style={{ ["--accent" as string]: LINE_COLOR }}
              />
              <p className="money mt-1 text-right text-sm font-semibold">{formatNT(amounts[t.id] ?? 0)}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-surface p-4">
          <p className="text-sm">
            已配置 <span className="money font-semibold">{formatNT(total)}</span> / {formatNT(STARTING_CASH)}
            {remaining < 0 && <span className="ml-2 text-negative">超出 {formatNT(-remaining)}</span>}
          </p>
        </div>

        {error && <p className="text-sm text-negative">{error}</p>}

        <button
          type="button"
          onClick={allocate}
          disabled={submitting || remaining < 0 || total <= 0}
          className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "配置中…" : "開始模擬"}
        </button>
      </div>
    );
  }

  const { portfolio, simDayIndex, value, benchmarkValue, sparkline, revealData } = view;
  const gain = value - 100000;
  const gainPct = (gain / 100000) * 100;

  // ---- Revealed: comparison screen ----
  if (revealData) {
    const benchGain = benchmarkValue - 100000;
    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-white" style={{ background: "#151a21", borderTop: `4px solid ${LINE_COLOR}` }}>
          <p className="font-display text-xs font-bold uppercase tracking-widest" style={{ color: LINE_COLOR }}>
            揭曉
          </p>
          <h2 className="mt-1.5 text-2xl font-black">
            你經歷的是 {revealData.startDate} 到 {revealData.endDate}
          </h2>
          {revealData.namedEvent && (
            <p className="mt-2 text-[15px] text-white/85">{revealData.namedEvent}</p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-hairline bg-surface p-5">
            <p className="text-sm text-ink-faint">你的配置</p>
            <p className="money mt-1 text-2xl font-black" style={{ color: gain >= 0 ? "var(--color-positive)" : "var(--color-negative)" }}>
              {gain >= 0 ? "+" : ""}
              {gainPct.toFixed(1)}%
            </p>
            <p className="money text-sm text-ink-soft">{formatNT(value)}</p>
          </div>
          <div className="rounded-2xl border border-hairline bg-surface p-5">
            <p className="text-sm text-ink-faint">均分買進持有（對照組）</p>
            <p className="money mt-1 text-2xl font-black" style={{ color: benchGain >= 0 ? "var(--color-positive)" : "var(--color-negative)" }}>
              {benchGain >= 0 ? "+" : ""}
              {((benchGain / 100000) * 100).toFixed(1)}%
            </p>
            <p className="money text-sm text-ink-soft">{formatNT(benchmarkValue)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-5">
          <Sparkline points={sparkline.map((p) => p.value)} color={LINE_COLOR} />
        </div>

        <p className="rounded-lg bg-line-1/10 px-4 py-3 text-xs leading-relaxed text-ink-soft">
          股價資料來源：臺灣證券交易所（TWSE）與證券櫃檯買賣中心（TPEx）公開資訊，依政府資料開放授權條款提供。
        </p>
      </div>
    );
  }

  // ---- Active: status + optional rebalance ----
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white" style={{ background: "#151a21", borderTop: `4px solid ${LINE_COLOR}` }}>
        <p className="font-display text-xs font-bold uppercase tracking-widest" style={{ color: LINE_COLOR }}>
          第 {simDayIndex} 個模擬日
        </p>
        <h2 className="mt-1.5 text-3xl font-black">
          {formatNT(value)}
          <span
            className="money ml-2 text-lg font-semibold"
            style={{ color: gain >= 0 ? "#4ade80" : "#f87171" }}
          >
            {gain >= 0 ? "+" : ""}
            {gainPct.toFixed(1)}%
          </span>
        </h2>
        <div className="mt-4">
          <Sparkline points={sparkline.map((p) => p.value)} color="#ffffff" light />
        </div>
      </div>

      {view.revealEligible && (
        <div className="rounded-2xl border border-hairline bg-surface p-5">
          <p className="font-bold">
            {view.revealRequired ? "已經滿 365 個模擬日了" : "已經可以揭曉了"}
          </p>
          <p className="mt-1.5 text-sm text-ink-soft">
            看看你經歷的其實是哪一段歷史，跟均分買進持有的對照組比較結果。
          </p>
          {error && <p className="mt-2 text-sm text-negative">{error}</p>}
          <button
            type="button"
            onClick={reveal}
            disabled={submitting}
            className="mt-3 inline-flex items-center justify-center rounded-xl bg-ink px-5 py-3 text-base font-semibold text-white hover:-translate-y-0.5 disabled:opacity-50"
          >
            揭曉結果
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-hairline bg-surface p-5">
        {!rebalancing ? (
          <button
            type="button"
            onClick={() => setRebalancing(true)}
            className="text-sm font-semibold text-line-2 underline"
          >
            調整配置
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-ink-soft">
              用目前的總值 {formatNT(value)} 重新分配——賣掉現有部位，換成新的配置。
            </p>
            {TICKERS.map((t) => (
              <div key={t.id}>
                <label className="text-sm font-semibold">
                  {t.id} {t.name}
                </label>
                <input
                  type="range"
                  min={0}
                  max={Math.round(value)}
                  step={1000}
                  value={amounts[t.id] ?? 0}
                  onChange={(e) => setAmount(t.id, Number(e.target.value))}
                  className="mt-1 w-full"
                />
                <p className="money text-right text-sm">{formatNT(amounts[t.id] ?? 0)}</p>
              </div>
            ))}
            {error && <p className="text-sm text-negative">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={submitRebalance}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                確認調整
              </button>
              <button
                type="button"
                onClick={() => {
                  setRebalancing(false);
                  setAmounts({});
                }}
                className="inline-flex items-center justify-center rounded-xl border border-hairline px-5 py-3 text-sm font-semibold"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-ink-faint">
        目前持股：
        {Object.entries(portfolio.holdings)
          .map(([t, u]) => `${t} ${u.toFixed(2)} 單位`)
          .join("、") || "全現金"}
      </p>
    </div>
  );
}

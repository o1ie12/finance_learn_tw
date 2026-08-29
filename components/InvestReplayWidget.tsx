import Link from "next/link";
import { formatNT } from "@/components/Money";
import Sparkline from "@/components/Sparkline";
import type { SimPortfolioView } from "@/lib/simPortfolioModel";

const LINE_COLOR = "#8E44AD";

/** Compact dashboard card — Duolingo/Wordle-style persistent widget, not
 * gated behind its own page unless the student wants the full view. */
export default function InvestReplayWidget({ view }: { view: SimPortfolioView | null }) {
  if (!view) {
    return (
      <Link
        href="/invest-replay"
        className="flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-surface p-5 transition-colors hover:border-ink/40"
      >
        <div>
          <p className="font-bold">用 NT$100,000 盲測一段歷史</p>
          <p className="mt-1 text-sm text-ink-soft">分配到六支 ETF，看看你的配置經得起考驗嗎。</p>
        </div>
        <span className="shrink-0 text-sm font-semibold" style={{ color: LINE_COLOR }}>
          開始 →
        </span>
      </Link>
    );
  }

  const gain = view.value - 100000;
  const gainPct = (gain / 100000) * 100;

  return (
    <Link
      href="/invest-replay"
      className="block rounded-2xl border border-hairline bg-surface p-5 transition-colors hover:border-ink/40"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink-faint">第 {view.simDayIndex} 個模擬日</p>
          <p className="money mt-0.5 text-2xl font-black">
            {formatNT(view.value)}
            <span
              className="ml-2 text-sm font-semibold"
              style={{ color: gain >= 0 ? "var(--color-positive)" : "var(--color-negative)" }}
            >
              {gain >= 0 ? "+" : ""}
              {gainPct.toFixed(1)}%
            </span>
          </p>
        </div>
        <div className="w-28 shrink-0">
          <Sparkline points={view.sparkline.map((p) => p.value)} color={LINE_COLOR} height={36} />
        </div>
      </div>
      {view.portfolio.revealed && <p className="mt-2 text-xs text-ink-faint">已揭曉</p>}
      {!view.portfolio.revealed && view.revealEligible && (
        <p className="mt-2 text-xs font-semibold" style={{ color: LINE_COLOR }}>
          已經可以揭曉結果了
        </p>
      )}
    </Link>
  );
}

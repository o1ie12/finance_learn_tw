import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FundCard } from "@/components/status/FundCard";
import { nt, ntSigned, percent1 } from "@/components/play/playModel";
import { Icon } from "@/components/ui/icons";
import { TopBar } from "@/components/ui/TopBar";
import { loadGameHome } from "@/lib/gameHome";
import { needsOnboarding } from "@/lib/onboarding";
import { getCurrentStudent } from "@/lib/session";
import s from "@/components/status/status.module.css";

export const metadata: Metadata = { title: "狀態" };

/**
 * 狀態 (06 E8.7): four stat cards, the emergency fund, freedom, then rows to
 * 工具箱, 證書 and 設定. Every number comes from the saved game on the server.
 */
export default async function StatusPage() {
  const student = await getCurrentStudent().catch(() => null);
  if (!student) redirect("/dashboard");
  if (needsOnboarding(student)) redirect("/creator");
  const data = await loadGameHome(student);
  const g = data.game;
  const last = g?.state.history.at(-1) ?? null;
  // Only cash has last month's start and end on record (the ledger); the
  // save keeps no per-account history, so the other cards show no change.
  const cashChange = last ? last.ledger.cashEnd - last.ledger.cashStart : null;
  const stats: { label: string; value: number; change: number | null }[] = [
    { label: "現金", value: g?.state.accounts.cash ?? 0, change: cashChange },
    { label: "存款", value: data.money.saved.amount, change: null },
    { label: "投資", value: g?.view.totals.invest ?? 0, change: null },
    { label: "負債", value: g?.view.totals.debt ?? 0, change: null },
  ];

  return (
    <>
      <TopBar title="狀態" flat />
      <div className={s.page}>
        <div className={s.grid}>
          {stats.map((st) => (
            <div key={st.label} className={s.card}>
              <span className={s.cardLabel}>{st.label}</span>
              <span className={s.stat}>{nt(st.value)}</span>
              {st.change !== null && st.change !== 0 ? (
                <span className={`${s.delta} ${st.change > 0 ? s.up : s.down}`}>
                  <span aria-hidden="true">{st.change > 0 ? "▲" : "▼"}</span> {ntSigned(st.change)}
                  <span className="sr-only">，上個月</span>
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <FundCard months={data.money.efMonths} fund={data.money.fund} />
        <div className={s.card}>
          <span className={s.cardLabel}>自由度</span>
          <span className={s.stat}>{percent1(data.money.freedomPct)}</span>
          <span className={s.cardCaption}>被動收入 ÷ 月薪。到 100% 就是財務自由。</span>
        </div>
        <nav className={s.list} aria-label="更多">
          <Link href="/tools" className={s.row}>
            工具箱
            <Icon name="chevron" size={20} />
          </Link>
          <Link href="/passport" className={s.row}>
            證書
            <Icon name="chevron" size={20} />
          </Link>
          <Link href="/settings" className={s.row}>
            設定
            <Icon name="chevron" size={20} />
          </Link>
        </nav>
      </div>
    </>
  );
}

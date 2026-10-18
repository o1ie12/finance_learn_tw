import { FloatCard } from "@/components/game/FloatCard";
import { formatNT } from "@/components/Money";
import type { Journey } from "@/lib/lifeGame/finale";

const CREDIT = { good: "良好", fair: "普通", poor: "不佳" } as const;

/** 財務決策線's final screen: the student's whole journey on one card (04 §13). */
export function JourneyCard({ journey }: { journey: Journey }) {
  const rows: [string, string][] = [
    ["工作", journey.job],
    ["每月先存", `月薪的 ${journey.savingRatePct}%`],
    ["緊急預備金", `${journey.efMonths.toFixed(1)} 個月`],
    ["信用紀錄", CREDIT[journey.creditRecord]],
    ["投資", formatNT(journey.invested)],
    ["財務自由進度", `${journey.freedomPct.toFixed(1)}%`],
    ["壓力", journey.stress],
  ];
  return (
    <div className="g-whyfirst">
      <div style={{ width: "100%", maxWidth: 760 }}>
        <FloatCard strong title={`你的人生遊戲 · 第 ${journey.months} 個月`} as="section">
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px" }}>
            {rows.map(([k, v]) => (
              <div key={k} style={{ display: "contents" }}>
                <dt style={{ color: "var(--ink-muted)" }}>{k}</dt>
                <dd style={{ margin: 0, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{v}</dd>
              </div>
            ))}
          </dl>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-muted)" }}>下面的買房或租屋決定，會用到這些數字。</p>
        </FloatCard>
      </div>
    </div>
  );
}

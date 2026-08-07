"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type Variant = "A" | "B";

/**
 * TEMPORARY pilot screen: a one-time comparison of the transit-map dashboard
 * (Variant A, live in production — DashboardMapView) against a plain
 * card-grid alternative (Variant B — DashboardCardGrid), shown once to each
 * student right after their first terminal-simulation completion. Gated by
 * ENABLE_DASHBOARD_AB_TEST (see lib/config.ts and app/dashboard/page.tsx).
 *
 * Follow-up: once the pilot group's feedback (via the Google Form below)
 * picks a winning design, either extend it site-wide or delete this
 * component, DashboardCardGrid, and the seen_ab_dashboard_test branch in
 * app/dashboard/page.tsx.
 */
export default function DashboardABTest({
  variantA,
  variantB,
  feedbackFormUrl,
}: {
  variantA: ReactNode;
  variantB: ReactNode;
  feedbackFormUrl: string | null;
}) {
  const [variant, setVariant] = useState<Variant>("A");

  const feedbackHref = feedbackFormUrl
    ? `${feedbackFormUrl}${feedbackFormUrl.includes("?") ? "&" : "?"}variant=${variant}`
    : null;

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-hairline bg-surface p-5 sm:p-6">
        <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-line-2">
          搶先體驗 · 兩種設計比一比
        </p>
        <h2 className="mt-1.5 text-2xl font-black tracking-tight">
          你比較喜歡哪一種路線圖？
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          我們在測試兩種呈現進度的方式，這裡是你的真實進度。兩邊切換看看，喜歡的都可以點進去試試，最後告訴我們你的想法。
        </p>

        <div
          role="tablist"
          aria-label="選擇要查看的設計"
          className="mt-5 inline-flex rounded-xl border border-hairline bg-bg p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={variant === "A"}
            onClick={() => setVariant("A")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              variant === "A" ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            路網地圖版
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={variant === "B"}
            onClick={() => setVariant("B")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              variant === "B" ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            卡片列表版
          </button>
        </div>
      </div>

      <div className="mt-2">
        <div hidden={variant !== "A"}>{variantA}</div>
        <div hidden={variant !== "B"}>{variantB}</div>
      </div>

      <div className="mt-8 rounded-2xl bg-ink p-6 text-center text-white sm:p-8">
        <p className="text-lg font-bold">看完兩種設計了嗎？</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/75">
          告訴我們你比較喜歡哪一種、為什麼——你的意見會直接影響我們接下來的設計。
        </p>
        {feedbackHref ? (
          <a
            href={feedbackHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-ink hover:-translate-y-0.5"
          >
            告訴我們你的想法 <span aria-hidden="true">→</span>
          </a>
        ) : (
          <p className="mt-5 text-sm text-white/60">（尚未設定回饋表單連結）</p>
        )}
      </div>
    </div>
  );
}

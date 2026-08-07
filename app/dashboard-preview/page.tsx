import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DashboardMapView from "@/components/DashboardMapView";
import DashboardCardGrid from "@/components/DashboardCardGrid";
import DashboardABTest from "@/components/DashboardABTest";
import { allLineStatuses } from "@/lib/progressModel";
import { isDashboardAbTestEnabled } from "@/lib/config";
import {
  PREVIEW_PROGRESS,
  PREVIEW_RUNS_BY_LINE,
} from "@/lib/dashboardPreviewFixture";

/**
 * TEMPORARY: a standalone design-preview page for the pilot group, comparing
 * the live transit-map dashboard (Variant A, reused as-is via DashboardMapView)
 * against a plain card-grid alternative (Variant B, DashboardCardGrid). Uses
 * hardcoded sample progress (lib/dashboardPreviewFixture.ts) — no signup, no
 * database — so it's purely a design/style comparison, shared directly with
 * the pilot group rather than linked from the app's normal navigation.
 *
 * Gated by ENABLE_DASHBOARD_AB_TEST (lib/config.ts) so the whole page can be
 * switched off in one place. Follow-up: once the pilot's feedback (via the
 * Google Form CTA) picks a winning design, either extend it site-wide or
 * delete this route, DashboardABTest, and DashboardCardGrid entirely.
 */
export const metadata: Metadata = {
  title: "設計預覽：兩種路線圖",
  robots: { index: false, follow: false },
};

export default function DashboardPreviewPage() {
  if (!isDashboardAbTestEnabled()) notFound();

  const statuses = allLineStatuses(PREVIEW_PROGRESS, PREVIEW_RUNS_BY_LINE);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header>
        <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-faint">
          設計預覽
        </p>
        <h1 className="mt-1.5 text-3xl font-black tracking-tight sm:text-4xl">
          兩種路線圖，你比較喜歡哪一種？
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          這裡使用示範資料，不是你的真實帳號——純粹讓你比較兩種設計的風格與好不好用。
        </p>
      </header>

      <DashboardABTest
        variantA={
          <DashboardMapView
            statuses={statuses}
            progress={PREVIEW_PROGRESS}
            runsByLine={PREVIEW_RUNS_BY_LINE}
          />
        }
        variantB={<DashboardCardGrid statuses={statuses} />}
        feedbackFormUrl={process.env.AB_TEST_FEEDBACK_FORM_URL ?? null}
      />
    </div>
  );
}

import Link from "next/link";
import type { LineStatus } from "@/lib/progressModel";

/**
 * Variant B of the temporary dashboard pilot: a plain card grid, one card per
 * line, no map metaphor — direct "X of Y stations complete" language instead.
 * See components/DashboardABTest.tsx for where this is used and why.
 */
export default function DashboardCardGrid({
  statuses,
}: {
  statuses: LineStatus[];
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {statuses.map((s) => {
        const pct =
          s.stationsTotal > 0
            ? Math.round((s.stationsDone / s.stationsTotal) * 100)
            : 0;
        const ctaHref = s.complete
          ? `/line/${s.line.slug}/certificate`
          : (s.next?.href ?? `/line/${s.line.slug}`);
        const ctaLabel = s.complete
          ? "查看證書"
          : s.next
            ? `繼續：${s.next.label}`
            : "開始這條線";

        return (
          <div
            key={s.line.slug}
            className="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface"
          >
            <span
              className="h-1.5 w-full"
              style={{ background: s.line.color }}
              aria-hidden="true"
            />
            <div className="flex flex-1 flex-col p-5">
              <Link href={`/line/${s.line.slug}`} className="group">
                <h3 className="text-xl font-bold group-hover:underline">
                  {s.line.name}
                </h3>
              </Link>
              <p className="mt-1 flex-1 text-[15px] leading-relaxed text-ink-soft">
                {s.line.short}
              </p>

              <div className="mt-4">
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-bg"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${s.line.name} 進度`}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: s.line.color }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-ink-faint">
                  {s.stationsDone}/{s.stationsTotal} 站完成
                  {s.simDone ? "・模擬已完成" : ""}
                </p>
              </div>

              <Link
                href={ctaHref}
                className="mt-4 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: s.line.colorInk }}
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

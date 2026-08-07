import Link from "next/link";
import TransitNetworkMap from "@/components/TransitNetworkMap";
import { LINES } from "@/lib/lines";
import { getModule } from "@/lib/modules";
import { buildLineStations } from "@/lib/buildStations";
import { nextActionAcrossLines, type LineStatus } from "@/lib/progressModel";
import type { ModuleProgress, SimulationRun } from "@/lib/types";

/**
 * Variant A of the dashboard: the schematic transit-network map. This is the
 * live production dashboard body, unchanged — extracted so the temporary
 * map-vs-card-grid pilot screen (DashboardABTest) can reuse it as-is
 * alongside DashboardCardGrid (Variant B), instead of rebuilding it.
 */
export default function DashboardMapView({
  statuses,
  progress,
  runsByLine,
}: {
  statuses: LineStatus[];
  progress: ModuleProgress[];
  runsByLine: Record<string, SimulationRun>;
}) {
  const next = nextActionAcrossLines(statuses);

  // Banner: station name + its subtitle for the single next action.
  let bannerLabel = "";
  let bannerSubtitle = "";
  if (next) {
    if (next.step.kind === "station" && next.step.moduleNumber) {
      bannerLabel = next.step.label;
      bannerSubtitle = getModule(next.step.moduleNumber)?.title ?? "";
    } else {
      bannerLabel = next.line.sim.station;
      bannerSubtitle = next.line.sim.title;
    }
  }

  const stationsDone = progress.filter((p) => p.completed_at).length;
  const stationsTotal = LINES.reduce((n, l) => n + l.stationModules.length, 0);
  const simsDone = statuses.filter((s) => s.simDone).length;
  const completedLines = statuses.filter((s) => s.complete);

  return (
    <>
      {/* Continue where you left off — one obvious next action, always. */}
      <section aria-labelledby="continue-heading" className="mt-6">
        <h2 id="continue-heading" className="sr-only">
          接下來
        </h2>
        {next ? (
          <Link
            href={next.step.href}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6 text-white transition-transform hover:-translate-y-0.5"
            style={{ background: "#151a21", borderTop: `4px solid ${next.line.color}` }}
          >
            <div>
              <p
                className="money text-[11px] font-bold uppercase tracking-[0.1em]"
                style={{
                  color: `color-mix(in srgb, ${next.line.color} 62%, white)`,
                }}
              >
                目前位置 · {next.line.name}
              </p>
              <p className="mt-1.5 font-display text-[22px] font-extrabold leading-tight">
                下一站：{bannerLabel}
              </p>
              <p className="mt-1 text-[13px] text-white/70">{bannerSubtitle}</p>
            </div>
            <span className="shrink-0 rounded-[10px] bg-white px-[18px] py-3 font-display text-sm font-bold text-ink">
              繼續前往 <span aria-hidden="true">→</span>
            </span>
          </Link>
        ) : (
          <div className="rounded-2xl bg-ink p-6 text-center text-white">
            <p className="text-2xl font-black">四條線都跑完了！🎉</p>
            <p className="mt-2 text-sm text-white/75">
              你完成了 起點 的全部內容。可以回去複習，或把你的完成證書分享給同學。
            </p>
          </div>
        )}
      </section>

      {/* Transit network map */}
      <section aria-labelledby="map-heading" className="mt-8">
        <h2 id="map-heading" className="sr-only">
          你的路網
        </h2>
        <TransitNetworkMap
          lines={statuses.map((s) => {
            const stations = buildLineStations(
              s.line,
              progress,
              runsByLine[s.line.slug] ?? null,
            );
            // On the network map, only a line the student has *started* shows a
            // "current" node; unstarted lines stay fully dimmed.
            const mapped = s.started
              ? stations
              : stations.map((st) =>
                  st.status === "current"
                    ? { ...st, status: "todo" as const }
                    : st,
                );
            return { line: s.line, stations: mapped };
          })}
        />
        <div className="mt-3 text-right">
          <Link href="/lines" className="text-sm font-medium text-line-2 underline">
            瀏覽所有路線 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Summary */}
      <section aria-labelledby="summary-heading" className="mt-8">
        <h2 id="summary-heading" className="sr-only">
          完成統計
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-hairline bg-surface p-4 text-center">
            <p className="money text-2xl font-bold">
              {stationsDone}
              <span className="text-sm text-ink-faint">/{stationsTotal}</span>
            </p>
            <p className="mt-1 text-xs text-ink-soft">站完成</p>
          </div>
          <div className="rounded-2xl border border-hairline bg-surface p-4 text-center">
            <p className="money text-2xl font-bold">
              {simsDone}
              <span className="text-sm text-ink-faint">/{LINES.length}</span>
            </p>
            <p className="mt-1 text-xs text-ink-soft">模擬完成</p>
          </div>
          <div className="rounded-2xl border border-hairline bg-surface p-4 text-center">
            <p className="money text-2xl font-bold">{completedLines.length}</p>
            <p className="mt-1 text-xs text-ink-soft">完成證書</p>
          </div>
        </div>
      </section>

      {/* Certificates for completed lines */}
      {completedLines.length > 0 && (
        <section aria-labelledby="cert-heading" className="mt-8">
          <h2 id="cert-heading" className="text-xl font-bold">
            你的完成證書
          </h2>
          <div className="mt-3 space-y-3">
            {completedLines.map((s) => (
              <Link
                key={s.line.slug}
                href={`/line/${s.line.slug}/certificate`}
                className="flex items-center justify-between rounded-2xl border border-hairline bg-surface p-4 hover:border-ink/30"
                style={{ borderLeft: `4px solid ${s.line.color}` }}
              >
                <span>
                  <span className="font-bold">{s.line.name}</span>
                  <span className="ml-2 text-sm text-ink-soft">完成證書</span>
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: s.line.colorInk }}
                >
                  查看 →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

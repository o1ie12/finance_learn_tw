import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLine, lineModules, lineMinutes } from "@/lib/lines";
import { buildLineStations } from "@/lib/buildStations";
import { lineStatus, moduleDoneSet } from "@/lib/progressModel";
import RouteMap from "@/components/RouteMap";
import { getCurrentStudent } from "@/lib/session";
import { getProgress, getLatestSimulationRunForLine } from "@/lib/db";
import type {
  Student,
  ModuleProgress,
  SimulationRun,
} from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const line = getLine(slug);
  if (!line) return { title: "找不到路線" };
  return { title: `${line.name} · ${line.enName}`, description: line.short };
}

export default async function LineDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const line = getLine(slug);
  if (!line) notFound();

  let student: Student | null = null;
  let progress: ModuleProgress[] = [];
  let run: SimulationRun | null = null;
  try {
    student = await getCurrentStudent();
    if (student) {
      [progress, run] = await Promise.all([
        getProgress(student.id),
        getLatestSimulationRunForLine(student.id, line.slug),
      ]);
    }
  } catch {
    /* not configured — render the public detail */
  }

  const status = lineStatus(line, moduleDoneSet(progress), run);
  const stations = buildLineStations(line, progress, run);
  const mods = lineModules(line);
  const firstStationHref = `/line/${line.slug}/course/${line.stationModules[0]}`;

  // Primary call to action.
  let ctaHref = firstStationHref;
  let ctaLabel = "開始第一站";
  if (student) {
    if (status.complete) {
      ctaLabel = "這條線你已完成 · 再看一次";
      ctaHref = firstStationHref;
    } else if (status.next) {
      ctaHref = status.next.href;
      ctaLabel = status.started
        ? `繼續：${status.next.label}`
        : `開始：${status.next.label}`;
    }
  }

  return (
    <div className="pb-12">
      <div
        className="h-1.5 w-full"
        style={{ background: line.color }}
        aria-hidden="true"
      />
      <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <nav aria-label="麵包屑" className="text-sm text-ink-faint">
          <Link href="/lines" className="hover:text-ink">
            所有路線
          </Link>{" "}
          <span aria-hidden="true">/</span> {line.name}
        </nav>

        <header className="mt-4">
          <p
            className="font-display text-sm font-semibold uppercase tracking-widest"
            style={{ color: line.colorInk }}
          >
            {line.enName}
            {line.flagship ? " · 旗艦路線" : ""}
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            {line.name}
          </h1>
          <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-ink-soft">
            {line.short}
          </p>
          <p className="mt-3 text-sm text-ink-faint">
            {mods.length} 站 · 約 {lineMinutes(line)} 分鐘閱讀 · 1 個終點模擬
            {student ? ` · 已完成 ${status.stationsDone}/${status.stationsTotal} 站` : ""}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              {ctaLabel}
            </Link>
            {!student && (
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-6 py-3.5 text-base font-semibold hover:border-ink"
              >
                建立帳號存進度
              </Link>
            )}
          </div>
        </header>

        {/* The line's map */}
        <section aria-labelledby="map-heading" className="mt-10">
          <h2 id="map-heading" className="text-xl font-bold">
            這條線怎麼走
          </h2>
          <div className="mt-4 rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
            <RouteMap stations={stations} />
          </div>
        </section>

        {/* Terminal simulation */}
        <section aria-labelledby="sim-heading" className="mt-10">
          <h2 id="sim-heading" className="text-xl font-bold">
            終點站：{line.sim.station}
          </h2>
          <div
            className="mt-4 rounded-2xl bg-surface p-6"
            style={{ borderLeft: `4px solid ${line.color}` }}
          >
            <p className="font-bold">{line.sim.title}</p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
              {line.sim.covers}
            </p>
            {line.sim.ready ? (
              <Link
                href={`/line/${line.slug}/simulation`}
                className="mt-4 inline-flex items-center gap-1 rounded-md font-semibold hover:underline"
                style={{ color: line.colorInk }}
              >
                前往模擬 <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <p className="mt-4 text-sm font-medium text-ink-faint">即將推出</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

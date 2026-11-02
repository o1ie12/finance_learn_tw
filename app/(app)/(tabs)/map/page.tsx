import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MetroMap, type MapLine } from "@/components/map/MetroMap";
import { TopBar } from "@/components/ui/TopBar";
import { buildLineStations } from "@/lib/buildStations";
import { getLatestSimulationRunsByLine, getLineCompletions, getProgress, getTaskResults } from "@/lib/db";
import { lineVars } from "@/lib/design/lineVars";
import { LINES } from "@/lib/lines";
import { effectiveMode } from "@/lib/modeModel";
import { needsOnboarding } from "@/lib/onboarding";
import { lastTouchedByLine, touchedLines } from "@/lib/gameHome";
import { allLineStatuses } from "@/lib/progressModel";
import { todayStop } from "@/lib/todayStop";
import { getCurrentStudent } from "@/lib/session";

export const metadata: Metadata = { title: "路線" };

/** 路線 (06 E8.7): the metro map of all twelve lines, from the student's progress. */
export default async function MapPage() {
  const student = await getCurrentStudent().catch(() => null);
  if (!student) redirect("/dashboard");
  if (needsOnboarding(student)) redirect("/onboarding/goal");
  const mode = effectiveMode(student.mode);
  const [progress, runsByLine, sticky, results] = await Promise.all([
    getProgress(student.id),
    getLatestSimulationRunsByLine(student.id),
    getLineCompletions(student.id),
    getTaskResults(student.id).catch(() => []),
  ]);
  // 10 PROG-3: tried but not done.
  const attempted = new Set(results.flatMap((r) => (r.station_id === null || r.station_id === undefined ? [] : [r.station_id])));
  const statuses = allLineStatuses(progress, runsByLine, mode, sticky);
  // One ring on the whole map: where the student continues (each line's own
  // next stop is an open dot like the rest).
  // 10 DATA-3: the same rule as 今天.
  const stop = todayStop(statuses, lastTouchedByLine(progress, runsByLine, results), touchedLines(results));
  const here = stop.kind === "turn" ? null : stop.href;
  const lines: MapLine[] = LINES.map((line, i) => {
    const st = statuses[i];
    const built = buildLineStations(line, progress, runsByLine[line.slug] ?? null, mode);
    // 10 DATA-2: the same count as 今天 and the line page: every station,
    // the last one included.
    const done = built.filter((r) => r.status === "done").length;
    return {
      slug: line.slug,
      name: line.name,
      color: line.color,
      vars: lineVars(line),
      progress: st.complete ? "已完成" : `${done} / ${built.length} 站`,
      stations: built.map((r) => ({
        key: r.key,
        label: r.label,
        title: r.title,
        status: r.status === "done" ? "done" : r.status === "current" && r.href === here ? "current" : "todo",
        // Stations open on the Part E flow.
        href: r.href?.replace(/^\/line\/([^/]+)\/course\//, "/line/$1/station/"),
        terminal: r.terminal,
        meta: r.status !== "done" && !r.terminal && attempted.has(Number(r.key.split("-m")[1])) ? "做到一半" : r.meta,
      })),
    };
  });
  return (
    <>
      <TopBar title="路線" flat />
      <MetroMap lines={lines} />
    </>
  );
}

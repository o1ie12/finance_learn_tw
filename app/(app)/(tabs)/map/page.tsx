import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MetroMap, type MapLine } from "@/components/map/MetroMap";
import { TopBar } from "@/components/ui/TopBar";
import { buildLineStations } from "@/lib/buildStations";
import { getLatestSimulationRunsByLine, getLineCompletions, getProgress } from "@/lib/db";
import { lineVars } from "@/lib/design/lineVars";
import { LINES } from "@/lib/lines";
import { effectiveMode } from "@/lib/modeModel";
import { needsOnboarding } from "@/lib/onboarding";
import { allLineStatuses, nextActionAcrossLines } from "@/lib/progressModel";
import { getCurrentStudent } from "@/lib/session";

export const metadata: Metadata = { title: "路線" };

/** 路線 (06 E8.7): the metro map of all twelve lines, from the student's progress. */
export default async function MapPage() {
  const student = await getCurrentStudent().catch(() => null);
  if (!student) redirect("/dashboard");
  if (needsOnboarding(student)) redirect("/onboarding/character");
  const mode = effectiveMode(student.mode);
  const [progress, runsByLine, sticky] = await Promise.all([
    getProgress(student.id),
    getLatestSimulationRunsByLine(student.id),
    getLineCompletions(student.id),
  ]);
  const statuses = allLineStatuses(progress, runsByLine, mode, sticky);
  // One ring on the whole map: where the student continues (each line's own
  // next stop is an open dot like the rest).
  const here = nextActionAcrossLines(statuses)?.step.href ?? null;
  const lines: MapLine[] = LINES.map((line, i) => {
    const st = statuses[i];
    return {
      slug: line.slug,
      name: line.name,
      color: line.color,
      vars: lineVars(line),
      progress: st.complete ? "已完成" : `${st.stationsDone} / ${st.stationsTotal} 站`,
      stations: buildLineStations(line, progress, runsByLine[line.slug] ?? null, mode).map((r) => ({
        key: r.key,
        label: r.label,
        title: r.title,
        status: r.status === "done" ? "done" : r.status === "current" && r.href === here ? "current" : "todo",
        // Stations open on the Part E flow.
        href: r.href?.replace(/^\/line\/([^/]+)\/course\//, "/line/$1/station/"),
        terminal: r.terminal,
        meta: r.meta,
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

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader, pageStyles as s } from "@/components/page/Page";
import { getCurrentStudent } from "@/lib/session";
import { getLatestSimulationRunsByLine, getLineCompletions, getProgress, isNotConfigured } from "@/lib/db";
import { effectiveMode } from "@/lib/modeModel";
import { allLineStatuses } from "@/lib/progressModel";
import Passport, { buildStamps } from "@/components/Passport";
import type { Student, SimulationRun } from "@/lib/types";

export const metadata: Metadata = {
  title: "錢途護照",
  description: "你的累積點數，以及每條線終點模擬的紀念戳章。",
};

export default async function PassportPage() {
  let student: Student | null = null;
  let notConfigured = false;
  let runsByLine: Record<string, SimulationRun> = {};
  let complete = new Set<string>();

  try {
    student = await getCurrentStudent();
    if (student) {
      const [runs, progress, sticky] = await Promise.all([
        getLatestSimulationRunsByLine(student.id),
        getProgress(student.id),
        getLineCompletions(student.id),
      ]);
      runsByLine = runs;
      complete = new Set(allLineStatuses(progress, runs, effectiveMode(student.mode), sticky).filter((st) => st.complete).map((st) => st.line.slug));
    }
  } catch (e) {
    if (isNotConfigured(e)) notConfigured = true;
  }

  if (!student) redirect(notConfigured ? "/" : "/signup");

  const stamps = buildStamps(runsByLine, complete);

  const earned = stamps.filter((st) => st.earned).length;
  return (
    <>
      <PageHeader
        kicker="錢途護照"
        title={`${student.name} 的護照`}
        intro={`每完成一站都會累積點數；走完一條線的每一站（含最後一站），就會拿到那條線的紀念戳章。目前 ${earned} / ${stamps.length} 個戳章。`}
        actions={
          <Link href="/map" className={s.secondary}>
            看路線圖
          </Link>
        }
      />
      <Passport studentName={student.name} pointsTotal={student.points_total} stamps={stamps} />
    </>
  );
}

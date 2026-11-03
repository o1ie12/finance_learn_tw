import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StationRunner } from "@/components/station/StationRunner";
import { countTaskAttempts, getTaskResults } from "@/lib/db";
import { getLine } from "@/lib/lines";
import { effectiveMode } from "@/lib/modeModel";
import { getModule } from "@/lib/modules";
import { nextStopAfter } from "@/lib/stationNav";
import { readProfile } from "@/lib/studentProfile";
import { getCurrentStudent } from "@/lib/session";
import { lessonForPage } from "@/lib/tasks/prepare";
import { lessonForStation } from "@/lib/tasks/registry";
import { sanitizeHook } from "@/lib/tasks/sanitize";
import { stationLetterCode } from "@/lib/design/lineCode";
import { lineVars } from "@/lib/design/lineVars";

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const mod = getModule(Number((await params).n));
  return { title: mod ? mod.station : "車站" };
}

/**
 * A station on the Part E design (06 E8.2 to E8.5): full screen, no tab bar.
 * Same lesson, scoring and storage as /line/[slug]/course/[n]; that page
 * keeps the older look and the reading page until every screen is rebuilt.
 */
export default async function StationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; n: string }>;
  searchParams: Promise<{ hook?: string }>;
}) {
  const { slug, n } = await params;
  const { hook } = await searchParams;
  const num = Number(n);
  const line = getLine(slug);
  const mod = getModule(num);
  if (!line || !mod || !line.stationModules.includes(num)) notFound();

  const lesson = lessonForStation(line.slug, num);
  const student = await getCurrentStudent().catch(() => null);
  if (!lesson || !student) redirect(`/line/${line.slug}/course/${num}`);

  const stop = nextStopAfter(line, num, effectiveMode(student.mode));
  const profile = readProfile(student.profile);
  const [tries, results] = await Promise.all([countTaskAttempts(student.id, lesson.task.id), getTaskResults(student.id).catch(() => [])]);
  const attempt = tries + 1;
  // 10 FLOW-2: the how-to lines on a student's first 3 stations only.
  const otherStations = new Set(results.filter((r) => r.station_id !== null && r.task_set_id !== lesson.task.id).map((r) => r.task_set_id));
  const howTo = otherStations.size < 3;
  return (
    <div style={{ ...lineVars(line), display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
    <StationRunner
      lesson={lessonForPage(lesson, student.id, attempt)}
      line={{ slug: line.slug, name: line.name, color: line.color, colorInk: line.colorInk, enName: line.enName }}
      station={{ name: mod.station, code: line.enName.toUpperCase() }}
      studentId={student.id}
      attempt={attempt}
      goal={profile.goal ? { amount: profile.goal.amount, months: profile.goal.months } : null}
      mode="station"
      // 10 FLOW-4: the month, then 今天 with the next card; no ride within a line.
      continueHref={lesson.lifeGameTurn ? "/turn" : stop.href.replace(/^\/line\/([^/]+)\/course\//, "/line/$1/station/")}
      initialHook={sanitizeHook(lesson.hook.options, hook)}
      design={{ stationName: mod.station, kicker: `${line.name} · ${stationLetterCode(line, line.stationModules.indexOf(num) + 1)}`, exitHref: "/today", readingHref: `/line/${line.slug}/course/${num}?read=1`, foldExpert: line.stationModules.indexOf(num) > 0, howTo }}
    />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { lookFromAvatar } from "@/components/art/look";
import { StationRunner } from "@/components/station/StationRunner";
import { countTaskAttempts } from "@/lib/db";
import { getLine } from "@/lib/lines";
import { effectiveMode } from "@/lib/modeModel";
import { getModule } from "@/lib/modules";
import { nextStopAfter, turnThenRide } from "@/lib/stationNav";
import { readProfile } from "@/lib/studentProfile";
import { getCurrentStudent } from "@/lib/session";
import { lessonForPage } from "@/lib/tasks/prepare";
import { lessonForStation } from "@/lib/tasks/registry";
import { sanitizeHook } from "@/lib/tasks/sanitize";
import { readAvatar } from "@/lib/avatar";
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
  const attempt = (await countTaskAttempts(student.id, lesson.task.id)) + 1;
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
      continueHref={lesson.lifeGameTurn ? turnThenRide(stop) : stop.href.replace(/^\/line\/([^/]+)\/course\//, "/line/$1/station/")}
      initialHook={sanitizeHook(lesson.hook.options, hook)}
      design={{ stationName: mod.station, world: line.slug, look: lookFromAvatar(readAvatar(student.avatar), student.name), exitHref: "/today" }}
    />
    </div>
  );
}

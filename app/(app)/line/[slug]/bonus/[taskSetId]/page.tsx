import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StationRunner } from "@/components/station/StationRunner";
import { countTaskAttempts } from "@/lib/db";
import { lineVars } from "@/lib/design/lineVars";
import { getLine } from "@/lib/lines";
import { turnThenRide } from "@/lib/stationNav";
import { readProfile } from "@/lib/studentProfile";
import { getCurrentStudent } from "@/lib/session";
import { lessonForPage } from "@/lib/tasks/prepare";
import { SHORT_KIND, findTaskSet } from "@/lib/tasks/registry";
import { sanitizeHook } from "@/lib/tasks/sanitize";

export async function generateMetadata({ params }: { params: Promise<{ taskSetId: string }> }): Promise<Metadata> {
  const found = findTaskSet(decodeURIComponent((await params).taskSetId));
  return { title: found ? found.task.title : "加碼任務" };
}

/**
 * A 加碼任務 on the Part E design (06 E8, F3): the same flow as a station,
 * replayable, stored in task_results, never marks a station done. The older
 * /line/[slug]/task/[taskSetId] page keeps the older look.
 */
export default async function BonusTaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; taskSetId: string }>;
  searchParams: Promise<{ hook?: string }>;
}) {
  const { slug, taskSetId } = await params;
  const { hook } = await searchParams;
  const line = getLine(slug);
  const found = findTaskSet(decodeURIComponent(taskSetId));
  if (!line || !found || found.line.slug !== line.slug || found.lesson.placement !== "library" || found.task.kind === SHORT_KIND) notFound();
  const student = await getCurrentStudent().catch(() => null);
  if (!student) redirect(`/line/${line.slug}/task/${taskSetId}`);

  const profile = readProfile(student.profile);
  const attempt = (await countTaskAttempts(student.id, found.task.id)) + 1;
  const lineHref = `/line/${line.slug}`;
  return (
    <div style={{ ...lineVars(line), display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <StationRunner
        lesson={lessonForPage(found.lesson, student.id, attempt)}
        line={{ slug: line.slug, name: line.name, color: line.color, colorInk: line.colorInk, enName: line.enName }}
        station={{ name: found.task.title, code: `${line.enName.toUpperCase()} · BONUS` }}
        studentId={student.id}
        attempt={attempt}
        goal={profile.goal ? { amount: profile.goal.amount, months: profile.goal.months } : null}
        mode="library"
        initialHook={sanitizeHook(found.lesson.hook.options, hook)}
        continueHref={turnThenRide({ href: lineHref, lineName: line.name, lineColor: line.color, stationName: "路線總覽", blurb: line.short, lineEnName: line.enName.toUpperCase(), stationCode: "MAP" })}
        design={{ stationName: found.task.title, kicker: `${line.name} · 加碼任務`, exitHref: "/today" }}
      />
    </div>
  );
}

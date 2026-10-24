import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StationRunner } from "@/components/station/StationRunner";
import { countTaskAttempts } from "@/lib/db";
import { stationLetterCode } from "@/lib/design/lineCode";
import { lineVars } from "@/lib/design/lineVars";
import { FLOW_V2 } from "@/lib/flags";
import { endStation, getLine } from "@/lib/lines";
import { getCurrentStudent } from "@/lib/session";
import { turnThenRide } from "@/lib/stationNav";
import { readProfile } from "@/lib/studentProfile";
import { lessonForPage } from "@/lib/tasks/prepare";
import { sanitizeHook } from "@/lib/tasks/sanitize";
import { pickTerminal } from "@/lib/tasks/terminalPick";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const line = getLine((await params).slug);
  return { title: line ? endStation(line).name : "車站" };
}

/**
 * 06 G0: a line's last station, when it is a task set, in the same station
 * player as every other station (flag on). The original simulation stays at
 * /line/[slug]/simulation?classic=1.
 */
export default async function EndStationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ hook?: string }>;
}) {
  const { slug } = await params;
  const { hook } = await searchParams;
  const line = getLine(slug);
  if (!line || !line.sim.ready) notFound();
  if (!FLOW_V2 || !line.sim.taskEnd) redirect(`/line/${line.slug}/simulation`);
  const student = await getCurrentStudent().catch(() => null);
  if (!student) redirect(`/line/${line.slug}`);
  const terminal = await pickTerminal(line.slug, student.id);
  if (!terminal) redirect(`/line/${line.slug}/simulation?classic=1`);

  const end = endStation(line);
  const profile = readProfile(student.profile);
  const attempt = (await countTaskAttempts(student.id, terminal.task.id)) + 1;
  return (
    <div style={{ ...lineVars(line), display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <StationRunner
        lesson={lessonForPage(terminal, student.id, attempt)}
        line={{ slug: line.slug, name: line.name, color: line.color, colorInk: line.colorInk, enName: line.enName }}
        station={{ name: end.name, code: line.enName.toUpperCase() }}
        studentId={student.id}
        attempt={attempt}
        goal={profile.goal ? { amount: profile.goal.amount, months: profile.goal.months } : null}
        mode="terminal"
        continueHref={turnThenRide({ href: `/line/${line.slug}`, lineName: line.name, lineColor: line.color, stationName: "回到路線", blurb: "", lineEnName: line.enName.toUpperCase(), stationCode: "" })}
        initialHook={sanitizeHook(terminal.hook.options, hook)}
        design={{ stationName: end.name, kicker: `${line.name} · ${stationLetterCode(line, line.stationModules.length + 1)}`, exitHref: "/today" }}
      />
    </div>
  );
}

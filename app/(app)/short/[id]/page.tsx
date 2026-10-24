import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { lookFromAvatar } from "@/components/art/look";
import { StationRunner } from "@/components/station/StationRunner";
import { readAvatar } from "@/lib/avatar";
import { countTaskAttempts } from "@/lib/db";
import { lineVars } from "@/lib/design/lineVars";
import { getLine } from "@/lib/lines";
import { readProfile } from "@/lib/studentProfile";
import { getCurrentStudent } from "@/lib/session";
import { lessonForPage } from "@/lib/tasks/prepare";
import { shortLesson } from "@/lib/tasks/registry";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const found = shortLesson(decodeURIComponent((await params).id));
  return { title: found ? found.task.title : "3 分鐘版" };
}

/**
 * A Short (06 F3.10): one question and its model answer, about 3 minutes.
 * Same scoring and storage as a 加碼任務; 完成 goes back to 今天.
 */
export default async function ShortPage({ params }: { params: Promise<{ id: string }> }) {
  const found = shortLesson(decodeURIComponent((await params).id));
  if (!found) notFound();
  const student = await getCurrentStudent().catch(() => null);
  if (!student) redirect("/signup");
  const line = getLine(found.line.slug)!;
  const profile = readProfile(student.profile);
  const attempt = (await countTaskAttempts(student.id, found.task.id)) + 1;
  return (
    <div style={{ ...lineVars(line), display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <StationRunner
        lesson={lessonForPage(found.lesson, student.id, attempt)}
        line={{ slug: line.slug, name: line.name, color: line.color, colorInk: line.colorInk, enName: line.enName }}
        station={{ name: found.task.title, code: `${line.enName.toUpperCase()} · SHORT` }}
        studentId={student.id}
        attempt={attempt}
        goal={profile.goal ? { amount: profile.goal.amount, months: profile.goal.months } : null}
        mode="library"
        continueHref="/today"
        design={{ stationName: found.task.title, world: line.slug, look: lookFromAvatar(readAvatar(student.avatar), student.name), exitHref: "/today", short: true }}
      />
    </div>
  );
}

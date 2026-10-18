import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FloatCard } from "@/components/game/FloatCard";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { StationRunner } from "@/components/station/StationRunner";
import { countTaskAttempts } from "@/lib/db";
import { getLine } from "@/lib/lines";
import { getCurrentStudent } from "@/lib/session";
import { playThenRide } from "@/lib/stationNav";
import { readProfile } from "@/lib/studentProfile";
import { lessonForPage } from "@/lib/tasks/prepare";
import { findTaskSet } from "@/lib/tasks/registry";

export async function generateMetadata({ params }: { params: Promise<{ taskSetId: string }> }): Promise<Metadata> {
  const found = findTaskSet(decodeURIComponent((await params).taskSetId));
  return { title: found ? found.task.title : "找不到任務" };
}

/**
 * A 加碼任務 / 案件庫 task set (plan.md §2.3): replayable any time, stored in
 * task_results, never marks a station or the simulation done.
 */
export default async function LibraryTaskPage({ params }: { params: Promise<{ slug: string; taskSetId: string }> }) {
  const { slug, taskSetId } = await params;
  const line = getLine(slug);
  const found = findTaskSet(decodeURIComponent(taskSetId));
  if (!line || !found || found.line.slug !== line.slug || found.lesson.placement !== "library") notFound();

  const student = await getCurrentStudent().catch(() => null);
  if (!student) {
    return (
      <div className="g-station-page" style={{ maxWidth: 520 }}>
        <FloatCard strong title={found.task.title}>
          <p style={{ margin: 0 }}>先建立帳號，任務結果才會存進你的路線。</p>
          <PrimaryButton href="/signup">建立帳號</PrimaryButton>
        </FloatCard>
      </div>
    );
  }
  const profile = readProfile(student.profile);
  const attempt = (await countTaskAttempts(student.id, found.task.id)) + 1;
  const lineHref = `/line/${line.slug}`;
  return (
    <div className="g-station-page">
      <StationRunner
        lesson={lessonForPage(found.lesson, student.id, attempt)}
        line={{ slug: line.slug, name: line.name, color: line.color, colorInk: line.colorInk, enName: line.enName }}
        station={{ name: found.task.title, code: `${line.enName.toUpperCase()} · BONUS` }}
        studentId={student.id}
        attempt={attempt}
        goal={profile.goal ? { amount: profile.goal.amount, months: profile.goal.months } : null}
        mode="library"
        continueHref={playThenRide({ href: lineHref, lineName: line.name, lineColor: line.color, stationName: "路線總覽", blurb: line.short, lineEnName: line.enName.toUpperCase(), stationCode: "MAP" })}
      />
    </div>
  );
}

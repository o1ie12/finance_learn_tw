import { notFound } from "next/navigation";
import { WorkspaceFixture } from "@/components/flow/WorkspaceFixture";
import { getLine } from "@/lib/lines";
import { stationFacts } from "@/lib/stationFacts";
import { fixtureAnswers, type Fixture } from "@/lib/tasks/fixtureAnswers";
import { lessonForPage, prepareLesson } from "@/lib/tasks/prepare";
import { answerKey } from "@/lib/tasks/publicLesson";
import { pickRevealWithSource } from "@/lib/tasks/reveal";
import { findTaskSet } from "@/lib/tasks/registry";
import { scoreTask } from "@/lib/tasks/scoring";

/**
 * 10 compare-e: any station's compare screen from a fixture, scored on the
 * server like a real submit. Dev only (404 in production).
 *   /dev/compare/<taskSetId>?fixture=right|wrong|some
 */
export default async function CompareFixturePage({
  params,
  searchParams,
}: {
  params: Promise<{ taskId: string }>;
  searchParams: Promise<{ fixture?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { taskId } = await params;
  const { fixture: f } = await searchParams;
  const fixture: Fixture = f === "right" || f === "wrong" ? f : "some";
  const found = findTaskSet(taskId);
  const line = found ? getLine(found.line.slug) : undefined;
  if (!found || !line) notFound();
  const { lesson, task } = found;
  const answers = fixtureAnswers(task, fixture);
  const score = scoreTask(task, answers, { goal: null, studentId: "fixture", attempt: 1, carried: new Set() });
  const picked = pickRevealWithSource(lesson.reveal, lesson.hook.options[0]?.id ?? null, answers);
  const mode = lesson.placement === "terminal" ? "terminal" : lesson.placement === "library" ? "library" : "station";
  const facts = stationFacts(line, lesson.placement === "terminal" ? null : lesson.stationId);
  return (
    <WorkspaceFixture
      lesson={lessonForPage(lesson, "fixture", 1)}
      stationName={lesson.placement === "library" ? task.title : facts.name}
      mode={mode}
      answers={answers}
      foldExpert={lesson.placement === "terminal" || (lesson.stationId !== null && line.stationModules.indexOf(lesson.stationId) > 0)}
      result={{
        score: score.score,
        total: score.total,
        passed: score.passed,
        details: score.details,
        stationDone: mode !== "station" || score.passed,
        reveal: picked.source === "default" && score.passed ? "" : picked.text,
        attempt: 1,
        answerKey: answerKey(prepareLesson(lesson).task, null),
      }}
    />
  );
}

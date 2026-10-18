"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StationFlow, type FlowLine, type SubmitPayload, type SubmitResult } from "@/components/tasks/StationFlow";
import type { StationLesson } from "@/lib/tasks/types";
import type { StepScore } from "@/lib/tasks/scoring";

/**
 * Runs one task set on a page: submits to the right endpoint, re-mounts the
 * flow for a second attempt, saves takeaways, and on 「回到你的人生」 goes to
 * /play for one month, which then rides the train to the next station.
 *
 * `mode`: "station" and "library" post to /api/task; "terminal" posts to
 * /api/simulation (the line's simulation result).
 */
export function StationRunner({
  lesson,
  line,
  station,
  studentId,
  attempt: firstAttempt,
  goal,
  mode,
  continueHref,
  fullLessonHref,
}: {
  lesson: StationLesson;
  line: FlowLine;
  station: { name: string; code: string } | null;
  studentId: string;
  attempt: number;
  goal: { amount: number; months: number } | null;
  mode: "station" | "library" | "terminal";
  continueHref: string;
  fullLessonHref?: string;
}) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(firstAttempt);
  const [hook, setHook] = useState<string | null>(null);

  async function submit(p: SubmitPayload): Promise<SubmitResult> {
    setHook(p.hookAnswer);
    if (mode === "terminal") {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ line_slug: line.slug, taskSetId: p.taskSetId, answers: p.answers, hookAnswer: p.hookAnswer }),
      });
      if (!res.ok) throw new Error(`simulation ${res.status}`);
      const data = (await res.json()) as {
        outcome: { score: number; total: number; passed: boolean; details: StepScore[]; revealShown: string; attempt: number };
      };
      return {
        score: data.outcome.score,
        total: data.outcome.total,
        passed: data.outcome.passed,
        details: data.outcome.details,
        stationDone: true,
        reveal: data.outcome.revealShown,
        attempt: data.outcome.attempt,
      };
    }
    const res = await fetch("/api/task", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(p),
    });
    if (!res.ok) throw new Error(`task ${res.status}`);
    return (await res.json()) as SubmitResult;
  }

  async function saveTool(name: string) {
    const res = await fetch("/api/tools", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`tools ${res.status}`);
  }

  return (
    <StationFlow
      key={attempt}
      lesson={lesson}
      line={line}
      station={station}
      studentId={studentId}
      attempt={attempt}
      goal={goal}
      fullLessonHref={fullLessonHref}
      onSubmit={submit}
      onSaveTool={saveTool}
      onContinue={() => router.push(continueHref)}
      onRetry={mode === "terminal" ? undefined : () => setAttempt((a) => a + 1)}
      startAtTask={attempt > firstAttempt}
      initialHookAnswer={hook}
    />
  );
}

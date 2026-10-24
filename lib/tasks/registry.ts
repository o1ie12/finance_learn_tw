/**
 * Every line's content, by slug, and lookups by task set id. The one place
 * that imports content/lines/*, so the validator, the API and the pages all
 * read the same data.
 */

import { CONTENT_BY_SLUG } from "@/content";
import { PERSONA } from "@/content/personas";
import type { LineContent, LineSlug, StationLesson, TaskSet } from "./types";

export function lineContent(slug: string): LineContent | null {
  return (CONTENT_BY_SLUG as Record<string, LineContent | undefined>)[slug] ?? null;
}

export function allLineContent(): LineContent[] {
  return Object.values(CONTENT_BY_SLUG);
}

export interface FoundTask {
  line: LineContent;
  lesson: StationLesson;
  task: TaskSet;
}

export function findTaskSet(taskSetId: string): FoundTask | null {
  for (const line of allLineContent()) {
    for (const lesson of line.lessons) {
      if (lesson.task.id === taskSetId) return { line, lesson, task: lesson.task };
    }
    const after = afterLesson(line.slug);
    if (after && after.task.id === taskSetId) return { line, lesson: after, task: after.task };
  }
  return null;
}

/** The task set id of a kept simulation's after-steps. */
export function afterTaskId(slug: string): string {
  return `${slug}.after.v1`;
}

/**
 * The steps that run after a kept simulation (報稅線, 創業線), as a lesson so
 * the same flow, scoring and storage handle them. Stored in task_results
 * (placement 'library': never marks a station or the simulation done).
 */
export function afterLesson(slug: string): StationLesson | null {
  const line = lineContent(slug);
  const t = line?.terminal;
  if (!line || !t?.afterSteps?.length || !t.afterKind) return null;
  return {
    stationId: null,
    placement: "library",
    hook: line.hook,
    lessonCards: t.lessonCards ?? [],
    task: {
      id: afterTaskId(slug),
      kind: t.afterKind,
      title: "做完模擬，再想一步",
      brief: {
        from: PERSONA[line.slug],
        message: "模擬做完了。再回答一題，把剛剛的經驗變成你的判斷。",
        learn: "把模擬裡的經驗，用在自己的決定上。",
        do: "回答一題。",
        minutes: 3,
      },
      materials: [],
      steps: t.afterSteps,
      passScore: 0.6,
    },
    reveal: t.reveal,
    takeaway: line.takeaway,
    minutes: 3,
    lifeGameTurn: true,
  };
}

/** The task set placed on a station, if any. */
export function lessonForStation(slug: LineSlug, stationId: number): StationLesson | null {
  return lineContent(slug)?.lessons.find((l) => l.placement === "station" && l.stationId === stationId) ?? null;
}

export function terminalLesson(slug: LineSlug): StationLesson | null {
  return lineContent(slug)?.lessons.find((l) => l.placement === "terminal") ?? null;
}

export function libraryLessons(slug: LineSlug): StationLesson[] {
  return lineContent(slug)?.lessons.filter((l) => l.placement === "library") ?? [];
}

/** Every task kind in the content, with its placement (for the contract script). */
export function allTaskKinds(): { kind: string; slug: LineSlug; placement: StationLesson["placement"] | "after" }[] {
  const out: { kind: string; slug: LineSlug; placement: StationLesson["placement"] | "after" }[] = [];
  for (const line of allLineContent()) {
    for (const l of line.lessons) out.push({ kind: l.task.kind, slug: line.slug, placement: l.placement });
    if (line.terminal?.afterKind && line.terminal.afterSteps?.length) {
      out.push({ kind: line.terminal.afterKind, slug: line.slug, placement: "after" });
    }
  }
  return out;
}

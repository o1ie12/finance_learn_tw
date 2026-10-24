/**
 * Stations with no task set of their own run their existing quiz inside the
 * same 5-step flow (05 A1, 04 header: "extra core stations keep their
 * current quiz, wrapped in the new station flow"): a hook with options,
 * 1 to 3 lesson cards cut from the station's article (content/stations.ts),
 * the quiz as choice steps, the line's bias reveal, its takeaway, and a
 * life-game month.
 *
 * Kinds: `<slug>_m<n>_v1`, registered in lib/tasks/kinds.ts.
 */

import { PERSONA } from "@/content/personas";
import type { WrappedStationCopy } from "@/content/stations";
import type { LineSlug } from "@/lib/lines";
import { getModule } from "@/lib/modules";
import type { ChoiceStep, LineContent, StationLesson } from "./types";

export function wrappedKind(slug: LineSlug, moduleNumber: number): string {
  return `${slug}_m${moduleNumber}_v1`;
}

export function wrappedTaskId(slug: LineSlug, moduleNumber: number): string {
  return `${slug}.m${moduleNumber}.v1`;
}

/** A wrapped quiz, not an authored task set (e.g. not one of 詐騙線's case files). */
export function isWrappedTask(task: { id: string }): boolean {
  return /\.m\d+\.v1$/.test(task.id);
}

/**
 * The line's main reveal: its terminal's, else its first task set's. Only
 * the bias and the default text: the per-answer maps are keyed to that
 * lesson's own hook and steps.
 */
function lineReveal(line: LineContent): StationLesson["reveal"] {
  const r = line.terminal?.reveal ?? line.lessons[0]?.reveal ?? { bias: line.bias, default: "" };
  return { bias: r.bias, default: r.default };
}

/** The old module copy uses em dashes; station copy does not (00 rules). */
function noDash(text: string): string {
  return text.replace(/\s*—+\s*/g, "：");
}

/**
 * The line with a wrapped lesson added for each of its stations that has no
 * task set of its own and has copy in content/stations.ts.
 */
export function withWrappedStations(
  line: LineContent,
  stationModules: readonly number[],
  copy: Record<number, WrappedStationCopy>,
): LineContent {
  const placed = new Set(line.lessons.filter((l) => l.placement === "station").map((l) => l.stationId));
  const added = stationModules
    .filter((n) => !placed.has(n) && copy[n])
    .map((n) => wrappedLesson(line, n, copy[n]))
    .filter((l): l is StationLesson => l !== null);
  return added.length ? { ...line, lessons: [...line.lessons, ...added] } : line;
}

export function wrappedLesson(line: LineContent, moduleNumber: number, copy: WrappedStationCopy): StationLesson | null {
  const mod = getModule(moduleNumber);
  if (!mod) return null;
  const steps: ChoiceStep[] = mod.quiz.map((q, i) => ({
    id: `s${i + 1}`,
    type: "choice",
    prompt: noDash(q.q),
    options: q.options.map((label, j) => ({ id: `o${j}`, label: noDash(label) })),
    correct: `o${q.answer}`,
    explanation: noDash(q.explain),
  }));
  return {
    stationId: moduleNumber,
    placement: "station",
    hook: copy.hook,
    lessonCards: copy.lessonCards,
    task: {
      id: wrappedTaskId(line.slug, moduleNumber),
      kind: wrappedKind(line.slug, moduleNumber),
      title: noDash(mod.title),
      brief: {
        from: PERSONA[line.slug],
        message: `${mod.station}有幾個重點。先看完卡片，再回答 ${steps.length} 題。`,
        learn: noDash(mod.subtitle),
        do: `回答 ${steps.length} 題。`,
        minutes: mod.minutes,
      },
      materials: [],
      steps,
      passScore: 0.6,
    },
    reveal: lineReveal(line),
    takeaway: line.takeaway,
    minutes: mod.minutes,
    lifeGameTurn: true,
    doLine: copy.doLine,
  };
}

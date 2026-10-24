/**
 * Writes engine figures into a lesson's text (06 P1: every number comes
 * from the engine or a stated formula). A lesson lists its figures as
 * ComputeRefs; every string in the lesson (hook, cards, brief, prompts,
 * options, explanations, materials, reveal, takeaway) has its {{name}}
 * tokens replaced with the worked-out number. Pure and deterministic: the
 * content loader runs it once, so the validator, the scorer and the page all
 * read the same finished text.
 */
import { resolveNumber } from "./compute";
import type { Figure, StationLesson } from "./types";

export function formatFigure(value: number, f: Pick<Figure, "unit" | "digits">): string {
  const digits = f.digits ?? 0;
  const n = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  switch (f.unit) {
    case "NT$":
      return value < 0 ? `-NT$${n(Math.abs(value))}` : `NT$${n(value)}`;
    case "%":
      return `${n(value)}%`;
    case "年":
      return `${n(value)} 年`;
    case "個月":
      return `${n(value)} 個月`;
    case "萬":
      return `${n(value / 10_000)} 萬`;
    default:
      return n(value);
  }
}

/** Every figure's text, by name; throws on a figure the engine cannot compute. */
export function figureTexts(figures: Record<string, Figure>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, f] of Object.entries(figures)) {
    const v = resolveNumber(f.ref, {});
    if (v === null) throw new Error(`figure "${name}" could not be computed`);
    out[name] = formatFigure(v, f);
  }
  return out;
}

function fill<T>(value: T, texts: Record<string, string>): T {
  if (typeof value === "string") {
    return value.replace(/\{\{(\w+)\}\}/g, (m, name: string) => texts[name] ?? m) as T;
  }
  if (Array.isArray(value)) return value.map((v) => fill(v, texts)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = k === "figures" ? v : fill(v, texts);
    return out as T;
  }
  return value;
}

export function fillFigures(lesson: StationLesson): StationLesson {
  if (!lesson.figures) return lesson;
  return fill(lesson, figureTexts(lesson.figures));
}

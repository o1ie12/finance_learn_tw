/**
 * Content validation for content/lines/*.ts (03 §5.5). Pure: takes loaded
 * LineContent objects and returns issues. scripts/check-content.ts loads the
 * files and exits non-zero on any error.
 *
 * Content is typed, so tsc already enforces shape. This checks what the type
 * system cannot: counts, cross references between ids, copy rules (no em
 * dashes, no partner names, card length) and kind naming.
 */

import { createHash } from "node:crypto";
import { LINES } from "@/lib/lines";
import { COMPUTE_FNS } from "./compute";
import type {
  BiasReveal,
  Hook,
  LessonCard,
  LineContent,
  Material,
  StationLesson,
  TaskStep,
} from "./types";

export type IssueLevel = "error" | "warning";

export interface Issue {
  level: IssueLevel;
  file: string;
  /** Dotted path inside the content object, e.g. lessons[0].task.steps[2]. */
  path: string;
  message: string;
}

/** Result kind naming: `<line>_<task>_v<n>` (03 §4). */
export const KIND_PATTERN = /^[a-z]+_[a-z0-9_]+_v\d+$/;

/** Text lesson card bodies, in characters (a Chinese character counts as 1). */
export const TEXT_CARD_MAX = 80;

/**
 * Organisation names that must never appear in content (hard rule 2). The
 * repo is public, so the names themselves are not written here: each entry
 * is the SHA-256 of the NFKC-normalised, lower-cased name and its length in
 * characters. Every window of that length in every content string is hashed
 * and compared. To add a name, hash it locally (see tests/tasks.test.ts for
 * the normalisation) and append { length, sha256 }.
 */
export const DENY_HASHES: { length: number; sha256: string }[] = [
  { length: 3, sha256: "0d473bdea566fc10bfec2bb1265e1f8f14418daa534200c2ed6c86680cb3e7dd" },
  { length: 12, sha256: "7441f400b582bc5fba4e406049f6d402b9300223f288864c3b122dcc1a343e69" },
  { length: 3, sha256: "713f199e6e39081d207d1a9f37de0ea3af64b52a73496f7c648038a8854ee4ae" },
  { length: 6, sha256: "c39e5817b2f3b38075929fa1c5f93dcacd35f23c0e7c51dc13ffd2f96c8861d8" },
];

export function normaliseForDeny(s: string): string {
  return s.normalize("NFKC").toLowerCase();
}

/** True when `text` contains a denied name (by hash) or one of `extra` (plain, for tests). */
export function containsDeniedName(text: string, extra: string[] = []): boolean {
  const norm = normaliseForDeny(text);
  if (extra.some((e) => norm.includes(normaliseForDeny(e)))) return true;
  const chars = [...norm];
  for (const d of DENY_HASHES) {
    for (let i = 0; i + d.length <= chars.length; i++) {
      const window = chars.slice(i, i + d.length).join("");
      if (createHash("sha256").update(window).digest("hex") === d.sha256) return true;
    }
  }
  return false;
}

/** U+2014 em dash (also catches the doubled Chinese ——) and U+2015 horizontal bar. */
const EM_DASH = /[—―]/;
const NT_AMOUNT = /NT\$\s?\d/;
/** Markers that make a NT$ figure acceptable: labelled illustrative or sourced. */
const FIGURE_CONTEXT = /示意|來源|出處|資料來源/;

/** Sentences, counted by their endings (。！？ and ASCII . ! ?). */
export function sentenceCount(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  const ends = t.match(/[。！？!?](?=[」』）)]*|$)/g)?.length ?? 0;
  return /[。！？!?][」』）)]*$/.test(t) ? ends : ends + 1;
}

/** Count characters as a reader does: one per code point. */
export function charLength(s: string): number {
  return [...s].length;
}

// --- document field ids (types.ts, per Material) ------------------------------------

function indexed(prefix: string, n: number): string[] {
  return Array.from({ length: Math.max(0, n) }, (_, i) => `${prefix}:${i}`);
}

/**
 * Field ids a FindStep target or a RateStep highlight may name, per document
 * (the lists documented in types.ts). Null for documents without fixed ids.
 */
export function fieldIdsFor(material: Material): string[] | null {
  switch (material.kind) {
    case "payslip":
      return ["company", "month", "base", "overtime", "gross", "labor", "health", "pension", "net"];
    case "cardStatement":
      return [
        "bank",
        "month",
        "closingDate",
        "dueDate",
        "totalDue",
        "minimumDue",
        "interest",
        "limit",
        "col:date",
        "col:postDate",
        "col:desc",
        "col:amount",
        ...indexed("tx", material.data.transactions?.length ?? 0),
      ];
    case "creditReport":
      return [
        "name",
        "age",
        "job",
        "income",
        "tenure",
        "cards.count",
        "cards.utilization",
        "cards.late12",
        "loans",
        "inquiries3m",
        "guarantor",
        "derogatory",
        "score",
        "application",
      ];
    case "chat":
      return indexed("msg", material.data.messages?.length ?? 0);
    case "billSheet":
      return [...indexed("row", material.data.rows?.length ?? 0), "total"];
    case "ledger":
      return indexed("row", material.data.rows?.length ?? 0);
    case "policy":
      return [
        "insurer",
        "type",
        "premium",
        "term",
        ...indexed("coverage", material.data.coverage?.length ?? 0),
        ...indexed("exclusions", material.data.exclusions?.length ?? 0),
      ];
    case "snapshot":
      return indexed("row", material.data.rows?.length ?? 0);
    default:
      return null;
  }
}

// --- the checker ----------------------------------------------------------------------

class Checker {
  issues: Issue[] = [];
  constructor(private file: string) {}
  error(path: string, message: string) {
    this.issues.push({ level: "error", file: this.file, path, message });
  }
  warn(path: string, message: string) {
    this.issues.push({ level: "warning", file: this.file, path, message });
  }
}

function arr<T>(v: T[] | undefined | null): T[] {
  return Array.isArray(v) ? v : [];
}

function blank(s: unknown): boolean {
  return typeof s !== "string" || s.trim().length === 0;
}

function dupes(ids: string[]): string[] {
  const seen = new Set<string>();
  const out = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) out.add(id);
    seen.add(id);
  }
  return [...out];
}

function checkHook(c: Checker, hook: Hook | undefined, path: string) {
  if (!hook) {
    c.error(path, "hook is missing");
    return;
  }
  if (blank(hook.question)) c.error(`${path}.question`, "hook question is empty");
  const opts = arr(hook.options);
  if (opts.length < 2 || opts.length > 4) {
    c.error(`${path}.options`, `hook has ${opts.length} options; needs 2 to 4`);
  }
  for (const d of dupes(opts.map((o) => o.id))) c.error(`${path}.options`, `duplicate option id "${d}"`);
}

function checkCards(c: Checker, cards: LessonCard[] | undefined, path: string, required: boolean) {
  const list = arr(cards);
  if (list.length > 3) c.error(path, `${list.length} lesson cards; at most 3`);
  if (required && list.length === 0) c.warn(path, "no lesson cards (expected 1 to 3)");
  list.forEach((card, i) => {
    if (card.kind === "text" && typeof card.body === "string") {
      const n = charLength(card.body);
      if (n > TEXT_CARD_MAX) {
        c.error(`${path}[${i}].body`, `text card body is ${n} characters; at most ${TEXT_CARD_MAX}`);
      }
    }
  });
}

function checkMaterialRef(
  c: Checker,
  materials: Material[],
  index: number,
  path: string,
): Material | null {
  if (!Number.isInteger(index) || index < 0 || index >= materials.length) {
    c.error(path, `materialIndex ${index} does not exist (task has ${materials.length} materials)`);
    return null;
  }
  return materials[index];
}

function checkFieldIds(c: Checker, material: Material | null, ids: string[], path: string) {
  if (!material) return;
  const fields = fieldIdsFor(material);
  if (!fields) {
    if (ids.length > 0) c.warn(path, `cannot check field ids on a ${material.kind} document`);
    return;
  }
  for (const id of ids) {
    if (!fields.includes(id)) c.error(path, `field id "${id}" does not exist on the ${material.kind} document`);
  }
}

function checkStep(c: Checker, step: TaskStep, materials: Material[], path: string) {
  const scored = step.scored !== false;
  if (blank(step.id)) c.error(`${path}.id`, "step id is empty");
  if (blank(step.prompt)) c.error(`${path}.prompt`, "step prompt is empty");
  if (scored && blank(step.explanation)) c.error(`${path}.explanation`, "scored step has no explanation");

  switch (step.type) {
    case "choice": {
      const opts = arr(step.options);
      const ids = opts.map((o) => o.id);
      if (opts.length < 2) c.error(`${path}.options`, "a choice needs at least 2 options");
      for (const d of dupes(ids)) c.error(`${path}.options`, `duplicate option id "${d}"`);
      if (scored && step.correct === undefined && !step.correctNearest) {
        c.error(`${path}.correct`, "scored choice has no correct option");
      }
      for (const k of Object.keys(step.correctNearest?.values ?? {})) {
        if (!ids.includes(k)) c.error(`${path}.correctNearest`, `"${k}" is not an option id`);
      }
      if (step.correct !== undefined && !ids.includes(step.correct)) {
        c.error(`${path}.correct`, `correct "${step.correct}" is not an option id`);
      }
      arr(step.accept).forEach((a, i) => {
        const id = typeof a === "string" ? a : a.option;
        if (!ids.includes(id)) c.error(`${path}.accept[${i}]`, `accept "${id}" is not an option id`);
        if (typeof a !== "string" && !(a.credit > 0 && a.credit <= 1)) {
          c.error(`${path}.accept[${i}]`, `credit ${a.credit} must be in (0, 1]`);
        }
      });
      const reasons = arr(step.reasons);
      for (const d of dupes(reasons.map((r) => r.id))) c.error(`${path}.reasons`, `duplicate reason id "${d}"`);
      if (step.correctReason !== undefined) {
        if (!reasons.some((r) => r.id === step.correctReason)) {
          c.error(`${path}.correctReason`, `correctReason "${step.correctReason}" is not a reason id`);
        } else if (reasons.length < 2) {
          c.warn(`${path}.reasons`, "only one reason: the reason part is not scored");
        }
      } else if (scored && reasons.length >= 2) {
        c.warn(`${path}.reasons`, "reasons given without correctReason: the reason part is not scored");
      }
      break;
    }
    case "rate": {
      const scaleValues = arr(step.scale).map((s) => s.value);
      for (const d of dupes(scaleValues.map(String))) c.error(`${path}.scale`, `duplicate scale value ${d}`);
      const items = arr(step.items);
      if (items.length === 0) c.error(`${path}.items`, "rate step has no items");
      for (const d of dupes(items.map((it) => it.id))) c.error(`${path}.items`, `duplicate item id "${d}"`);
      items.forEach((item, i) => {
        const p = `${path}.items[${i}]`;
        if (!scaleValues.includes(item.answer)) c.error(`${p}.answer`, `answer ${item.answer} is not on the scale`);
        for (const v of arr(item.alsoFull)) {
          if (!scaleValues.includes(v)) c.error(`${p}.alsoFull`, `alsoFull ${v} is not on the scale`);
        }
        if (scored && blank(item.explain)) c.error(`${p}.explain`, "rate item has no explanation");
        const m = checkMaterialRef(c, materials, item.materialIndex, `${p}.materialIndex`);
        checkFieldIds(c, m, arr(item.highlight), `${p}.highlight`);
      });
      if (step.drawCount !== undefined) {
        if (!Number.isInteger(step.drawCount) || step.drawCount < 1 || step.drawCount > items.length) {
          c.error(`${path}.drawCount`, `drawCount ${step.drawCount} must be 1 to ${items.length}`);
        }
      }
      break;
    }
    case "find": {
      const m = checkMaterialRef(c, materials, step.materialIndex, `${path}.materialIndex`);
      const targets = arr(step.targets);
      if (targets.length === 0) c.error(`${path}.targets`, "find step has no targets");
      for (const d of dupes(targets)) c.error(`${path}.targets`, `duplicate target "${d}"`);
      checkFieldIds(c, m, targets, `${path}.targets`);
      const explain = step.explainTargets ?? {};
      if (scored) {
        for (const t of targets) {
          if (blank(explain[t])) c.error(`${path}.explainTargets`, `target "${t}" has no explanation`);
        }
      }
      for (const k of Object.keys(explain)) {
        if (!targets.includes(k)) c.warn(`${path}.explainTargets`, `"${k}" is explained but is not a target`);
      }
      break;
    }
    case "number": {
      const a = step.answer;
      if (typeof a === "number") {
        if (!Number.isFinite(a)) c.error(`${path}.answer`, "answer is not a finite number");
      } else if (!a || !COMPUTE_FNS.includes(a.fn)) {
        c.error(`${path}.answer`, `unknown compute fn "${(a as { fn?: string })?.fn}"`);
      }
      if (step.tolerance !== undefined && !(step.tolerance >= 0)) {
        c.error(`${path}.tolerance`, "tolerance must be 0 or more");
      }
      break;
    }
    case "sort": {
      const boxes = arr(step.boxes);
      const boxIds = boxes.map((b) => b.id);
      if (boxes.length < 2 || boxes.length > 6) c.error(`${path}.boxes`, `${boxes.length} boxes; needs 2 to 6`);
      for (const d of dupes(boxIds)) c.error(`${path}.boxes`, `duplicate box id "${d}"`);
      const items = arr(step.items);
      if (items.length === 0) c.error(`${path}.items`, "sort step has no items");
      for (const d of dupes(items.map((it) => it.id))) c.error(`${path}.items`, `duplicate item id "${d}"`);
      items.forEach((item, i) => {
        const p = `${path}.items[${i}]`;
        if (scored && item.box === undefined) c.error(`${p}.box`, "scored sort item has no box");
        if (scored && blank(item.explain)) c.error(`${p}.explain`, "scored sort item has no explanation");
        if (item.box !== undefined && !boxIds.includes(item.box)) {
          c.error(`${p}.box`, `box "${item.box}" is not a box id`);
        }
        arr(item.accept).forEach((a, j) => {
          const id = typeof a === "string" ? a : a.option;
          if (!boxIds.includes(id)) c.error(`${p}.accept[${j}]`, `accept "${id}" is not a box id`);
          if (typeof a !== "string" && !(a.credit > 0 && a.credit <= 1)) {
            c.error(`${p}.accept[${j}]`, `credit ${a.credit} must be in (0, 1]`);
          }
        });
      });
      break;
    }
    case "order": {
      const items = arr(step.items);
      const ids = items.map((it) => it.id);
      if (items.length < 2) c.error(`${path}.items`, "an order step needs at least 2 items");
      for (const d of dupes(ids)) c.error(`${path}.items`, `duplicate item id "${d}"`);
      const answer = arr(step.answer);
      const sameSet =
        answer.length === ids.length && dupes(answer).length === 0 && answer.every((id) => ids.includes(id));
      if (!sameSet) c.error(`${path}.answer`, "answer must list every item id exactly once");
      break;
    }
    default:
      c.error(path, `unknown step type "${(step as { type?: string }).type}"`);
  }
}

function checkSteps(c: Checker, steps: TaskStep[] | undefined, materials: Material[], path: string) {
  const list = arr(steps);
  if (list.length < 1 || list.length > 6) c.error(path, `${list.length} steps; needs 1 to 6`);
  for (const d of dupes(list.map((s) => s.id))) c.error(path, `duplicate step id "${d}"`);
  list.forEach((s, i) => checkStep(c, s, materials, `${path}[${i}]`));
}

function checkReveal(
  c: Checker,
  reveal: BiasReveal | undefined,
  hook: Hook | undefined,
  steps: TaskStep[],
  path: string,
) {
  if (!reveal) {
    c.error(path, "reveal is missing");
    return;
  }
  if (blank(reveal.bias)) c.error(`${path}.bias`, "reveal has no bias name");
  if (blank(reveal.default)) c.error(`${path}.default`, "reveal has no default text");
  // 03 §1: reveal texts are at most two sentences.
  const texts: [string, string][] = [
    ["default", reveal.default ?? ""],
    ...Object.entries(reveal.byHookOption ?? {}).map(([k, v]) => [`byHookOption.${k}`, v] as [string, string]),
    ...Object.entries(reveal.byOutcome ?? {}).map(([k, v]) => [`byOutcome.${k}`, v] as [string, string]),
  ];
  for (const [k, t] of texts) {
    if (sentenceCount(t) > 2) c.error(`${path}.${k}`, `reveal text has ${sentenceCount(t)} sentences (max 2)`);
  }
  const hookIds = arr(hook?.options).map((o) => o.id);
  for (const k of Object.keys(reveal.byHookOption ?? {})) {
    if (!hookIds.includes(k)) c.error(`${path}.byHookOption`, `"${k}" is not a hook option id`);
  }
  if (reveal.outcomeFrom) {
    const { stepId, map } = reveal.outcomeFrom;
    const step = steps.find((s) => s.id === stepId);
    if (!step) {
      c.error(`${path}.outcomeFrom.stepId`, `step "${stepId}" does not exist`);
    } else if (step.type !== "choice") {
      c.error(`${path}.outcomeFrom.stepId`, `step "${stepId}" is a ${step.type} step; outcomeFrom needs a choice`);
    } else {
      const optIds = step.options.map((o) => o.id);
      for (const k of Object.keys(map ?? {})) {
        if (!optIds.includes(k)) c.error(`${path}.outcomeFrom.map`, `"${k}" is not an option of step "${stepId}"`);
      }
    }
    const outcomes = reveal.byOutcome ?? {};
    for (const [opt, outcome] of Object.entries(map ?? {})) {
      if (!(outcome in outcomes)) {
        c.error(`${path}.byOutcome`, `outcome "${outcome}" (from option "${opt}") has no text`);
      }
    }
  } else if (reveal.byOutcome) {
    c.warn(`${path}.byOutcome`, "byOutcome without outcomeFrom is never used");
  }
}

function checkKind(c: Checker, kind: string | undefined, path: string, slug: string | undefined) {
  if (typeof kind !== "string" || !KIND_PATTERN.test(kind)) {
    c.error(path, `kind "${kind}" does not match <line>_<task>_v<n>`);
  } else if (slug && !kind.startsWith(`${slug}_`)) {
    c.warn(path, `kind "${kind}" does not start with the line slug "${slug}_"`);
  }
}

function checkLesson(c: Checker, lesson: StationLesson, slug: string | undefined, path: string) {
  const line = LINES.find((l) => l.slug === slug);
  if (lesson.placement === "station") {
    if (lesson.stationId === null || (line && !line.stationModules.includes(lesson.stationId))) {
      c.error(`${path}.stationId`, `station ${lesson.stationId} is not one of this line's stations`);
    }
  } else if (lesson.stationId !== null && lesson.stationId !== undefined) {
    c.warn(`${path}.stationId`, `a ${lesson.placement} task set usually has stationId null`);
  }
  checkHook(c, lesson.hook, `${path}.hook`);
  checkCards(c, lesson.lessonCards, `${path}.lessonCards`, true);
  const task = lesson.task;
  if (!task) {
    c.error(`${path}.task`, "task is missing");
    return;
  }
  if (blank(task.id)) c.error(`${path}.task.id`, "task id is empty");
  checkKind(c, task.kind, `${path}.task.kind`, slug);
  if (blank(task.title)) c.error(`${path}.task.title`, "task title is empty");
  // 06 F3.1: who is asking, a short message, what you learn and do, minutes.
  const b = task.brief;
  if (!b || blank(b.from?.name) || blank(b.from?.role) || blank(b.from?.org)) {
    c.error(`${path}.task.brief.from`, "brief needs a sender: name, role and organisation");
  }
  if (blank(b?.message) || blank(b?.learn) || blank(b?.do)) {
    c.error(`${path}.task.brief`, "brief needs a message, a learn line and a do line");
  }
  if (sentenceCount(b?.message ?? "") > 2) {
    c.error(`${path}.task.brief.message`, "brief message is longer than 2 sentences");
  }
  if (charLength(b?.message ?? "") > 60) {
    c.error(`${path}.task.brief.message`, `brief message is ${charLength(b?.message ?? "")} characters (max 60)`);
  }
  for (const k of ["learn", "do"] as const) {
    if (/[。！？][^。！？]/.test(b?.[k] ?? "")) c.error(`${path}.task.brief.${k}`, `brief ${k} line must be one line, one sentence`);
  }
  if (!(Number.isInteger(b?.minutes) && b.minutes >= 1 && b.minutes <= 20)) {
    c.error(`${path}.task.brief.minutes`, `brief minutes ${b?.minutes} must be 1 to 20`);
  }
  if (!(task.passScore >= 0 && task.passScore <= 1)) {
    c.error(`${path}.task.passScore`, `passScore ${task.passScore} must be 0 to 1`);
  }
  const materials = arr(task.materials);
  checkSteps(c, task.steps, materials, `${path}.task.steps`);
  checkReveal(c, lesson.reveal, lesson.hook, arr(task.steps), `${path}.reveal`);
  if (blank(lesson.takeaway?.name) || arr(lesson.takeaway?.lines).length === 0) {
    c.error(`${path}.takeaway`, "takeaway needs a name and at least one line");
  }
}

// --- copy rules over every string ---------------------------------------------------

interface StringAt {
  path: string;
  value: string;
  /** Strings in the enclosing object and its parent: the context a figure sits in. */
  context: string[];
}

function collectStrings(root: unknown): StringAt[] {
  const out: StringAt[] = [];
  const directStrings = (v: unknown): string[] =>
    v && typeof v === "object"
      ? Object.values(v as Record<string, unknown>).filter((x): x is string => typeof x === "string")
      : [];
  const walk = (v: unknown, path: string, parents: unknown[]) => {
    if (typeof v === "string") {
      const ctx = parents.slice(-2).flatMap(directStrings);
      out.push({ path, value: v, context: ctx });
      return;
    }
    if (Array.isArray(v)) {
      v.forEach((x, i) => walk(x, `${path}[${i}]`, [...parents, v]));
      return;
    }
    if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
        walk(x, path ? `${path}.${k}` : k, [...parents, v]);
      }
    }
  };
  walk(root, "", []);
  return out;
}

function checkCopy(c: Checker, content: unknown, extraDeny: string[]) {
  for (const s of collectStrings(content)) {
    if (EM_DASH.test(s.value)) c.error(s.path, "em dash in copy; rewrite the sentence");
    if (containsDeniedName(s.value, extraDeny)) c.error(s.path, "contains a listed organisation name");
    if (NT_AMOUNT.test(s.value) && !FIGURE_CONTEXT.test(s.value) && !s.context.some((x) => FIGURE_CONTEXT.test(x))) {
      c.warn(s.path, "NT$ figure without a 示意 label or source nearby; check it is sourced or illustrative");
    }
  }
}

// --- public -------------------------------------------------------------------------

/** All checks that need only this one file. */
/** `extraDeny`: plain names to treat as denied too (tests use a made-up one). */
export function validateLine(content: LineContent, file: string, fileSlug?: string, extraDeny: string[] = []): Issue[] {
  const c = new Checker(file);
  if (!content || typeof content !== "object") {
    c.error("", "no `content` export (each file must `export const content: LineContent`)");
    return c.issues;
  }
  const slug = content.slug;
  if (!LINES.some((l) => l.slug === slug)) c.error("slug", `unknown line slug "${slug}"`);
  if (fileSlug !== undefined && slug !== fileSlug) {
    c.error("slug", `slug "${slug}" does not match the file name "${fileSlug}"`);
  }
  checkHook(c, content.hook, "hook");
  if (blank(content.bias)) c.error("bias", "line has no bias name");
  if (blank(content.takeaway?.name)) c.error("takeaway", "line takeaway has no name");
  if (blank(content.unlocks)) c.warn("unlocks", "line has no unlocks text");
  const lessons = arr(content.lessons);
  if (lessons.length === 0 && !content.terminal) c.error("lessons", "line has no task sets");
  lessons.forEach((l, i) => checkLesson(c, l, slug, `lessons[${i}]`));

  if (content.terminal) {
    const t = content.terminal;
    checkCards(c, t.lessonCards, "terminal.lessonCards", false);
    const after = arr(t.afterSteps);
    checkReveal(c, t.reveal, content.hook, after, "terminal.reveal");
    if (after.length > 0) {
      checkSteps(c, after, [], "terminal.afterSteps");
      checkKind(c, t.afterKind, "terminal.afterKind", slug);
    } else if (t.afterKind !== undefined) {
      checkKind(c, t.afterKind, "terminal.afterKind", slug);
    }
  }
  checkCopy(c, content, extraDeny);
  return c.issues;
}

/** Every file's own checks, plus uniqueness of kinds and task ids across lines. */
export function validateAll(entries: { file: string; content: LineContent; fileSlug?: string }[]): Issue[] {
  const issues: Issue[] = [];
  const kinds = new Map<string, string>();
  const taskIds = new Map<string, string>();
  const slugs = new Map<string, string>();
  for (const { file, content, fileSlug } of entries) {
    issues.push(...validateLine(content, file, fileSlug));
    if (!content || typeof content !== "object") continue;
    const claim = (map: Map<string, string>, key: string | undefined, path: string, what: string) => {
      if (typeof key !== "string" || key.length === 0) return;
      const prior = map.get(key);
      if (prior !== undefined) {
        issues.push({ level: "error", file, path, message: `${what} "${key}" is already used in ${prior}` });
      } else {
        map.set(key, `${file} ${path}`);
      }
    };
    claim(slugs, content.slug, "slug", "slug");
    arr(content.lessons).forEach((l, i) => {
      claim(kinds, l.task?.kind, `lessons[${i}].task.kind`, "kind");
      claim(taskIds, l.task?.id, `lessons[${i}].task.id`, "task id");
    });
    claim(kinds, content.terminal?.afterKind, "terminal.afterKind", "kind");
  }
  return issues;
}

/**
 * Copy checks for the global content files (content/global.ts,
 * content/overview.ts): em dashes and listed organisation names.
 */
export function validateCopyOnly(value: unknown, file: string, extraDeny: string[] = []): Issue[] {
  const issues: Issue[] = [];
  const walk = (v: unknown, path: string) => {
    if (typeof v === "string") {
      if (EM_DASH.test(v)) issues.push({ level: "error", file, path, message: "em dash in copy; rewrite the sentence" });
      if (containsDeniedName(v, extraDeny)) issues.push({ level: "error", file, path, message: "contains a listed organisation name" });
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
  };
  walk(value, "");
  return issues;
}

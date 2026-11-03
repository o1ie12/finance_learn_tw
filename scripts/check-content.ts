/**
 * Content check (03 §5.5): loads every content/lines/*.ts and validates it
 * with lib/tasks/validate.ts. Each file must `export const content:
 * LineContent`. Files named index.ts, *.test.ts, *.d.ts or starting with "_"
 * are skipped (helpers, not lines).
 *
 * Exits 1 on any error. Warnings are printed and do not fail the check.
 *
 *   npx tsx scripts/check-content.ts [folder]
 */

import { existsSync, readdirSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { validateAll, validateCopyOnly, validateLinePages, type Issue } from "@/lib/tasks/validate";
import type { LineContent } from "@/lib/tasks/types";

/** content/lines, or a folder given as the first argument (for testing the checker). */
const DIR = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(__dirname, "..", "content", "lines");

function lineFiles(): string[] {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR)
    .filter(
      (f) =>
        f.endsWith(".ts") &&
        !f.endsWith(".d.ts") &&
        !f.endsWith(".test.ts") &&
        f !== "index.ts" &&
        !f.startsWith("_"),
    )
    .sort();
}

function print(issue: Issue) {
  const where = issue.path ? `${issue.file} ${issue.path}` : issue.file;
  const tag = issue.level === "error" ? "ERROR  " : "WARNING";
  console.log(`${tag} ${where}: ${issue.message}`);
}

async function main() {
  const files = lineFiles();
  const entries: { file: string; content: LineContent; fileSlug: string }[] = [];
  const loadErrors: Issue[] = [];

  for (const f of files) {
    const rel = relative(process.cwd(), join(DIR, f));
    try {
      const mod = (await import(pathToFileURL(join(DIR, f)).href)) as { content?: LineContent };
      entries.push({ file: rel, content: mod.content as LineContent, fileSlug: basename(f, ".ts") });
    } catch (err) {
      loadErrors.push({
        level: "error",
        file: rel,
        path: "",
        message: `failed to load: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  // The global copy files get the copy checks too (em dashes, listed names).
  const globals: Issue[] = [];
  for (const g of ["global.ts", "overview.ts"]) {
    const path = join(DIR, "..", g);
    if (!existsSync(path)) continue;
    const mod = (await import(pathToFileURL(path).href)) as Record<string, unknown>;
    globals.push(...validateCopyOnly(mod, relative(process.cwd(), path)));
  }
  // The line pages' program copy (06 F3.5, F3.6).
  const pagesPath = join(DIR, "..", "linePages.ts");
  if (existsSync(pagesPath) && !process.argv[2]) {
    const { LINE_PAGES } = (await import(pathToFileURL(pagesPath).href)) as { LINE_PAGES: Parameters<typeof validateLinePages>[0] };
    const { LINE_SLUGS } = await import("@/lib/lines");
    globals.push(...validateLinePages(LINE_PAGES, LINE_SLUGS, relative(process.cwd(), pagesPath)));
  }
  // 10 CMP-1: a job note or a step's explanation that repeats a lesson card
  // (over 0.8 of its character pairs) is said twice on the compare screen.
  // A warning with the pair: the screen hides the repeat; a writer rewrites one.
  const { JOB_NOTES } = await import("@/content/jobNotes");
  const { overlap, cardText } = await import("@/lib/tasks/overlap");
  const repeatsCard: Issue[] = [];
  for (const e of entries) {
    e.content?.lessons?.forEach((l, li) => {
      const texts: [string, string][] = [];
      const note = (JOB_NOTES as Record<string, string>)[l.task.id] ?? l.task.jobNote;
      if (note) texts.push([`lessons[${li}].task.jobNote`, note]);
      l.task.steps.forEach((s, si) => s.explanation && texts.push([`lessons[${li}].task.steps[${si}].explanation`, s.explanation]));
      for (const [path, text] of texts) {
        const card = l.lessonCards.find((c) => overlap(text, cardText(c)) > 0.8);
        if (card) {
          repeatsCard.push({ level: "warning", file: e.file, path, message: `repeats the lesson card 「${card.title}」 (${Math.round(overlap(text, cardText(card)) * 100)}%): rewrite one (10 CMP-1)` });
        }
      }
    });
  }
  // 10 HOOK-1: every station's 想一想 option has its line (a warning while
  // they are written); a line is at most 60 characters and names a real option.
  const { HOOK_REVEALS } = await import("@/content/hookReveals");
  const { charLength } = await import("@/lib/tasks/validate");
  const { isHiddenTask } = await import("@/lib/tasks/hidden");
  const hookLines: Issue[] = [];
  for (const e of entries) {
    e.content?.lessons?.forEach((l, li) => {
      if (l.placement === "library" || isHiddenTask(l.task.id)) return;
      const lines = (HOOK_REVEALS as Record<string, Record<string, string>>)[l.task.id] ?? {};
      const ids = new Set(l.hook.options.map((o) => o.id));
      const missing = l.hook.options.filter((o) => !lines[o.id]).map((o) => o.id);
      if (missing.length) hookLines.push({ level: "warning", file: e.file, path: `lessons[${li}].hook`, message: `no 你一開始的想法 line for ${missing.join(", ")} (content/hookReveals.ts, 10 HOOK-1)` });
      for (const [id, line] of Object.entries(lines)) {
        if (!ids.has(id)) hookLines.push({ level: "error", file: "content/hookReveals.ts", path: `${l.task.id}.${id}`, message: "names an option the 想一想 does not have" });
        if (charLength(line) > 60) hookLines.push({ level: "error", file: "content/hookReveals.ts", path: `${l.task.id}.${id}`, message: `${charLength(line)} characters (at most 60)` });
        if (/[—–]/.test(line)) hookLines.push({ level: "error", file: "content/hookReveals.ts", path: `${l.task.id}.${id}`, message: "em dash" });
      }
    });
  }
  // 10 CONT-1: a choice must not give its right answer away by length or by
  // being the only one with a number (lib/tasks/answerTell.ts).
  const { answerTells } = await import("@/lib/tasks/answerTell");
  const { allLineContent } = await import("@/lib/tasks/registry");
  const { fillFigures } = await import("@/lib/tasks/figures");
  const tells: Issue[] = [];
  // As students see them: figures filled in ({{depRate}} → 1.7%).
  if (!process.argv[2]) {
    for (const line of allLineContent()) {
      for (const l of line.lessons) {
        if (isHiddenTask(l.task.id)) continue;
        for (const tell of answerTells(fillFigures(l).task.steps)) {
          tells.push({ level: "error", file: `content/lines/${line.slug}.ts`, path: `${l.task.id}.${tell.stepId}.${tell.list}`, message: `the right answer stands out: ${tell.why} (10 CONT-1)` });
        }
      }
    }
  }
  const issues = [...loadErrors, ...validateAll(entries), ...globals, ...repeatsCard, ...hookLines, ...tells];
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  for (const i of [...errors, ...warnings]) print(i);

  console.log(
    `check-content: ${files.length} files, ${errors.length} errors, ${warnings.length} warnings`,
  );
  if (files.length === 0) console.log("0 files");
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

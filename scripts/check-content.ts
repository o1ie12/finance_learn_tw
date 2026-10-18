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

import { validateAll, validateCopyOnly, type Issue } from "@/lib/tasks/validate";
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
  const issues = [...loadErrors, ...validateAll(entries), ...globals];
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

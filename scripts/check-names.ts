/**
 * Partner organisation names must never reach the public repo (00 hard rule
 * 2, 06 hard rules). Scans every file changed since `main` plus untracked
 * files, and the commit messages since `main`, with the same hashed deny list
 * as the content check (lib/tasks/validate.ts). A short ASCII name only counts
 * when it stands alone, so `isFinite` is not a hit.
 *
 * "forage" is on the content deny list so the UI never names it, but it is not
 * a partner: the specs and code comments name it as the model for the station
 * flow, so this repo-wide check lets it through. The content check still
 * keeps it out of anything a student sees.
 *
 *   npx tsx scripts/check-names.ts [base-ref]    (default base: origin/main)
 */
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { DENY_HASHES, normaliseForDeny } from "@/lib/tasks/validate";

const base = process.argv[2] ?? "origin/main";
const NOT_PARTNERS = new Set(["forage"]);

function hit(text: string): boolean {
  const chars = [...normaliseForDeny(text)];
  for (const d of DENY_HASHES) {
    for (let i = 0; i + d.length <= chars.length; i++) {
      const w = chars.slice(i, i + d.length).join("");
      if (createHash("sha256").update(w).digest("hex") !== d.sha256) continue;
      if (NOT_PARTNERS.has(w)) continue;
      const before = chars[i - 1] ?? " ";
      const after = chars[i + d.length] ?? " ";
      if (/^[a-z0-9]+$/.test(w) && (/[a-z0-9]/.test(before) || /[a-z0-9]/.test(after))) continue;
      return true;
    }
  }
  return false;
}

const sh = (cmd: string) => execSync(cmd, { encoding: "utf8" }).split("\n").filter(Boolean);
const files = new Set([...sh(`git diff --name-only ${base}`), ...sh("git ls-files --others --exclude-standard")]);
let hits = 0;
for (const f of files) {
  if (!existsSync(f) || statSync(f).isDirectory() || /\.(png|jpe?g|ico|woff2?|ttf|otf|pptx|pdf)$/i.test(f)) continue;
  readFileSync(f, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (hit(line)) {
        hits++;
        console.log(`HIT ${f}:${i + 1}`);
      }
    });
  if (hit(f)) {
    hits++;
    console.log(`HIT file name ${f}`);
  }
}
sh(`git log --format=%B ${base}..HEAD`).forEach((line, i) => {
  if (hit(line)) {
    hits++;
    console.log(`HIT commit message line ${i + 1}`);
  }
});
console.log(`check-names: ${files.size} files and the commit messages since ${base}, ${hits} hits`);
process.exit(hits ? 1 : 0);

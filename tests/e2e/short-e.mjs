/**
 * Finline Shorts (06 F3.10): 今天's 「3 分鐘版」 opens a Short; each Short is
 * one question, its model answer, and 完成 back to 今天. Every screen is
 * checked (no page scroll, targets, 12px floor), light and dark.
 *
 *   npx tsx tests/e2e/task-key.ts <shortId> <dir>/<shortId>.json   (for each Short)
 *   BASE_URL=http://localhost:3210 node tests/e2e/short-e.mjs <dir> <shortId> [...]
 */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { measureScreen } from "./designChecks.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const [, , dir, ...ids] = process.argv;
const post = (p, body, cookie) =>
  fetch(BASE + p, { method: "POST", headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body ?? {}) });

const results = [];
const errors = [];
const check = (ok, what) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
const browser = await chromium.launch();
for (const scheme of ["light", "dark"]) {
  const code = (await (await post("/api/signup", { name: "短版走查", school: "本機測試", grade: "高二" })).json()).access_code;
  const cookie = `fs_access_code=${code}; fs_signed_in=1`;
  for (const p of ["/api/avatar", "/api/goal"]) await post(p, { skip: true }, cookie);
  await post("/api/tour", {}, cookie);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme });
  await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : code, domain: "localhost", path: "/" })));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  const screen = async (label) => {
    await page.waitForTimeout(400);
    const { ok, why } = await measureScreen(page);
    check(ok, `${scheme} ${label}${ok ? "" : ` (${why})`}`);
  };

  await page.goto(BASE + "/today", { waitUntil: "networkidle" });
  const link = page.getByRole("link", { name: "3 分鐘版" });
  check((await link.getAttribute("href")) === `/short/${ids[0]}`, `${scheme} 今天: 3 分鐘版 opens the first Short not done`);
  await screen("今天");

  for (const id of ids) {
    const key = JSON.parse(readFileSync(`${dir}/${id}.json`, "utf8"));
    const step = key.steps[0];
    await page.goto(`${BASE}/short/${id}`, { waitUntil: "networkidle" });
    // The lesson bar's kicker reads 「<line> · 3 分鐘版」 (2026-10-24).
    check((await page.locator("header p").first().innerText()).includes("3 分鐘版"), `${scheme} ${id}: opens on its question`);
    if (step.type === "choice") await page.getByRole("radio", { name: step.right, exact: true }).first().click();
    else await page.locator('input[inputmode="decimal"]').fill(String(Math.round(step.value * 10) / 10));
    await screen(`${id} question`);
    await page.getByRole("button", { name: "確定", exact: true }).click();
    await page.getByRole("heading", { name: "建議答案" }).waitFor({ timeout: 20_000 });
    check(await page.getByText("和建議答案一樣").or(page.getByText("正確答案")).first().isVisible(), `${scheme} ${id}: the right answer matches`);
    await screen(`${id} answer`);
    await page.getByRole("button", { name: "完成", exact: true }).click();
    await page.waitForURL(/\/today$/, { timeout: 20_000 });
    check(true, `${scheme} ${id}: 完成 goes back to 今天`);
  }
  await page.goto(BASE + "/today", { waitUntil: "networkidle" });
  const after = await page.getByRole("link", { name: "3 分鐘版" }).getAttribute("href");
  check(after?.startsWith("/short/"), `${scheme} 今天: after every Short, 3 分鐘版 offers the next in turn (${after})`);
  await ctx.close();
}
await browser.close();
console.log(results.join("\n"));
console.log(errors.length ? `page errors:\n${errors.join("\n")}` : "page errors: 0");
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`${results.length} checks, ${fails} failing`);
process.exit(fails || errors.length ? 1 : 0);

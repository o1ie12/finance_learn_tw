/**
 * The Part E life-game turn (06 E8.6) by keyboard: a new student plays three
 * months on /turn (month 3 has the ledger), every step checked for page
 * scroll, targets ≥ 44 and the 12px floor, light and dark, and saved to
 * docs/design/screens/.
 *
 *   BASE_URL=http://localhost:3210 node tests/e2e/turn-e.mjs [WxH]
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { measureScreen } from "./designChecks.mjs";
import { playStep, waitHeading } from "./playDriver.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const [W, H] = (process.argv[2] ?? "390x844").split("x").map(Number);
const OUT = new URL("../../docs/design/screens/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const post = (p, body, cookie) =>
  fetch(BASE + p, { method: "POST", headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body ?? {}) });

const browser = await chromium.launch();
const results = [];
const errors = [];
for (const scheme of ["light", "dark"]) {
  const code = (await (await post("/api/signup", { name: "回合走查", school: "本機測試", grade: "高二" })).json()).access_code;
  const cookie = `fs_access_code=${code}; fs_signed_in=1`;
  for (const p of ["/api/avatar", "/api/goal"]) await post(p, { skip: true }, cookie);
  await post("/api/tour", {}, cookie);
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, colorScheme: scheme, deviceScaleFactor: 2 });
  await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : code, domain: "localhost", path: "/" })));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE + "/turn", { waitUntil: "networkidle" });
  await waitHeading(page);
  let n = 0;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(400);
    const heading = await page.evaluate(() => document.querySelector("[data-step-heading]")?.textContent?.trim() ?? "");
    const sub = await page.evaluate(() => document.querySelector("header p")?.textContent?.trim() ?? "");
    const { ok, why } = await measureScreen(page);
    results.push(`${ok ? "ok  " : "FAIL"} ${scheme} ${sub} 「${heading}」${ok ? "" : ` (${why})`}`);
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await page.screenshot({ path: `${OUT}turn-${String(++n).padStart(2, "0")}-${W}x${H}-${scheme}.png` });
    if (/^第 3 個月結束了$/.test(heading)) break;
    await playStep(page);
  }
  await ctx.close();
}
await browser.close();
console.log(results.join("\n"));
console.log(errors.length ? `page errors:\n${errors.join("\n")}` : "page errors: 0");
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`${results.length} screens, ${fails} failing`);
process.exit(fails || errors.length ? 1 : 0);

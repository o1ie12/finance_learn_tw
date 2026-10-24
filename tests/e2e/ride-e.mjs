/**
 * The Part E ride (06 E11): a new student plays one month on /turn with a
 * ride query, presses 完成, and the train runs (doors, walk-in, departure,
 * arrival card) and lands on the next station. Screens at each phase, light
 * and dark; then once more under reduced motion (straight to the card).
 *
 *   BASE_URL=http://localhost:3210 node tests/e2e/ride-e.mjs
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { playStep, waitHeading } from "./playDriver.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const OUT = new URL("../../docs/design/screens/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const post = (p, body, cookie) =>
  fetch(BASE + p, { method: "POST", headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body ?? {}) });

const q = new URLSearchParams({
  return: "/line/xinyong/station/7",
  toLine: "信用線",
  toColor: "#F4A300",
  toStation: "卡片站",
  toBlurb: "看懂你的第一張信用卡帳單",
  toEn: "CREDIT LINE",
  toCode: "CR02",
});
const results = [];
const errors = [];
const browser = await chromium.launch();
for (const [scheme, motion] of [["light", "no-preference"], ["dark", "no-preference"], ["light", "reduce"]]) {
  const code = (await (await post("/api/signup", { name: "乘車走查", school: "本機測試", grade: "高二" })).json()).access_code;
  const cookie = `fs_access_code=${code}; fs_signed_in=1`;
  for (const p of ["/api/avatar", "/api/goal"]) await post(p, { skip: true }, cookie);
  await post("/api/tour", {}, cookie);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme, reducedMotion: motion, deviceScaleFactor: 2 });
  await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : code, domain: "localhost", path: "/" })));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${BASE}/turn?${q}`, { waitUntil: "networkidle" });
  await waitHeading(page);
  for (let i = 0; i < 12; i++) {
    const r = await playStep(page, { ride: true });
    if (r.ride) break;
  }
  const tag = `${scheme}${motion === "reduce" ? "-reduced" : ""}`;
  const t0 = Date.now();
  const shots = motion === "reduce" ? [["card", 250]] : [["doors", 350], ["walk", 950], ["depart", 2000], ["card", 2450]];
  for (const [label, at] of shots) {
    await page.waitForTimeout(Math.max(at - (Date.now() - t0), 0));
    const phase = await page.evaluate(() => document.querySelector("[data-train]")?.getAttribute("data-phase") ?? "(gone)");
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await page.screenshot({ path: `${OUT}ride-${label}-390x844-${tag}.png` });
    results.push(`${tag} ${label} @${at}ms: phase ${phase}`);
  }
  await page.waitForURL(/\/line\/xinyong\/station\/7/, { timeout: 20_000 });
  const landed = page.url().includes("/line/xinyong/station/7");
  results.push(`${landed ? "ok  " : "FAIL"} ${tag}: landed on ${new URL(page.url()).pathname} after ${Date.now() - t0}ms`);
  await ctx.close();
}
await browser.close();
console.log(results.join("\n"));
console.log(errors.length ? `page errors:\n${errors.join("\n")}` : "page errors: 0");
process.exit(results.some((r) => r.startsWith("FAIL")) || errors.length ? 1 : 0);

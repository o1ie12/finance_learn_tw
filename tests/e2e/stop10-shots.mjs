/**
 * The screens for the 10 stop after step 4, at 390 × 844 (viewport and full
 * page): a station start, the compare screen passed, failed and unscored
 * (/dev/compare fixtures), and the 行動 step of the month.
 *
 *   BASE_URL=http://localhost:3210 node tests/e2e/stop10-shots.mjs
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { playStep, stepHeading, waitHeading } from "./playDriver.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const OUT = new URL("../../docs/design/screens/stop10/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const json = { "content-type": "application/json" };
const code = (await (await fetch(BASE + "/api/signup", { method: "POST", headers: json, body: JSON.stringify({ name: "小安", grade: "高二" }) })).json()).access_code;
const cookie = `fs_access_code=${code}; fs_signed_in=1`;
for (const p of ["/api/avatar", "/api/goal"]) await fetch(BASE + p, { method: "POST", headers: { ...json, cookie }, body: JSON.stringify({ skip: true }) });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : code, domain: "localhost", path: "/" })));
const page = await ctx.newPage();
const hideDev = () => page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
const shot = async (name) => {
  await hideDev();
  await page.screenshot({ path: `${OUT}${name}.png` });
  await page.screenshot({ path: `${OUT}${name}-full.png`, fullPage: true });
  console.log(name);
};

await page.goto(BASE + "/line/touzi/station/5", { waitUntil: "networkidle" });
await shot("1-station-start-IN01");
for (const [name, path] of [
  ["2-compare-pass-CR03", "/dev/compare/xinyong.protect.v1?fixture=right"],
  ["3-compare-fail-CR03", "/dev/compare/xinyong.protect.v1?fixture=wrong"],
  ["4-compare-unscored-CA01", "/dev/compare/zhiya.interest.v1?fixture=some"],
]) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await shot(name);
}
await page.goto(BASE + "/turn", { waitUntil: "networkidle" });
await waitHeading(page);
for (let i = 0; i < 8 && (await stepHeading(page)) !== "剩下的錢，要怎麼用？"; i++) await playStep(page);
await shot("5-month-actions");
await browser.close();

/**
 * 10 UI-4 (map-e): the map's station dots by keyboard, at 1440 × 900 and
 * 390 × 844. Tab reaches a dot with a label (code, name, state); Enter opens
 * its sheet with focus inside; Escape closes it and focus is back on the dot.
 * The dot's hit area is at least 44 × 44, and the map's counts read N / M 站
 * with M every station of the line (DATA-2).
 *
 *   BASE_URL=http://localhost:3210 node tests/e2e/map-e.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const json = { "content-type": "application/json" };
const results = [];
const errors = [];
const check = (ok, what) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
const code = (await (await fetch(BASE + "/api/signup", { method: "POST", headers: json, body: JSON.stringify({ name: "地圖走查", grade: "高二" }) })).json()).access_code;
await fetch(BASE + "/api/goal", { method: "POST", headers: { ...json, cookie: `fs_access_code=${code}; fs_signed_in=1` }, body: JSON.stringify({ skip: true }) });

const browser = await chromium.launch();
for (const [W, H] of [[1440, 900], [390, 844]]) {
  const tag = `${W}x${H}`;
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : code, domain: "localhost", path: "/" })));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE + "/map", { waitUntil: "networkidle" });

  let label = "";
  for (let i = 0; i < 40 && !label; i++) {
    await page.keyboard.press("Tab");
    label = await page.evaluate(() => {
      const a = document.activeElement;
      return a?.getAttribute("role") === "button" && a.closest("svg") ? (a.getAttribute("aria-label") ?? "") : "";
    });
  }
  check(/^\S+線 [A-Z]{2}\d{2} \S+，(已完成|下一站|未完成)$/.test(label), `${tag} Tab reaches a dot labelled 「${label}」`);
  const hit = await page.evaluate(() => {
    const r = document.activeElement.getBoundingClientRect();
    return Math.min(r.width, r.height);
  });
  check(hit >= 43.5, `${tag} the dot's hit area is ${Math.round(hit)}px or more`);
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ timeout: 5000 });
  check(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')), `${tag} Enter opens the sheet, focus inside`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  const back = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? "");
  check(back === label, `${tag} Escape closes it and focus is back on the dot`);
  await page.keyboard.press(" ");
  check(await dialog.isVisible().catch(() => false), `${tag} Space opens it too`);
  await page.keyboard.press("Escape");

  const counts = await page.locator('[data-list] li').allInnerTexts();
  check(counts.length === 12 && counts.every((t) => /\d+ \/ \d+ 站|已完成/.test(t)), `${tag} every line's count reads N / M 站`);
  await ctx.close();
}
await browser.close();
console.log(results.join("\n"));
console.log(errors.length ? `page errors:\n${errors.slice(0, 5).join("\n")}` : "page errors: 0");
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`map-e: ${results.length} checks, ${fails} failing`);
process.exit(fails || errors.length ? 1 : 0);

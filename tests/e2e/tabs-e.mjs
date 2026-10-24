/**
 * The Part E tabs and line page by interaction (06 E8.7, E8.9, E7.12): every
 * sheet opens, closes with 關閉 (after its 200ms exit) and with Esc, and
 * focus comes back; the map's station sheet offers 上車; 站點 swaps the line
 * page's halves. Light and dark.
 *
 *   BASE_URL=http://localhost:3210 node tests/e2e/tabs-e.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const post = (p, body, cookie) =>
  fetch(BASE + p, { method: "POST", headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body ?? {}) });

const results = [];
const errors = [];
const check = (ok, what) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
const browser = await chromium.launch();
for (const scheme of ["light", "dark"]) {
  const code = (await (await post("/api/signup", { name: "分頁走查", school: "本機測試", grade: "高二" })).json()).access_code;
  const cookie = `fs_access_code=${code}; fs_signed_in=1`;
  for (const p of ["/api/avatar", "/api/goal"]) await post(p, { skip: true }, cookie);
  await post("/api/tour", {}, cookie);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme });
  await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : code, domain: "localhost", path: "/" })));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  const dialog = () => page.locator('[role="dialog"]');

  const sheetCycle = async (label, opener) => {
    await opener.click();
    await dialog().first().waitFor({ timeout: 5000 });
    check((await dialog().count()) === 1, `${scheme} ${label}: sheet opens`);
    await page.getByRole("button", { name: "關閉", exact: true }).click();
    await page.waitForTimeout(350);
    check((await dialog().count()) === 0, `${scheme} ${label}: 關閉 closes it`);
    await opener.click();
    await dialog().first().waitFor({ timeout: 5000 });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(350);
    const back = await opener.evaluate((el) => el === document.activeElement);
    check((await dialog().count()) === 0 && back, `${scheme} ${label}: Esc closes it, focus returns`);
  };

  await page.goto(BASE + "/status", { waitUntil: "networkidle" });
  await sheetCycle("狀態 緊急預備金", page.getByRole("button", { name: /緊急預備金/ }));

  await page.goto(BASE + "/moves", { waitUntil: "networkidle" });
  await sheetCycle("行動 還沒解鎖的", page.getByRole("button", { name: /還沒解鎖的/ }));
  await page.getByRole("button", { name: "下一張卡" }).click();
  await page.waitForTimeout(600);
  check(await page.getByRole("button", { name: "上一張卡" }).isEnabled(), `${scheme} 行動: › pages the cards`);

  await page.goto(BASE + "/map", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "信用線", exact: true }).click();
  check((await page.getByRole("button", { name: "信用線", exact: true }).getAttribute("aria-pressed")) === "true", `${scheme} 路線: a line chip focuses its line`);
  await page.locator('svg [class*="dot"]').first().click();
  await dialog().first().waitFor({ timeout: 5000 });
  check((await page.getByRole("link", { name: "上車" }).count()) === 1, `${scheme} 路線: a station sheet offers 上車`);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "放大地圖" }).click();
  check(await page.getByRole("button", { name: "縮小地圖" }).isEnabled(), `${scheme} 路線: + zooms in`);

  await page.goto(BASE + "/line/xinyong", { waitUntil: "networkidle" });
  for (const name of ["證書", "學習紀錄用語", "面試小提示", "學到的技能"]) {
    await sheetCycle(`線頁 ${name}`, page.getByRole("button", { name, exact: true }));
  }
  await page.getByRole("tab", { name: "站點" }).click();
  check(await page.getByRole("link", { name: /信用站/ }).isVisible(), `${scheme} 線頁: 站點 shows the stations`);
  await ctx.close();
}
await browser.close();
console.log(results.join("\n"));
console.log(errors.length ? `page errors:\n${errors.join("\n")}` : "page errors: 0");
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`${results.length} checks, ${fails} failing`);
process.exit(fails || errors.length ? 1 : 0);

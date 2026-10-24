/**
 * 06 E7.14, the life-game reset (SHIP-LOG step 6): the API refuses anything
 * but a signed-in JSON { confirm: "reset" }; in 設定 the one alert opens with
 * no default button (Enter does nothing, Esc cancels and keeps the game), and
 * 重新開始 starts the game over at month 1 and lands on 今天.
 *
 *   USE_DEV_STORE=1 SUPABASE_URL= SUPABASE_SERVICE_ROLE_KEY= npx next dev -p 3210
 *   BASE_URL=http://localhost:3210 node tests/e2e/reset-e.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");

const results = [];
const errors = [];
const check = (ok, what) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
const json = { "content-type": "application/json" };

const code = (await (await fetch(BASE + "/api/signup", { method: "POST", headers: json, body: JSON.stringify({ name: "重來走查", school: "本機測試", grade: "高二" }) })).json()).access_code;
const cookie = `fs_access_code=${code}; fs_signed_in=1`;
const game = async () => (await (await fetch(BASE + "/api/life-game", { headers: { cookie } })).json()).state;
const act = (action) => fetch(BASE + "/api/life-game/action", { method: "POST", headers: { ...json, cookie }, body: JSON.stringify({ action }) });
const reset = (body, headers = { ...json, cookie }) => fetch(BASE + "/api/life-game/reset", { method: "POST", headers, body });

// Move the game on: collect the pay (the phase moves past 發薪日).
await game();
check((await act({ type: "collectPay" })).ok, "the game moves on (collectPay)");
const moved = await game();
check(moved.phase !== "payday", `before: phase ${moved.phase}`);

// The API's guards.
check((await reset(JSON.stringify({ confirm: "reset" }), { cookie })).status === 415, "no JSON content type → 415");
check((await reset(JSON.stringify({}))).status === 400, "no confirm → 400");
check((await reset(JSON.stringify({ confirm: "reset" }), json)).status === 401, "signed out → 401");
check((await game()).phase === moved.phase, "a refused reset leaves the game as it was");

// 設定: the alert.
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : code, domain: "localhost", path: "/" })));
const page = await ctx.newPage();
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
const row = page.getByRole("button", { name: "重新開始人生模擬" });
const dialog = page.getByRole("alertdialog");
check((await dialog.count()) === 0, "no alert on load");
await row.click();
await dialog.waitFor({ timeout: 5000 });
check((await dialog.getByRole("heading").innerText()) === "要重新開始遊戲嗎？", "the alert's title");
check((await dialog.locator("#alert-body").innerText()) === "目前的進度和存款會清除，無法復原。", "the alert says what is lost");
check(await dialog.evaluate((el) => el === document.activeElement), "focus is on the dialog, not a button");
const names = await dialog.getByRole("button").allInnerTexts();
check(names.join("|") === "重新開始|取消", `the buttons, top to bottom (${names.join(" / ")})`);
await page.keyboard.press("Enter");
await page.waitForTimeout(500);
check((await dialog.count()) === 1 && (await game()).phase === moved.phase, "Enter does nothing (no default button)");
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
check((await dialog.count()) === 0 && (await game()).phase === moved.phase, "Esc cancels and keeps the game");
const back = await row.evaluate((el) => el === document.activeElement);
check(back, "after Esc, focus returns to the row");

await row.click();
await dialog.getByRole("button", { name: "取消" }).click();
check((await dialog.count()) === 0 && (await game()).phase === moved.phase, "取消 cancels and keeps the game");

await row.click();
await dialog.getByRole("button", { name: "重新開始" }).click();
await page.waitForURL(/\/today$/, { timeout: 15_000 });
check(true, "重新開始 lands on 今天");
const fresh = await game();
check(fresh.turn === 0 && fresh.phase === "payday", `after: month ${fresh.turn + 1}, phase ${fresh.phase}`);

await browser.close();
console.log(results.join("\n"));
console.log(errors.length ? `page errors:\n${errors.join("\n")}` : "page errors: 0");
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`${results.length} checks, ${fails} failing`);
process.exit(fails || errors.length ? 1 : 0);

/**
 * The Part E home switch: a new student goes from sign-up through the creator
 * and the goal to 今天; a returning student's code lands on 今天; /dashboard,
 * /simulate, /play and /onboarding/character redirect; signed out, 今天 shows
 * the code form without a loop; 設定's mode switch saves and stays.
 *
 *   BASE_URL=http://localhost:3210 node tests/e2e/switch-e.mjs
 */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const results = [];
const errors = [];
const check = (ok, what) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
const path = (page) => new URL(page.url()).pathname + new URL(page.url()).search;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => errors.push(String(e)));

// 1. A new student: sign-up → creator → goal → 今天.
await page.goto(BASE + "/signup", { waitUntil: "networkidle" });
await page.getByLabel(/名字|暱稱/).first().fill("切換走查");
const school = page.getByLabel(/學校/).first();
if (await school.count()) await school.fill("本機測試");
const grade = page.getByLabel(/年級/).first();
if (await grade.count()) await grade.selectOption({ index: 1 }).catch(() => grade.fill("高二"));
await page.getByRole("button", { name: /建立|開始/ }).first().click();
await page.getByRole("link", { name: "做出你的角色" }).click();
await page.waitForURL(/\/creator$/, { timeout: 20_000 });
check(true, "sign-up's 做出你的角色 opens /creator");
// The access code is an httpOnly cookie: read it from the browser context.
const code = (await ctx.cookies()).find((c) => c.name === "fs_access_code")?.value ?? null;
await page.getByLabel("名字").fill("小切");
await page.getByRole("button", { name: "出發" }).click();
await page.waitForURL(/\/onboarding\/goal/, { timeout: 20_000 });
await page.getByRole("button", { name: "先跳過" }).click();
await page.waitForURL(/\/today$/, { timeout: 20_000 });
check(true, "creator → goal → 先跳過 lands on 今天");

// 2. Old URLs redirect.
for (const [from, to] of [
  ["/dashboard", "/today"],
  ["/simulate", "/today"],
  ["/onboarding/character", "/creator"],
  ["/play", "/turn"],
  ["/play?return=%2Fline%2Fxinyong%2Fstation%2F7&toLine=%E4%BF%A1%E7%94%A8%E7%B7%9A&toStation=%E5%8D%A1%E7%89%87%E7%AB%99", "/turn?return=%2Fline%2Fxinyong%2Fstation%2F7&toLine=%E4%BF%A1%E7%94%A8%E7%B7%9A&toStation=%E5%8D%A1%E7%89%87%E7%AB%99"],
  ["/dashboard?linked=1", "/settings?linked=1"],
]) {
  await page.goto(BASE + from, { waitUntil: "networkidle" });
  check(path(page) === to, `${from} → ${path(page)}`);
}

// 3. 設定: the mode switch saves and stays on 設定.
await page.goto(BASE + "/settings", { waitUntil: "networkidle" });
const seg = page.getByRole("group", { name: "學習方式" }).getByRole("button", { name: "學習" });
await seg.click();
await page.waitForTimeout(1500);
check(path(page) === "/settings", `設定's mode switch stays on 設定 (${path(page)})`);
// The dev store is the file the server writes (never a real database).
const store = JSON.parse(readFileSync(new URL("../../.devstore.json", import.meta.url), "utf8"));
const me = store.students.find((st) => st.access_code === decodeURIComponent(code ?? ""));
check(me?.mode === "full", `the mode saved as 學習 (${me?.mode})`);

// 4. Signed out: 今天 shows the code form; the code logs back in to 今天.
await ctx.clearCookies();
await page.goto(BASE + "/today", { waitUntil: "networkidle" });
check(path(page) === "/dashboard" && (await page.getByRole("button", { name: "查看進度" }).count()) === 1, `signed out, 今天 → ${path(page)} with the code form`);
if (code) {
  await page.getByLabel("你的代碼").fill(decodeURIComponent(code));
  await page.getByRole("button", { name: "查看進度" }).click();
  await page.waitForURL(/\/today$/, { timeout: 20_000 }).catch(() => {});
  check(path(page) === "/today", `the code logs back in to ${path(page)}`);
} else check(false, "read the new student's code");

await browser.close();
console.log(results.join("\n"));
console.log(errors.length ? `page errors:\n${errors.join("\n")}` : "page errors: 0");
process.exit(results.some((r) => r.startsWith("FAIL")) || errors.length ? 1 : 0);

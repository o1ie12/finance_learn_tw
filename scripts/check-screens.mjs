/**
 * 05 Part C: every screen after login fits the viewport without page
 * scrolling. Walks the dashboard (each phone tab), one full station (a
 * wrapped one, then its life-game month) and the 看完整課文 reader at
 * 390×844 (VIEWPORT=1440x900 for desktop), and checks document.scrollingElement.scrollHeight <= innerHeight + 1
 * on every screen. Document viewers scroll inside themselves and are not
 * counted (the page around them is).
 *
 * Needs a dev server on the file store, never a real database:
 *   USE_DEV_STORE=1 SUPABASE_URL= SUPABASE_SERVICE_ROLE_KEY= npx next dev -p 3210
 *   BASE_URL=http://localhost:3210 node scripts/check-screens.mjs [shots-dir]
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) {
  console.error("check-screens runs against a local dev server only");
  process.exit(2);
}
const SHOTS = process.argv[2] ?? null;
const [W, H] = (process.env.VIEWPORT ?? "390x844").split("x").map(Number);
const phone = W < 720;

const post = (path, body, cookie) =>
  fetch(BASE + path, {
    method: "POST",
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body ?? {}),
  });

const r = await post("/api/signup", { name: "畫面檢查", school: "本機測試", grade: "高二" });
const code = (await r.json()).access_code;
if (!code) throw new Error("signup failed: is the dev store on?");
const cookie = `fs_access_code=${code}; fs_signed_in=1`;
await post("/api/avatar", { skip: true }, cookie);
await post("/api/goal", { skip: true }, cookie);
await post("/api/tour", {}, cookie);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: phone, isMobile: phone });
await ctx.addCookies(
  ["fs_access_code", "fs_signed_in"].map((name, i) => ({ name, value: i ? "1" : code, domain: "localhost", path: "/" })),
);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

const failures = [];
let n = 0;
async function check(name) {
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => ({ sh: document.scrollingElement.scrollHeight, ih: innerHeight }));
  const ok = m.sh <= m.ih + 1;
  n++;
  if (!ok) failures.push(`${name}: ${m.sh} > ${m.ih}`);
  console.log(`${ok ? "fits   " : "SCROLLS"} ${name}${ok ? "" : ` (${m.sh} > ${m.ih})`}`);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${String(n).padStart(2, "0")}-${name.replace(/[^\w-]+/g, "_")}.png` });
}

/** Pick the first choice in every radio group, and fill every number field. */
async function answerVisible() {
  await page.evaluate(() => {
    const groups = new Map();
    for (const el of document.querySelectorAll('input[type="radio"]')) {
      if (!el.offsetParent && el.closest("label")?.offsetParent == null) continue;
      if (!groups.has(el.name)) groups.set(el.name, el);
    }
    for (const el of groups.values()) if (!document.querySelector(`input[name="${el.name}"]:checked`)) el.click();
  });
  // Event cards: a group of toggle buttons; pick the first in any group with none picked.
  for (const group of await page.locator('[role="group"]:visible').all()) {
    const toggles = group.locator("button[aria-pressed]");
    if ((await toggles.count()) && !(await group.locator('button[aria-pressed="true"]').count())) await toggles.first().click();
  }
  for (const input of await page.locator('input[inputmode="numeric"]:visible, input[type="number"]:visible').all()) {
    if (!(await input.inputValue())) await input.fill("0");
  }
}

const FORWARD =
  /^(下一張|開始任務|開始|送出，下一題|送出|下一題|下一位|繼續|看第一題|收下|存起來|繳費|就這樣過這個月|確定|對答案|再對一次|看這個月的帳|下個月)/;

/** Click the main forward button on the screen. Returns its label, or null. */
async function forward() {
  const hook = page.locator('button[class*="hookOption"]:visible');
  if (await hook.count()) {
    await hook.first().click();
    return "hook";
  }
  const rate = page.locator('button[class*="bigRate"]:visible');
  if (await rate.count()) {
    await rate.first().click();
    return "rate";
  }
  await answerVisible();
  for (const b of await page.locator(".g-btn:visible").all()) {
    const label = (await b.innerText()).trim();
    if (FORWARD.test(label) && !(await b.isDisabled()) && (await b.getAttribute("aria-disabled")) !== "true") {
      await b.click();
      return label;
    }
  }
  return null;
}

// 1. Dashboard, each phone tab.
await page.goto(BASE + "/dashboard", { waitUntil: "networkidle" });
await check("dashboard-今天");
for (const tab of phone ? ["狀態", "路線圖", "行動"] : []) {
  await page.locator(".gh-tab", { hasText: tab }).click();
  await check(`dashboard-${tab}`);
}

// 2. One full station (租屋線 station 24, a wrapped quiz), through its month.
await page.goto(BASE + "/line/zuwu/course/24", { waitUntil: "networkidle" });
for (let i = 0; i < 40; i++) {
  await check(`station-${i}`);
  const was = page.url();
  const did = await forward();
  if (!did) {
    // The station's last screen: on to the life-game month.
    const cont = page.locator(".g-btn:visible").last();
    if (!(await cont.count())) break;
    await cont.click();
    await page.waitForURL((u) => u.toString() !== was, { timeout: 15000 }).catch(() => {});
    if (page.url().includes("/play")) break;
  }
  await page.waitForTimeout(250);
}

// 3. The life-game month, step by step, to its summary.
if (!page.url().includes("/play")) await page.goto(BASE + "/play", { waitUntil: "networkidle" });
for (let i = 0; i < 20; i++) {
  await page.waitForLoadState("networkidle");
  const step = await page.locator('[aria-current="step"]').first().innerText().catch(() => "summary");
  await check(`turn-${i}-${step.replace(/\s+/g, "")}`);
  const label = await forward();
  if (!label || label === "下個月") break;
  await page.waitForTimeout(400);
}

// 4. 看完整課文: the reader pages.
await page.goto(BASE + "/line/zuwu/course/24?read=1", { waitUntil: "networkidle" });
for (let i = 0; i < 8; i++) {
  await check(`reader-${i}`);
  const next = page.locator(".g-reader-btn", { hasText: "下一頁" });
  if (!(await next.count())) break;
  await next.click();
}

await browser.close();
console.log(`\n${n} screens, ${failures.length} scroll${failures.length === 1 ? "s" : ""}, ${errors.length} page errors`);
for (const f of failures) console.log("  SCROLLS", f);
for (const e of errors.slice(0, 5)) console.log("  ERROR", e);
process.exit(failures.length || errors.length ? 1 : 0);

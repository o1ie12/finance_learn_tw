/**
 * 信用線 end to end, with retries (05 A6): a new student plays
 *   信用站 (你是銀行): fails on purpose, retries, passes;
 *   its life-game month, the train ride to 卡片站;
 *   卡片站 (你的第一張帳單): fails twice, and the station still counts as done;
 *   its life-game month.
 * Checks the score copy after every attempt and module_progress after each
 * station. Answers come from a key written from the content by xinyong-key.ts.
 *
 * Needs a dev server on the file store, never a real database:
 *   USE_DEV_STORE=1 SUPABASE_URL= SUPABASE_SERVICE_ROLE_KEY= npx next dev -p 3210
 *   npx tsx tests/e2e/xinyong-key.ts /tmp/xinyong-key.json
 *   BASE_URL=http://localhost:3210 node tests/e2e/xinyong-retry.mjs /tmp/xinyong-key.json [shots-dir]
 */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const KEY = JSON.parse(readFileSync(process.argv[2], "utf8"));
const SHOTS = process.argv[3] ?? null;

const FIRST_FAIL = "還差一點。再試一次；第二次不論分數，這一站都會完成。";
const PASSED = "過關了，這一站完成。";
const SECOND_DONE = "這一站完成了。";

const post = (path, body, cookie) =>
  fetch(BASE + path, { method: "POST", headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body ?? {}) });
const code = (await (await post("/api/signup", { name: "信用線走查", school: "本機測試", grade: "高二" })).json()).access_code;
const cookie = `fs_access_code=${code}; fs_signed_in=1`;
await post("/api/avatar", { skip: true }, cookie);
await post("/api/goal", { skip: true }, cookie);
await post("/api/tour", {}, cookie);
const doneStations = async () =>
  ((await (await fetch(BASE + "/api/progress", { headers: { cookie } })).json()).progress ?? [])
    .filter((p) => p.completed_at)
    .map((p) => p.module_number);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((name, i) => ({ name, value: i ? "1" : code, domain: "localhost", path: "/" })));
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
const results = [];
const expect = (ok, what) => {
  results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
  console.log(`${ok ? "ok  " : "FAIL"} ${what}`);
};
let shotN = 0;
const shot = async (name) => SHOTS && page.screenshot({ path: `${SHOTS}/${String(++shotN).padStart(2, "0")}-${name}.png` });
const click = async (re) => {
  const b = page.locator(".g-btn:visible, button:visible").filter({ hasText: re }).first();
  await b.click();
  await page.waitForTimeout(300);
};

/** Hook, lesson cards and brief, up to the first question. */
async function openStation(n) {
  await page.goto(`${BASE}/line/xinyong/course/${n}`, { waitUntil: "networkidle" });
  await page.locator('button[class*="hookOption"]').first().click();
  for (let i = 0; i < 5; i++) {
    const next = page.locator(".g-btn:visible").filter({ hasText: /^(下一張|開始任務)/ });
    if (!(await next.count())) break;
    await next.first().click();
    await page.waitForTimeout(300);
  }
  await click(/^開始$/);
}

/** Answers every question, right (pass) or wrong (fail), and submits. */
async function answer(n, pass) {
  for (const step of KEY[n]) {
    if (step.type === "rate") {
      for (let k = 0; k < 6; k++) {
        const text = await page.locator('[class*="qCard"]:visible').first().innerText();
        const item = step.items.find((it) => text.includes(it.label));
        if (!item) throw new Error("applicant not found on screen");
        const value = pass ? item.answer : item.answer === 1 ? 3 : 1;
        await page.locator('button[class*="bigRateBtn"]:visible').filter({ hasText: String(value) }).first().click();
        await page.waitForTimeout(350);
      }
    } else if (step.type === "find") {
      const ids = pass
        ? step.targets
        : (await page.locator("button[data-field]:visible").evaluateAll((els) => els.map((e) => e.dataset.field)))
            .filter((id) => !step.targets.includes(id))
            .slice(0, step.targets.length);
      for (const id of ids) await page.locator(`button[data-field="${id}"]:visible`).first().click();
    } else if (step.type === "write") {
      await page.locator("textarea:visible").first().fill("這次先不核准，因為卡費還在循環。");
    } else if (step.type === "choice") {
      await page.locator("label:visible").filter({ hasText: pass ? step.right : step.wrong }).first().click();
      const reason = pass ? step.correctReason : step.wrongReason;
      if (reason) await page.locator("label:visible").filter({ hasText: reason }).first().click();
    }
    const send = page.locator(".g-btn:visible").filter({ hasText: /^送出/ });
    if (await send.count()) await send.first().click();
    await page.waitForTimeout(400);
  }
  await page.getByText("看看示範答案").waitFor({ timeout: 20_000 });
}

/** Model answers to the end of the station, then on into the life-game month and the ride. */
async function finishStationAndMonth(nextStation) {
  for (let i = 0; i < 25 && !page.url().includes("/play"); i++) {
    const btn = page.locator(".g-btn:visible").last();
    const was = page.url();
    await btn.click();
    await page.waitForTimeout(400);
    if (page.url() !== was) await page.waitForLoadState("networkidle");
  }
  expect(page.url().includes("/play"), "station's last screen leads into the life-game month");
  const FORWARD = /^(收下|存起來|繳費|就這樣過這個月|確定|繼續|看這個月的帳|對答案|再對一次)/;
  for (let i = 0; i < 15; i++) {
    for (const g of await page.locator('[role="group"]:visible').all()) {
      const t = g.locator("button[aria-pressed]");
      if ((await t.count()) && !(await g.locator('button[aria-pressed="true"]').count())) await t.first().click();
    }
    for (const input of await page.locator('input[inputmode="numeric"]:visible').all()) if (!(await input.inputValue())) await input.fill("0");
    const ride = page.locator(".g-btn:visible").filter({ hasText: "搭車到下一站" });
    if (await ride.count()) {
      await shot(`month-summary-before-${nextStation}`);
      await ride.click();
      break;
    }
    const b = page.locator(".g-btn:visible").filter({ hasText: FORWARD }).first();
    if (!(await b.count())) break;
    await b.click();
    await page.waitForTimeout(500);
  }
  if (nextStation) {
    await page.waitForURL((u) => u.pathname.endsWith(`/course/${nextStation}`), { timeout: 30_000 }).catch(() => {});
    expect(page.url().includes(`/course/${nextStation}`), `the train arrives at station ${nextStation}`);
  }
}

const status = () => page.locator('[class*="centerCard"]:visible p').allInnerTexts();

// 信用站: fail, retry, pass.
await openStation(4);
await answer(4, false);
await shot("s4-attempt1");
expect((await status()).includes(FIRST_FAIL), `信用站 attempt 1 fails with 「${FIRST_FAIL}」`);
expect(!(await doneStations()).includes(4), "信用站 is not done after a failed first attempt");
await click(/^再試一次$/);
await page.getByRole("button", { name: /^開始$/ }).waitFor({ timeout: 20_000 });
expect(true, "再試一次 reopens the station on the brief");
await click(/^開始$/);
await answer(4, true);
await shot("s4-attempt2");
expect((await status()).includes(PASSED), `信用站 attempt 2 passes with 「${PASSED}」`);
expect((await doneStations()).includes(4), "信用站 is done");
await finishStationAndMonth(7);

// 卡片站: fail twice; the second attempt still completes the station.
await page.waitForLoadState("networkidle");
await page.locator('button[class*="hookOption"]').first().click();
for (let i = 0; i < 5; i++) {
  const next = page.locator(".g-btn:visible").filter({ hasText: /^(下一張|開始任務)/ });
  if (!(await next.count())) break;
  await next.first().click();
  await page.waitForTimeout(300);
}
await click(/^開始$/);
await answer(7, false);
await shot("s7-attempt1");
expect((await status()).includes(FIRST_FAIL), `卡片站 attempt 1 fails with 「${FIRST_FAIL}」`);
await click(/^再試一次$/);
await page.getByRole("button", { name: /^開始$/ }).waitFor({ timeout: 20_000 });
await click(/^開始$/);
await answer(7, false);
await shot("s7-attempt2");
const s7 = await status();
expect(s7.includes(SECOND_DONE), `卡片站 attempt 2 (failed again) says 「${SECOND_DONE}」`);
expect(!(await page.locator("button:visible").filter({ hasText: /^再試一次$/ }).count()), "no third try is offered");
expect((await doneStations()).includes(7), "卡片站 is done after the second attempt");
await finishStationAndMonth(null);

await browser.close();
const failed = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${results.length} checks, ${failed} failed, ${errors.length} page errors`);
for (const e of errors.slice(0, 5)) console.log("  ERROR", e);
process.exit(failed || errors.length ? 1 : 0);

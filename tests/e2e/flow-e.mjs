/**
 * 10 FLOW-1, FLOW-2, FLOW-4, UI-1 (flow-e) at 390 × 844:
 *   FLOW-1: answering 想一想 brings the task heading into view and focuses it;
 *   FLOW-2: a student's first stations show the how-to lines; after 3 other
 *           stations they sit behind 怎麼玩 and every 想一想 option is on the
 *           first screen;
 *   FLOW-4: a station's month ends on 今天 (no line page, no ride);
 *   UI-1:   the 行動 dock is one row (≤ 80px) with at least 2 cards in full
 *           view; a focused amount field and 確定 are both on screen.
 *
 *   BASE_URL=http://localhost:3210 node tests/e2e/flow-e.mjs
 */
import { chromium } from "playwright";
import { playStep, stepHeading, waitHeading } from "./playDriver.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const json = { "content-type": "application/json" };
const results = [];
const errors = [];
const check = (ok, what) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);

async function student(name, tried = []) {
  const code = (await (await fetch(BASE + "/api/signup", { method: "POST", headers: json, body: JSON.stringify({ name, grade: "高二" }) })).json()).access_code;
  const cookie = `fs_access_code=${code}; fs_signed_in=1`;
  for (const p of ["/api/avatar", "/api/goal"]) await fetch(BASE + p, { method: "POST", headers: { ...json, cookie }, body: JSON.stringify({ skip: true }) });
  for (const id of tried) await fetch(BASE + "/api/task", { method: "POST", headers: { ...json, cookie }, body: JSON.stringify({ taskSetId: id, answers: {}, hookAnswer: null }) });
  return code;
}
const browser = await chromium.launch();
async function pageFor(code) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : code, domain: "localhost", path: "/" })));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  return page;
}
const inView = (page, sel) =>
  page.evaluate((s) => {
    const r = document.querySelector(s)?.getBoundingClientRect();
    return !!r && r.top >= 0 && r.bottom <= innerHeight;
  }, sel);

// FLOW-1 and FLOW-2 (first stations).
{
  const page = await pageFor(await student("流程走查一"));
  await page.goto(BASE + "/line/touzi/station/5", { waitUntil: "networkidle" });
  check((await page.getByText("先回答下面的「想一想」").count()) > 0, "FLOW-2: a first station shows the how-to lines");
  await page.locator('[role="radiogroup"] [role="radio"]').first().click();
  await page.waitForTimeout(900);
  check(await inView(page, "#task-start"), "FLOW-1: the task heading is in view after 想一想");
  check(await page.evaluate(() => document.activeElement?.id === "task-start"), "FLOW-1: and it has focus");
  check((await page.getByText("任務已打開").count()) > 0, "FLOW-1: 任務已打開 is announced");

  // FLOW-4: submit, go into the month, finish it: back on 今天.
  await page.getByRole("button", { name: "送出答案" }).click();
  await page.waitForTimeout(400);
  // Answer whatever is open with the first option, then send.
  for (const g of await page.locator('section[id^="q-"] [role="radiogroup"]').all()) await g.locator('[role="radio"]').first().click();
  await page.getByRole("button", { name: "送出答案" }).click();
  await page.locator("#result-title").waitFor({ timeout: 20_000 });
  await page.getByRole("button", { name: /^(進入這個月|再做一次)/ }).last().click().catch(() => {});
  if (!page.url().includes("/turn")) await page.getByRole("button", { name: "進入這個月" }).click();
  await page.waitForURL(/\/turn/, { timeout: 20_000 });
  check(!new URL(page.url()).search.includes("return="), "FLOW-4: the month has no ride back to the line");
  await waitHeading(page);
  for (let i = 0; i < 14 && !/^第 \d+ 個月結束了$/.test(await stepHeading(page)); i++) {
    if ((await stepHeading(page)) === "剩下的錢，要怎麼用？") {
      // UI-1 on the way.
      const m = await page.evaluate(() => {
        const dock = document.querySelector('[class*="dock"]');
        const card = dock?.closest('[class*="card"]') ?? document.scrollingElement;
        const box = card.getBoundingClientRect();
        const d = dock.getBoundingClientRect();
        const full = [...document.querySelectorAll('[class*="moveCard"]')].filter((c) => {
          const r = c.getBoundingClientRect();
          return r.top >= box.top - 1 && r.bottom <= d.top + 1;
        }).length;
        return { dockH: d.height, full, cardsAbove: [...document.querySelectorAll('[class*="moveCard"]')].length };
      });
      check(m.dockH <= 80, `UI-1: the dock is one row (${Math.round(m.dockH)}px)`);
      // Scroll the first card to the top of the step: two cards fit above the dock.
      await page.locator('[class*="moveCard"]').first().evaluate((c) => c.scrollIntoView({ block: "start" }));
      const two = await page.evaluate(() => {
        const d = document.querySelector('[class*="dock"]').getBoundingClientRect();
        return [...document.querySelectorAll('[class*="moveCard"]')].filter((c) => {
          const r = c.getBoundingClientRect();
          return r.top >= 0 && r.bottom <= d.top + 1;
        }).length;
      });
      check(two >= 2 || m.cardsAbove < 2, `UI-1: ${two} cards in full view with the dock`);
      const input = page.locator('[class*="moveCard"] input').first();
      await input.focus();
      await page.waitForTimeout(300);
      const both = await page.evaluate(() => {
        const a = document.activeElement.getBoundingClientRect();
        const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "確定").getBoundingClientRect();
        return a.top >= 0 && a.bottom <= innerHeight && b.top >= 0 && b.bottom <= innerHeight && a.bottom <= b.top;
      });
      check(both, "UI-1: a focused amount field and 確定 are both on screen");
    }
    await playStep(page);
  }
  await page.getByRole("button", { name: "完成" }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/turn"), { timeout: 20_000 });
  check(new URL(page.url()).pathname === "/today", `FLOW-4: after 完成 → ${new URL(page.url()).pathname}`);
  await page.context().close();
}

// FLOW-2 after 3 other stations.
{
  const page = await pageFor(await student("流程走查二", ["xinyong.bank.v1", "xinyong.statement.v1", "cunqian.compound.v1"]));
  await page.goto(BASE + "/line/touzi/station/5", { waitUntil: "networkidle" });
  check((await page.getByText("先回答下面的「想一想」").count()) === 0, "FLOW-2: station 4 hides the how-to lines");
  check((await page.getByRole("button", { name: "怎麼玩" }).count()) === 1, "FLOW-2: 怎麼玩 is there");
  const bottom = await page.evaluate(() => {
    const opts = [...document.querySelectorAll('[aria-labelledby="hook-q"] [role="radio"]')];
    // The bar sticks to the bottom of the screen: the options must clear it.
    const bar = document.querySelector("footer")?.getBoundingClientRect().height ?? 0;
    return { last: Math.max(...opts.map((o) => o.getBoundingClientRect().bottom)), foot: innerHeight - bar };
  });
  check(bottom.last <= bottom.foot, `FLOW-2: every 想一想 option is on the first screen (${Math.round(bottom.last)} ≤ ${Math.round(bottom.foot)})`);
  await page.getByRole("button", { name: "怎麼玩" }).click();
  check((await page.getByRole("dialog", { name: "怎麼玩" }).getByText("先回答下面的「想一想」").count()) === 1, "FLOW-2: 怎麼玩 opens the lines in a sheet");
  await page.context().close();
}

await browser.close();
console.log(results.join("\n"));
console.log(errors.length ? `page errors:\n${errors.slice(0, 5).join("\n")}` : "page errors: 0");
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`flow-e: ${results.length} checks, ${fails} failing`);
process.exit(fails || errors.length ? 1 : 0);

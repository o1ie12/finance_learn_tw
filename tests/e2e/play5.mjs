// Five full life-game months on /play, keyboard only. Month 3 has the ledger
// (first try deliberately wrong). Mid-turn reload resumes at the same step;
// the events shown before and after a reload are the same (seeded).
//
// Run:
//   NODE_PATH=/path/to/pw/node_modules E2E_BASE=http://localhost:3210 \
//     E2E_SHOTS=/tmp/e2e-shots node tests/e2e/play5.mjs

import { chromium, BASE, signup, newPage, ledger, shot } from "./lib.mjs";
import { playStep, playTurn, stepHeading, waitHeading } from "./playDriver.mjs";

const L = ledger("play5");
const browser = await chromium.launch();
const code = await signup("五個月測試");
const { page, errors } = await newPage(browser, { code });

const eventTitles = () =>
  page.evaluate(() => [...document.querySelectorAll("article h3")].map((h) => h.textContent.replace(/\s+/g, " ").trim()));
const monthLabel = () =>
  page.evaluate(() => {
    // The pill holds the number twice (visible + sr-only live copy).
    const pill = [...document.querySelectorAll("p")].find((p) => /^第.*個月$/.test(p.textContent.trim()));
    const vis = pill?.querySelector('[aria-hidden="true"]')?.textContent?.trim();
    const sr = pill?.querySelector(".sr-only")?.textContent?.trim();
    return vis === sr ? vis : `visible ${vis} / sr ${sr}`;
  });

await page.goto(BASE + "/play", { waitUntil: "networkidle" });
await waitHeading(page);
L.check("/play opens at 發薪日到了", (await stepHeading(page)) === "發薪日到了", await stepHeading(page));

const transitions = [];
let sawLedger = false;
let reloadChecked = false;
let eventsChecked = false;

for (let month = 1; month <= 5; month++) {
  await L.step(`month ${month}: full turn by keyboard`, async () => {
    const steps = [];
    for (let i = 0; i < 14; i++) {
      const before = await stepHeading(page);

      // Month 2: reload after 先存錢 (at 帳單) and check it resumes there.
      if (month === 2 && !reloadChecked && before === "繳這個月的帳單") {
        await page.reload({ waitUntil: "networkidle" });
        const after = await waitHeading(page);
        reloadChecked = true;
        L.check("reload mid-turn resumes at the same step", after === before, `${before} -> ${after}`);
      }
      // First month that shows event cards: reload, compare the events.
      if (!eventsChecked && /^這個月發生了/.test(before)) {
        const e1 = await eventTitles();
        await page.reload({ waitUntil: "networkidle" });
        await waitHeading(page);
        const e2 = await eventTitles();
        eventsChecked = true;
        L.check(
          "same seed -> same events after reload",
          e1.length > 0 && JSON.stringify(e1) === JSON.stringify(e2),
          `month ${month}: ${e1.join("/")} vs ${e2.join("/")}`,
        );
      }
      if (before === "記帳時間") {
        sawLedger = true;
        L.check("ledger appears on month 3", month === 3, `month ${month}`);
        await shot(page, "play5_ledger");
      }
      const r = await playStep(page);
      if (r.from === "記帳時間") await shot(page, "play5_ledger_answers");
      steps.push(r);
      transitions.push(r.transitionMs);
      if (/^第 \d+ 個月結束了$/.test(r.from)) break;
    }
    const last = steps.at(-1);
    if (!/^第 \d+ 個月結束了$/.test(last.from)) throw new Error("did not reach month end");
    return steps.map((s) => s.from.replace(/這個月發生了 \d 件事/, "事件")).join(" > ");
  });
  await shot(page, `play5_month${month}_end`);
}

L.check("ledger step seen", sawLedger);
L.check("mid-turn reload checked", reloadChecked);
L.check("event determinism checked (a month with events occurred)", eventsChecked);
await page.waitForTimeout(1500); // let the month counter finish its count-up
L.check("now at month 6 payday", (await stepHeading(page)) === "發薪日到了" && (await monthLabel()) === "6", `${await stepHeading(page)} / month ${await monthLabel()}`);
const sorted = [...transitions].sort((a, b) => a - b);
L.check(
  "every step transition under 5s",
  sorted.at(-1) < 5000,
  `n=${sorted.length} median=${sorted[Math.floor(sorted.length / 2)]}ms max=${sorted.at(-1)}ms`,
);
L.check("no console/page errors", errors.length === 0, errors.slice(0, 5).join(" | "));
await browser.close();
L.summary();

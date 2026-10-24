/**
 * 06 G1 to G3 with NEXT_PUBLIC_FLOW_V2=1 (SHIP-LOG): on 信用線's bill task
 * (/line/xinyong/station/7, four steps):
 *   - the task comes before the side notes (no teaching before it);
 *   - 看提示 opens a sheet with a side note and closes back to the step;
 *   - one step answered wrong: 對答案 has the three blocks, and 再做一次 asks
 *     only that step, then scores the whole task as attempt 2;
 *   - a position saved in the old order at 先懂 opens on the side notes, one
 *     saved at the task opens on the ticket.
 *
 *   NEXT_PUBLIC_FLOW_V2=1 USE_DEV_STORE=1 SUPABASE_URL= SUPABASE_SERVICE_ROLE_KEY= npx next dev -p 3210
 *   npx tsx tests/e2e/task-key.ts xinyong.statement.v1 /tmp/statement.json
 *   BASE_URL=http://localhost:3210 node tests/e2e/flow-v2-e.mjs /tmp/statement.json
 */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const KEY = JSON.parse(readFileSync(process.argv[2], "utf8"));
const TASK = "xinyong.statement.v1";
const PATH = "/line/xinyong/station/7";

const results = [];
const errors = [];
const check = (ok, what) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
const json = { "content-type": "application/json" };
const signup = async () => {
  const code = (await (await fetch(BASE + "/api/signup", { method: "POST", headers: json, body: JSON.stringify({ name: "流程走查", grade: "高二" }) })).json()).access_code;
  await fetch(BASE + "/api/goal", { method: "POST", headers: { ...json, cookie: `fs_access_code=${code}; fs_signed_in=1` }, body: JSON.stringify({ skip: true }) });
  return code;
};
const browser = await chromium.launch();
const open = async (code) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : code, domain: "localhost", path: "/" })));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  return { ctx, page };
};
const btn = (page, name) => page.getByRole("button", { name, exact: true });
const answer = async (page, step, right) => {
  if (step.type === "find") {
    for (const t of step.targets) await page.locator(`button[data-field="${t}"]:visible, [data-field="${t}"]:visible button`).first().click();
  } else if (step.type === "choice") {
    if (right) await page.getByRole("radio", { name: step.right, exact: true }).first().click();
    else {
      // any option that is not the right one
      const radios = page.locator('[role="radiogroup"]').first().getByRole("radio");
      for (let i = 0; i < (await radios.count()); i++) {
        const name = (await radios.nth(i).innerText()).trim();
        if (!name.startsWith(step.right)) {
          await radios.nth(i).click();
          break;
        }
      }
    }
    if (step.hasReasons && step.reason) await page.getByRole("radio", { name: step.reason, exact: true }).first().click();
  }
  await btn(page, "確定").click();
  await page.waitForTimeout(300);
};

// ---- order, 看提示, compare, redo ----------------------------------------------
{
  const code = await signup();
  const { ctx, page } = await open(code);
  await page.goto(BASE + PATH, { waitUntil: "networkidle" });
  await page.locator('label:has(input[name="hook"])').first().click();
  await btn(page, "確定").click();
  await page.waitForTimeout(300);
  check((await page.getByText(/先懂一件事|剛剛的任務，專家怎麼想/).count()) === 0 && (await btn(page, "開始任務").count()) === 1, "after 想一想 comes the task ticket, no side note first");
  const stops = (await page.locator("header [role=progressbar] span").allInnerTexts()).join(" ");
  check(/想一想.*任務.*先懂.*對答案.*人生/.test(stops), `the bar: ${stops.replace(/\s+/g, " ")}`);
  await btn(page, "開始任務").click();

  // 看提示 on the first step
  await btn(page, "看提示").click();
  const sheet = page.getByRole("dialog");
  await sheet.waitFor({ timeout: 5000 });
  check((await sheet.innerText()).includes("看提示不影響分數"), "看提示 opens a sheet with a side note");
  await btn(page, "回到題目").click();
  await page.waitForTimeout(400);
  check((await page.getByRole("dialog").count()) === 0, "回到題目 closes it");

  // steps 1, 2, 4 right; step 3 wrong
  const wrong = 2;
  for (const [k, step] of KEY.steps.entries()) await answer(page, step, k !== wrong);
  await page.getByText("剛剛的任務，專家怎麼想").first().waitFor({ timeout: 20_000 });
  check(true, "after the attempt come the side notes (剛剛的任務，專家怎麼想)");
  for (let i = 0; i < 4 && (await page.getByText("剛剛的任務，專家怎麼想").count()); i++) await btn(page, "繼續").click();
  await page.getByText("得分").waitFor({ timeout: 10_000 });
  const body = await page.locator("main, body").first().innerText();
  check(body.includes("你做得好的") && body.includes("可以再想想") && body.includes("這是一種做法，不是唯一的答案。"), "對答案 has 你做得好的 and 可以再想想 with the fixed line");
  check(body.includes("這份工作實際怎麼做"), "對答案 has 這份工作實際怎麼做 (jobNote)");
  const redo = page.getByRole("button", { name: /^再做一次（1 題）$/ });
  check((await redo.count()) === 1, "再做一次 offers the 1 missed step");
  await redo.click();
  await page.waitForTimeout(1500);
  const where = await page.locator("header p").first().innerText();
  check(where.includes(`第 ${wrong + 1} 題`), `the redo opens on the missed step (${where})`);
  await answer(page, KEY.steps[wrong], true);
  await page.getByText("剛剛的任務，專家怎麼想").first().waitFor({ timeout: 20_000 });
  for (let i = 0; i < 4 && (await page.getByText("剛剛的任務，專家怎麼想").count()); i++) await btn(page, "繼續").click();
  await page.getByText("得分").waitFor({ timeout: 10_000 });
  const score = (await page.locator("[class*='scoreNum']").first().innerText()).replace(/\s/g, "");
  check(/^(\d+)\/\1$/.test(score), `attempt 2, with the carried answers, scores full: ${score}`);
  await ctx.close();
}

// ---- G3: positions saved in the old order -------------------------------------
for (const [stop, expect] of [
  ["lesson", "side notes"],
  ["task", "ticket"],
]) {
  const code = await signup();
  const { ctx, page } = await open(code);
  await page.goto(BASE + "/today", { waitUntil: "domcontentloaded" });
  // The student id is in the dev store; the position key is per student and task.
  const id = await page.evaluate(async () => (await (await fetch("/api/session")).json())?.student?.id ?? null).catch(() => null);
  const ids = id ? [id] : [];
  if (!ids.length) {
    // fall back: read every key the app writes once, then reuse its student id
    await page.goto(BASE + PATH, { waitUntil: "networkidle" });
    const k = await page.evaluate(() => Object.keys(localStorage).find((x) => x.startsWith("finline:pos:")));
    if (k) ids.push(k.split(":")[2]);
  }
  check(ids.length === 1, `G3 ${stop}: found the student id`);
  await page.evaluate(([sid, task, s]) => localStorage.setItem(`finline:pos:${sid}:${task}`, JSON.stringify({ v: 1, stop: s, attempt: 1 })), [ids[0], TASK, stop]);
  await page.goto(BASE + PATH, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const onNotes = (await page.getByText("剛剛的任務，專家怎麼想").count()) > 0;
  const onTicket = (await btn(page, "開始任務").count()) > 0;
  check(expect === "side notes" ? onNotes : onTicket, `G3: saved in the old order at ${stop} → opens on the ${expect}`);
  if (expect === "side notes") {
    for (let i = 0; i < 4 && (await page.getByText("剛剛的任務，專家怎麼想").count()); i++) await btn(page, "繼續").click();
    check((await btn(page, "開始任務").count()) === 1, "G3: with no result yet, the side notes lead to the task");
  }
  await ctx.close();
}

await browser.close();
console.log(results.join("\n"));
console.log(errors.length ? `page errors:\n${errors.join("\n")}` : "page errors: 0");
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`${results.length} checks, ${fails} failing`);
process.exit(fails || errors.length ? 1 : 0);

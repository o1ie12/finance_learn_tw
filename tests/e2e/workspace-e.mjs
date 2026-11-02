/**
 * A station as one page (2026-11-02), any task set, end to end, at 390×844
 * and 1440×900:
 *   - the page carries the mission, how to do it and every question at once;
 *   - nothing opens until 想一想 is answered;
 *   - 看提示 opens inline;
 *   - 送出 with a step left empty points at it;
 *   - answers from the key (one step wrong when [wrong] is given), one 送出;
 *   - the results are on the same page: 答對 N / M, each answer, 專家怎麼想;
 *   - with a wrong step, 再做一次 asks only that step and scores in full;
 *   - 進入這個月 goes to the month.
 * Also the E18 checks on each state: no horizontal overflow, targets ≥ 44,
 * nothing under 12px.
 *
 *   npx tsx tests/e2e/task-key.ts <taskSetId> /tmp/key.json
 *   BASE_URL=http://localhost:3210 node tests/e2e/workspace-e.mjs /tmp/key.json <path> <name> [wrongStepIndex]
 */
import { mkdirSync, readFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const [keyPath, PATH, NAME, wrongArg] = process.argv.slice(2);
const KEY = JSON.parse(readFileSync(keyPath, "utf8"));
const WRONG = wrongArg === undefined ? -1 : Number(wrongArg);
const OUT = new URL("../../docs/design/screens/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const results = [];
const errors = [];
const check = (ok, what) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
const json = { "content-type": "application/json" };
const browser = await chromium.launch();

for (const [W, H] of [
  [1440, 900],
  [390, 844],
]) {
  const tag = `${W}x${H}`;
  const code = (await (await fetch(BASE + "/api/signup", { method: "POST", headers: json, body: JSON.stringify({ name: "工作台走查", grade: "高二" }) })).json()).access_code;
  await fetch(BASE + "/api/goal", { method: "POST", headers: { ...json, cookie: `fs_access_code=${code}; fs_signed_in=1` }, body: JSON.stringify({ skip: true }) });
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : code, domain: "localhost", path: "/" })));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  const btn = (name) => page.getByRole("button", { name, exact: true });
  const audit = async (state) => {
    await page.waitForTimeout(400);
    const m = await page.evaluate(() => {
      const visible = (e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && !e.closest(".sr-only, [aria-hidden='true'], details:not([open])");
      };
      const small = [...document.querySelectorAll('button, a, [role="radio"], label:has(input)')]
        .filter((e) => visible(e) && !e.closest("p") && !e.matches(".sr-only"))
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width < 43.5 || r.height < 43.5;
        })
        .map((e) => (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 10));
      const tiny = [];
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (tw.nextNode()) {
        const el = tw.currentNode.parentElement;
        if (!tw.currentNode.textContent.trim() || !el || !visible(el) || el.closest("svg")) continue;
        if (parseFloat(getComputedStyle(el).fontSize) < 12) tiny.push(tw.currentNode.textContent.trim().slice(0, 10));
      }
      return { sw: document.scrollingElement.scrollWidth, iw: innerWidth, small: [...new Set(small)].slice(0, 6), tiny: [...new Set(tiny)].slice(0, 6) };
    });
    const ok = m.sw <= m.iw + 1 && !m.small.length && !m.tiny.length;
    check(ok, `${tag} ${state}${ok ? "" : ` (${[m.sw > m.iw + 1 ? `overflow ${m.sw}>${m.iw}` : "", m.small.length ? `small: ${m.small.join(" / ")}` : "", m.tiny.length ? `tiny: ${m.tiny.join(" / ")}` : ""].filter(Boolean).join("; ")})`}`);
    await page.screenshot({ path: `${OUT}ws-${NAME}-${state}-${tag}.png` });
  };
  const card = (k) => page.locator('section[id^="q-"]').nth(k);
  const answer = async (k, step, right) => {
    const c = card(k);
    await c.scrollIntoViewIfNeeded();
    if (step.type === "choice") {
      if (right) await c.getByRole("radio", { name: step.right, exact: true }).first().click();
      else {
        const radios = c.getByRole("radio");
        for (let i = 0; i < (await radios.count()); i++) {
          const n = (await radios.nth(i).innerText()).trim();
          if (n && !n.startsWith(step.right) && n !== step.reason) {
            await radios.nth(i).click();
            break;
          }
        }
      }
      if (step.hasReasons && step.reason) await c.getByRole("radio", { name: step.reason, exact: true }).first().click();
    } else if (step.type === "number") {
      await c.locator('input[inputmode="decimal"]').fill(String(right ? Math.round(step.value * 10) / 10 : Math.round(step.value * 10) / 10 + 9999));
    } else if (step.type === "find") {
      for (const t of step.targets) await c.locator(`button[data-field="${t}"]:visible, [data-field="${t}"]:visible button`).first().click();
    } else if (step.type === "sort") {
      for (const it of step.items) {
        const sel = c.locator(`select[aria-label="「${it.label}」放到哪一格"]`);
        if (it.box && (await sel.count())) await sel.selectOption({ label: it.box });
      }
    } else if (step.type === "order") {
      for (let target = 0; target < step.answer.length; target++) {
        const labels = await c.locator('ol li [class*="orderLabel"]').allInnerTexts();
        const at = labels.findIndex((l) => l.trim() === step.answer[target]);
        for (let m = at; m > target; m--) await c.getByRole("button", { name: `上移「${step.answer[target]}」` }).click();
      }
    } else if (step.type === "rate") {
      const items = c.locator('[class*="rateItem"]');
      for (let i = 0; i < (await items.count()); i++) {
        const label = await items.nth(i).locator('[class*="rateName"]').innerText();
        const item = step.items.find((it) => label.includes(it.label));
        await items.nth(i).getByRole("radio", { name: new RegExp(`^${item ? item.answer : 1}，`) }).click();
      }
    } else if (step.type === "write") {
      await c.locator("textarea").fill("這次先不核准，因為卡費還在循環。先繳清，半年後再來申請。");
    }
  };

  await page.goto(BASE + PATH, { waitUntil: "networkidle" });
  const body = await page.locator("main, body").first().innerText();
  check(/你會學到/.test(body) && /你要做的/.test(body) && /送出答案/.test(body), `${tag} the mission, how to do it and 送出 are on one page`);
  check((await page.locator('section[id^="q-"]').count()) === KEY.steps.length, `${tag} all ${KEY.steps.length} questions are on the page`);
  check(await btn("送出答案").isDisabled(), `${tag} 送出 waits for 想一想`);
  await audit("start");
  await page.locator('[role="radiogroup"] [role="radio"]').first().click();
  check(!(await btn("送出答案").isDisabled()), `${tag} 想一想 answered: the task opens`);

  const hint = page.getByRole("button", { name: "看提示" }).first();
  if (await hint.count()) {
    await hint.click();
    check((await page.getByText("看提示不影響分數。").count()) > 0, `${tag} 看提示 opens inline`);
    await page.getByRole("button", { name: "收起提示" }).first().click();
  }

  // 送出 with one step empty points at it (an order step always has an
  // answer: its starting order).
  const empty = KEY.steps.findLastIndex((st) => st.type !== "order");
  for (const [k, step] of KEY.steps.entries()) if (k !== empty) await answer(k, step, k !== WRONG);
  await btn("送出答案").click();
  await page.waitForTimeout(500);
  check((await page.locator('[role="alert"]').count()) > 0, `${tag} an unanswered step is pointed out, nothing sent`);
  await answer(empty, KEY.steps[empty], empty !== WRONG);
  await audit("answered");
  await btn("送出答案").click();
  await page.locator("#result-title").waitFor({ timeout: 20_000 });
  const after = await page.locator("main, body").first().innerText();
  check(/專家怎麼想/.test(after) && /這一站帶走/.test(after), `${tag} results on the same page: the count, 專家怎麼想, 帶走`);
  check(await page.evaluate(() => document.activeElement?.id === "result-title"), `${tag} focus moves to the result heading (A11Y-1)`);
  check((await page.getByRole("button", { name: /^(進入這個月|完成)$/ }).count()) === 1, `${tag} one 進入這個月 button (CMP-1)`);
  await audit("results");

  if (WRONG >= 0) {
    const redo = page.getByRole("button", { name: /^再做一次（1 題）$/ }).first();
    check((await redo.count()) > 0, `${tag} 再做一次 offers the 1 missed step`);
    await redo.click();
    await page.waitForTimeout(2000);
    const carried = await page.getByText("上次已經答對，這次不用再做。").count();
    check(carried === KEY.steps.length - 1, `${tag} the redo asks only the missed step (${KEY.steps.length - carried} open)`);
    await answer(WRONG, KEY.steps[WRONG], true);
    await btn("送出答案").click();
    await page.locator("#result-title").waitFor({ timeout: 20_000 });
    const t = (await page.locator("#result-title").innerText()).replace(/\s/g, "");
    check(/^答對(\d+)\/\1$/.test(t), `${tag} attempt 2 with the carried answers scores in full (${t})`);
  }

  await page.getByRole("button", { name: /^(進入這個月|完成)$/ }).first().click();
  await page.waitForURL((u) => !u.pathname.startsWith(PATH.split("?")[0]), { timeout: 20_000 });
  check(true, `${tag} the next step leaves the station → ${new URL(page.url()).pathname}`);
  await ctx.close();
}
await browser.close();
console.log(results.join("\n"));
console.log(errors.length ? `page errors:\n${errors.slice(0, 5).join("\n")}` : "page errors: 0");
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`${NAME}: ${results.length} checks, ${fails} failing`);
process.exit(fails || errors.length ? 1 : 0);

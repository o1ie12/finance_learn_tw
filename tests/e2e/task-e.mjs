/**
 * Any task set on the Part E flow, end to end (06 STOP 3): hook, cards,
 * brief, every step answered from the key (tests/e2e/task-key.ts), score,
 * every model answer, reveal. Each screen is checked for page scroll,
 * targets ≥ 44 and the 12px type floor, and saved to docs/design/screens/.
 *
 *   BASE_URL=http://localhost:3210 node tests/e2e/task-e.mjs <key.json> <path> <name> [WxH]
 */
import { mkdirSync, readFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const [, , keyFile, path, name, vp = "390x844"] = process.argv;
const KEY = JSON.parse(readFileSync(keyFile, "utf8"));
const [W, H] = vp.split("x").map(Number);
const OUT = new URL("../../docs/design/screens/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const post = (p, body, cookie) =>
  fetch(BASE + p, { method: "POST", headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body ?? {}) });

const browser = await chromium.launch();
const results = [];
const errors = [];
for (const scheme of ["light", "dark"]) {
  const code = (await (await post("/api/signup", { name: "任務走查", school: "本機測試", grade: "高二" })).json()).access_code;
  const cookie = `fs_access_code=${code}; fs_signed_in=1`;
  for (const p of ["/api/avatar", "/api/goal"]) await post(p, { skip: true }, cookie);
  await post("/api/tour", {}, cookie);
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, colorScheme: scheme, deviceScaleFactor: 2 });
  await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : code, domain: "localhost", path: "/" })));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  let n = 0;
  const screen = async (label) => {
    await page.waitForTimeout(450);
    const m = await page.evaluate(() => {
      const vis = (e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && !e.closest(".sr-only, [aria-hidden='true']");
      };
      const small = [...document.querySelectorAll('button, a, [role="radio"], [role="tab"], label:has(input), select')]
        .filter((e) => vis(e) && !e.closest("p") && !e.matches(".sr-only"))
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width < 43.5 || r.height < 43.5;
        })
        .map((e) => (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 10));
      const tiny = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) {
        const el = w.currentNode.parentElement;
        if (!w.currentNode.textContent.trim() || !el || !vis(el) || el.closest("svg")) continue;
        if (parseFloat(getComputedStyle(el).fontSize) < 12) tiny.push(w.currentNode.textContent.trim().slice(0, 10));
      }
      return { sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth, small, tiny };
    });
    const scroll = m.sh > m.ih + 1 || m.sw > m.iw + 1;
    const ok = !scroll && !m.small.length && !m.tiny.length;
    const why = [scroll ? `scroll ${m.sw}x${m.sh}` : "", m.small.length ? `small: ${m.small.join(" / ")}` : "", m.tiny.length ? `tiny: ${m.tiny.join(" / ")}` : ""].filter(Boolean).join("; ");
    results.push(`${ok ? "ok  " : "FAIL"} ${scheme} ${label}${ok ? "" : ` (${why})`}`);
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await page.screenshot({ path: `${OUT}${name}-${String(++n).padStart(2, "0")}-${label}-${W}x${H}-${scheme}.png` });
  };
  const btn = (t) => page.getByRole("button", { name: t, exact: true });

  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await screen("hook");
  await page.locator('label:has(input[name="hook"])').first().click();
  await btn("確定").click();
  for (let i = 0; i < 4 && (await page.getByText("先懂一件事").count()); i++) {
    await screen(`card-${i + 1}`);
    await btn("繼續").click();
  }
  await screen("brief");
  await btn("開始任務").click();
  for (const [k, step] of KEY.steps.entries()) {
    await page.waitForTimeout(350);
    if (step.type === "rate") {
      for (let a = 0; a < step.items.length && a < 6; a++) {
        const title = await page.locator("h2[data-screen-heading]").first().innerText();
        const item = step.items.find((it) => title.includes(it.label));
        await page.getByRole("radio", { name: new RegExp(`^${item ? item.answer : 1}，`) }).click();
        if (a === 0) await screen(`q${k + 1}`);
        await btn("確定").click();
        await page.waitForTimeout(250);
      }
      continue;
    }
    if (step.type === "choice") {
      await page.getByRole("radio", { name: step.right, exact: true }).first().click();
      if (step.hasReasons && step.reason) await page.getByRole("radio", { name: step.reason, exact: true }).first().click();
    } else if (step.type === "number") {
      await page.locator('input[inputmode="decimal"]').fill(String(Math.round(step.value * 10) / 10));
    } else if (step.type === "find") {
      for (const t of step.targets) await page.locator(`button[data-field="${t}"]:visible`).first().click();
    } else if (step.type === "sort") {
      for (const it of step.items) {
        const sel = page.locator(`select[aria-label="「${it.label}」放到哪一格"]`);
        if (it.box && (await sel.count())) await sel.selectOption({ label: it.box });
      }
    } else if (step.type === "order") {
      for (let target = 0; target < step.answer.length; target++) {
        const labels = await page.locator('ol li [class*="orderLabel"]').allInnerTexts();
        const at = labels.findIndex((l) => l.trim() === step.answer[target]);
        for (let m = at; m > target; m--) await page.getByRole("button", { name: `上移「${step.answer[target]}」` }).click();
      }
    } else if (step.type === "write") {
      await page.locator("textarea").fill("我的回覆：說出決定、原因和下一步。");
    }
    await screen(`q${k + 1}`);
    await btn("確定").click();
  }
  await page.getByText("得分").waitFor({ timeout: 20_000 });
  await screen("score");
  await btn("繼續").click();
  for (let a = 0; a < 20 && !(await page.getByText("你剛剛的選擇，背後是").count()); a++) {
    await screen(`answer-${a + 1}`);
    await btn("繼續").click();
    await page.waitForTimeout(300);
  }
  await screen("reveal");
  const score = await page.locator("body").innerText();
  results.push(`info ${scheme} reached the reveal`);
  void score;
  await ctx.close();
}
await browser.close();
console.log(results.join("\n"));
const failed = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${name}: ${results.filter((r) => !r.startsWith("info")).length} screens, ${failed} failing, ${errors.length} page errors`);
for (const e of errors.slice(0, 5)) console.log("  ERROR", e);
process.exit(failed || errors.length ? 1 : 0);

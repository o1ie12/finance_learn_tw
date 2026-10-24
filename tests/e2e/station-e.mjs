/**
 * 06 STOP 2: one full station (信用站, 你是銀行) on the Part E flow, end to end,
 * at 390×844 (or VIEWPORT=WxH) in light and dark. Every screen is checked
 * for page scroll (E18) and saved to docs/design/screens/station-<n>-...png.
 * Answers come from the key (tests/e2e/xinyong-key.ts) so the run passes.
 *
 *   USE_DEV_STORE=1 SUPABASE_URL= SUPABASE_SERVICE_ROLE_KEY= npx next dev -p 3210
 *   npx tsx tests/e2e/xinyong-key.ts /tmp/xinyong-key.json
 *   BASE_URL=http://localhost:3210 node tests/e2e/station-e.mjs /tmp/xinyong-key.json
 */
import { mkdirSync, readFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const KEY = JSON.parse(readFileSync(process.argv[2], "utf8"));
const [W, H] = (process.env.VIEWPORT ?? "390x844").split("x").map(Number);
const OUT = new URL("../../docs/design/screens/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const post = (path, body, cookie) =>
  fetch(BASE + path, { method: "POST", headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body ?? {}) });

const browser = await chromium.launch();
const results = [];
const errors = [];
for (const scheme of ["light", "dark"]) {
  const code = (await (await post("/api/signup", { name: "車站走查", school: "本機測試", grade: "高二" })).json()).access_code;
  const cookie = `fs_access_code=${code}; fs_signed_in=1`;
  await post("/api/avatar", { skip: true }, cookie);
  await post("/api/goal", { skip: true }, cookie);
  await post("/api/tour", {}, cookie);
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, colorScheme: scheme, deviceScaleFactor: 2 });
  await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((name, i) => ({ name, value: i ? "1" : code, domain: "localhost", path: "/" })));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  let n = 0;
  const screen = async (name) => {
    await page.waitForTimeout(450);
    const m = await page.evaluate(() => {
      const visible = (e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && !e.closest(".sr-only, [aria-hidden='true']");
      };
      // E18 targets (≥ 44×44; inline links in a paragraph exempt) and the 12px type floor.
      const small = [...document.querySelectorAll('button, a, [role="radio"], [role="tab"], label:has(input)')]
        .filter((e) => visible(e) && !e.closest("p") && !e.matches(".sr-only"))
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width < 43.5 || r.height < 43.5;
        })
        .map((e) => (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 10));
      const tiny = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) {
        const el = w.currentNode.parentElement;
        if (!w.currentNode.textContent.trim() || !el || !visible(el) || el.closest("svg")) continue;
        if (parseFloat(getComputedStyle(el).fontSize) < 12) tiny.push(w.currentNode.textContent.trim().slice(0, 10));
      }
      return { sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth, small, tiny };
    });
    const ok = m.sh <= m.ih + 1 && m.sw <= m.iw + 1 && m.small.length === 0 && m.tiny.length === 0;
    const why = [m.sh > m.ih + 1 || m.sw > m.iw + 1 ? `scroll ${m.sw}x${m.sh} in ${m.iw}x${m.ih}` : "", m.small.length ? `small targets: ${m.small.join(" / ")}` : "", m.tiny.length ? `text < 12px: ${m.tiny.join(" / ")}` : ""].filter(Boolean).join("; ");
    results.push(`${ok ? "ok  " : "FAIL"} ${scheme} ${name}${ok ? "" : ` (${why})`}`);
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await page.screenshot({ path: `${OUT}station-${String(++n).padStart(2, "0")}-${name}-${W}x${H}-${scheme}.png` });
  };
  const button = (name) => page.getByRole("button", { name, exact: true });

  await page.goto(`${BASE}/line/xinyong/station/4`, { waitUntil: "networkidle" });
  await screen("hook");
  await page.locator('label:has(input[name="hook"])').first().click();
  await screen("hook-picked");
  await button("確定").click();
  for (let i = 0; i < 4; i++) {
    if (!(await page.getByText("先懂一件事").count())) break;
    await screen(`card-${i + 1}`);
    await button("繼續").click();
  }
  await screen("brief");
  await button("開始任務").click();
  const rate = KEY["4"][0];
  for (let k = 0; k < 6; k++) {
    await page.waitForTimeout(300);
    const title = await page.locator("h2[data-screen-heading]").first().innerText();
    const item = rate.items.find((it) => title.includes(it.label));
    if (!item) throw new Error(`applicant not found: ${title}`);
    if (k === 0) await screen("applicant-empty");
    await page.getByRole("radio", { name: new RegExp(`^${item.answer}，`) }).click();
    await screen(`applicant-${k + 1}`);
    await button("確定").click();
  }
  // 06 F3.3: the write step after the ratings.
  await page.locator("textarea").waitFor();
  await screen("write-empty");
  await page.locator("textarea").fill("這次先不核准，因為卡費還在循環。先繳清，半年後再來申請。");
  await screen("write");
  await button("確定").click();
  await page.getByText("得分").waitFor({ timeout: 20_000 });
  await screen("score");
  await button("繼續").click();
  for (let k = 0; k < 7; k++) {
    await screen(`answer-${k + 1}`);
    await button("繼續").click();
  }
  await page.getByText("你剛剛的選擇，背後是").waitFor();
  await screen("reveal");
  await ctx.close();
}
await browser.close();
console.log(results.join("\n"));
const failed = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${results.length} screens, ${failed} failing (scroll, targets or type floor), ${errors.length} page errors`);
for (const e of errors.slice(0, 5)) console.log("  ERROR", e);
process.exit(failed || errors.length ? 1 : 0);

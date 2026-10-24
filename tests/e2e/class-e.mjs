/**
 * Class mode, both flows, with a teacher browser and a student browser
 * (SHIP-LOG step 3). Class mode has no "student does a station, teacher sees
 * it" flow; these are the two it has:
 *
 *   1. 即時測驗: the teacher opens a room on a line's question bank, a student
 *      joins with the code, the teacher starts, the student answers all ten
 *      and sends, and the teacher's leaderboard shows the student's score.
 *   2. 人生賽局: the teacher opens a room and starts it, a signed-in student
 *      joins a team and plays one month, and the teacher's table ranks the
 *      team.
 *
 *   USE_DEV_STORE=1 SUPABASE_URL= SUPABASE_SERVICE_ROLE_KEY= npx next dev -p 3210
 *   BASE_URL=http://localhost:3210 node tests/e2e/class-e.mjs
 */
import { chromium } from "playwright";
import { playTurn, waitHeading } from "./playDriver.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");

const results = [];
const errors = [];
const check = (ok, what) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
const browser = await chromium.launch();
const open = async (cookie) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  if (cookie) await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : cookie, domain: "localhost", path: "/" })));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  return { ctx, page };
};

// ---- 1. 即時測驗 ------------------------------------------------------------
{
  const teacher = await open();
  await teacher.page.goto(BASE + "/class/host", { waitUntil: "networkidle" });
  // the radio is visually hidden; a person clicks its label
  await teacher.page.locator("label", { hasText: "信用線" }).first().click();
  check(await teacher.page.getByRole("radio", { name: "信用線" }).isChecked(), "測驗: the teacher picks 信用線");
  await teacher.page.getByRole("button", { name: "建立房間" }).click();
  const codeEl = teacher.page.locator("p.money").first();
  await codeEl.waitFor({ timeout: 15_000 });
  const code = (await codeEl.innerText()).trim();
  check(/^[A-Z0-9]{4,6}$/.test(code), `測驗: the teacher gets a room code (${code})`);

  const student = await open();
  await student.page.goto(BASE + "/class/play", { waitUntil: "networkidle" });
  await student.page.getByLabel("房間代碼").fill(code);
  await student.page.getByLabel("你的名字").fill("課堂走查");
  await student.page.getByRole("button", { name: "加入" }).click();
  await student.page.getByText("已加入房間").waitFor({ timeout: 15_000 });
  await teacher.page.getByText("課堂走查").waitFor({ timeout: 15_000 });
  check(true, "測驗: the student joins and shows on the teacher's leaderboard");

  await teacher.page.getByRole("button", { name: "開始測驗" }).click();
  const send = student.page.getByRole("button", { name: /^送出/ });
  await send.waitFor({ timeout: 20_000 });
  // Answer every question with its first option (the score is whatever it is).
  for (const fs of await student.page.locator("fieldset").all()) await fs.getByRole("button").first().click();
  await send.click();
  await student.page.getByText(/\/ 10，用了/).waitFor({ timeout: 15_000 });
  const scoreText = await student.page.getByText(/\/ 10，用了/).innerText();
  const score = scoreText.match(/^(\d+) \/ 10/)?.[1];
  check(score != null, `測驗: the student sends all answers (${scoreText.trim()})`);
  const row = teacher.page.locator("div", { hasText: "課堂走查" }).filter({ hasText: `${score} / 10` });
  await row.first().waitFor({ timeout: 15_000 });
  check(true, `測驗: the teacher's leaderboard shows 課堂走查 at ${score} / 10`);
  await teacher.page.getByRole("button", { name: "結束這場" }).click();
  await teacher.ctx.close();
  await student.ctx.close();
}

// ---- 2. 人生賽局 ------------------------------------------------------------
{
  const signup = await (await fetch(BASE + "/api/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "隊伍走查", school: "本機測試", grade: "高二" }),
  })).json();
  const teacher = await open();
  await teacher.page.goto(BASE + "/class/life/host", { waitUntil: "networkidle" });
  await teacher.page.getByRole("button", { name: "建立房間" }).click();
  const codeEl = teacher.page.locator("[aria-label^='房間代碼 ']");
  await codeEl.waitFor({ timeout: 15_000 });
  const code = (await codeEl.innerText()).replace(/\s/g, "");
  check(/^[A-Z0-9]{4,6}$/.test(code), `人生賽局: the teacher gets a room code (${code})`);
  await teacher.page.getByRole("button", { name: "開始", exact: true }).click();
  await teacher.page.getByRole("button", { name: "結束這場" }).waitFor({ timeout: 15_000 });

  const student = await open(signup.access_code);
  await student.page.goto(BASE + "/class/life/play", { waitUntil: "networkidle" });
  await student.page.getByLabel("房間代碼").fill(code);
  const name = student.page.getByLabel(/名字/);
  if (await name.count()) await name.first().fill("隊伍走查");
  await student.page.locator("input[name='team']").first().check();
  const team = await student.page.locator("input[name='team']").first().inputValue();
  await student.page.getByRole("button", { name: "加入", exact: true }).click();
  await waitHeading(student.page, 30_000);
  check(true, `人生賽局: the student joins ${team} and the shared save opens`);
  const log = await playTurn(student.page, { timeout: 30_000 });
  check(log.length > 3, `人生賽局: the team plays one month (${log.map((l) => l.from).join(" > ")})`);

  // The teacher's table ranks the team once it has played.
  const ranked = teacher.page.locator("table tr", { hasText: team });
  await ranked.first().waitFor({ timeout: 20_000 });
  check(true, `人生賽局: the teacher's table ranks ${team}`);
  await teacher.page.getByRole("button", { name: "結束這場" }).click();
  await teacher.ctx.close();
  await student.ctx.close();
}

await browser.close();
console.log(results.join("\n"));
console.log(errors.length ? `page errors:\n${errors.join("\n")}` : "page errors: 0");
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`${results.length} checks, ${fails} failing`);
process.exit(fails || errors.length ? 1 : 0);

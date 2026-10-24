// Station flow, keyboard only: 信用線 Task A (/line/xinyong/course/4)
// hook -> lesson -> find x2 -> choice -> number -> model answer -> save tool
// -> 回到你的人生 -> one /play month -> 完成 (ride) -> lands on the next station.
// Then 你是銀行 (/line/xinyong/course/7): rate 6 files with the keys 1/2/3.
//
// Run:
//   NODE_PATH=/path/to/pw/node_modules E2E_BASE=http://localhost:3210 \
//     E2E_SHOTS=/tmp/e2e-shots node tests/e2e/station.mjs

import { chromium, BASE, signup, newPage, tabTo, active, ledger, shot } from "./lib.mjs";
import { playStep, waitHeading, stepHeading, panelHeading } from "./playDriver.mjs";

const L = ledger("station");
const browser = await chromium.launch();
const code = await signup("車站測試");
const { page, errors } = await newPage(browser, { code });

const progress = () => page.evaluate(() => document.body.innerText.match(/第 (\d) 步，共 (\d) 步 · (\S+)/)?.[0] ?? "");
const waitProgress = async (n) => page.waitForFunction((n) => document.body.innerText.includes(`第 ${n} 步，共`), n, { timeout: 30_000 });

await L.step("open /line/xinyong/course/4", async () => {
  const r = await page.goto(BASE + "/line/xinyong/course/4", { waitUntil: "networkidle" });
  if (r.status() !== 200) throw new Error("HTTP " + r.status());
  return await progress();
});
await shot(page, "station4_hook");

await L.step("hook: Tab to the first option, Enter -> lesson panel", async () => {
  await tabTo(page, (a) => a.tag === "button" && ["算", "不算", "不確定"].includes(a.name), { max: 40 });
  const a = await active(page);
  await page.keyboard.press("Enter");
  await waitProgress(2);
  const f = await active(page);
  return `picked "${a.name}", focus now on ${f.tag} "${f.name}"`;
});

await L.step("lesson: focus lands on the panel heading; 下一步 by keyboard", async () => {
  const f = await active(page);
  if (!f.heading) throw new Error("focus not on heading: " + JSON.stringify(f));
  await tabTo(page, (a) => a.tag === "button" && a.name === "下一步");
  await page.keyboard.press("Enter");
  await waitProgress(3);
});
await shot(page, "station4_task");

await L.step("find step 1: toggle 本期應繳總額, 最低應繳金額, 繳款截止日; 送出", async () => {
  for (const f of ["totalDue", "minimumDue", "dueDate"]) {
    await tabTo(page, (a) => a.field === f, { max: 40 });
    await page.keyboard.press("Enter");
    const a = await active(page);
    if (a.pressed !== "true") throw new Error(`${f} not pressed`);
  }
  const count = await page.evaluate(() => document.body.innerText.match(/已選\s*(\d+)\s*個/)?.[1]);
  await tabTo(page, (a) => a.tag === "button" && a.name === "送出");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.body.innerText.includes("第 2 題"));
  return `已選 ${count}`;
});

await L.step("find step 2: toggle the 入帳日 column; 送出", async () => {
  const f = await active(page);
  if (!f.heading) throw new Error("focus not moved to the step prompt: " + JSON.stringify(f));
  await tabTo(page, (a) => a.field === "col:postDate", { max: 40 });
  await page.keyboard.press("Enter");
  if ((await active(page)).pressed !== "true") throw new Error("column not pressed");
  await tabTo(page, (a) => a.tag === "button" && a.name === "送出");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.body.innerText.includes("第 3 題"));
});

await L.step("choice step: Enter on 全額 moves to reasons, Enter on reason sends", async () => {
  await tabTo(page, (a) => a.type === "radio");
  const a = await active(page);
  if (!a.name.includes("全額")) throw new Error("first radio is " + a.name);
  await page.keyboard.press("Enter");
  const r = await active(page);
  if (r.type !== "radio" || !r.name.includes("繳全額就完全不用付利息")) throw new Error("focus after Enter: " + JSON.stringify(r));
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.body.innerText.includes("第 4 題"));
});

await L.step("number step: type 107, Enter submits the task", async () => {
  await tabTo(page, (a) => a.tag === "input" && a.type === "text");
  await page.keyboard.type("107");
  await page.keyboard.press("Enter");
  await waitProgress(4);
  const h = await active(page);
  return `focus ${h.tag} "${h.name}"`;
});
await shot(page, "station4_answer", { fullPage: true });

await L.step("model answer panel shows the score", async () => {
  const t = await page.evaluate(() => document.body.innerText.match(/得分\s*([\d.]+)\s*\/\s*(\d+)/)?.slice(1).join("/"));
  const pass = await page.getByText("過關了，這一站完成。").count();
  if (!t) throw new Error("no score");
  return `score ${t}${pass ? " (過關)" : " (not passed)"}`;
});

await L.step("存到工具箱 by keyboard -> 已存到工具箱", async () => {
  await tabTo(page, (a) => a.tag === "button" && a.name.includes("存到工具箱"), { max: 120 });
  await page.keyboard.press("Enter");
  await page.getByText("已存到工具箱").waitFor({ timeout: 15_000 });
});

await L.step("下一步 -> end card; 回到你的人生 -> /play?return=…", async () => {
  await tabTo(page, (a) => a.tag === "button" && a.name === "下一步");
  await page.keyboard.press("Enter");
  await waitProgress(5);
  await tabTo(page, (a) => a.tag === "button" && a.name.includes("回到你的人生"));
  await Promise.all([page.waitForURL("**/play?**", { timeout: 60_000 }), page.keyboard.press("Enter")]);
  return new URL(page.url()).searchParams.get("return");
});

const returnTo = new URL(page.url()).searchParams.get("return");
await L.step("/play: one full month by keyboard, then 完成 (ride)", async () => {
  await waitHeading(page);
  const seen = [];
  for (let i = 0; i < 14; i++) {
    const r = await playStep(page, { ride: true });
    seen.push(r.from);
    if (r.ride) break;
  }
  if (!seen.at(-1)?.match(/個月結束了/)) throw new Error("no month summary: " + seen.join(" > "));
  return seen.join(" > ");
});

await L.step("the ride lands on the next station URL", async () => {
  const dlg = page.getByRole("dialog", { name: "前往下一站" });
  await dlg.waitFor({ timeout: 10_000 }).catch(() => {});
  await shot(page, "station_ride");
  const t0 = Date.now();
  await page.waitForURL((u) => u.pathname === returnTo, { timeout: 20_000 });
  return `${returnTo} after ${Date.now() - t0}ms (full ride, not skipped)`;
});
L.check("return target is a 信用線 station", /^\/line\/xinyong\/(course\/\d+|simulation)$/.test(returnTo ?? ""), returnTo);

// ---- 你是銀行 -----------------------------------------------------------------
await L.step("open /line/xinyong/course/7, hook + lesson by keyboard", async () => {
  await page.goto(BASE + "/line/xinyong/course/7", { waitUntil: "networkidle" });
  await tabTo(page, (a) => a.tag === "button" && /收入多少|準時|工作/.test(a.name), { max: 30 });
  await page.keyboard.press("Enter");
  await waitProgress(2);
  await tabTo(page, (a) => a.tag === "button" && a.name === "下一步");
  await page.keyboard.press("Enter");
  await waitProgress(3);
});

await L.step("rate 6 files with the keys 1/2/3", async () => {
  const n = await page.evaluate(() => document.querySelectorAll("fieldset input[type=radio][value='1']").length);
  const keys = ["3", "1", "2", "1", "2", "3"];
  for (let i = 0; i < n; i++) {
    // Tab into the i-th item's radio group, press a digit.
    await tabTo(page, (a) => a.type === "radio", { max: 80 });
    const legend = await page.evaluate(() => document.activeElement?.closest("fieldset")?.querySelector("legend")?.textContent ?? "");
    await page.keyboard.press(keys[i % keys.length]);
    const v = await page.evaluate(() => (document.activeElement instanceof HTMLInputElement && document.activeElement.checked ? document.activeElement.value : null));
    if (v !== keys[i % keys.length]) throw new Error(`item ${i + 1} (${legend}): key ${keys[i % keys.length]} -> checked ${v}`);
    // Leave this group: Tab moves past the remaining radios of a native group.
    await page.keyboard.press("Tab");
  }
  const caption = await page.evaluate(() => document.body.innerText.match(/已給分 \d+ \/ \d+ 份/)?.[0]);
  if (!caption?.startsWith(`已給分 ${n} / ${n}`)) throw new Error("caption " + caption);
  return `${n} files: ${caption}`;
});
await shot(page, "station7_rated", { fullPage: true });

await L.step("Enter in a rating group sends; model answers show", async () => {
  await tabTo(page, (a) => a.type === "radio", { back: true, max: 20 });
  await page.keyboard.press("Enter");
  await waitProgress(4);
  return (await panelHeading(page)).slice(0, 60);
});
await shot(page, "station7_answer", { fullPage: true });

L.check("no console/page errors", errors.length === 0, errors.slice(0, 5).join(" | "));
await browser.close();
L.summary();

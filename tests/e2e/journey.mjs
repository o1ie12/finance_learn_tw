// Journey: new student -> character (keyboard) -> goal (keyboard) -> first
// ride (skip by keyboard) -> home with character, today's stop, map, tour.
//
// Run:
//   NODE_PATH=/path/to/pw/node_modules E2E_BASE=http://localhost:3210 \
//     E2E_SHOTS=/tmp/e2e-shots node tests/e2e/journey.mjs

import { chromium, BASE, signup, newPage, tabTo, active, ledger, shot } from "./lib.mjs";

const L = ledger("journey");
const browser = await chromium.launch();
const code = await signup("旅程測試");
const { page, errors } = await newPage(browser, { code, viewport: { width: 1280, height: 860 } });

await L.step("open /onboarding/character", async () => {
  const res = await page.goto(BASE + "/onboarding/character", { waitUntil: "networkidle" });
  if (res.status() !== 200) throw new Error("HTTP " + res.status());
  await page.getByRole("heading", { name: "做出你的角色" }).waitFor();
});

await L.step("character tabs: Tab to tablist, ArrowRight moves selection", async () => {
  await tabTo(page, (a) => a.role === "tab");
  const a0 = await active(page);
  await page.keyboard.press("ArrowRight");
  const a1 = await active(page);
  const sel = await page.getByRole("tab", { selected: true }).textContent();
  if (a0.name !== "臉" || a1.name !== "髮型" || sel !== "髮型") throw new Error(`tab path ${a0.name} -> ${a1.name}, selected=${sel}`);
  return `${a0.name} -> ${a1.name}`;
});

await L.step("pick a hair swatch by keyboard (Tab into panel, Enter)", async () => {
  // Panel follows the tablist in tab order.
  await page.keyboard.press("Tab");
  // Move to the 2nd swatch of the panel.
  const first = await active(page);
  await page.keyboard.press("Tab");
  const second = await active(page);
  await page.keyboard.press("Enter");
  const pressed = await page.evaluate(() => {
    const el = document.activeElement;
    return el?.getAttribute("aria-pressed") ?? el?.getAttribute("aria-checked") ?? el?.getAttribute("aria-selected");
  });
  if (pressed !== "true") throw new Error(`after Enter on "${second.name}" aria-pressed/checked=${pressed} (first was "${first.name}")`);
  return `picked ${second.name}`;
});

await L.step("color tab via End, pick an outfit colour with Space", async () => {
  await tabTo(page, (a) => a.role === "tab", { back: true });
  await page.keyboard.press("End");
  const sel = await page.getByRole("tab", { selected: true }).textContent();
  if (sel !== "顏色") throw new Error("selected " + sel);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const a = await active(page);
  await page.keyboard.press("Space");
  const pressed = await page.evaluate(() => document.activeElement?.getAttribute("aria-pressed") ?? document.activeElement?.getAttribute("aria-checked"));
  if (pressed !== "true") throw new Error(`Space on ${a.name}: ${pressed}`);
  return `picked ${a.name}`;
});

await L.step("type name, press 完成 with Enter, lands on /onboarding/goal", async () => {
  await tabTo(page, (a) => a.tag === "input" && a.name.includes("名字"));
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("鍵盤小明");
  await tabTo(page, "完成");
  await Promise.all([page.waitForURL("**/onboarding/goal", { timeout: 60_000 }), page.keyboard.press("Enter")]);
  await page.getByRole("heading", { name: "設定你的目標" }).waitFor();
});
await shot(page, "journey_goal");

await L.step("goal: radio card by arrow keys, reason by arrows, ticks all met", async () => {
  // First radio group = goal cards. Tab lands on the first radio.
  const a = await tabTo(page, (x) => x.type === "radio");
  await page.keyboard.press("Space"); // check 一台新筆電 (first card)
  const after = await active(page);
  if (!after.checked) throw new Error(`Space did not check "${after.name}"`);
  // Reason group: Tab past the inputs to the next radio group.
  await page.keyboard.press("Tab");
  const r = await tabTo(page, (x) => x.type === "radio" && /重要|安全|未來|別人/.test(x.name));
  await page.keyboard.press("Space");
  const rr = await active(page);
  if (!rr.checked) throw new Error("reason not checked: " + rr.name);
  const ticks = await page.evaluate(() => document.body.innerText.match(/還有 \d 項沒打勾/)?.[0] ?? null);
  const disabled = await page.getByRole("button", { name: "設定目標" }).getAttribute("aria-disabled");
  if (disabled === "true") throw new Error(`設定目標 still aria-disabled; card=${a.name} reason=${rr.name} ${ticks ?? ""}`);
  return `card=${a.name.slice(0, 12)} reason=${rr.name.slice(0, 10)}`;
});

let rideSeen = false;
await L.step("設定目標 by Enter opens the first ride; 跳過 is focused; Enter skips", async () => {
  await tabTo(page, "設定目標");
  await page.keyboard.press("Enter");
  const dlg = page.getByRole("dialog", { name: "前往下一站" });
  await dlg.waitFor({ timeout: 20_000 });
  rideSeen = true;
  await shot(page, "journey_ride");
  const a = await active(page);
  if (a.name !== "跳過") throw new Error("focus on " + JSON.stringify(a));
  const t0 = Date.now();
  await Promise.all([page.waitForURL((u) => !u.pathname.startsWith("/onboarding"), { timeout: 60_000 }), page.keyboard.press("Enter")]);
  return `landed ${new URL(page.url()).pathname} in ${Date.now() - t0}ms`;
});
L.check("ride overlay appeared", rideSeen);

await page.waitForLoadState("networkidle");
await page.waitForTimeout(800);
await shot(page, "journey_home");
await L.step("home shows the character", async () => {
  await page.locator('[data-tour-id="character"] svg').first().waitFor({ state: "visible", timeout: 15_000 });
});
await L.step("home shows today's stop card", async () => {
  const t = (await page.locator('[data-tour-id="next-card"]').first().innerText({ timeout: 15_000 })).replace(/\s+/g, " ");
  if (!t.trim()) throw new Error("empty");
  return t.slice(0, 80);
});
await L.step("home shows the route map", async () => {
  await page.locator('[data-tour-id="route-map"]').first().waitFor({ state: "visible", timeout: 15_000 });
});
await L.step("the guided tour opens by itself", async () => {
  // The dialog wrapper itself has no box; its title is what shows.
  await page.locator('[role="dialog"] #tour-title').waitFor({ state: "visible", timeout: 15_000 });
  return (await page.locator("#tour-title").textContent()) ?? "";
});
await shot(page, "journey_tour");
L.check("no console/page errors on the journey", errors.length === 0, errors.slice(0, 5).join(" | "));

await browser.close();
L.summary();

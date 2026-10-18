// Keyboard-only driver for the /play life-game turn screen and the station
// flow. Every action is a real key press (page.keyboard); focus is moved
// with Tab / Shift+Tab only.

import { tabTo, active, sleep } from "./lib.mjs";

/** Text of the current step heading on /play ([data-step-heading]). */
export async function stepHeading(page) {
  return page
    .evaluate(() => document.querySelector("[data-step-heading]")?.textContent?.replace(/\s+/g, " ").trim() ?? "")
    .catch(() => "");
}

export async function waitHeadingChange(page, prev, timeout = 20_000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const h = await stepHeading(page);
    if (h && h !== prev) return { heading: h, ms: Date.now() - t0 };
    await sleep(50);
  }
  throw new Error(`step heading stayed "${prev}" for ${timeout}ms`);
}

/** Wait for the step heading to be present (first load). */
export async function waitHeading(page, timeout = 60_000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const h = await stepHeading(page);
    if (h) return h;
    await sleep(100);
  }
  throw new Error("no [data-step-heading] on the page");
}

/** Tab to a button whose name contains `label` and press Enter. */
export async function pressButton(page, label, opts = {}) {
  await tabTo(page, (a) => (a.tag === "button" || a.tag === "a") && a.name.includes(label), opts);
  await page.keyboard.press("Enter");
}

/** Event step: in each option group pick one option by Tab + Enter. */
async function chooseEvents(page) {
  const groups = await page.evaluate(() =>
    [...document.querySelectorAll('[role="group"][aria-label$="你的選擇"]')].map((g) => ({
      label: g.getAttribute("aria-label"),
      options: [...g.querySelectorAll("button")].map((b) => b.textContent.trim()),
    })),
  );
  const picked = [];
  for (const g of groups) {
    // Avoid options that open an amount field (market_drop 加碼).
    const want = g.options.find((o) => !o.includes("加碼")) ?? g.options[0];
    await tabTo(page, (a) => a.tag === "button" && a.group === g.label && a.name.includes(want), { max: 80 });
    await page.keyboard.press("Enter");
    const a = await active(page);
    if (a.pressed !== "true") throw new Error(`event option "${want}" not pressed after Enter`);
    picked.push(`${g.label.replace("：你的選擇", "")}=${want}`);
  }
  return picked;
}

/** Ledger step: fill every cell with `value`, then press the check button. */
async function fillLedger(page, value) {
  const n = await page.evaluate(() => document.querySelectorAll("table input").length);
  // Shift+Tab back to the top of the step, then forward to the first cell.
  await tabTo(page, (a) => a.tag === "input");
  for (let i = 0; i < n; i++) {
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.type(String(value));
    if (i < n - 1) await page.keyboard.press("Tab");
  }
  return n;
}

/**
 * Plays the current step by keyboard. Returns { from, to, ms, did }.
 * opts.ride: on the month summary, press 搭車到下一站 (returns { ride: true }).
 * opts.ledger: "wrongFirst" (default) types 1 into every cell on the first
 * try, which is wrong, then checks the hint notice before the second try.
 */
export async function playStep(page, opts = {}) {
  const from = await stepHeading(page);
  const t0 = Date.now();
  let did = "";
  if (from === "發薪日到了") {
    await pressButton(page, "收下");
    did = "收下";
  } else if (from === "快轉一年？") {
    await pressButton(page, "先不要");
    did = "先不要";
  } else if (from === "先存錢，再花錢") {
    await pressButton(page, "存起來");
    did = "存起來";
  } else if (from === "繳這個月的帳單") {
    await pressButton(page, "繳費");
    did = "繳費";
  } else if (from === "剩下的錢，要怎麼用？") {
    await pressButton(page, "確定", { max: 150 });
    did = "確定";
  } else if (from === "先管好錢，再讓錢長大") {
    await pressButton(page, "先不買");
    did = "先不買";
  } else if (/^這個月發生了/.test(from)) {
    const picked = await chooseEvents(page);
    await pressButton(page, "繼續");
    did = "events " + picked.join(", ");
  } else if (from === "這個月平安無事") {
    await pressButton(page, "繼續");
    did = "繼續";
  } else if (from === "結果") {
    const lbl = await page.evaluate(() =>
      [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).find((t) => t === "看這個月的帳" || t === "去記帳"),
    );
    await pressButton(page, lbl ?? "看這個月的帳");
    did = lbl ?? "";
  } else if (from === "記帳時間") {
    const n = await fillLedger(page, 1);
    await pressButton(page, "對答案");
    // A wrong first try stays on the step and shows hints.
    await page.getByText("有幾格不對").waitFor({ timeout: 15_000 });
    const wrong = await page.evaluate(
      () => document.querySelectorAll('table input[aria-invalid="true"], table [data-state="wrong"]').length,
    );
    await pressButton(page, "再對一次");
    did = `ledger: ${n} cells, first try wrong (${wrong} marked), second try`;
  } else if (/^第 \d+ 個月結束了$/.test(from)) {
    if (opts.ride) {
      await pressButton(page, "搭車到下一站");
      return { from, to: "(ride)", ms: 0, did: "搭車到下一站", ride: true };
    }
    const hasNext = await page.evaluate(() => [...document.querySelectorAll("button")].some((b) => b.textContent.trim() === "下個月"));
    await pressButton(page, hasNext ? "下個月" : "再玩一個月");
    did = hasNext ? "下個月" : "再玩一個月";
  } else if (/^快轉/.test(from)) {
    await pressButton(page, "回到這個月");
    did = "回到這個月";
  } else {
    throw new Error(`unknown step heading "${from}"`);
  }
  const { heading: to, ms } = await waitHeadingChange(page, from, opts.timeout ?? 20_000);
  return { from, to, ms: Date.now() - t0, transitionMs: ms, did };
}

/**
 * Plays one whole month: from the current step until the summary for this
 * month has been passed (heading back at 發薪日到了) or the ride starts.
 */
export async function playTurn(page, opts = {}) {
  const log = [];
  for (let i = 0; i < 14; i++) {
    const r = await playStep(page, opts);
    log.push(r);
    if (r.ride) return log;
    if (/^第 \d+ 個月結束了$/.test(r.from)) return log;
  }
  throw new Error("turn did not finish in 14 steps: " + log.map((l) => l.from).join(" > "));
}

/** Station flow (03 §3) keyboard helpers. */
export async function panelHeading(page) {
  return page.evaluate(() => {
    const hs = [...document.querySelectorAll("[data-panel-heading]")];
    return hs.map((h) => h.textContent.replace(/\s+/g, " ").trim()).join(" | ");
  });
}

export async function waitText(page, text, timeout = 20_000) {
  await page.getByText(text, { exact: false }).first().waitFor({ timeout });
}

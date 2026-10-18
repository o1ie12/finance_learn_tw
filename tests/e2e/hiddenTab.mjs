// 02 §9 test 13: a month on /play, and the train ride, complete in a tab the
// student is not looking at.
//
// Two pages share one context; the other page is brought to the front and the
// /play page is driven by keyboard without ever being brought forward.
//
// Headless Chromium under Playwright keeps a background page "visible" (rAF
// keeps firing at 60 fps; verified: visibilityState stays "visible" even after
// bringToFront on another page, headed or headless, with Playwright's
// anti-throttling flags removed). So the /play page also gets a hidden-tab
// shim installed before any app code runs, modelling what Chrome does to a
// real background tab:
//   - document.visibilityState = "hidden", document.hidden = true
//   - requestAnimationFrame never calls back
//   - transitionend / animationend never reach app code
//   - setTimeout / setInterval wake-ups are aligned to whole seconds
//     (Chrome's background timer throttling)
// Anything that waits on a frame or an end event hangs here, as it would in a
// real hidden tab.
//
// Run:
//   NODE_PATH=/path/to/pw/node_modules E2E_BASE=http://localhost:3210 \
//     E2E_SHOTS=/tmp/e2e-shots node tests/e2e/hiddenTab.mjs

import { chromium, BASE, signup, watch, signIn, ledger, shot } from "./lib.mjs";
import { playStep, waitHeading, stepHeading } from "./playDriver.mjs";

const HIDDEN_SHIM = () => {
  Object.defineProperty(Document.prototype, "visibilityState", { get: () => "hidden", configurable: true });
  Object.defineProperty(Document.prototype, "hidden", { get: () => true, configurable: true });
  let rafAsked = 0;
  window.requestAnimationFrame = () => ++rafAsked;
  window.cancelAnimationFrame = () => {};
  Object.defineProperty(window, "__rafAsked", { get: () => rafAsked });
  for (const type of ["transitionend", "animationend", "transitionrun", "animationstart"]) {
    window.addEventListener(type, (e) => e.stopImmediatePropagation(), true);
  }
  const st = window.setTimeout.bind(window);
  const si = window.setInterval.bind(window);
  const align = (ms) => {
    const now = performance.now();
    const due = now + Math.max(0, Number(ms) || 0);
    return Math.ceil(due / 1000) * 1000 - now;
  };
  window.setTimeout = (fn, ms, ...args) => st(fn, align(ms), ...args);
  window.setInterval = (fn, ms, ...args) => si(fn, Math.max(1000, Number(ms) || 0), ...args);
  document.dispatchEvent(new Event("visibilitychange"));
};

const L = ledger("hiddenTab");
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
const code = await signup("背景分頁測試");
await signIn(ctx, code);

const front = await ctx.newPage();
await front.goto(BASE + "/lines", { waitUntil: "domcontentloaded", timeout: 150_000 });
const bg = await ctx.newPage();
bg.setDefaultTimeout(60_000);
bg.setDefaultNavigationTimeout(150_000);
const errors = watch(bg);
await bg.addInitScript(HIDDEN_SHIM);
await front.bringToFront();

const ret = "/line/xinyong/course/7";
const q = new URLSearchParams({ return: ret, toLine: "信用線", toColor: "#c58b00", toStation: "測試站", toBlurb: "測試" });
await bg.goto(BASE + "/play?" + q.toString(), { waitUntil: "load" });

await L.step("background /play reports hidden and loads to a step", async () => {
  const vis = await bg.evaluate(() => document.visibilityState);
  const h = await waitHeading(bg);
  if (vis !== "hidden") throw new Error("visibilityState " + vis);
  return `${vis}; first step "${h}"`;
});

const times = [];
await L.step("a full month by keyboard in the background tab; every step heading changes", async () => {
  const seen = [];
  for (let i = 0; i < 14; i++) {
    const r = await playStep(bg, { ride: true, timeout: 15_000 });
    if (r.ride) {
      seen.push(r.from + " (ride)");
      break;
    }
    times.push(r.transitionMs);
    seen.push(`${r.from} -> ${r.to} ${r.transitionMs}ms`);
  }
  return seen.join(" | ");
});

await L.step("ride in the background tab lands on the return URL within 6s", async () => {
  const t0 = Date.now();
  await bg.waitForURL((u) => u.pathname === ret, { timeout: 6_000 });
  return `${Date.now() - t0}ms`;
});
await shot(bg, "hidden_after_ride");
const raf = await bg.evaluate(() => window.__rafAsked ?? 0).catch(() => "n/a");
L.check("the /play page was never brought to front (front page kept focus)", await front.evaluate(() => document.hasFocus()), "");
L.check("transition times recorded", times.length > 0, `max ${Math.max(...times)}ms over ${times.length} steps; rAF calls swallowed on the station page: ${raf}`);
L.check("no console/page errors in the background tab", errors.length === 0, errors.slice(0, 5).join(" | "));
await browser.close();
L.summary();

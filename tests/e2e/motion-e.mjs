/**
 * 06 E12 / E17 (SHIP-LOG step 7): reduced motion and the low-end flag still
 * turn off the glass blur and the MetroRide animation after the redesign.
 * Default: the sidebar is blurred glass and the car moves. data-lowend: no
 * blur on the sidebar or behind the ride, and the car stands still. Reduced
 * motion: the car stands still and the ride ends in about 900ms. Reduced
 * transparency: no blur, the car still moves.
 *
 *   BASE_URL=http://localhost:3210 node tests/e2e/motion-e.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const results = [];
const errors = [];
const check = (ok, what) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
const code = (await (await fetch(BASE + "/api/signup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "動態走查", school: "本機測試", grade: "高二" }) })).json()).access_code;
for (const p of ["/api/goal"]) await fetch(BASE + p, { method: "POST", headers: { "content-type": "application/json", cookie: `fs_access_code=${code}; fs_signed_in=1` }, body: JSON.stringify({ skip: true }) });

const browser = await chromium.launch();
async function run(label, { reducedMotion = "no-preference", lowend = false, clear = false }) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion });
  await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : code, domain: "localhost", path: "/" })));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  // Playwright has no option for it; Chromium emulates the media feature.
  if (clear) await (await ctx.newCDPSession(page)).send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }] });
  await page.goto(BASE + "/line/xinyong", { waitUntil: "networkidle" });
  if (lowend) await page.evaluate(() => document.documentElement.setAttribute("data-lowend", ""));
  const sidebar = await page.locator("nav[class*='tabbar']").first().evaluate((el) => getComputedStyle(el).backdropFilter);
  const blurOn = /blur/.test(sidebar);
  check(lowend || clear ? !blurOn : blurOn, `${label}: sidebar backdrop-filter = ${sidebar}`);

  await page.getByRole("button", { name: /^上車/ }).click();
  const ride = page.locator("[class*='ride']").first();
  await ride.waitFor({ timeout: 5000 });
  const rideBlur = await ride.evaluate((el) => getComputedStyle(el).backdropFilter);
  check(lowend || clear ? !/blur/.test(rideBlur) : /blur/.test(rideBlur), `${label}: blur behind the ride = ${rideBlur}`);
  const t0 = Date.now();
  await page.getByRole("button", { name: "直接感應" }).click();
  // The car is the element whose CSS-module class ends in "car" (not "card").
  await page.waitForFunction(() => [...document.querySelectorAll("[data-metro-ride] *")].some((el) => [...el.classList].some((c) => /(^|_)car$/.test(c))), null, { timeout: 5000 });
  const anim = await page.evaluate(() => {
    const el = [...document.querySelectorAll("[data-metro-ride] *")].find((e) => [...e.classList].some((c) => /(^|_)car$/.test(c)));
    return el ? getComputedStyle(el).animationName : "missing";
  });
  const still = anim === "none";
  check(reducedMotion === "reduce" || lowend ? still : !still, `${label}: the car's animation = ${anim}`);
  await page.waitForURL(/\/station\//, { timeout: 15_000 });
  const ms = Date.now() - t0;
  check(reducedMotion === "reduce" || lowend ? ms < 2500 : ms > 1500, `${label}: the ride reached the station in ${ms}ms`);
  await ctx.close();
}
await run("default", {});
await run("low-end", { lowend: true });
await run("reduced motion", { reducedMotion: "reduce" });
await run("reduced transparency", { clear: true });
await browser.close();
console.log(results.join("\n"));
console.log(errors.length ? `page errors:\n${errors.join("\n")}` : "page errors: 0");
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`${results.length} checks, ${fails} failing`);
process.exit(fails || errors.length ? 1 : 0);

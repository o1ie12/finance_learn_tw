/**
 * Google sign-in is on hold (SHIP-LOG step 4): no Google sign-in or linking
 * UI anywhere a student goes, signed out or in, and the Google routes send
 * the visitor back to /signup.
 *
 *   BASE_URL=http://localhost:3210 node tests/e2e/google-e.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const results = [];
const check = (ok, what) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
const code = (await (await fetch(BASE + "/api/signup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "谷歌走查", grade: "高二" }) })).json()).access_code;

const browser = await chromium.launch();
for (const signedIn of [false, true]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  if (signedIn) await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((n, i) => ({ name: n, value: i ? "1" : code, domain: "localhost", path: "/" })));
  const page = await ctx.newPage();
  for (const path of ["/", "/signup", "/signup#login", "/dashboard", "/settings", "/class", "/class/play", "/class/life/play", "/today"]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    const google = await page.locator("a, button, form").filter({ hasText: /Google/i }).count();
    const hrefs = await page.locator('a[href*="/api/auth/google"], form[action*="/api/auth/google"]').count();
    check(google === 0 && hrefs === 0, `${signedIn ? "signed in" : "signed out"} ${path} → ${new URL(page.url()).pathname}: no Google control`);
  }
  await ctx.close();
}
for (const path of ["/api/auth/google/start?intent=signin", "/api/auth/google/start?intent=link", "/api/auth/google/callback?code=x", "/signup/google"]) {
  const res = await fetch(BASE + path, { redirect: "manual" });
  const to = res.headers.get("location") ?? "";
  check(res.status >= 300 && res.status < 400 && /\/signup/.test(to), `${path} → ${res.status} ${to.replace(BASE, "")}`);
}
await browser.close();
console.log(results.join("\n"));
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`${results.length} checks, ${fails} failing`);
process.exit(fails ? 1 : 0);

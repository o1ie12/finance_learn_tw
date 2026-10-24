/**
 * 06 E18 screenshots: writes docs/design/screens/<name>-<viewport>-<scheme>.png
 * for each page given, at 390×844 and 1440×900, light and dark. Ryan reviews
 * screenshots, not code. Needs a local dev server (file store):
 *
 *   BASE_URL=http://localhost:3210 node scripts/shots-design.mjs name=/path [name=/path ...]
 *   options: --phone-only  --full (full-page capture)  --cookie=<fs_access_code>
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const args = process.argv.slice(2);
const pages = args.filter((a) => !a.startsWith("--")).map((a) => [a.slice(0, a.indexOf("=")), a.slice(a.indexOf("=") + 1)]);
const phoneOnly = args.includes("--phone-only");
const full = args.includes("--full");
const code = args.find((a) => a.startsWith("--cookie="))?.slice(9);
const OUT = new URL("../docs/design/screens/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const viewports = phoneOnly ? [[390, 844]] : [[390, 844], [1440, 900]];
const browser = await chromium.launch();
for (const scheme of ["light", "dark"]) {
  for (const [w, h] of viewports) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: 2 });
    if (code) {
      await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((name, i) => ({ name, value: i ? "1" : code, domain: "localhost", path: "/" })));
    }
    const page = await ctx.newPage();
    for (const [name, path] of pages) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      // Next's dev-only badge is not part of the design.
      await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
      await page.waitForTimeout(500);
      const file = `${OUT}${name}-${w}x${h}-${scheme}.png`;
      await page.screenshot({ path: file, fullPage: full });
      console.log(file.replace(OUT, "docs/design/screens/"));
    }
    await ctx.close();
  }
}
await browser.close();

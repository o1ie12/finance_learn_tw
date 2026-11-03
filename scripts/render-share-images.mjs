/**
 * 11 META-1, UI-2: renders public/og.png (1200 × 630: the logo and 「理財，
 * 一站一站學。」, nothing else), public/apple-touch-icon.png (180, full
 * bleed) and public/icon-512.png from app/icon.svg. Rerun after a logo change:
 *
 *   node scripts/render-share-images.mjs
 */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const svg = readFileSync(new URL("../app/icon.svg", import.meta.url), "utf8");
const out = (name) => new URL(`../public/${name}`, import.meta.url).pathname;
const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@500;900&family=Barlow+Condensed:wght@600&display=block">';

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<!doctype html><html lang="zh-Hant-TW"><head><meta charset="utf-8">${fonts}<style>
  html,body{margin:0;width:1200px;height:630px;background:#f2f3f4;color:#14171a}
  body{display:flex;flex-direction:column;justify-content:center;padding:0 110px;box-sizing:border-box;gap:44px}
  .mark{display:flex;align-items:center;gap:26px}
  .mark svg{width:112px;height:112px}
  .name{font:900 76px/1 "Noto Sans TC",sans-serif}
  .en{font:600 40px/1 "Barlow Condensed",sans-serif;color:#5b636b;margin-left:4px}
  .line{font:900 104px/1.15 "Noto Sans TC",sans-serif;letter-spacing:-0.01em}
</style></head><body>
  <div class="mark">${svg}<span class="name">錢途</span><span class="en">Finline</span></div>
  <div class="line">理財，一站一站學。</div>
</body></html>`);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
await page.screenshot({ path: out("og.png") });

for (const [size, name, bleed] of [[180, "apple-touch-icon.png", true], [512, "icon-512.png", false]]) {
  await page.setViewportSize({ width: size, height: size });
  const icon = bleed ? svg.replace('rx="7"', 'rx="0"') : svg;
  await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style></head><body>${icon}</body></html>`);
  await page.screenshot({ path: out(name), omitBackground: !bleed });
}
await browser.close();
console.log("og.png, apple-touch-icon.png, icon-512.png");

/**
 * 06 E9.4 review gate: every world with the character in all 8 outfit
 * colors, as one contact strip per scene (docs/design/screens/scene-<kind>.png),
 * plus the measured contrast between the character's edge (its dark outline,
 * or the light rim where the scene has one) and the scene behind the
 * character (E9.1.4 asks ≥ 3:1). Local dev server only.
 *
 *   BASE_URL=http://localhost:3210 node scripts/review-scenes.mjs
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const OUT = new URL("../docs/design/screens/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const KINDS = ["platform", "xinyong", "qixin", "cunqian", "touzi", "baoxian", "zhapian", "zhiya", "xuedai", "baoshui", "zuwu", "chuangye", "caiwujuece"];
const RIM = new Set(["platform", "qixin", "touzi", "zhapian", "caiwujuece"]);
const lum = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const browser = await chromium.launch();
const rows = [];
for (const scheme of ["light", "dark"]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme });
  const page = await ctx.newPage();
  for (const kind of KINDS) {
    // The scene alone: mean color around the character's outline.
    await page.goto(`${BASE}/dev/character?scene=${kind}&color=none`, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    const buf = await page.screenshot({ clip: { x: 104, y: 217, width: 182, height: 265 } });
    const px = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = new OffscreenCanvas(img.width, img.height);
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, img.width, img.height).data;
      let r = 0, gg = 0, bb = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; bb += d[i + 2]; n++; }
      return [r / n, gg / n, bb / n];
    }, buf.toString("base64"));
    const bg = lum(px);
    // In dark mode the rim is on in every scene (character.module.css).
    const rim = RIM.has(kind) || scheme === "dark";
    const edge = rim ? Math.max(ratio(bg, lum([27, 36, 48])), ratio(bg, lum([255, 255, 255]))) : ratio(bg, lum([27, 36, 48]));
    rows.push(`${edge >= 3 ? "ok  " : "LOW "} ${scheme} ${kind.padEnd(11)} edge ${edge.toFixed(1)}:1 ${rim ? "(rim)" : "(outline)"}`);
    if (scheme === "light" || kind === "platform" || RIM.has(kind)) {
      const tiles = [];
      for (let c = 0; c < 8; c++) {
        await page.goto(`${BASE}/dev/character?scene=${kind}&color=${c}`, { waitUntil: "networkidle" });
        await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
        tiles.push((await page.screenshot({ clip: { x: 0, y: 100, width: 390, height: 520 } })).toString("base64"));
      }
      await page.setContent(`<body style="margin:0;display:flex">${tiles.map((t) => `<img src="data:image/png;base64,${t}" style="width:195px">`).join("")}</body>`);
      await page.setViewportSize({ width: 195 * 8, height: 260 });
      await page.screenshot({ path: `${OUT}scene-${kind}-${scheme}.png` });
      await page.setViewportSize({ width: 390, height: 844 });
    }
  }
  await ctx.close();
}
await browser.close();
console.log(rows.join("\n"));

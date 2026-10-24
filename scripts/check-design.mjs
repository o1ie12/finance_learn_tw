/**
 * 06 E18, the browser checks, against a local dev server on the file store:
 *   no-scroll at 390×844, 375×667, 360×740 and 1440×900, light and dark;
 *   200% text: no horizontal overflow, the primary button inside the view;
 *   targets ≥ 44×44 and ≥ 8px apart; no visible text under 12px;
 *   a focus outline ≥ 2px on every tab stop; reduced motion: no transform
 *   animations; layout shift < 0.1; ≤ 4 font requests and no CJK preload.
 *
 *   BASE_URL=http://localhost:3210 node scripts/check-design.mjs --cookie=<code> name=/path[!noscroll] ...
 *   A page marked !gallery skips the no-scroll check (a gallery is meant to scroll).
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const args = process.argv.slice(2);
const code = args.find((a) => a.startsWith("--cookie="))?.slice(9);
const pages = args
  .filter((a) => !a.startsWith("--"))
  .map((a) => {
    const name = a.slice(0, a.indexOf("="));
    let path = a.slice(a.indexOf("=") + 1);
    const gallery = path.endsWith("!gallery");
    if (gallery) path = path.slice(0, -8);
    return { name, path, gallery };
  });

const results = [];
const check = (ok, what) => {
  results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
  console.log(`${ok ? "ok  " : "FAIL"} ${what}`);
};

const browser = await chromium.launch();
async function ctxFor(opts) {
  const ctx = await browser.newContext(opts);
  if (code) await ctx.addCookies(["fs_access_code", "fs_signed_in"].map((name, i) => ({ name, value: i ? "1" : code, domain: "localhost", path: "/" })));
  return ctx;
}
async function open(ctx, path) {
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await page.waitForTimeout(400);
  return page;
}

for (const p of pages) {
  // ---- no-scroll, every viewport and scheme ----
  if (!p.gallery) {
    for (const scheme of ["light", "dark"]) {
      for (const [w, h] of [[390, 844], [375, 667], [360, 740], [1440, 900]]) {
        const ctx = await ctxFor({ viewport: { width: w, height: h }, colorScheme: scheme });
        const page = await open(ctx, p.path);
        const m = await page.evaluate(() => ({ sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth }));
        check(m.sh <= m.ih + 1 && m.sw <= m.iw + 1, `${p.name} ${w}x${h} ${scheme}: no page scroll (${m.sw}x${m.sh} in ${m.iw}x${m.ih})`);
        await ctx.close();
      }
    }
  }

  const ctx = await ctxFor({ viewport: { width: 390, height: 844 } });
  const fonts = [];
  ctx.on("request", (r) => {
    if (r.resourceType() === "font") fonts.push(r.url());
  });
  const page = await open(ctx, p.path);

  // ---- fonts ----
  const preloads = await page.$$eval('link[rel="preload"][as="font"]', (ls) => ls.map((l) => l.getAttribute("href") ?? ""));
  check(fonts.length <= 4, `${p.name}: ${fonts.length} font requests before interaction (≤ 4)`);
  check(!preloads.some((h) => /noto|huninn|tc|cjk/i.test(h)), `${p.name}: no CJK font preloaded`);

  // ---- targets, type floor ----
  const t = await page.evaluate(() => {
    const els = [...document.querySelectorAll('button, a, [role="radio"], [role="tab"], [role="checkbox"]')].filter((e) => {
      if (e.closest("p")) return false; // inline links in a paragraph are exempt
      if (e.matches(".sr-only:not(:focus)")) return false; // a skip link is hidden until focused
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden";
    });
    const rects = els.map((e) => ({ e, r: e.getBoundingClientRect() }));
    const small = rects.filter(({ r }) => r.width < 44 - 0.5 || r.height < 44 - 0.5).map(({ e, r }) => `${e.tagName.toLowerCase()} "${(e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 12)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    const gap = (a, b) => Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right), Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom));
    const close = [];
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i];
        const b = rects[j];
        if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
        // Tabs in one bar and segments of one control sit edge to edge by
        // design (E7.13: four equal ~97×49 tabs); they count as one group.
        const group = (e) => e.closest('[role="tablist"], nav, [role="radiogroup"]');
        if (group(a.e) && group(a.e) === group(b.e)) continue;
        const d = gap(a.r, b.r);
        if (d < 8 - 0.5) close.push(`${(a.e.textContent || a.e.getAttribute("aria-label") || "").trim().slice(0, 8)} / ${(b.e.textContent || b.e.getAttribute("aria-label") || "").trim().slice(0, 8)} ${d.toFixed(0)}px`);
      }
    }
    const tiny = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      if (!el || el.closest("svg, [aria-hidden='true'], .sr-only")) continue;
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 12) tiny.push(`"${n.textContent.trim().slice(0, 10)}" ${fs}px`);
    }
    return { small, close, tiny };
  });
  check(t.small.length === 0, `${p.name}: targets ≥ 44×44${t.small.length ? ` (${t.small.join("; ")})` : ""}`);
  check(t.close.length === 0, `${p.name}: targets ≥ 8px apart${t.close.length ? ` (${t.close.slice(0, 6).join("; ")})` : ""}`);
  check(t.tiny.length === 0, `${p.name}: no text under 12px${t.tiny.length ? ` (${t.tiny.slice(0, 6).join("; ")})` : ""}`);

  // ---- focus ----
  const noRing = [];
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    const f = await page.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      const cs = getComputedStyle(e);
      return { name: (e.textContent || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 12), ok: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2 };
    });
    if (!f) break;
    if (!f.ok) noRing.push(f.name);
  }
  check(noRing.length === 0, `${p.name}: every tab stop shows a ≥ 2px focus outline${noRing.length ? ` (missing: ${[...new Set(noRing)].join("; ")})` : ""}`);
  await ctx.close();

  // ---- 200% text (screens only; a gallery is not a screen) ----
  if (!p.gallery) {
    const c = await ctxFor({ viewport: { width: 390, height: 844 } });
    const pg = await open(c, p.path);
    await pg.addStyleTag({ content: "html{font-size:200%!important}" });
    await pg.waitForTimeout(300);
    const m = await pg.evaluate(() => {
      const btn = document.querySelector("[class*='primary']");
      const r = btn?.getBoundingClientRect();
      return { sw: document.scrollingElement.scrollWidth, iw: innerWidth, btnIn: !r || (r.bottom <= innerHeight + 1 && r.top >= 0) };
    });
    check(m.sw <= m.iw + 1, `${p.name}: 200% text, no horizontal overflow (${m.sw} in ${m.iw})`);
    if (!p.gallery) check(m.btnIn, `${p.name}: 200% text, the primary button stays inside the view`);
    await c.close();
  }

  // ---- reduced motion, layout shift ----
  {
    const c = await ctxFor({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await c.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    const pg = await open(c, p.path);
    const m = await pg.evaluate(() => ({
      transforms: document
        .getAnimations()
        .filter((a) => a.playState === "running" && (a.effect?.getKeyframes?.() ?? []).some((k) => "transform" in k)).length,
      cls: window.__cls,
    }));
    check(m.transforms === 0, `${p.name}: reduced motion, ${m.transforms} running transform animations (0)`);
    check(m.cls < 0.1, `${p.name}: layout shift ${m.cls.toFixed(3)} (< 0.1)`);
    await c.close();
  }
}

await browser.close();
const failed = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`\ncheck-design: ${results.length} checks, ${failed} failed`);
process.exit(failed ? 1 : 0);

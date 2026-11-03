/**
 * 11 meta-e, redirect-e, minutes-e, a11y-e on the public pages, against a
 * local dev server:
 *   - every public route: its own title, description, canonical (on
 *     NEXT_PUBLIC_SITE_URL), og:title, og:description, og:image; no two share
 *     a title;
 *   - the landing's minutes range is the min and max of the station data,
 *     and its stop count is FLOW_STEPS.length;
 *   - the old production host and the bare domain 308 to www, keeping the path;
 *   - tap targets on the public pages are 44px or more (links inside a
 *     sentence, in a p or dd, are exempt as inline text).
 *
 *   BASE_URL=http://localhost:3210 npx tsx tests/e2e/public-e.mts
 */
import { FLOW_STEPS } from "@/content/flow";
import { LINES } from "@/lib/lines";
import { lineFacts } from "@/lib/stationFacts";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const results: string[] = [];
const check = (ok: boolean, what: string) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
const PUBLIC = ["/", "/lines", "/about", "/partnerships", "/privacy", "/terms", "/signup", "/transfer", ...LINES.map((l) => `/line/${l.slug}`)];
const attr = (html: string, re: RegExp) => html.match(re)?.[1]?.replace(/&amp;/g, "&") ?? "";

const titles = new Map<string, string>();
for (const path of PUBLIC) {
  const html = await (await fetch(BASE + path)).text();
  const title = attr(html, /<title>([^<]*)<\/title>/);
  const desc = attr(html, /<meta name="description" content="([^"]*)"/);
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
  const ogT = attr(html, /<meta property="og:title" content="([^"]*)"/);
  const ogD = attr(html, /<meta property="og:description" content="([^"]*)"/);
  const ogI = attr(html, /<meta property="og:image" content="([^"]*)"/);
  check(!!title && !!desc && !!ogT && !!ogD, `${path}: title, description, og:title, og:description`);
  check(new URL(canonical || "http://x/none").pathname === path, `${path}: canonical ${canonical}`);
  check(/\/og\.png$/.test(ogI), `${path}: og:image ${ogI}`);
  if (titles.has(title)) check(false, `${path}: title 「${title}」 also on ${titles.get(title)}`);
  titles.set(title, path);
}

const landing = (await (await fetch(BASE + "/")).text()).replace(/<!--[\s\S]*?-->/g, "");
const minutes = LINES.flatMap((l) => lineFacts(l).stations.map((s) => s.minutes));
const range = `一站約 ${Math.min(...minutes)} 到 ${Math.max(...minutes)} 分鐘，${FLOW_STEPS.length} 個停靠`;
check(landing.includes(range), `the landing says 「${range}」`);

// fetch drops a custom Host header; node:http sends it.
const { request } = await import("node:http");
const viaHost = (host: string) =>
  new Promise<{ status: number; location: string }>((done, fail) => {
    const u = new URL(BASE + "/lines?x=1");
    request({ hostname: u.hostname, port: u.port, path: u.pathname + u.search, headers: { host } }, (r) => {
      r.resume();
      done({ status: r.statusCode ?? 0, location: String(r.headers.location ?? "") });
    })
      .on("error", fail)
      .end();
  });
for (const host of ["finance-learn-tw.vercel.app", "finlinetw.org"]) {
  const r = await viaHost(host);
  check(r.status === 308 && r.location === "https://www.finlinetw.org/lines?x=1", `${host} → ${r.status} ${r.location}`);
}

const { chromium } = await import("playwright");
const browser = await chromium.launch();
for (const [W, H] of [[1440, 900], [390, 844]]) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  for (const path of ["/", "/lines", "/about", "/partnerships", "/privacy", "/terms", "/signup", "/line/zhiya"]) {
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 180_000 });
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('a, button, [role="radio"], label:has(input)')]
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && !e.closest("p, dd, .sr-only, nextjs-portal") && (r.width < 43.5 || r.height < 43.5);
        })
        .map((e) => `${(e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 12)} ${Math.round(e.getBoundingClientRect().width)}×${Math.round(e.getBoundingClientRect().height)}`),
    );
    check(small.length === 0, `${W} ${path}: tap targets ≥ 44px${small.length ? ` (${small.slice(0, 4).join(" / ")})` : ""}`);
  }
  await page.close();
}
await browser.close();

console.log(results.filter((r) => r.startsWith("FAIL")).join("\n"));
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`public-e: ${results.length} checks, ${fails} failing`);
process.exit(fails ? 1 : 0);

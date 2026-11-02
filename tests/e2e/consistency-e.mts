/**
 * 10 DATA-1, DATA-2 (consistency-e): every station's name, minutes and
 * question count, and every line's totals, read the same on each surface as
 * in lib/stationFacts: the line page, the station page, the map, the /lines
 * board and 今天 (for the station 今天 offers). Plain fetches, no browser.
 *
 *   BASE_URL=http://localhost:3210 npx tsx tests/e2e/consistency-e.mts
 */
import { LINES } from "@/lib/lines";
import { lineFacts } from "@/lib/stationFacts";
import { terminalLesson } from "@/lib/tasks/registry";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const json = { "content-type": "application/json" };

const results: string[] = [];
const check = (ok: boolean, what: string) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
/** The page's visible text, tags turned into "|". */
const text = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "|")
    .replace(/\|+/g, "|");

const code = (await (await fetch(BASE + "/api/signup", { method: "POST", headers: json, body: JSON.stringify({ name: "一致性走查", grade: "高二" }) })).json()).access_code;
const cookie = `fs_access_code=${code}; fs_signed_in=1`;
await fetch(BASE + "/api/goal", { method: "POST", headers: { ...json, cookie }, body: JSON.stringify({ skip: true }) });
const get = async (p: string) => text(await (await fetch(BASE + p, { headers: { cookie } })).text());

const [map, board, today] = await Promise.all([get("/map"), get("/lines"), get("/today")]);
let stations = 0;
for (const line of LINES) {
  const f = lineFacts(line);
  const page = await get(`/line/${line.slug}`);
  check(page.includes(`約 ${f.minutes} 分鐘`), `${line.name}: line page total 約 ${f.minutes} 分鐘`);
  check(map.includes(`${line.name}|0 / ${f.total} 站`) || map.includes(`0 / ${f.total} 站`), `${line.name}: map 0 / ${f.total} 站`);
  check(board.includes(`${f.total} 站 · ${f.minutes} 分鐘`), `${line.name}: /lines ${f.total} 站 · ${f.minutes} 分鐘`);
  let cursor = 0;
  const names = f.stations.map((s) => s.name);
  // A content decision, so a warning: the report lists it.
  if (new Set(names).size !== names.length) results.push(`WARN ${line.name}: two stations share a name (${names.join("、")})`);
  for (const s of f.stations) {
    stations++;
    // Line page: rows in order; each names the station and its minutes.
    const at = page.indexOf(`|${s.code}|${s.name}|`, cursor);
    if (at >= 0) cursor = at + s.name.length;
    const row = at >= 0 ? page.slice(at, page.indexOf("分鐘", at) + 2) : "";
    check(row.endsWith(`|${s.minutes}|分鐘`), `${s.code} ${s.name}: line page ${s.minutes} 分鐘${row ? "" : " (name missing)"}`);
    // Station page (task stations and task last stations).
    const href = s.terminal ? (terminalLesson(line.slug) ? `/line/${line.slug}/end` : null) : `/line/${line.slug}/station/${s.number}`;
    if (href && s.questions !== null) {
      const st = await get(href);
      check(st.includes(s.name) && st.includes(`約 ${s.minutes} 分鐘 · ${s.questions} 題`), `${s.code} ${s.name}: station page 約 ${s.minutes} 分鐘 · ${s.questions} 題`);
    }
    if (today.includes(`|${s.name}|`) && today.includes(s.code)) {
      check(today.includes(`約 ${s.minutes} 分鐘`), `${s.code} ${s.name}: 今天 約 ${s.minutes} 分鐘`);
    }
  }
}
console.log(results.join("\n"));
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`consistency-e: ${stations} stations, ${results.length} checks, ${fails} failing`);
process.exit(fails ? 1 : 0);

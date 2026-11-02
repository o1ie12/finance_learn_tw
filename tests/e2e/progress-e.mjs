/**
 * 10 PROG-1 to PROG-3 (progress-e), through the real APIs on a local dev
 * store, plain fetches:
 *   A. a new student does only 信用線's last station: no stamp, no
 *      certificate, the line not done, its first station is next;
 *   B. a new student does the stations first: still nothing until the last
 *      one; then the stamp, the certificate and 已完成 all appear;
 *   C. fail and leave: the station is not done and shows 做到一半; fail
 *      again: done (05 A6, second attempt).
 *
 *   BASE_URL=http://localhost:3210 node tests/e2e/progress-e.mjs
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3210";
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error("local dev server only");
const json = { "content-type": "application/json" };
const results = [];
const check = (ok, what) => results.push(`${ok ? "ok  " : "FAIL"} ${what}`);
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "|").replace(/\|+/g, "|");

async function student(name) {
  const code = (await (await fetch(BASE + "/api/signup", { method: "POST", headers: json, body: JSON.stringify({ name, grade: "高二" }) })).json()).access_code;
  const cookie = `fs_access_code=${code}; fs_signed_in=1`;
  await fetch(BASE + "/api/goal", { method: "POST", headers: { ...json, cookie }, body: JSON.stringify({ skip: true }) });
  const post = async (p, body) => {
    const r = await fetch(BASE + p, { method: "POST", headers: { ...json, cookie }, body: JSON.stringify(body) });
    return { status: r.status, body: await r.json().catch(() => null) };
  };
  const raw = async (p) => (await fetch(BASE + p, { headers: { cookie } })).text();
  const get = async (p) => text(await raw(p));
  return { post, get, raw };
}
// 信用線: 信用站 (4) and 卡片站 (7), then 護卡站 (the last station, a task set).
const STATIONS = [
  ["xinyong.bank.v1", 4],
  ["xinyong.statement.v1", 7],
];
const station = (s, id) => s.post("/api/task", { taskSetId: id, answers: {}, hookAnswer: null });
const last = (s) => s.post("/api/simulation", { line_slug: "xinyong", taskSetId: "xinyong.protect.v1", answers: {}, hookAnswer: null });
const stampCount = async (s) => Number((await s.get("/passport")).match(/目前 (\d+) \/ 12 個戳章/)?.[1] ?? NaN);
const certEarned = async (s) => !(await s.get("/line/xinyong/certificate")).includes("就拿到證書");

// A. Only the last station.
{
  const s = await student("進度走查A");
  const r = await last(s);
  check(r.status === 200, `A: the last station alone can be played (${r.status})`);
  check((await stampCount(s)) === 0, "A: no stamp after only the last station");
  check(!(await certEarned(s)), "A: no certificate after only the last station");
  const line = await s.get("/line/xinyong");
  check(!line.includes("已走完"), "A: the line page does not say 已走完");
  const map = await s.get("/map");
  check(!/信用線\|已完成/.test(map), "A: the map does not mark 信用線 已完成");
}

// B. The stations first, then the last one.
{
  const s = await student("進度走查B");
  // Each station twice: done on the second attempt even with empty answers (A6).
  for (const [id] of STATIONS) {
    await station(s, id);
    await station(s, id);
  }
  await new Promise((r) => setTimeout(r, 500)); // progress is written after the response (PERF-1)
  check((await stampCount(s)) === 0, "B: every station but the last: no stamp");
  check(!(await certEarned(s)), "B: every station but the last: no certificate");
  await last(s);
  await new Promise((r) => setTimeout(r, 500));
  check((await stampCount(s)) === 1, "B: the last station done too: the stamp appears");
  check(await certEarned(s), "B: and the certificate");
  check((await s.get("/line/xinyong")).includes("已走完") || (await s.get("/map")).includes("已完成"), "B: and the line shows done");
}

// C. Fail and leave, then fail again.
{
  const s = await student("進度走查C");
  const r1 = await station(s, STATIONS[0][0]);
  check(r1.body && !r1.body.passed && !r1.body.stationDone, "C: a failed first attempt does not finish the station");
  await new Promise((r) => setTimeout(r, 300));
  check((await s.get("/today")).includes("做到一半"), "C: 今天 shows 做到一半");
  // The map shows it in the station's sheet, drawn from the page's data.
  check((await s.raw("/map")).includes("做到一半"), "C: the map's station sheet says 做到一半");
  const r2 = await station(s, STATIONS[0][0]);
  check(r2.body?.stationDone === true, "C: a second failed attempt finishes the station (A6)");
  await new Promise((r) => setTimeout(r, 300));
  check(!(await s.raw("/map")).includes("做到一半"), "C: then 做到一半 is gone");
}

console.log(results.join("\n"));
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`progress-e: ${results.length} checks, ${fails} failing`);
process.exit(fails ? 1 : 0);

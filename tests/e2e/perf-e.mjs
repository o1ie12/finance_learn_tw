/**
 * 10 PERF-1: one test student submits a station task 20 times; fails when
 * p95 of submit → response is over 3 s. Prints p50/p75/p95 and the median of
 * each Server-Timing entry, so a slow run says which await was slow.
 *
 *   BASE_URL=http://localhost:3210 node tests/e2e/perf-e.mjs
 *   BASE_URL=https://<preview>.vercel.app PERF_REMOTE=1 VERCEL_BYPASS=<secret> node tests/e2e/perf-e.mjs
 *
 * A protected preview (401) needs Vercel's "Protection Bypass for
 * Automation" secret (Project Settings → Deployment Protection) in
 * VERCEL_BYPASS; it is sent as the x-vercel-protection-bypass header.
 *
 * A remote run creates one test student (名字「效能測試」) in that
 * deployment's database, so it needs PERF_REMOTE=1 and a *.vercel.app
 * preview URL; it refuses the production domain.
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3210";
const local = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE);
if (!local) {
  if (process.env.PERF_REMOTE !== "1") throw new Error("remote runs need PERF_REMOTE=1");
  if (!/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(BASE) || /finance-learn-tw\.vercel\.app/.test(BASE)) throw new Error("preview URLs only, never production");
}
const RUNS = Number(process.env.RUNS ?? 20);
const TASK = process.env.TASK ?? "cunqian.compound.v1";
const json = { "content-type": "application/json", ...(process.env.VERCEL_BYPASS ? { "x-vercel-protection-bypass": process.env.VERCEL_BYPASS } : {}) };

const signup = await fetch(BASE + "/api/signup", { method: "POST", headers: json, body: JSON.stringify({ name: "效能測試", grade: "高二" }) });
if (signup.status === 401) throw new Error("the preview is behind Vercel's login: set VERCEL_BYPASS (see the top of this file)");
const code = (await signup.json()).access_code;
const cookie = `fs_access_code=${code}; fs_signed_in=1`;
await fetch(BASE + "/api/goal", { method: "POST", headers: { ...json, cookie }, body: JSON.stringify({ skip: true }) });

const times = [];
const parts = {};
for (let i = 0; i < RUNS; i++) {
  const t0 = performance.now();
  const res = await fetch(BASE + "/api/task", { method: "POST", headers: { ...json, cookie }, body: JSON.stringify({ taskSetId: TASK, answers: {}, hookAnswer: null }) });
  await res.json();
  times.push(performance.now() - t0);
  if (!res.ok) throw new Error(`submit ${i + 1}: ${res.status}`);
  for (const e of (res.headers.get("server-timing") ?? "").split(",")) {
    const m = e.trim().match(/^([\w-]+);dur=([\d.]+)$/);
    if (m) (parts[m[1]] ??= []).push(Number(m[2]));
  }
}
const pct = (xs, p) => [...xs].sort((a, b) => a - b)[Math.min(xs.length - 1, Math.ceil((p / 100) * xs.length) - 1)];
const ms = (x) => `${Math.round(x)} ms`;
console.log(`${BASE} · ${TASK} · ${RUNS} submits`);
console.log(`submit → response: p50 ${ms(pct(times, 50))}, p75 ${ms(pct(times, 75))}, p95 ${ms(pct(times, 95))}, first ${ms(times[0])}`);
console.log("server (median): " + Object.entries(parts).map(([k, v]) => `${k} ${ms(pct(v, 50))}`).join(", "));
const ok = pct(times, 95) <= 3000;
console.log(`${ok ? "ok  " : "FAIL"} p95 ≤ 3 s`);
process.exit(ok ? 0 : 1);

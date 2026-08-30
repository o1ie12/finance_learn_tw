/**
 * Seeds historical_prices — ONE TIME, not run automatically. Run with:
 *   USE_DEV_STORE=1 npx tsx scripts/seed-historical-prices.ts     (dev store)
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-historical-prices.ts  (real DB)
 *
 * The data this writes is real (TWSE + TPEx official daily closes,
 * 2023-06-01 through 2026-08-28) — see lib/historicalPricesSeed.ts's header
 * for sources and licensing.
 *
 * Deliberately does NOT import lib/db.ts: that file (and everything it
 * pulls in) starts with `import "server-only"`, which throws unconditionally
 * outside Next's own build — Next aliases it to a no-op only inside its
 * webpack pipeline. A standalone script run via plain tsx/node is never
 * inside that pipeline, so it duplicates the small amount of storage logic
 * it needs (dev-store read/write, or a direct Supabase upsert) instead.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { generateSeedRows } from "@/lib/historicalPricesSeed";
import { TICKERS } from "@/lib/sims/historicalReplay";

async function seedDevStore(rows: ReturnType<typeof generateSeedRows>) {
  const file = path.join(process.cwd(), ".devstore.json");
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    /* no existing dev store yet — start fresh */
  }
  data.students ??= [];
  data.module_progress ??= [];
  data.simulation_runs ??= [];
  data.coach_messages ??= [];
  data.line_tests ??= [];
  data.class_rooms ??= [];
  data.class_participants ??= [];
  data.sim_portfolios ??= [];

  const key = (r: { ticker: string; date: string }) => `${r.ticker}|${r.date}`;
  const existing = new Map(
    ((data.historical_prices as { ticker: string; date: string }[]) ?? []).map((r) => [key(r), r]),
  );
  for (const row of rows) existing.set(key(row), row);
  data.historical_prices = Array.from(existing.values());

  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
  return rows.length;
}

async function seedSupabase(rows: ReturnType<typeof generateSeedRows>) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (or use USE_DEV_STORE=1).");
  }
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await db.from("historical_prices").upsert(batch, { onConflict: "ticker,date" });
    if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
  }
  return rows.length;
}

async function main() {
  const rows = generateSeedRows();
  console.log(`Seeding ${rows.length} rows across ${TICKERS.length} tickers (real TWSE/TPEx data)…`);

  const count =
    process.env.USE_DEV_STORE === "1" ? await seedDevStore(rows) : await seedSupabase(rows);
  console.log(`Done — ${count} rows written.`);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});

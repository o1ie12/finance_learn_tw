/**
 * SEED DATA FOR historical_prices — SYNTHETIC PLACEHOLDER, NOT REAL PRICES.
 *
 * The spec (section 2b) calls for seeding historical_prices once from real
 * historical data (TWSE or a licensed provider, source terms verified
 * before use) and never fetching live. This session has no way to source
 * and license-verify years of real daily closing prices for six Taiwanese
 * ETFs — that's a data-sourcing task for a human with access to a real
 * provider, not something to fabricate and present as real.
 *
 * So: this file generates a deterministic, clearly-synthetic price series
 * per ticker (seeded pseudo-random walk, no true randomness — same output
 * every run) purely so the drip-feed/portfolio/reveal mechanism in
 * lib/sims/historicalReplay.ts has real rows to query against and can be
 * exercised end to end. The dates are real calendar business days (so the
 * "date" column behaves correctly), but the PRICES ARE MADE UP.
 *
 * Before this feature reaches real students: replace generateSeedRows()'s
 * output with real historical closes from a verified source, loaded via
 * scripts/seed-historical-prices.ts, and populate
 * lib/sims/historicalReplay.ts's EVENT_WINDOWS with the real dates of
 * events like the 2020 crash — only meaningful once the dates are real.
 */

import type { TickerId } from "@/lib/sims/historicalReplay";
import { TICKERS } from "@/lib/sims/historicalReplay";

export interface SeedRow {
  ticker: TickerId;
  date: string; // YYYY-MM-DD
  closing_price: number;
}

// Arbitrary anchor — NOT a real historical date. Business days only.
const ANCHOR_DATE = new Date("2018-01-02T00:00:00Z");
export const SEED_TRADING_DAYS = 520; // ~2 simulated years

// Deterministic PRNG (mulberry32) — same sequence every run, no true
// randomness, so the seed data is reproducible and reviewable.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h;
}

function businessDayDates(count: number): string[] {
  const dates: string[] = [];
  const d = new Date(ANCHOR_DATE);
  while (dates.length < count) {
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) {
      dates.push(d.toISOString().slice(0, 10));
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return dates;
}

interface TickerProfile {
  startPrice: number;
  dailyDrift: number; // avg daily log-return
  dailyVol: number; // daily volatility
}

const PROFILES: Record<TickerId, TickerProfile> = {
  "0050": { startPrice: 85, dailyDrift: 0.0003, dailyVol: 0.011 },
  "0056": { startPrice: 27, dailyDrift: 0.00025, dailyVol: 0.009 },
  "006208": { startPrice: 78, dailyDrift: 0.00031, dailyVol: 0.011 },
  "00878": { startPrice: 18, dailyDrift: 0.00025, dailyVol: 0.008 },
  "00929": { startPrice: 17, dailyDrift: 0.00028, dailyVol: 0.012 },
  "00679B": { startPrice: 35, dailyDrift: 0.00005, dailyVol: 0.005 },
};

// One correction window (equities down, bond up — a rate-driven divergence,
// so "diversification" has a real payoff) and one rally window. Indices
// into the trading-day sequence, not real dates.
const CORRECTION_WINDOW = { start: 240, end: 260 };
const RALLY_WINDOW = { start: 380, end: 400 };

export function generateSeedRows(): SeedRow[] {
  const dates = businessDayDates(SEED_TRADING_DAYS);
  const rows: SeedRow[] = [];

  for (const ticker of TICKERS) {
    const profile = PROFILES[ticker.id];
    const rng = mulberry32(hashSeed(ticker.id));
    let price = profile.startPrice;

    for (let i = 0; i < dates.length; i++) {
      if (i > 0) {
        let drift = profile.dailyDrift;
        let vol = profile.dailyVol;
        const inCorrection = i >= CORRECTION_WINDOW.start && i <= CORRECTION_WINDOW.end;
        const inRally = i >= RALLY_WINDOW.start && i <= RALLY_WINDOW.end;
        if (inCorrection) {
          drift = ticker.kind === "bond" ? 0.003 : -0.012;
          vol = profile.dailyVol * 1.6;
        } else if (inRally) {
          drift = ticker.kind === "bond" ? -0.001 : 0.006;
          vol = profile.dailyVol * 1.3;
        }
        // Box-Muller for a roughly-normal daily return.
        const u1 = Math.max(rng(), 1e-9);
        const u2 = rng();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const dailyReturn = drift + vol * z;
        price = Math.max(price * (1 + dailyReturn), 0.5);
      }
      rows.push({ ticker: ticker.id, date: dates[i], closing_price: Math.round(price * 100) / 100 });
    }
  }

  return rows;
}

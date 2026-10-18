import "server-only";

/**
 * 財務決策線, the finale (04 §13): the buy-vs-rent engine now reads the
 * life-game state as well as the profile, with the same `known` flags and
 * stand-in labels. A value from a game the student has actually played
 * (at least one month) counts as known; otherwise the profile's value and
 * its flag stand, exactly as before.
 */

import { getSoloLifeSave } from "@/lib/db";
import { financialSnapshot, readProfile, type FinancialSnapshot } from "@/lib/studentProfile";
import type { Student } from "@/lib/types";
import { etfValue, timeDepositTotal } from "./stats";
import { STRESS_LABEL, stressLevel } from "./stats";
import { LifeStateSchema, type LifeState } from "./types";
import { syncWithContext } from "./engine";
import { gameContextFor } from "./server";

export interface Journey {
  job: string;
  savingRatePct: number;
  efMonths: number;
  creditRecord: "good" | "fair" | "poor";
  invested: number;
  freedomPct: number;
  stress: string;
  months: number;
}

async function playedState(student: Student): Promise<LifeState | null> {
  const save = await getSoloLifeSave(student.id);
  if (!save) return null;
  const parsed = LifeStateSchema.safeParse(save.state);
  if (!parsed.success || parsed.data.turn === 0) return null;
  // Apply what changed outside the save since its last turn (a line finished,
  // e.g. 職涯線 replacing the starter job), exactly as a load would.
  return syncWithContext(parsed.data, await gameContextFor(student));
}

export async function capstoneSnapshot(student: Student): Promise<{ snap: FinancialSnapshot; journey: Journey | null }> {
  const snap = financialSnapshot(readProfile(student.profile));
  const s = await playedState(student);
  if (!s) return { snap, journey: null };
  const v = etfValue(s);
  const invested = v.etfBroad + v.etfDividend;
  const savings = s.accounts.cash + s.accounts.demand + timeDepositTotal(s) + s.accounts.housingFund;
  const gross = s.job.grossMonthly;
  const merged: FinancialSnapshot = {
    ...snap,
    // Only the student's own 職涯線 job is "known"; a starter job is a stand-in.
    income: { amount: gross, known: s.job.source === "careerLine" },
    savings: { amount: savings, known: true },
    credit: s.unlocked.includes("card") ? { record: s.creditRecord, known: true } : snap.credit,
    invested: invested > 0 ? { amount: invested, hasInvested: true, known: true } : snap.invested,
    savingsBehavior: { direction: "surplus", amount: s.plan.saveFirst, known: true },
    empty: false,
  };
  return {
    snap: merged,
    journey: {
      job: s.job.title,
      savingRatePct: gross > 0 ? Math.round((s.plan.saveFirst / gross) * 100) : 0,
      efMonths: s.stats.efMonths,
      creditRecord: s.creditRecord,
      invested,
      freedomPct: s.stats.freedomPct,
      stress: STRESS_LABEL[stressLevel(s.stats.stress)],
      months: s.turn,
    },
  };
}

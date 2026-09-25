import { findPath, type CareerPath } from "@/lib/sims/careers";
import type { InterestId } from "@/lib/studentProfile";

/**
 * 職涯抉擇模擬 — pick a path, see the shape of its income over time.
 *
 * The teaching point is that paths differ in shape rather than in worth: one
 * trades a long unpaid run-up for a steeper climb, another earns immediately
 * and rises gently. So the outcome is a curve, not a score, and nothing here
 * ranks the options.
 *
 * Every figure originates in lib/sims/careers.ts and this module only
 * arranges them. How well-evidenced any given figure is varies by path and
 * is recorded there, not here — this module must not imply a confidence it
 * cannot see.
 */

export const PROJECTION_MONTHS = 60; // five years

export interface IncomePoint {
  month: number;
  income: number;
}

export interface CareerChoiceOutcome {
  interest: InterestId;
  pathId: string;
  pathName: string;
  rampMonths: number;
  /** Monthly income once earning starts — what 消費 spends. */
  startingIncome: number;
  laterIncome: number;
  /** Total earned across the projection, the honest headline figure. */
  fiveYearTotal: number;
  /** Months earning nothing while training. */
  monthsWithoutIncome: number;
  points: IncomePoint[];
  tradeoff: string;
}

/**
 * Straight-line growth from starting to later income after the ramp.
 *
 * A real curve is not straight. Nobody publishes the curve, though — the
 * sources give an entry figure and a figure some years later, so the shape
 * between them would be invented whether the endpoints are sourced or not.
 * A straight line is the one interpolation that adds no claim of its own.
 */
function incomeAt(path: CareerPath, month: number): number {
  if (month < path.rampMonths) return 0;
  const earning = month - path.rampMonths;
  const span = Math.max(1, PROJECTION_MONTHS - path.rampMonths);
  const progress = Math.min(1, earning / span);
  return Math.round(
    path.startingIncome + (path.laterIncome - path.startingIncome) * progress,
  );
}

export function computeCareerChoice(input: {
  interest: InterestId;
  pathId: string;
}): CareerChoiceOutcome {
  const path = findPath(input.pathId);
  if (!path) throw new Error(`computeCareerChoice: unknown path ${input.pathId}`);

  const points: IncomePoint[] = [];
  let total = 0;
  for (let m = 0; m < PROJECTION_MONTHS; m++) {
    const income = incomeAt(path, m);
    total += income;
    // One point per quarter keeps the payload small and the chart readable.
    if (m % 3 === 0 || m === PROJECTION_MONTHS - 1) {
      points.push({ month: m, income });
    }
  }

  return {
    interest: input.interest,
    pathId: path.id,
    pathName: path.name,
    rampMonths: path.rampMonths,
    startingIncome: path.startingIncome,
    laterIncome: path.laterIncome,
    fiveYearTotal: total,
    monthsWithoutIncome: path.rampMonths,
    points,
    tradeoff: path.tradeoff,
  };
}

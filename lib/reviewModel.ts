import type { LineMeta } from "@/lib/lines";
import type { SimulationRun } from "@/lib/types";

/**
 * 複習站 (review) — pure mechanic, no dedicated content or DB table. A line
 * becomes eligible for review 7 real days after its terminal simulation was
 * completed; eligibility is just a timestamp comparison against the
 * student's existing simulation_runs row for that line, re-checked on every
 * dashboard load. No "acknowledged" state is tracked — a student can revisit
 * a review as many times as they like once it unlocks.
 */
const REVIEW_UNLOCK_DAYS = 7;
const REVIEW_UNLOCK_MS = REVIEW_UNLOCK_DAYS * 24 * 60 * 60 * 1000;

export interface ReviewEligibleLine {
  line: LineMeta;
  completedAt: string;
  daysAgo: number;
}

export function reviewEligibleLines(
  lines: LineMeta[],
  runsByLine: Record<string, SimulationRun>,
): ReviewEligibleLine[] {
  const now = Date.now();
  const eligible: ReviewEligibleLine[] = [];
  for (const line of lines) {
    const run = runsByLine[line.slug];
    if (!run) continue;
    const completedAt = new Date(run.created_at).getTime();
    if (Number.isNaN(completedAt)) continue;
    const elapsed = now - completedAt;
    if (elapsed >= REVIEW_UNLOCK_MS) {
      eligible.push({
        line,
        completedAt: run.created_at,
        daysAgo: Math.floor(elapsed / (24 * 60 * 60 * 1000)),
      });
    }
  }
  return eligible;
}

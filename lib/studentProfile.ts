import { z } from "zod";

/**
 * Cross-line facts about a student.
 *
 * This exists so lines do not read each other's simulation results. 消費 needs
 * the income 職涯線 produced, and the obvious shortcut — reading Earn's
 * simulation_runs row — couples the two lines together permanently and has to
 * be redone the moment a third line wants the same number. Earn writes named
 * fields here; 消費 reads named fields here; neither knows the other exists.
 *
 * Stored as jsonb so adding a field is not a migration (see migration 12).
 * Validated here so that flexibility does not become the silent drift that
 * free-form jsonb produced last time: every read and write goes through this
 * schema, and a field that is absent or malformed comes back undefined rather
 * than as a confident wrong value.
 *
 * Adding a field: add it to StudentProfileSchema as optional, and give it a
 * reader. Existing lines keep working untouched — that is the point of the
 * shape.
 */

/** The interest buckets 職涯線 offers. Deliberately small and reviewable. */
export const INTEREST_BUCKETS = [
  { id: "art", label: "藝術與設計" },
  { id: "tech", label: "科技" },
  { id: "business", label: "商業" },
  { id: "service", label: "服務業" },
  { id: "vocational", label: "技職" },
] as const;

export type InterestId = (typeof INTEREST_BUCKETS)[number]["id"];

export function isInterestId(v: unknown): v is InterestId {
  return INTEREST_BUCKETS.some((b) => b.id === v);
}

export function interestLabel(id: InterestId): string {
  return INTEREST_BUCKETS.find((b) => b.id === id)?.label ?? id;
}

// Every field optional: a profile is built up over time, and a student who
// has not reached a line yet simply has nothing recorded for it.
export const StudentProfileSchema = z.object({
  /** Chosen on 興趣站. Drives which career paths 職涯站 shows. */
  interest: z.enum(["art", "tech", "business", "service", "vocational"]).optional(),
  /** Monthly income resolved by the career simulation, in NT$. */
  monthlyIncome: z.number().int().nonnegative().optional(),
  /** Which career path produced that income, for display and re-entry. */
  careerPathId: z.string().optional(),
  /**
   * Which version of the onboarding tour this student has finished or
   * skipped. A version rather than a boolean so that changing the tour's
   * content can show it again — bump CURRENT_TUTORIAL_VERSION in lib/tour.ts
   * and a stored 1 simply falls behind, with no migration and no backfill.
   */
  tutorialSeenVersion: z.number().int().nonnegative().optional(),
});

export type StudentProfile = z.infer<typeof StudentProfileSchema>;

export const EMPTY_PROFILE: StudentProfile = {};

/**
 * Parse a stored profile. Anything unrecognised or malformed yields an empty
 * profile rather than a partial one, so a caller never receives a field it
 * cannot trust. Unknown keys are dropped, which keeps an older build from
 * choking on a field a newer one wrote.
 */
export function readProfile(raw: unknown): StudentProfile {
  const parsed = StudentProfileSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : EMPTY_PROFILE;
}

/**
 * Merge named fields into a profile. Returns the full object to store.
 * Undefined values are ignored rather than clearing an existing field, so a
 * line writing only what it knows cannot erase another line's contribution.
 */
export function mergeProfile(
  current: unknown,
  patch: StudentProfile,
): StudentProfile {
  const base = readProfile(current);
  const next: StudentProfile = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) {
      (next as Record<string, unknown>)[k] = v;
    }
  }
  return readProfile(next);
}

/**
 * Starting income for 消費 when the student has not done 職涯線 yet.
 *
 * A required path, not a fallback for tidiness: modes and navigation both
 * make it genuinely reachable, and 消費 must not refuse to run or start a
 * student at zero. Deliberately round rather than precise, because it is a
 * stand-in rather than a figure anyone verified.
 */
export const DEFAULT_MONTHLY_INCOME = 30000;

/** The income 消費 should start from, whatever the student has done so far. */
export function startingIncome(profile: StudentProfile): {
  amount: number;
  fromEarnLine: boolean;
} {
  return profile.monthlyIncome != null
    ? { amount: profile.monthlyIncome, fromEarnLine: true }
    : { amount: DEFAULT_MONTHLY_INCOME, fromEarnLine: false };
}

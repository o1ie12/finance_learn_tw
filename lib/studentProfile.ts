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

  // --- the threaded financial state -----------------------------------------
  // Each field below is written by exactly one line and read by later ones.
  // Nothing reads these directly: everything goes through financialSnapshot(),
  // which supplies a documented default for every one of them.

  /** Written by 消費. Whether the month ended over or under, and by how much. */
  savingsBehavior: z
    .object({
      direction: z.enum(["surplus", "shortfall"]),
      amount: z.number().int().nonnegative(),
    })
    .optional(),

  /** Written by 存錢線: what the student actually accumulated. */
  savingsAmount: z.number().int().nonnegative().optional(),

  /**
   * Written by 信用線, as a stable internal value — never the display string.
   *
   * 信用線 shows 「良好」/「普通」 today and may well show different words
   * tomorrow. Storing what the screen happened to say would make a copy edit
   * in one line silently change a mortgage rate in another, which is the same
   * class of break as kind-vs-slug: the identity has to be independent of the
   * label. 'poor' has no producer yet and exists so that adding one later is
   * a change in 信用線 alone.
   */
  creditRecord: z.enum(["good", "fair", "poor"]).optional(),

  /** Written by 投資線: how much ended up actually invested. */
  investedAmount: z.number().int().nonnegative().optional(),
  /** Written by 投資線: whether they invested at all, as opposed to saved or spent. */
  hasInvested: z.boolean().optional(),
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

// --- defaults for the threaded state ----------------------------------------
//
// A student can reach any line without having done the ones before it — modes,
// the route map and a shared URL all make that ordinary rather than an edge
// case. So every field has a stand-in, and every stand-in is round and
// obviously illustrative for the same reason the career placeholders are: a
// precise-looking default reads as the student's own number.
//
// The defaults are also chosen not to flatter. An unknown credit record is
// 'fair', not 'good' — a student who skipped 信用線 has not earned a good
// record, and handing them one would make the capstone's credit consequence
// meaningless for everyone who took the line seriously.

/** Stand-in savings when 存錢線 has not been run. Five months of the default income. */
export const DEFAULT_SAVINGS_AMOUNT = 150000;
/** Stand-in credit record: the middle one, neither earned nor punished. */
export const DEFAULT_CREDIT_RECORD: CreditRecordValue = "fair";

export type CreditRecordValue = "good" | "fair" | "poor";

/**
 * Everything later lines need to know about a student, with a value for every
 * field and a flag saying whether it is theirs or a stand-in.
 *
 * One function rather than a reader per field, because the rule that matters
 * is the one that is easy to forget: no caller should ever see `undefined` and
 * decide for itself what to do about it. Handing back `known` alongside each
 * value lets a screen say "this is a stand-in" honestly instead of presenting
 * a default as a fact.
 */
export interface FinancialSnapshot {
  income: { amount: number; known: boolean };
  savings: { amount: number; known: boolean };
  savingsBehavior: {
    direction: "surplus" | "shortfall";
    amount: number;
    known: boolean;
  };
  credit: { record: CreditRecordValue; known: boolean };
  invested: { amount: number; hasInvested: boolean; known: boolean };
  interest: { id: InterestId | null; known: boolean };
  /** True when the student has done none of the lines that write this. */
  empty: boolean;
}

export function financialSnapshot(profile: StudentProfile): FinancialSnapshot {
  const income = startingIncome(profile);
  const known = {
    income: income.fromEarnLine,
    savings: profile.savingsAmount != null,
    behavior: profile.savingsBehavior != null,
    credit: profile.creditRecord != null,
    invested: profile.hasInvested != null,
    interest: profile.interest != null,
  };
  return {
    income: { amount: income.amount, known: known.income },
    savings: {
      amount: profile.savingsAmount ?? DEFAULT_SAVINGS_AMOUNT,
      known: known.savings,
    },
    savingsBehavior: {
      direction: profile.savingsBehavior?.direction ?? "surplus",
      amount: profile.savingsBehavior?.amount ?? 0,
      known: known.behavior,
    },
    credit: {
      record: profile.creditRecord ?? DEFAULT_CREDIT_RECORD,
      known: known.credit,
    },
    invested: {
      amount: profile.investedAmount ?? 0,
      hasInvested: profile.hasInvested ?? false,
      known: known.invested,
    },
    interest: { id: profile.interest ?? null, known: known.interest },
    empty: !Object.values(known).some(Boolean),
  };
}

/**
 * What 投資線 should suggest the student has available to invest.
 *
 * Prefers what 存錢線 actually produced. A month that ended short is reported
 * as such rather than being silently topped up to the stand-in — telling a
 * student who just overspent that they have money to invest is precisely the
 * kind of cheerful nonsense this line exists to argue against.
 */
export function investableAmount(profile: StudentProfile): {
  amount: number;
  fromSavingsLine: boolean;
  inShortfall: boolean;
} {
  const snap = financialSnapshot(profile);
  return {
    amount: snap.savings.amount,
    fromSavingsLine: snap.savings.known,
    inShortfall:
      snap.savingsBehavior.known &&
      snap.savingsBehavior.direction === "shortfall",
  };
}

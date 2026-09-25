/**
 * The shared contract for simulation results.
 *
 * Every terminal simulation stores a JSON outcome, and several features read
 * it back by field name: the AI coach, the 護照 stamp, and the completion
 * certificate. Nothing used to enforce that those readers and the writer
 * agreed. When 信用線's simulation was replaced, the stored shape changed,
 * three readers kept reaching for fields that no longer existed, and all three
 * rendered confident wrong numbers — NT$0 figures and a housing stamp on a
 * credit-card simulation — while the build stayed green.
 *
 * Two decisions follow from that.
 *
 * `kind` is NOT the line slug. The slug stayed 'xinyong' across that swap,
 * which is exactly why the old and new rows became indistinguishable. `kind`
 * names the SHAPE of the stored outcome and carries a version, so replacing a
 * line's simulation mints a new kind and leaves historical rows readable as
 * what they actually are. A line may have several kinds over its life.
 *
 * Schemas declare exactly the read surface. Each lists the fields some
 * consumer depends on and nothing else; zod strips the rest on parse, so a
 * consumer physically cannot reach a field the contract does not promise.
 * That exactness is deliberate — an earlier draft used .passthrough(), which
 * infers an index signature and let `outcome.totalInterest` typecheck against
 * an investing result. Extra fields on the stored outcome are still fine: the
 * full outcome is what gets persisted, and this schema only governs what
 * consumers may read back.
 */

import { z } from "zod";
import { legacyRecordValue } from "@/lib/sims/creditCard";

// --- kinds ------------------------------------------------------------------
// Append-only. Never reuse or repurpose a kind: old rows still carry it.
// When a line's simulation is replaced, add a new kind, leave the old one
// here, and give it a legacy renderer or let it fall back.

export const SIM_KINDS = [
  "zhiya_career_choice_v1",
  "qixin_salary_v1", // retired — 起薪線 before the 消費 reframe
  "xiaofei_needs_wants_v1",
  "cunqian_savings_v1",
  "xinyong_housing_v1", // retired — 信用線 before the credit-card simulation
  "xinyong_credit_card_v1",
  "touzi_investing_v1",
  "zhapian_fraud_v1",
  "xuedai_student_loan_v1",
  "baoshui_tax_v1",
  "zuwu_lease_v1",
  "baoxian_sales_pitch_v1",
  "chuangye_bubble_tea_v1",
] as const;

export type SimKind = (typeof SIM_KINDS)[number];

/** Kinds that are no longer produced but still exist in stored history. */
export const RETIRED_SIM_KINDS: readonly SimKind[] = [
  "xinyong_housing_v1",
  "qixin_salary_v1",
];

// --- per-kind outcome schemas ----------------------------------------------
// Required fields are the ones a consumer actually reads. Adding a field here
// is a promise that it will keep existing; removing one is a breaking change
// that should mint a new kind.

const zhiyaCareerOutcome = z.object({
  interest: z.enum(["art", "tech", "business", "service", "vocational"]),
  pathId: z.string(),
  pathName: z.string(),
  // What 消費 spends. Declared here because a consumer depends on it, which
  // is the whole rule for what belongs in one of these schemas.
  startingIncome: z.number(),
  fiveYearTotal: z.number(),
  monthsWithoutIncome: z.number(),
});

const qixinOutcome = z
  .object({
    leftover: z.number(),
    deficit: z.boolean(),
    annualSavings: z.number(),
  });

const xiaofeiOutcome = z.object({
  income: z.number(),
  incomeFromCareer: z.boolean(),
  needsTotal: z.number(),
  wantsTotal: z.number(),
  savings: z.number(),
  underfunded: z.array(z.string()),
  absorbedShortfall: z.boolean(),
  shortfallGap: z.number(),
  verdict: z.enum(["comfortable", "tight", "short"]),
});

const cunqianOutcome = z
  .object({
    goal: z.object({ label: z.string(), amount: z.number() }),
    user: z
      .object({ finalAmount: z.number(), reachedGoal: z.boolean() })
      ,
    resistAll: z.object({ finalAmount: z.number() }),
    giveInAll: z.object({ finalAmount: z.number() }),
  });

const xinyongHousingOutcome = z
  .object({
    chosen: z.object({ leftover: z.number() }),
  });

const xinyongCreditCardOutcome = z
  .object({
    totalPaid: z.number(),
    totalInterest: z.number(),
    totalIfNoInterest: z.number(),
    creditRecord: z.enum(["良好", "普通"]),
    // Optional, not required, and deliberately so: rows written before the
    // stable value existed are still perfectly readable, and making this
    // required would turn every one of them into UNREADABLE_RESULT_TEXT for
    // the coach, the stamp and the certificate. Read it through
    // creditRecordOf(), which falls back to mapping the label for those rows.
    record: z.enum(["good", "fair", "poor"]).optional(),
    rounds: z.array(z.object({ carryOut: z.number() })),
  });

const touziOutcome = z
  .object({
    start: z.number(),
    chosen: z
      .object({
        id: z.string(),
        label: z.string(),
        low: z.number(),
        high: z.number(),
        taxOnMidSale: z.number(),
      })
      ,
  });

const zhapianOutcome = z
  .object({ correct: z.number(), total: z.number() });

const xuedaiOutcome = z.object({ loanCoversPct: z.number() });

// `character` is the whole chosen character object, not its id — the stamp
// previously read the id off spending_choices instead, which is why this
// mismatch only surfaced once the two were validated against each other.
const baoshuiOutcome = z.object({
  character: z.object({ id: z.string() }),
});

const zuwuOutcome = z
  .object({
    correctFlags: z.number(),
    totalBad: z.number(),
    falseFlags: z.array(z.unknown()),
  });

const baoxianOutcome = z
  .object({ allDeclined: z.boolean(), boughtSavings: z.boolean() });

const chuangyeOutcome = z
  .object({ survived: z.boolean(), priceId: z.string() });

// --- the union --------------------------------------------------------------

export const SimResultSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("zhiya_career_choice_v1"), outcome: zhiyaCareerOutcome }),
  z.object({ kind: z.literal("qixin_salary_v1"), outcome: qixinOutcome }),
  z.object({ kind: z.literal("xiaofei_needs_wants_v1"), outcome: xiaofeiOutcome }),
  z.object({ kind: z.literal("cunqian_savings_v1"), outcome: cunqianOutcome }),
  z.object({ kind: z.literal("xinyong_housing_v1"), outcome: xinyongHousingOutcome }),
  z.object({ kind: z.literal("xinyong_credit_card_v1"), outcome: xinyongCreditCardOutcome }),
  z.object({ kind: z.literal("touzi_investing_v1"), outcome: touziOutcome }),
  z.object({ kind: z.literal("zhapian_fraud_v1"), outcome: zhapianOutcome }),
  z.object({ kind: z.literal("xuedai_student_loan_v1"), outcome: xuedaiOutcome }),
  z.object({ kind: z.literal("baoshui_tax_v1"), outcome: baoshuiOutcome }),
  z.object({ kind: z.literal("zuwu_lease_v1"), outcome: zuwuOutcome }),
  z.object({ kind: z.literal("baoxian_sales_pitch_v1"), outcome: baoxianOutcome }),
  z.object({ kind: z.literal("chuangye_bubble_tea_v1"), outcome: chuangyeOutcome }),
]);

/**
 * A validated result. Consumers switch on `kind`; TypeScript then narrows
 * `outcome` to that kind's shape, so reading a field belonging to a different
 * simulation fails to compile.
 */
export type SimResult = z.infer<typeof SimResultSchema>;

export function isSimKind(v: unknown): v is SimKind {
  return typeof v === "string" && (SIM_KINDS as readonly string[]).includes(v);
}

/**
 * Validate a result at the API boundary, before anything is stored. Returns
 * the typed result, or an error describing what failed — never a partially
 * trusted object.
 */
export function parseSimResult(
  input: unknown,
): { ok: true; result: SimResult } | { ok: false; error: string } {
  const parsed = SimResultSchema.safeParse(input);
  if (parsed.success) return { ok: true, result: parsed.data };
  const issue = parsed.error.issues[0];
  return {
    ok: false,
    error: issue
      ? `${issue.path.join(".") || "(root)"}: ${issue.message}`
      : "unrecognised simulation result shape",
  };
}

/**
 * Read a stored row back into the union. Rows written before `kind` existed,
 * and rows whose kind this build does not know, come back as null so callers
 * are forced to render a neutral state rather than guess at the shape.
 */
export function readStoredResult(
  kind: unknown,
  outcome: unknown,
): SimResult | null {
  if (!isSimKind(kind)) return null;
  const parsed = SimResultSchema.safeParse({ kind, outcome });
  return parsed.success ? parsed.data : null;
}

/** Shown wherever a result cannot be read. Never accompanied by a figure. */
export const UNREADABLE_RESULT_TEXT = "此模擬結果無法顯示";

/**
 * The stable credit value for a credit-card result, old rows included.
 *
 * The one place allowed to look at the display label, and only when the
 * stored row predates `record`. Everything downstream calls this instead of
 * reading either field, so rewording 信用線 cannot reach the capstone.
 */
export function creditRecordOf(outcome: {
  creditRecord: string;
  record?: "good" | "fair" | "poor";
}): "good" | "fair" | "poor" {
  return outcome.record ?? legacyRecordValue(outcome.creditRecord);
}

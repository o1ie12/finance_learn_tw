/**
 * 消費模擬 — allocate one month's income across real categories, then find
 * out whether the allocation survives contact with something unplanned.
 *
 * The teaching point is 需要 vs 想要, so the student allocates freely rather
 * than adjusting a preset split: a fixed split tells you the answer, while
 * an empty budget makes you produce one and then live with it. The shortfall
 * event at the end is what turns "I spent it all" from an abstraction into a
 * consequence — a month with no slack cannot absorb a NT$3,000 surprise, and
 * that is the whole lesson in one number.
 *
 * Income comes from the student's profile (職涯線's result) or the default
 * when they have not done that line — see lib/studentProfile.ts.
 */

export type CategoryKind = "need" | "want" | "save";

export interface SpendCategory {
  id: string;
  label: string;
  kind: CategoryKind;
  /** Below this a need is not really covered. Wants have no minimum. */
  minimum?: number;
  hint: string;
}

export const SPEND_CATEGORIES: SpendCategory[] = [
  {
    id: "housing",
    label: "住的地方",
    kind: "need",
    minimum: 8000,
    hint: "跟家人住、租雅房或套房，差距很大，但總得有個地方住。",
  },
  {
    id: "food",
    label: "吃飯",
    kind: "need",
    minimum: 6000,
    hint: "自己煮跟三餐外食，一個月可以差好幾千。",
  },
  {
    id: "transport",
    label: "交通",
    kind: "need",
    minimum: 1200,
    hint: "通勤月票、油錢或車資。",
  },
  {
    id: "phone",
    label: "手機與網路",
    kind: "need",
    minimum: 500,
    hint: "現在很難完全不花這筆。",
  },
  {
    id: "social",
    label: "娛樂與社交",
    kind: "want",
    hint: "聚餐、看電影、追劇訂閱。花得少不代表沒有生活。",
  },
  {
    id: "shopping",
    label: "購物",
    kind: "want",
    hint: "衣服、3C、想要但不是非有不可的東西。",
  },
  {
    id: "savings",
    label: "存起來",
    kind: "save",
    hint: "沒有分配到的部分不會自動存起來——要留才有。",
  },
];

/** The unplanned expense that tests whether the month had any slack. */
export const SHORTFALL_EVENT = {
  amount: 3000,
  label: "機車送修",
  detail: "月底機車突然發不動，修車要 NT$3,000。",
};

export type Allocation = Record<string, number>;

export interface SpendingOutcome {
  income: number;
  /** True when the income came from 職涯線 rather than the default. */
  incomeFromCareer: boolean;
  allocation: Allocation;
  allocated: number;
  unallocated: number;
  needsTotal: number;
  wantsTotal: number;
  savings: number;
  /** Needs left under their minimum, by label. */
  underfunded: string[];
  wantsShareOfIncome: number; // 0–1
  /** Could the surprise be absorbed without going negative? */
  absorbedShortfall: boolean;
  shortfallGap: number; // how much short, 0 when absorbed
  verdict: "comfortable" | "tight" | "short";
}

export function computeSpending(input: {
  income: number;
  incomeFromCareer: boolean;
  allocation: Allocation;
}): SpendingOutcome {
  const { income, incomeFromCareer } = input;

  const allocation: Allocation = {};
  for (const c of SPEND_CATEGORIES) {
    const raw = Number(input.allocation[c.id]);
    allocation[c.id] = Number.isFinite(raw) && raw > 0 ? Math.round(raw) : 0;
  }

  const sumOf = (kind: CategoryKind) =>
    SPEND_CATEGORIES.filter((c) => c.kind === kind).reduce(
      (n, c) => n + allocation[c.id],
      0,
    );

  const needsTotal = sumOf("need");
  const wantsTotal = sumOf("want");
  const savings = sumOf("save");
  const allocated = needsTotal + wantsTotal + savings;
  const unallocated = Math.max(0, income - allocated);

  const underfunded = SPEND_CATEGORIES.filter(
    (c) => c.minimum != null && allocation[c.id] < c.minimum,
  ).map((c) => c.label);

  // Anything left unallocated is still available — it simply was not set
  // aside deliberately, which is a different thing from not existing.
  const buffer = savings + unallocated;
  const absorbedShortfall = buffer >= SHORTFALL_EVENT.amount;
  const shortfallGap = absorbedShortfall
    ? 0
    : SHORTFALL_EVENT.amount - buffer;

  // Absorbing the surprise is the first cut, and it is absolute: a month
  // that could not cover it is "short", full stop. Only a month that DID
  // cover it can be "tight" — meaning it did so with nothing to spare, or by
  // squeezing a need below its floor. The previous version folded a failed
  // month with no underfunded need into "tight", so the stamp said 剛剛好
  // while the headline on the same screen said 月底差了.
  const bufferAfterShock = buffer - SHORTFALL_EVENT.amount;
  const verdict: SpendingOutcome["verdict"] = !absorbedShortfall
    ? "short"
    : underfunded.length > 0 || bufferAfterShock < SHORTFALL_EVENT.amount
      ? "tight"
      : "comfortable";

  return {
    income,
    incomeFromCareer,
    allocation,
    allocated,
    unallocated,
    needsTotal,
    wantsTotal,
    savings,
    underfunded,
    wantsShareOfIncome: income > 0 ? wantsTotal / income : 0,
    absorbedShortfall,
    shortfallGap,
    verdict,
  };
}

export function isSpendCategoryId(v: unknown): v is string {
  return typeof v === "string" && SPEND_CATEGORIES.some((c) => c.id === v);
}

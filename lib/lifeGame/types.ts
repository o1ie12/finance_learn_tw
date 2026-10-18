import { z } from "zod";

/**
 * The life game's saved state (02-LIFE-GAME §2), validated on every read and
 * write. STATE_VERSION 1. All money is whole NT$.
 *
 * Additions beyond the spec's sketch, each needed to run the spec's rules:
 *  - `phase` and `pending`: where the current turn stands, so the server can
 *    accept one step at a time.
 *  - `card`: the 信用線 carry state and this month's charges.
 *  - `prices`: where in the real monthly series this game started.
 *  - `pension`, `jobless`, `rentExtra`, `bills`, `givingTotal`, `dividends12`,
 *    `readiness`, `creditRecord`, `goal`: state the moves and events need.
 */

const money = z.number().int();
const nonNeg = z.number().int().nonnegative();

export const MOVE_IDS = [
  "demand", // 存活存
  "give", // 助人
  "timeDeposit", // 存定存
  "goalTracking", // 存錢目標
  "editBills", // 調整生活開銷
  "card", // 信用卡
  "cardRepay", // 還卡債
  "etfBroad", // 市值型 ETF
  "etfDividend", // 高股息 ETF
  "etfMonthly", // 定期定額
  "etfSell", // 賣出 ETF
  "fastForward", // 快轉一年
  "insurance", // 保險
  "skill", // 學技能
  "sideBusiness", // 副業
  "moveOut", // 搬出去住
  "housingFund", // 房屋基金
  "studentLoan", // 學貸還款
  "realTax", // 報稅
  "scamHelp", // 防詐提示
  "finale", // 買房或租屋的決定
] as const;
export type MoveId = (typeof MOVE_IDS)[number];

export const PHASES = ["payday", "saveFirst", "bills", "lifestyle", "actions", "event", "ledger"] as const;

/** 生活風格 (05 Part B): this month's 想要 spending level. */
export const LIFESTYLE_LEVELS = ["save", "normal", "enjoy"] as const;
export type LifestyleLevel = (typeof LIFESTYLE_LEVELS)[number];
export type Phase = (typeof PHASES)[number];

export const HoldingSchema = z.object({
  units: z.number().nonnegative(),
  costBasis: nonNeg,
});
export type Holding = z.infer<typeof HoldingSchema>;

export const CardStateSchema = z.object({
  /**
   * The carry the current statement was built from (creditCard.ts `Carry`):
   * what was still owed after the previous statement was paid.
   */
  olderPrincipal: nonNeg,
  lastMonthPrincipal: nonNeg,
  unpaidInterest: nonNeg,
  /** Interest billed on the current statement (on that carry, from 入帳日). */
  statementInterest: nonNeg,
  /** New spending billed on the current statement. */
  statementNewCharge: nonNeg,
  /** The statement due this turn: carry + interest + new spending (0 when nothing is owed). */
  statementTotal: nonNeg,
  statementMinimum: nonNeg,
  /** Paid so far toward that statement this turn. */
  paidThisTurn: nonNeg,
  /** New spending on the card this turn; posts on the next statement. */
  chargesThisTurn: nonNeg,
  consecutiveMissed: nonNeg,
  everRevolved: z.boolean(),
  everMissed: z.boolean(),
});
export type CardState = z.infer<typeof CardStateSchema>;

const EventResolutionSchema = z.object({
  id: z.string(),
  option: z.string().nullable(),
  cost: nonNeg, // cash-side cost before insurance
  paid: nonNeg, // what the student actually paid after insurance
  covered: nonNeg, // what insurance paid
  gain: nonNeg,
  note: z.string(),
});
export type EventResolution = z.infer<typeof EventResolutionSchema>;

/** Money flows of one turn, all whole NT$, for the summary and the ledger check. */
export const FlowsSchema = z.object({
  grossPay: money, // informational (tax notice); not part of the net-worth identity
  pensionSelf: money.optional(), // 勞退自提 this turn (tax notice); optional for older saves
  netPay: money,
  sideProfit: money,
  otherIncome: money, // bonus, unemployment benefit, invoice, tax refund
  spending: money, // everything consumed (bills, events, fees, giving, interest paid)
  interest: money, // deposit interest earned (can be negative when a 定存 breaks)
  dividends: money,
  marketChange: money,
  writeOffs: money,
});
export type Flows = z.infer<typeof FlowsSchema>;

export const LedgerCellsSchema = z.object({
  cashStart: money,
  income: money,
  saved: money,
  bills: money,
  actions: money,
  events: money,
  cashEnd: money,
});
export type LedgerCells = z.infer<typeof LedgerCellsSchema>;

export const TurnRecordSchema = z.object({
  turn: nonNeg,
  calendarMonth: z.number().int().min(1).max(12),
  flows: FlowsSchema,
  ledger: LedgerCellsSchema,
  billsTotal: nonNeg,
  wants: nonNeg.optional(),
  savedFirst: nonNeg,
  tookBackSaving: nonNeg,
  overdueCreated: nonNeg,
  events: z.array(EventResolutionSchema),
  netWorthStart: money,
  netWorthEnd: money,
  etfReturn: z.number().nullable(),
  stress: z.number().int(),
  notes: z.array(z.string()),
  ledgerScore: z.number().nullable(),
  /** The last ledger try's per-cell result and hints (null when no ledger this turn). */
  ledgerChecked: z.record(z.string(), z.object({ ok: z.boolean(), hint: z.string() })).nullable().optional(),
  autopilot: z.boolean(),
});
export type TurnRecord = z.infer<typeof TurnRecordSchema>;

/** One summarised year, for turns older than the full-history window. */
export const YearSummarySchema = z.object({
  fromTurn: nonNeg,
  toTurn: nonNeg,
  income: money,
  spending: money,
  netWorthEnd: money,
});

export const PendingEventSchema = z.object({
  key: z.string(), // unique in the turn, e.g. "birthday" or "repay:0"
  id: z.string(),
  vars: z.record(z.string(), z.union([z.string(), z.number()])),
});
export type PendingEvent = z.infer<typeof PendingEventSchema>;

/** The turn in progress. Reset at the start of every turn. */
export const PendingSchema = z.object({
  cashStart: money,
  netWorthStart: money,
  flows: FlowsSchema,
  ledger: LedgerCellsSchema,
  savedFirst: nonNeg,
  tookBackSaving: nonNeg,
  billsTotal: nonNeg,
  /** 想要 spending actually spent at the 生活風格 step (older saves: 0). */
  wants: nonNeg.default(0),
  overdueCreated: nonNeg,
  events: z.array(PendingEventSchema),
  resolved: z.array(EventResolutionSchema),
  etfReturn: z.number().nullable(),
  coveredByInsurance: z.boolean(),
  bigEventHit: z.boolean(),
  gaveThisTurn: z.boolean(),
  stressAdjust: z.number().int(),
  notes: z.array(z.string()),
  ledgerTries: nonNeg,
  ledgerScore: z.number().nullable(),
  /** After a wrong ledger try: which cells were right, and a hint per wrong cell. */
  ledgerChecked: z.record(z.string(), z.object({ ok: z.boolean(), hint: z.string() })).nullable(),
  autopilot: z.boolean(),
  /** Price before this month's move, for the market-change line. */
  priceBefore: z.object({ etfBroad: z.number(), etfDividend: z.number() }),
});
export type Pending = z.infer<typeof PendingSchema>;

export const LifeStateSchema = z.object({
  version: z.literal(1),
  seed: z.number().int().nonnegative(),
  turn: nonNeg,
  startCalendarMonth: z.literal(7),
  ageMonths: nonNeg,
  phase: z.enum(PHASES),
  job: z.object({
    id: z.string(),
    title: z.string(),
    grossMonthly: nonNeg,
    source: z.enum(["careerLine", "starter"]),
  }),
  housing: z.enum(["family", "shared", "studio"]),
  rentExtra: nonNeg,
  bills: z.object({
    food: nonNeg,
    daily: nonNeg,
    transport: z.enum(["tpass", "bike"]),
  }),
  accounts: z.object({
    cash: money,
    demand: nonNeg,
    timeDeposits: z.array(
      z.object({ amount: nonNeg, startTurn: nonNeg, termMonths: z.literal(12) }),
    ),
    housingFund: nonNeg,
  }),
  pension: z.object({ rate: z.number().min(0).max(0.06), balance: nonNeg }),
  holdings: z.object({ etfBroad: HoldingSchema, etfDividend: HoldingSchema }),
  prices: z.object({
    startIndex: nonNeg,
    /** Multipliers applied after each wrap, so returns stay continuous. */
    wraps: z.array(z.object({ atTurn: nonNeg, scaleBroad: z.number(), scaleDividend: z.number() })),
  }),
  dividends12: z.array(money), // last 12 months' dividends, newest last
  debts: z.object({
    card: CardStateSchema,
    installments: z.array(z.object({ label: z.string(), monthly: nonNeg, turnsLeft: nonNeg, lastMonthly: nonNeg })),
    guarantee: z
      .object({ amount: nonNeg, triggerTurn: nonNeg, willTrigger: z.boolean() })
      .nullable(),
    guaranteeOwed: nonNeg,
    overdueBills: nonNeg,
  }),
  receivables: z.array(
    z.object({ from: z.string(), amount: nonNeg, dueTurn: nonNeg, willRepay: z.boolean() }),
  ),
  insurance: z.object({ medical: z.boolean(), accident: z.boolean(), life: z.boolean() }),
  /** Policies the student chose this turn; they start covering next turn. */
  insuranceNext: z
    .object({ medical: z.boolean(), accident: z.boolean(), life: z.boolean() })
    .nullable(),
  plan: z.object({ saveFirst: nonNeg, etfMonthly: nonNeg, givingMonthly: nonNeg }),
  /** The last 生活風格 choice (the next month's default) and how many 省 months in a row. */
  lifestyle: z
    .object({ last: z.enum(LIFESTYLE_LEVELS), saveStreak: nonNeg })
    .default({ last: "normal", saveStreak: 0 }),
  skills: z.array(z.object({ id: z.string(), doneTurn: nonNeg.nullable(), monthsLeft: nonNeg, monthly: nonNeg })),
  sideBusiness: z.object({ active: z.boolean(), startedTurn: nonNeg }).nullable(),
  jobless: z.object({ turnsLeft: nonNeg, benefit: nonNeg }).nullable(),
  moveOutNext: z.enum(["shared", "studio"]).nullable(),
  unlocked: z.array(z.enum(MOVE_IDS)),
  creditRecord: z.enum(["good", "fair", "poor"]),
  givingTotal: nonNeg,
  readiness: z.object({
    warned: z.boolean(),
    proceeded: z.boolean(),
    turn: nonNeg.nullable(),
    reason: z.string().nullable(),
    /** The choice has been named in a bias reveal (02 §3.4). Optional: older saves lack it. */
    named: z.boolean().optional(),
  }),
  goal: z.object({ name: z.string(), amount: nonNeg, months: nonNeg, startTurn: nonNeg }).nullable(),
  history: z.array(TurnRecordSchema),
  years: z.array(YearSummarySchema),
  stats: z.object({
    stress: z.number().int(),
    efMonths: z.number(),
    freedomPct: z.number(),
    netWorth: money,
  }),
  flags: z.object({ seenFullRides: nonNeg, lastLedgerTurn: z.number().int() }),
  pending: PendingSchema,
});
export type LifeState = z.infer<typeof LifeStateSchema>;

// --- actions (what the browser may send) -------------------------------------

export const BILL_SOURCES = ["saving", "demand", "deposit", "card", "etf"] as const;
export type BillSource = (typeof BILL_SOURCES)[number];

const amount = z.number().int().nonnegative().max(100_000_000);

export const ActionsPayloadSchema = z.object({
  demand: amount.optional(), // cash → 活存
  withdrawDemand: amount.optional(), // 活存 → cash
  timeDeposit: amount.optional(), // new 定存
  breakDeposit: z.number().int().nonnegative().optional(), // index of a 定存 to break
  housingFund: amount.optional(),
  etfBroad: amount.optional(), // buy amount
  etfDividend: amount.optional(),
  sellBroadUnits: z.number().nonnegative().optional(),
  sellDividendUnits: z.number().nonnegative().optional(),
  cardRepay: amount.optional(), // extra on top of what the bill step paid
  insurance: z
    .object({ medical: z.boolean(), accident: z.boolean(), life: z.boolean() })
    .optional(),
  startSkill: z.boolean().optional(),
  give: amount.optional(),
  startSideBusiness: z.boolean().optional(),
  moveOut: z.enum(["shared", "studio"]).optional(),
  bills: z
    .object({
      food: amount.optional(),
      daily: amount.optional(),
      transport: z.enum(["tpass", "bike"]).optional(),
    })
    .optional(),
  plan: z
    .object({
      saveFirst: amount.optional(),
      etfMonthly: amount.optional(),
      givingMonthly: amount.optional(),
    })
    .optional(),
  pensionRate: z.number().min(0).max(0.06).optional(),
  confirmReadiness: z.boolean().optional(),
});
export type ActionsPayload = z.infer<typeof ActionsPayloadSchema>;

export const ActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("collectPay") }),
  z.object({ type: z.literal("saveFirst"), amount, remember: z.boolean().optional() }),
  z.object({ type: z.literal("payBills"), cover: z.array(z.enum(BILL_SOURCES)).max(5).optional() }),
  z.object({ type: z.literal("lifestyle"), level: z.enum(LIFESTYLE_LEVELS) }),
  z.object({ type: z.literal("actions"), moves: ActionsPayloadSchema }),
  z.object({
    type: z.literal("events"),
    choices: z.record(
      z.string(),
      z.object({ option: z.string(), payWith: z.enum(["cash", "card"]).optional(), amount: amount.optional() }),
    ),
  }),
  z.object({ type: z.literal("ledger"), cells: LedgerCellsSchema.partial() }),
  z.object({ type: z.literal("fastForward") }),
]);
export type Action = z.infer<typeof ActionSchema>;

/** The state as the browser may see it: hidden rolls removed. */
export type PublicLifeState = Omit<LifeState, "seed" | "receivables" | "debts"> & {
  receivables: { from: string; amount: number; dueTurn: number }[];
  debts: Omit<LifeState["debts"], "guarantee"> & {
    guarantee: { amount: number } | null;
  };
};

/**
 * 手搖飲攤位 (Tycoon lite) — a 30-simulated-day cash-flow game, not a full
 * economic simulation. The student makes two decisions up front (price tier,
 * daily prep batch size); the 30 days then play out against a fixed,
 * pre-scripted event timeline (not real randomness) so the outcome is
 * deterministic and testable. Framed as "lite" on purpose — this teaches
 * fixed vs. variable cost, break-even, and cash flow, not real forecasting.
 */

export type PriceId = "low" | "mid" | "high";
export type PrepId = "small" | "medium" | "large";

export interface PriceOption {
  id: PriceId;
  label: string;
  pricePerCup: number; // NT$
  costPerCup: number; // NT$ — variable cost (ingredients/packaging)
  baseDemand: number; // cups/day at this price, before events
}

export interface PrepOption {
  id: PrepId;
  label: string;
  cupsPrepped: number; // max cups available to sell that day
  dailyFixedCost: number; // NT$ — rent + base staffing for this scale
}

export const PRICE_OPTIONS: PriceOption[] = [
  { id: "low", label: "低價策略（NT$30/杯）", pricePerCup: 30, costPerCup: 12, baseDemand: 70 },
  { id: "mid", label: "中價策略（NT$45/杯）", pricePerCup: 45, costPerCup: 15, baseDemand: 50 },
  { id: "high", label: "高價策略（NT$60/杯）", pricePerCup: 60, costPerCup: 18, baseDemand: 32 },
];

export const PREP_OPTIONS: PrepOption[] = [
  { id: "small", label: "小攤（每天備 40 杯）", cupsPrepped: 40, dailyFixedCost: 500 },
  { id: "medium", label: "中攤（每天備 60 杯）", cupsPrepped: 60, dailyFixedCost: 800 },
  { id: "large", label: "大攤（每天備 90 杯）", cupsPrepped: 90, dailyFixedCost: 1200 },
];

const STARTING_CASH = 5000;
const SIM_DAYS = 30;

/** Fixed event timeline — same for every playthrough, so outcomes are reproducible. */
interface DayEvent {
  day: number;
  label: string;
  demandMultiplier?: number; // applied from this day onward until changed
  costMultiplier?: number; // applied to ingredient cost per cup, from this day onward
}

const EVENTS: DayEvent[] = [
  { day: 6, label: "颱風天，路上幾乎沒人", demandMultiplier: 0.2 },
  { day: 7, label: "颱風過了，人潮恢復正常", demandMultiplier: 1 },
  { day: 12, label: "茶葉批發價上漲", costMultiplier: 1.2 },
  { day: 18, label: "巷口新開一家競爭對手", demandMultiplier: 0.75 },
  { day: 25, label: "學校附近辦園遊會，人潮變多", demandMultiplier: 1.4 },
  { day: 26, label: "園遊會結束，人潮回歸平常", demandMultiplier: 0.75 }, // competitor effect still active
];

export interface DaySnapshot {
  day: number;
  cupsSold: number;
  revenue: number;
  cost: number;
  profit: number;
  cash: number;
  event: string | null;
}

export interface BubbleTeaInput {
  priceId: PriceId;
  prepId: PrepId;
}

export interface BubbleTeaOutcome {
  priceId: PriceId;
  prepId: PrepId;
  days: DaySnapshot[];
  finalCash: number;
  survived: boolean;
  bankruptDay: number | null; // first day cash went negative, if any
  totalRevenue: number;
  totalProfit: number;
  breakEvenCups: number; // cups/day needed at this price+prep to cover fixed cost
}

export function isPriceId(v: unknown): v is PriceId {
  return v === "low" || v === "mid" || v === "high";
}

export function isPrepId(v: unknown): v is PrepId {
  return v === "small" || v === "medium" || v === "large";
}

export function computeBubbleTea(input: BubbleTeaInput): BubbleTeaOutcome {
  const price = PRICE_OPTIONS.find((p) => p.id === input.priceId) ?? PRICE_OPTIONS[1];
  const prep = PREP_OPTIONS.find((p) => p.id === input.prepId) ?? PREP_OPTIONS[1];

  const grossMarginPerCup = price.pricePerCup - price.costPerCup;
  const breakEvenCups =
    grossMarginPerCup > 0 ? Math.ceil(prep.dailyFixedCost / grossMarginPerCup) : Infinity;

  let cash = STARTING_CASH;
  let demandMultiplier = 1;
  let costMultiplier = 1;
  let bankruptDay: number | null = null;
  let totalRevenue = 0;
  let totalProfit = 0;

  const days: DaySnapshot[] = [];

  for (let day = 1; day <= SIM_DAYS; day++) {
    const event = EVENTS.find((e) => e.day === day) ?? null;
    if (event) {
      if (event.demandMultiplier !== undefined) demandMultiplier = event.demandMultiplier;
      if (event.costMultiplier !== undefined) costMultiplier = event.costMultiplier;
    }

    const demand = Math.round(price.baseDemand * demandMultiplier);
    const cupsSold = Math.max(0, Math.min(demand, prep.cupsPrepped));
    const revenue = cupsSold * price.pricePerCup;
    const variableCost = cupsSold * price.costPerCup * costMultiplier;
    const cost = variableCost + prep.dailyFixedCost;
    const profit = revenue - cost;

    cash += profit;
    totalRevenue += revenue;
    totalProfit += profit;

    if (cash < 0 && bankruptDay === null) bankruptDay = day;

    days.push({
      day,
      cupsSold,
      revenue,
      cost,
      profit,
      cash,
      event: event?.label ?? null,
    });

    if (bankruptDay !== null) break; // the stall closes — no more days to simulate
  }

  return {
    priceId: price.id,
    prepId: prep.id,
    days,
    finalCash: cash,
    survived: bankruptDay === null,
    bankruptDay,
    totalRevenue,
    totalProfit,
    breakEvenCups,
  };
}

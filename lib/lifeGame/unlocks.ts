/**
 * Which moves a student has (02 §7.1). Derived on every load from line
 * completions (sticky `line_completions` plus live `lineStatus`, already
 * merged by the caller). `state.unlocked` is a cache for display; it is
 * never the source of truth.
 */

import type { LineSlug } from "@/lib/lines";
import type { MoveId } from "./types";

export const START_MOVES: MoveId[] = ["demand", "give"];

export const LINE_UNLOCKS: Record<LineSlug, MoveId[]> = {
  zhiya: ["skill"],
  qixin: ["editBills"],
  cunqian: ["timeDeposit", "goalTracking"],
  xinyong: ["card", "cardRepay"],
  touzi: ["etfBroad", "etfDividend", "etfMonthly", "etfSell", "fastForward"],
  baoxian: ["insurance"],
  zhapian: ["scamHelp"],
  zuwu: ["moveOut", "housingFund"],
  xuedai: ["studentLoan"],
  baoshui: ["realTax"],
  chuangye: ["sideBusiness"],
  caiwujuece: ["finale"],
};

/** Display names for the dashboard chips (01 §6.1, card 3). */
export const MOVE_LABEL: Record<MoveId, string> = {
  demand: "存活存",
  give: "助人",
  timeDeposit: "存定存",
  goalTracking: "存錢目標",
  editBills: "調整開銷",
  card: "信用卡",
  cardRepay: "還卡債",
  etfBroad: "市值型 ETF",
  etfDividend: "高股息 ETF",
  etfMonthly: "定期定額",
  etfSell: "賣出 ETF",
  fastForward: "快轉一年",
  insurance: "保險",
  skill: "學技能",
  sideBusiness: "副業",
  moveOut: "搬出去住",
  housingFund: "房屋基金",
  studentLoan: "學貸還款",
  realTax: "報稅",
  scamHelp: "防詐提示",
  finale: "買房決定",
};

/** The line that unlocks a move, or null for start moves. */
export function lineForMove(move: MoveId): LineSlug | null {
  for (const [slug, moves] of Object.entries(LINE_UNLOCKS) as [LineSlug, MoveId[]][]) {
    if (moves.includes(move)) return slug;
  }
  return null;
}

export function unlockedMoves(completed: ReadonlySet<string>): MoveId[] {
  const out = new Set<MoveId>(START_MOVES);
  for (const [slug, moves] of Object.entries(LINE_UNLOCKS) as [LineSlug, MoveId[]][]) {
    if (completed.has(slug)) moves.forEach((m) => out.add(m));
  }
  return [...out];
}

/** Recommended order for today's stop (02 §7.2). */
export const RECOMMENDED_ORDER: LineSlug[] = [
  "zhiya",
  "qixin",
  "cunqian",
  "xinyong",
  "zhapian",
  "touzi",
  "baoxian",
  "zuwu",
  "xuedai",
  "baoshui",
  "chuangye",
  "caiwujuece",
];

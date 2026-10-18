/**
 * Small, pure helpers for the turn screen. Nothing here computes a balance:
 * every amount comes from the server payload. The only arithmetic is
 * grouping server numbers for the top bar and the live preview of what the
 * student is typing (01 §6.4, 02 intro).
 */

import { installmentRemaining } from "@/lib/lifeGame/bills";
import { EVENT_TEXT, fillText, type EventText } from "@/lib/lifeGame/eventText";
import type { LedgerCells, Phase, PublicLifeState } from "@/lib/lifeGame/types";
import type { GamePayload, TurnView } from "@/lib/lifeGame/view";

export type { GamePayload };

export const STEPS = ["發薪日", "先存錢", "帳單", "行動", "人生事件", "記帳"] as const;

export const PHASE_STEP: Record<Phase, number> = {
  payday: 0,
  saveFirst: 1,
  bills: 2,
  actions: 3,
  event: 4,
  ledger: 5,
};

export interface KeyNumbers {
  cash: number;
  savings: number;
  invest: number;
  debt: number;
}

/** The four top-bar pills, grouped from server balances. */
export function keyNumbers(state: PublicLifeState, view: TurnView): KeyNumbers {
  const a = state.accounts;
  const d = state.debts;
  return {
    cash: a.cash,
    savings: a.demand + a.timeDeposits.reduce((sum, t) => sum + t.amount, 0) + a.housingFund,
    invest: view.etf.broadValue + view.etf.dividendValue,
    debt:
      view.card.balance +
      d.installments.reduce((sum, i) => sum + installmentRemaining(i), 0) +
      d.guaranteeOwed +
      d.overdueBills,
  };
}

/**
 * The one status line PlayScreen announces per step change, e.g.
 * 「第 7 個月，發薪日：現金 NT$12,000，存款 NT$30,000」. Cash always; the other
 * balances only when they are not zero, so the line stays short.
 */
export function playStatusLine(month: number, stepTitle: string, n: KeyNumbers): string {
  const parts = [`現金 ${nt(n.cash)}`];
  if (n.savings) parts.push(`存款 ${nt(n.savings)}`);
  if (n.invest) parts.push(`投資 ${nt(n.invest)}`);
  if (n.debt) parts.push(`負債 ${nt(n.debt)}`);
  return `第 ${month} 個月，${stepTitle}：${parts.join("，")}`;
}

/** Parse what the student typed ("12,000", "NT$500") into whole NT$. Null when empty or not a number. */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[\s,，]/g, "").replace(/^NT\$/i, "");
  if (cleaned === "") return null;
  if (!/^-?\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isSafeInteger(n) ? n : null;
}

/** Same, but empty or invalid counts as 0 and negatives are clamped. */
export function amountOrZero(raw: string): number {
  const n = parseAmount(raw);
  return n === null ? 0 : Math.max(n, 0);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/** NT$ with thousands separators. */
export function nt(n: number): string {
  const r = Math.round(n);
  return `${r < 0 ? "-" : ""}NT$${Math.abs(r).toLocaleString("en-US")}`;
}

/** Signed NT$ for changes: +NT$1,200 / -NT$300. */
export function ntSigned(n: number): string {
  return n > 0 ? `+${nt(n)}` : nt(n);
}

export function percent1(n: number): string {
  return `${(Math.round(n * 10) / 10).toFixed(1)}%`;
}

// --- events -----------------------------------------------------------------

const FALLBACK_EVENT: EventText = { title: "人生事件", text: "", options: [{ id: "ok", label: "好" }], teaches: "" };

export function eventText(id: string): EventText {
  return EVENT_TEXT[id] ?? FALLBACK_EVENT;
}

/** A choice event has more than one option (the same twelve as the engine's SAFEST_OPTION). */
export function isChoice(id: string): boolean {
  return eventText(id).options.length > 1;
}

export function eventBody(id: string, vars: Record<string, string | number>, name: string): string {
  return fillText(eventText(id).text, { ...vars, name });
}

export function optionLabel(id: string, option: string | null): string | null {
  if (!option) return null;
  return eventText(id).options.find((o) => o.id === option)?.label ?? null;
}

/**
 * Events whose amounts are 示意 (02 §6: "All costs 示意 unless noted").
 * Not tagged: market_drop (real closes), layoff (就業保險法 60%), the tax
 * notice (報稅線 engine), and follow-ups without a new amount.
 */
const ILLUSTRATIVE_EVENTS = new Set([
  "phone_break",
  "dental",
  "scooter_service",
  "accident",
  "hospital",
  "birthday",
  "concert",
  "japan_trip",
  "new_phone",
  "scam_msg",
  "friend_loan",
  "family_help",
  "rent_up",
  "invoice",
  "course_sale",
  "bonus",
  "raise",
  "guarantee_called",
]);

export function eventIsIllustrative(id: string): boolean {
  return ILLUSTRATIVE_EVENTS.has(id);
}

// --- ledger -----------------------------------------------------------------

export const LEDGER_ROWS: { key: keyof LedgerCells; label: string }[] = [
  { key: "cashStart", label: "月初現金" },
  { key: "income", label: "收入" },
  { key: "saved", label: "存錢" },
  { key: "bills", label: "帳單" },
  { key: "actions", label: "行動" },
  { key: "events", label: "事件" },
  { key: "cashEnd", label: "月底現金" },
];

export const LEDGER_TRIES = 2;

// --- errors -----------------------------------------------------------------

const ERROR_TEXT: Record<string, string> = {
  insufficient_cash: "現金不夠，請把金額調低一點。",
  below_minimum: "定期定額每月最少 NT$1,000，或填 0 停止。",
  locked: "這個行動還沒解鎖。",
  choice_required: "每張事件卡都要先做選擇。",
  already_active: "副業已經在經營了。",
  no_such_deposit: "找不到這筆定存，請重新整理。",
  invalid_action: "送出的內容有問題，請再試一次。",
  forbidden_field: "送出的內容有問題，請再試一次。",
  no_session: "登入已經過期，請重新登入。",
  backend_not_configured: "系統的資料庫還沒設定好，暫時不能玩。",
  network: "連不上伺服器，請檢查網路後再試一次。",
};

export function errorText(code: string): string {
  return ERROR_TEXT[code] ?? "出了一點問題，請再試一次。";
}

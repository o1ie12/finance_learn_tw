/**
 * Onboarding (01-DESIGN-SYSTEM §6.3, 04-CONTENT §1.3): who still needs it,
 * the starter budget the goal step checks against, and the SMART check.
 *
 * Pure and client-safe: the goal form runs smartCheck live, and
 * app/api/goal runs the very same function before storing anything, so the
 * browser and the server can never disagree about what counts as a goal.
 */
import { DEFAULT_AVATAR, validateName, type Avatar } from "@/lib/avatar";
import { GOAL_REASONS, SMART_TICKS, type SmartTick } from "@/content/global";
import { BILLS, TRANSPORT } from "@/lib/lifeGame/constants";
import { netPay } from "@/lib/lifeGame/payroll";
import { readProfile, type StudentProfile } from "@/lib/studentProfile";

/**
 * Bump to show onboarding again to everyone whose stored version is lower.
 * Stored on profile.onboardedVersion by /api/avatar and /api/goal.
 */
export const ONBOARDING_VERSION = 1;

/** True when the student has not finished (or skipped) this onboarding version. */
export function needsOnboarding(student: { profile?: unknown } | null | undefined): boolean {
  if (!student) return false;
  const seen = readProfile(student.profile).onboardedVersion;
  return seen == null || seen < ONBOARDING_VERSION;
}

// ---------- the starter budget ----------

/**
 * The starter salary stand-in until 職涯線 resolves a real one. 04 §5's own
 * scenario salary (content/lines/qixin.ts uses the same NT$32,000). 示意.
 */
export const STARTER_GROSS = 32_000;

/**
 * Monthly essentials for the starter life (living at home): 孝親費, 餐費,
 * 手機, 日用品 and the TPASS 月票. Read from lib/lifeGame/constants.ts (bills
 * 示意, TPASS 交通部); 04 §5's scenario sums to NT$15,199.
 */
export function starterEssentials(): number {
  return BILLS.familyContribution + BILLS.food + BILLS.phone + BILLS.daily + TRANSPORT.tpass;
}

/** The gross salary the budget starts from: 職涯線's when done, else the stand-in. */
export function starterGross(profile: StudentProfile): { gross: number; fromCareerLine: boolean } {
  return profile.monthlyIncome != null && profile.monthlyIncome > 0
    ? { gross: profile.monthlyIncome, fromCareerLine: true }
    : { gross: STARTER_GROSS, fromCareerLine: false };
}

/** Money left each month after essentials: 實發 (lib/lifeGame/payroll) − essentials. */
export function starterMonthlyLeft(profile: StudentProfile): number {
  return netPay(starterGross(profile).gross) - starterEssentials();
}

/** 04 §1.3: the emergency card's default, 3 × the starter monthly essentials. */
export function emergencyGoalAmount(): number {
  return 3 * starterEssentials();
}

// ---------- the SMART check ----------

export const GOAL_NAME_MAX = 20;
export const GOAL_MONTHS_MIN = 1;
export const GOAL_MONTHS_MAX = 60;
/** Sanity cap on the amount (not a teaching rule): NT$10,000,000. */
export const GOAL_AMOUNT_MAX = 10_000_000;

export type SmartTickId = SmartTick["id"];

export interface GoalDraft {
  name: string;
  /** NT$, a whole number; null when blank or not a number. */
  amount: number | null;
  /** null when blank or not a number. */
  months: number | null;
  /** A GOAL_REASONS id, or null when none is picked. */
  reason: string | null;
}

export interface TickResult {
  id: SmartTickId;
  label: string;
  met: boolean;
  /** What to fix. Empty when met. */
  hint: string;
}

export interface SmartResult {
  ticks: TickResult[];
  /** amount ÷ months rounded up to NT$100; null until both are valid. */
  monthly: number | null;
  allMet: boolean;
}

// Control and invisible format characters, and angle brackets: a goal name
// is plain text (rendered as text, but kept clean like the avatar name).
const GOAL_NAME_BAD = /[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁠-⁩﻿<>]/;

export type GoalNameCheck = { ok: true; value: string } | { ok: false; reason: string };

/** A goal name: 1 to 20 characters after trimming, plain text. */
export function validateGoalName(name: unknown): GoalNameCheck {
  if (typeof name !== "string") return { ok: false, reason: "要存錢買什麼？寫清楚一點。" };
  if (GOAL_NAME_BAD.test(name)) return { ok: false, reason: "名稱不能有特殊字元或 < > 符號。" };
  const value = name.trim();
  const length = Array.from(value).length;
  if (length === 0) return { ok: false, reason: "要存錢買什麼？寫清楚一點。" };
  if (length > GOAL_NAME_MAX) return { ok: false, reason: `名稱最多 ${GOAL_NAME_MAX} 個字。` };
  return { ok: true, value };
}

function isAmount(n: number | null): n is number {
  return n != null && Number.isInteger(n) && n > 0 && n <= GOAL_AMOUNT_MAX;
}

function isMonths(n: number | null): n is number {
  return n != null && Number.isInteger(n) && n >= GOAL_MONTHS_MIN && n <= GOAL_MONTHS_MAX;
}

/** amount ÷ months, rounded up to the next NT$100 (04 §1.3). */
export function monthlySaving(amount: number, months: number): number {
  return Math.ceil(amount / months / 100) * 100;
}

const TICK = Object.fromEntries(SMART_TICKS.map((t) => [t.id, t])) as Record<SmartTickId, SmartTick>;

/**
 * 04 §1.3's five ticks. `monthlyLeft` is starterMonthlyLeft(profile).
 * 做得到 compares the exact amount ÷ months (not the rounded figure) with the
 * money left, so a goal exactly at the limit is reachable.
 */
export function smartCheck(goal: GoalDraft, monthlyLeft: number): SmartResult {
  const nameCheck = validateGoalName(goal.name);
  const amountOk = isAmount(goal.amount);
  const monthsOk = isMonths(goal.months);
  const monthly = amountOk && monthsOk ? monthlySaving(goal.amount!, goal.months!) : null;
  const reason = GOAL_REASONS.find((r) => r.id === goal.reason) ?? null;

  const specific = nameCheck.ok;
  const measurable = amountOk;
  const timebound = monthsOk;
  const achievable = amountOk && monthsOk && goal.amount! / goal.months! <= monthlyLeft;
  const relevant = reason?.ticksRelevant === true;

  const ticks: TickResult[] = [
    {
      id: "specific",
      label: TICK.specific.label,
      met: specific,
      hint: nameCheck.ok ? "" : nameCheck.reason,
    },
    {
      id: "measurable",
      label: TICK.measurable.label,
      met: measurable,
      hint: measurable
        ? ""
        : goal.amount != null && goal.amount > GOAL_AMOUNT_MAX
          ? "金額太大了，先定一個比較近的目標。"
          : TICK.measurable.hint,
    },
    {
      id: "achievable",
      label: TICK.achievable.label,
      met: achievable,
      hint: achievable
        ? ""
        : monthly == null
          ? "先填好金額和期限，才算得出每個月要存多少。"
          : TICK.achievable.hint.replace("{X}", monthly.toLocaleString("en-US")),
    },
    {
      id: "relevant",
      label: TICK.relevant.label,
      met: relevant,
      hint: relevant ? "" : reason ? TICK.relevant.hint : "選一個原因：這個目標為什麼重要？",
    },
    {
      id: "timebound",
      label: TICK.timebound.label,
      met: timebound,
      hint: timebound
        ? ""
        : goal.months != null && goal.months > GOAL_MONTHS_MAX
          ? `期限最長 ${GOAL_MONTHS_MAX} 個月。`
          : TICK.timebound.hint,
    },
  ];

  return { ticks, monthly, allMet: ticks.every((t) => t.met) };
}

/**
 * Parse what the student typed into an amount or months box: digits, with
 * optional thousands commas and spaces. Anything else (blank, decimals,
 * letters, a minus sign) is null.
 */
export function parseWholeNumber(raw: string): number | null {
  const cleaned = raw.replace(/[,\s，]/g, "");
  if (!/^\d{1,9}$/.test(cleaned)) return null;
  return Number(cleaned);
}

// ---------- the skip path ----------

/**
 * The avatar a student gets when they skip the creator: the default parts,
 * named after the student (first 8 characters). Falls back to the default
 * name when that is not a valid avatar name (one character, a link ...).
 */
export function skipAvatar(studentName: string): Avatar {
  const short = Array.from(studentName.trim()).slice(0, 8).join("");
  const check = validateName(short);
  return { ...DEFAULT_AVATAR, name: check.ok ? check.value : DEFAULT_AVATAR.name };
}

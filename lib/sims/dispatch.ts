import {
  computeSavings,
  isSavingsGoalId,
  isSavingsStorageId,
  SAVINGS_MONTHS,
} from "@/lib/sims/savings";
import { computeCreditCard, type PayChoice } from "@/lib/sims/creditCard";
import { computeCareerChoice } from "@/lib/sims/careerChoice";
import { computeSpending, SPEND_CATEGORIES } from "@/lib/sims/spending";
import { isCareerPathId, findPath, CAREER_PATHS } from "@/lib/sims/careers";
import { isInterestId } from "@/lib/studentProfile";
import { computeInvesting, isInvestChoiceId } from "@/lib/sims/investing";
import { computeFraud, FRAUD_CARDS } from "@/lib/sims/fraud";
import {
  computeStudentLoan,
  isSchoolType,
  isHousingType,
} from "@/lib/sims/studentLoan";
import {
  computeTaxFiling,
  isCharacterId,
  isTaxMethod,
  DEDUCTION_OPTIONS,
} from "@/lib/sims/taxFiling";
import { computeLease, LEASE_CLAUSES } from "@/lib/sims/leaseContract";
import { computeSalesPitch, isDecision, PRODUCTS } from "@/lib/sims/salesPitch";
import { computeBubbleTea, isPriceId, isPrepId } from "@/lib/sims/bubbleTea";
import { computeBuyVsRent, isHousingChoice } from "@/lib/sims/buyVsRent";
import { INVEST_LINKOUT_ENABLED } from "@/lib/investLinkout";
import {
  computeInvestReflection,
  isFocusId,
  isSurpriseId,
  isIntentId,
} from "@/lib/sims/investReflection";
import type { CreateRunInput } from "@/lib/db";

export type StoreInput = Omit<CreateRunInput, "student_id">;

export interface DispatchOk {
  ok: true;
  storeInput: StoreInput;
  outcome: unknown;
}
export interface DispatchErr {
  ok: false;
  error: string;
}
export type DispatchResult = DispatchOk | DispatchErr;

function asJson(v: object): Record<string, unknown> {
  return v as unknown as Record<string, unknown>;
}

function pathsBelongTo(interest: string, pathId: string): boolean {
  const list = CAREER_PATHS[interest as keyof typeof CAREER_PATHS];
  return Array.isArray(list) && list.some((p) => p.id === pathId);
}

/**
 * Validate a simulation payload for a line, compute its outcome, and return
 * both the row to store and the outcome to hand back to the client. Pure and
 * server-safe.
 */
export function dispatchSimulation(
  lineSlug: string,
  body: Record<string, unknown>,
): DispatchResult {
  switch (lineSlug) {
    case "zhiya": {
      const interest = body.interest;
      const pathId = body.pathId;
      if (!isInterestId(interest))
        return { ok: false, error: "invalid_interest" };
      if (!isCareerPathId(pathId))
        return { ok: false, error: "invalid_path" };
      // The path must belong to the interest the student actually chose —
      // otherwise a crafted payload could pair any path with any bucket and
      // 職涯站's content would contradict the result.
      const path = findPath(pathId);
      const belongs = path && pathsBelongTo(interest, pathId);
      if (!belongs) return { ok: false, error: "path_interest_mismatch" };

      const outcome = computeCareerChoice({ interest, pathId });
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "zhiya",
          kind: "zhiya_career_choice_v1",
          spending_choices: { interest, pathId },
          outcome_summary: asJson(outcome),
        },
      };
    }

    // Still slug 'qixin': the line is reframed, not replaced, and renaming
    // the slug is a separate data migration across three tables (open
    // question 7). This is exactly why kind is not the slug — the shape is
    // xiaofei_needs_wants_v1 while the line is still identified as qixin,
    // and history from the old salary simulation stays readable as
    // qixin_salary_v1.
    case "qixin": {
      // income is injected by the API route from the student's profile, not
      // taken from the request — a client-supplied income would let anyone
      // hand themselves any budget.
      const income = Number(body.income);
      if (!Number.isFinite(income) || income <= 0)
        return { ok: false, error: "invalid_income" };
      const raw = body.allocation;
      if (typeof raw !== "object" || raw === null)
        return { ok: false, error: "invalid_allocation" };

      const allocation: Record<string, number> = {};
      for (const c of SPEND_CATEGORIES) {
        const v = Number((raw as Record<string, unknown>)[c.id]);
        allocation[c.id] = Number.isFinite(v) && v > 0 ? Math.round(v) : 0;
      }
      const total = Object.values(allocation).reduce((a, b) => a + b, 0);
      if (total > income) return { ok: false, error: "over_budget" };

      const outcome = computeSpending({
        income,
        incomeFromCareer: Boolean(body.incomeFromCareer),
        allocation,
      });
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "qixin",
          kind: "xiaofei_needs_wants_v1",
          spending_choices: { allocation },
          outcome_summary: asJson(outcome),
        },
      };
    }

    case "cunqian": {
      const goalId = body.goalId;
      const storageId = body.storageId;
      const months = Number(body.months);
      const monthlyDeposit = Number(body.monthlyDeposit);
      const responses = Array.isArray(body.temptationResponses)
        ? body.temptationResponses.map(Boolean)
        : [];
      if (!isSavingsGoalId(goalId)) return { ok: false, error: "invalid_goal" };
      if (!isSavingsStorageId(storageId))
        return { ok: false, error: "invalid_storage" };
      if (!SAVINGS_MONTHS.includes(months as (typeof SAVINGS_MONTHS)[number]))
        return { ok: false, error: "invalid_months" };
      if (
        !Number.isFinite(monthlyDeposit) ||
        monthlyDeposit < 0 ||
        monthlyDeposit > 100000
      )
        return { ok: false, error: "invalid_deposit" };
      const outcome = computeSavings({
        goalId,
        storageId,
        months,
        monthlyDeposit,
        temptationResponses: responses,
      });
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "cunqian",
          kind: "cunqian_savings_v1",
          spending_choices: {
            goalId,
            storageId,
            months,
            monthlyDeposit,
            temptationResponses: responses,
          },
          outcome_summary: asJson(outcome),
        },
      };
    }

    case "xinyong": {
      const raw = body.choices;
      if (!Array.isArray(raw) || raw.length !== 3)
        return { ok: false, error: "invalid_choices" };
      const valid = raw.every(
        (c: unknown) => c === "full" || c === "minimum",
      );
      if (!valid) return { ok: false, error: "invalid_choice_value" };
      // Injected by the API route from the student's profile, like qixin's
      // income — never taken from the request. It only picks wording here,
      // but a client-supplied profile value is a door worth not opening.
      const interest = isInterestId(body.interest) ? body.interest : null;
      const outcome = computeCreditCard(raw as PayChoice[], interest);
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "xinyong",
          kind: "xinyong_credit_card_v1",
          spending_choices: { choices: raw },
          outcome_summary: asJson(outcome),
        },
      };
    }

    case "touzi": {
      // Two modes, one line. While the linkout is off — which is the default
      // and the current state — this branch is never taken and 投資線 runs
      // the custom simulator below, unchanged.
      if (INVEST_LINKOUT_ENABLED) {
        const focus = body.focus;
        const surprise = body.surprise;
        const intent = body.intent;
        if (!isFocusId(focus)) return { ok: false, error: "invalid_focus" };
        if (!isSurpriseId(surprise))
          return { ok: false, error: "invalid_surprise" };
        if (!isIntentId(intent)) return { ok: false, error: "invalid_intent" };
        const plannedAmount = Number(body.plannedAmount);
        if (!Number.isFinite(plannedAmount) || plannedAmount < 0)
          return { ok: false, error: "invalid_planned_amount" };
        // Injected by the API route from the profile, like every other
        // cross-line figure.
        const suggestedAmount = Number(body.start);
        const outcome = computeInvestReflection({
          suggestedAmount: Number.isFinite(suggestedAmount) ? suggestedAmount : 0,
          fromSavingsLine: Boolean(body.fromSavingsLine),
          inShortfall: Boolean(body.inShortfall),
          interest: isInterestId(body.interest) ? body.interest : null,
          plannedAmount,
          focus,
          surprise,
          intent,
        });
        return {
          ok: true,
          outcome,
          storeInput: {
            line_slug: "touzi",
            kind: "touzi_twse_reflection_v1",
            spending_choices: { plannedAmount, focus, surprise, intent },
            outcome_summary: asJson(outcome),
          },
        };
      }

      const choice = body.choice;
      const ipo = Boolean(body.ipo);
      if (!isInvestChoiceId(choice))
        return { ok: false, error: "invalid_choice" };
      // Injected by the API route from the student's profile; a
      // client-supplied sum would let anyone invest any amount.
      const start = Number(body.start);
      const outcome = computeInvesting({ choice, ipo, start });
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "touzi",
          kind: "touzi_investing_v1",
          spending_choices: { choice, ipo },
          outcome_summary: asJson(outcome),
        },
      };
    }

    case "zhapian": {
      const raw = body.answers;
      if (typeof raw !== "object" || raw === null)
        return { ok: false, error: "invalid_answers" };
      const validIds = new Set(FRAUD_CARDS.map((c) => c.id));
      const answers: Record<string, boolean> = {};
      for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
        if (validIds.has(id)) answers[id] = Boolean(v);
      }
      const outcome = computeFraud(answers);
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "zhapian",
          kind: "zhapian_fraud_v1",
          spending_choices: { answers },
          outcome_summary: asJson(outcome),
        },
      };
    }

    case "xuedai": {
      const school = body.school;
      const housing = body.housing;
      const loanCoversPct = Number(body.loanCoversPct);
      if (!isSchoolType(school)) return { ok: false, error: "invalid_school" };
      if (!isHousingType(housing)) return { ok: false, error: "invalid_housing" };
      if (!Number.isFinite(loanCoversPct) || loanCoversPct < 0 || loanCoversPct > 100)
        return { ok: false, error: "invalid_loan_pct" };
      const outcome = computeStudentLoan({ school, housing, loanCoversPct });
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "xuedai",
          kind: "xuedai_student_loan_v1",
          spending_choices: { school, housing, loanCoversPct },
          outcome_summary: asJson(outcome),
        },
      };
    }

    case "baoshui": {
      const characterId = body.characterId ?? body.character;
      if (!isCharacterId(characterId))
        return { ok: false, error: "invalid_character" };
      const payslipGuess = Number(body.payslipGuess);
      if (!Number.isFinite(payslipGuess))
        return { ok: false, error: "invalid_payslip_guess" };
      const rawDeductions = body.deductionIds;
      if (!Array.isArray(rawDeductions))
        return { ok: false, error: "invalid_deductions" };
      const validIds = new Set(DEDUCTION_OPTIONS.map((d) => d.id));
      const deductionIds = rawDeductions.filter(
        (v): v is string => typeof v === "string" && validIds.has(v),
      );
      const method = body.method;
      if (!isTaxMethod(method)) return { ok: false, error: "invalid_method" };

      const outcome = computeTaxFiling({
        characterId,
        payslipGuess,
        deductionIds,
        method,
      });
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "baoshui",
          kind: "baoshui_tax_filing_v1",
          spending_choices: { characterId, payslipGuess, deductionIds, method },
          outcome_summary: asJson(outcome),
        },
      };
    }

    case "zuwu": {
      const raw = body.flagged;
      if (!Array.isArray(raw)) return { ok: false, error: "invalid_flagged" };
      const validIds = new Set(LEASE_CLAUSES.map((c) => c.id));
      const flagged = raw.filter((v): v is string => typeof v === "string" && validIds.has(v));
      const outcome = computeLease(flagged);
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "zuwu",
          kind: "zuwu_lease_v1",
          spending_choices: { flagged },
          outcome_summary: asJson(outcome),
        },
      };
    }

    case "baoxian": {
      const raw = body.decisions;
      if (typeof raw !== "object" || raw === null)
        return { ok: false, error: "invalid_decisions" };
      const entries = Object.entries(raw as Record<string, unknown>);
      const validIds = new Set(PRODUCTS.map((p) => p.id));
      const decisions = {} as Record<(typeof PRODUCTS)[number]["id"], "buy" | "decline">;
      for (const [id, v] of entries) {
        if (validIds.has(id as (typeof PRODUCTS)[number]["id"]) && isDecision(v)) {
          decisions[id as (typeof PRODUCTS)[number]["id"]] = v;
        }
      }
      if (Object.keys(decisions).length !== PRODUCTS.length)
        return { ok: false, error: "incomplete_decisions" };
      const outcome = computeSalesPitch({ decisions });
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "baoxian",
          kind: "baoxian_sales_pitch_v1",
          spending_choices: { decisions },
          outcome_summary: asJson(outcome),
        },
      };
    }

    case "chuangye": {
      const priceId = body.priceId;
      const prepId = body.prepId;
      if (!isPriceId(priceId)) return { ok: false, error: "invalid_price" };
      if (!isPrepId(prepId)) return { ok: false, error: "invalid_prep" };
      const outcome = computeBubbleTea({ priceId, prepId });
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "chuangye",
          kind: "chuangye_bubble_tea_v1",
          spending_choices: { priceId, prepId },
          outcome_summary: asJson(outcome),
        },
      };
    }

    case "caiwujuece": {
      const choice = body.choice;
      if (!isHousingChoice(choice))
        return { ok: false, error: "invalid_choice" };
      // The whole financial position is injected by the API route from the
      // student's profile. Nothing here comes from the request, because every
      // one of these values changes the result — a client-supplied salary or
      // credit record would let anyone hand themselves a mortgage.
      const income = Number(body.income);
      const savings = Number(body.savings);
      const investedAmount = Number(body.investedAmount);
      const creditRecord = body.creditRecord;
      if (!Number.isFinite(income) || income <= 0)
        return { ok: false, error: "invalid_income" };
      if (!Number.isFinite(savings) || savings < 0)
        return { ok: false, error: "invalid_savings" };
      if (
        creditRecord !== "good" &&
        creditRecord !== "fair" &&
        creditRecord !== "poor"
      )
        return { ok: false, error: "invalid_credit_record" };

      const outcome = computeBuyVsRent({
        choice,
        income,
        savings,
        creditRecord,
        investedAmount: Number.isFinite(investedAmount) ? investedAmount : 0,
        hasInvested: Boolean(body.hasInvested),
      });
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "caiwujuece",
          kind: "capstone_buy_vs_rent_v1",
          spending_choices: { choice },
          outcome_summary: asJson(outcome),
        },
      };
    }

    default:
      return { ok: false, error: "invalid_line" };
  }
}

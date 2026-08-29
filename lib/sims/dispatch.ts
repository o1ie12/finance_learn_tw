import { computeSimulation, isValidRentChoice } from "@/lib/simulation";
import {
  computeSavings,
  isSavingsGoalId,
  isSavingsStorageId,
  SAVINGS_MONTHS,
} from "@/lib/sims/savings";
import { computeHousing, isHousingId, type FurnishId } from "@/lib/sims/housing";
import { computeInvesting, isInvestChoiceId } from "@/lib/sims/investing";
import { computeFraud, FRAUD_CARDS } from "@/lib/sims/fraud";
import {
  computeStudentLoan,
  isSchoolType,
  isHousingType,
} from "@/lib/sims/studentLoan";
import { computeTax, isCharacterId } from "@/lib/sims/tax";
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
    case "qixin": {
      const rent = body.rent;
      const tpass = Boolean(body.tpass);
      const savingsRate = Number(body.savingsRate);
      if (!isValidRentChoice(rent)) return { ok: false, error: "invalid_rent" };
      if (!Number.isFinite(savingsRate) || savingsRate < 0 || savingsRate > 100)
        return { ok: false, error: "invalid_savings_rate" };
      const outcome = computeSimulation({ rent, tpass, savingsRate });
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "qixin",
          rent_choice: outcome.chosen.rent,
          savings_rate: outcome.savingsRate,
          spending_choices: {
            tpass: outcome.tpass,
            transitCost: outcome.transitCost,
            livingCost: outcome.livingCost,
          },
          outcome_summary: {
            net: outcome.net,
            leftover: outcome.chosen.leftover,
            deficit: outcome.chosen.deficit,
            monthlySavings: outcome.chosen.monthlySavings,
            annualSavings: outcome.chosen.annualSavings,
            rentCost: outcome.chosen.rentCost,
          },
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
      const housing = body.housing;
      const furnishRaw = body.furnish;
      if (!isHousingId(housing))
        return { ok: false, error: "invalid_housing" };
      const furnish: FurnishId =
        furnishRaw === "cash" ||
        furnishRaw === "installment" ||
        furnishRaw === "none"
          ? furnishRaw
          : "cash";
      const outcome = computeHousing({ housing, furnish });
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "xinyong",
          spending_choices: { housing, furnish },
          outcome_summary: asJson(outcome),
        },
      };
    }

    case "touzi": {
      const choice = body.choice;
      const ipo = Boolean(body.ipo);
      if (!isInvestChoiceId(choice))
        return { ok: false, error: "invalid_choice" };
      const outcome = computeInvesting({ choice, ipo });
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "touzi",
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
          spending_choices: { school, housing, loanCoversPct },
          outcome_summary: asJson(outcome),
        },
      };
    }

    case "baoshui": {
      const character = body.character;
      if (!isCharacterId(character))
        return { ok: false, error: "invalid_character" };
      const outcome = computeTax(character);
      return {
        ok: true,
        outcome,
        storeInput: {
          line_slug: "baoshui",
          spending_choices: { character },
          outcome_summary: asJson(outcome),
        },
      };
    }

    default:
      return { ok: false, error: "invalid_line" };
  }
}

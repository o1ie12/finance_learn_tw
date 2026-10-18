/**
 * The monthly payslip (02 §3.2), from the verified 115年度 payroll constants
 * in lib/sims/taxFiling.ts (TAX_YEAR.payroll). Income tax is not withheld
 * monthly in the game; the yearly tax notice handles it.
 *
 * 勞保: insured salary = gross, floored at the 2026 minimum wage and capped
 *       at NT$45,800 (the 勞保 cap only; brackets are not modelled).
 * 健保: insured amount = gross. The repo has no 健保 bracket table, and its
 *       own cap is far above this game's salaries, so the 勞保 cap is never
 *       applied to it (sources.md item 15).
 */

import { MIN_MONTHLY_WAGE_2026, PAYROLL, UNEMPLOYMENT_RATE, roundMoney } from "./constants";

export interface Payslip {
  gross: number;
  overtime: number;
  laborInsured: number;
  labor: number; // 勞保自付
  health: number; // 健保自付
  pensionSelf: number; // 勞退自提
  pensionRate: number;
  net: number;
}

export function laborInsuredSalary(gross: number): number {
  return Math.min(Math.max(gross, MIN_MONTHLY_WAGE_2026), PAYROLL.laborInsuredSalaryCap);
}

export function payslipFor(gross: number, pensionRate = 0): Payslip {
  const laborInsured = laborInsuredSalary(gross);
  const labor = roundMoney(laborInsured * PAYROLL.laborInsuranceRate * PAYROLL.laborEmployeeShare);
  const health = roundMoney(gross * PAYROLL.healthInsuranceRate * PAYROLL.healthEmployeeShare);
  const pensionSelf = roundMoney(gross * pensionRate);
  return {
    gross,
    overtime: 0,
    laborInsured,
    labor,
    health,
    pensionSelf,
    pensionRate,
    net: gross - labor - health - pensionSelf,
  };
}

/** Net pay with no 自提, for content answers ("實發多少"). */
export function netPay(gross: number): number {
  return payslipFor(gross).net;
}

/** 失業給付: 60% of the insured salary, per month (就業保險法 §16). */
export function unemploymentBenefit(gross: number): number {
  return roundMoney(laborInsuredSalary(gross) * UNEMPLOYMENT_RATE);
}

/**
 * Housing Decision Simulation (信用線 terminal) — pure, testable math.
 *
 * Reuses the First Salary net-salary baseline for consistency across lines,
 * then models the "where do I live?" decision: stay with parents vs. rent with
 * roommates vs. rent alone, plus the credit concepts a first renter meets — a
 * rental deposit (押金) and paying cash vs. an installment plan to furnish the
 * place. Outcome is monthly cash flow per option + the upfront cash needed.
 */
import { NET_SALARY } from "@/lib/simulation";

export const HOUSING_NET = NET_SALARY; // 34,578
export const HOUSING_TRANSIT = 1200; // TPASS, fixed for this scenario
export const FURNISH_CASH = 18000; // one-off cash price to furnish a rented place
export const FURNISH_INSTALLMENT_MONTHS = 6;
export const FURNISH_INSTALLMENT_MONTHLY = 3150; // 6 × 3,150 = 18,900 (+900 手續費)

export type HousingId = "parents" | "roommates" | "alone";

export interface HousingOption {
  id: HousingId;
  label: string;
  blurb: string;
  housingCost: number; // monthly rent, or 孝親費 for parents
  housingLabel: string; // "房租" or "孝親費"
  living: number; // monthly food/daily costs (lower when living with parents)
  depositMonths: number; // rental deposit = depositMonths × rent
  canFurnishInstallment: boolean;
}

export const HOUSING_OPTIONS: HousingOption[] = [
  {
    id: "parents",
    label: "與父母同住",
    blurb: "房租零，給家裡一點孝親費，通勤可能遠一點。",
    housingCost: 5000,
    housingLabel: "孝親費",
    living: 8000,
    depositMonths: 0,
    canFurnishInstallment: false,
  },
  {
    id: "roommates",
    label: "與室友合租",
    blurb: "有自己的空間，分攤房租，押金也比較小。",
    housingCost: 10000,
    housingLabel: "房租",
    living: 12000,
    depositMonths: 2,
    canFurnishInstallment: true,
  },
  {
    id: "alone",
    label: "自己租套房",
    blurb: "最自由，但房租與押金負擔最大。",
    housingCost: 18000,
    housingLabel: "房租",
    living: 12000,
    depositMonths: 2,
    canFurnishInstallment: true,
  },
];

export function getHousing(id: string): HousingOption | undefined {
  return HOUSING_OPTIONS.find((o) => o.id === id);
}
export function isHousingId(v: unknown): v is HousingId {
  return v === "parents" || v === "roommates" || v === "alone";
}
export type FurnishId = "cash" | "installment" | "none";

export interface HousingOptionOutcome {
  id: HousingId;
  housingCost: number;
  housingLabel: string;
  living: number;
  transit: number;
  leftover: number; // monthly, before furnishing installment
  deficit: boolean;
  deposit: number; // upfront rental deposit
}

export interface HousingOutcome {
  net: number;
  transit: number;
  furnish: FurnishId;
  furnishInstallmentMonthly: number; // 0 unless installment
  furnishInstallmentMonths: number;
  chosen: HousingOptionOutcome & {
    leftoverDuringInstallment: number; // leftover minus installment (first months)
    upfrontCash: number; // deposit + (cash furnishing or first installment)
  };
  all: HousingOptionOutcome[];
}

function optionOutcome(o: HousingOption): HousingOptionOutcome {
  const leftover = HOUSING_NET - o.housingCost - o.living - HOUSING_TRANSIT;
  return {
    id: o.id,
    housingCost: o.housingCost,
    housingLabel: o.housingLabel,
    living: o.living,
    transit: HOUSING_TRANSIT,
    leftover,
    deficit: leftover < 0,
    deposit: o.housingCost * o.depositMonths,
  };
}

export interface HousingInput {
  housing: HousingId;
  furnish: FurnishId; // ignored for parents
}

export function computeHousing(input: HousingInput): HousingOutcome {
  const opt = getHousing(input.housing) ?? HOUSING_OPTIONS[0];
  const all = HOUSING_OPTIONS.map(optionOutcome);
  const base = optionOutcome(opt);

  const furnish: FurnishId = opt.canFurnishInstallment ? input.furnish : "none";
  const installmentMonthly =
    furnish === "installment" ? FURNISH_INSTALLMENT_MONTHLY : 0;
  const furnishUpfront =
    furnish === "cash"
      ? FURNISH_CASH
      : furnish === "installment"
        ? FURNISH_INSTALLMENT_MONTHLY // first instalment
        : 0;

  return {
    net: HOUSING_NET,
    transit: HOUSING_TRANSIT,
    furnish,
    furnishInstallmentMonthly: installmentMonthly,
    furnishInstallmentMonths:
      furnish === "installment" ? FURNISH_INSTALLMENT_MONTHS : 0,
    chosen: {
      ...base,
      leftoverDuringInstallment: base.leftover - installmentMonthly,
      upfrontCash: base.deposit + furnishUpfront,
    },
    all,
  };
}

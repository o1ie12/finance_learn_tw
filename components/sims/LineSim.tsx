"use client";

import Simulation from "@/components/Simulation";
import type { InterestId } from "@/lib/studentProfile";
import CareerSim from "@/components/sims/CareerSim";
import SpendingSim from "@/components/sims/SpendingSim";
import SavingsSim from "@/components/sims/SavingsSim";
import CreditCardSim from "@/components/sims/CreditCardSim";
import InvestingSim from "@/components/sims/InvestingSim";
import FraudSim from "@/components/sims/FraudSim";
import StudentLoanSim from "@/components/sims/StudentLoanSim";
import TaxSim from "@/components/sims/TaxSim";
import LeaseSim from "@/components/sims/LeaseSim";
import InsuranceSim from "@/components/sims/InsuranceSim";
import EntrepreneurSim from "@/components/sims/EntrepreneurSim";

/** Renders the right terminal simulation for a line. */
export default function LineSim({
  slug,
  color,
  colorInk,
  income,
  incomeFromCareer,
  interest,
  investable,
}: {
  slug: string;
  color: string;
  colorInk: string;
  // Everything below is resolved on the server from the student's profile and
  // passed down, so these client components never have to know the profile
  // exists — the same arrangement 消費線 has always had for its income.
  income?: number;
  incomeFromCareer?: boolean;
  /** 信用線 words its purchases around this. Wording only. */
  interest?: InterestId | null;
  /** 投資線 works with what 存錢線 produced. */
  investable?: { amount: number; fromSavingsLine: boolean; inShortfall: boolean };
}) {
  switch (slug) {
    case "zhiya":
      return <CareerSim color={color} colorInk={colorInk} />;
    case "qixin":
      return (
        <SpendingSim
          color={color}
          colorInk={colorInk}
          income={income ?? 0}
          incomeFromCareer={Boolean(incomeFromCareer)}
        />
      );
    case "cunqian":
      return <SavingsSim color={color} colorInk={colorInk} />;
    case "xinyong":
      return (
        <CreditCardSim
          color={color}
          colorInk={colorInk}
          interest={interest ?? null}
        />
      );
    case "touzi":
      return (
        <InvestingSim
          color={color}
          colorInk={colorInk}
          investable={investable}
        />
      );
    case "zhapian":
      return <FraudSim color={color} colorInk={colorInk} />;
    case "xuedai":
      return <StudentLoanSim color={color} colorInk={colorInk} />;
    case "baoshui":
      return <TaxSim color={color} />;
    case "zuwu":
      return <LeaseSim color={color} colorInk={colorInk} />;
    case "baoxian":
      return <InsuranceSim color={color} colorInk={colorInk} />;
    case "chuangye":
      return <EntrepreneurSim color={color} colorInk={colorInk} />;
    default:
      return null;
  }
}

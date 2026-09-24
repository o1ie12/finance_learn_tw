"use client";

import Simulation from "@/components/Simulation";
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
}: {
  slug: string;
  color: string;
  colorInk: string;
  // 消費線 spends what 職涯線 produced. Resolved on the server from the
  // student's profile and passed down, so this client component never has to
  // know the profile exists.
  income?: number;
  incomeFromCareer?: boolean;
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
      return <CreditCardSim color={color} colorInk={colorInk} />;
    case "touzi":
      return <InvestingSim color={color} colorInk={colorInk} />;
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

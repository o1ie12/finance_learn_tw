"use client";

import Simulation from "@/components/Simulation";
import SavingsSim from "@/components/sims/SavingsSim";
import HousingSim from "@/components/sims/HousingSim";
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
}: {
  slug: string;
  color: string;
  colorInk: string;
}) {
  switch (slug) {
    case "qixin":
      return <Simulation />;
    case "cunqian":
      return <SavingsSim color={color} colorInk={colorInk} />;
    case "xinyong":
      return <HousingSim color={color} colorInk={colorInk} />;
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

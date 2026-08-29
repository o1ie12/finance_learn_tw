"use client";

import Simulation from "@/components/Simulation";
import SavingsSim from "@/components/sims/SavingsSim";
import HousingSim from "@/components/sims/HousingSim";
import InvestingSim from "@/components/sims/InvestingSim";
import FraudSim from "@/components/sims/FraudSim";

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
    default:
      return null;
  }
}

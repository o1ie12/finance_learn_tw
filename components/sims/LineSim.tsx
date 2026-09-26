"use client";

import Simulation from "@/components/Simulation";
import type { InterestId, FinancialSnapshot } from "@/lib/studentProfile";
import type { LineSlug } from "@/lib/lines";
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
import BuyVsRentSim from "@/components/sims/BuyVsRentSim";
import InvestLinkoutSim from "@/components/sims/InvestLinkoutSim";
import { INVEST_LINKOUT_ENABLED, TWSE_TOOL_URL } from "@/lib/investLinkout";

/** Renders the right terminal simulation for a line. */
export default function LineSim({
  slug,
  color,
  colorInk,
  income,
  incomeFromCareer,
  interest,
  investable,
  snapshot,
}: {
  slug: LineSlug;
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
  /** 財務決策線 opens on the student's whole position. */
  snapshot?: FinancialSnapshot;
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
      // Two modes. The custom simulator is the default and is not deprecated
      // — the linkout only takes over when a human has confirmed the tool and
      // supplied its URL. See lib/investLinkout.ts.
      return INVEST_LINKOUT_ENABLED && TWSE_TOOL_URL ? (
        <InvestLinkoutSim
          color={color}
          colorInk={colorInk}
          toolUrl={TWSE_TOOL_URL}
          investable={investable}
        />
      ) : (
        <InvestingSim
          color={color}
          colorInk={colorInk}
          investable={investable}
        />
      );
    case "zhapian":
      return <FraudSim color={color} colorInk={colorInk} />;
    case "xuedai":
      return (
        <StudentLoanSim
          color={color}
          colorInk={colorInk}
          income={income ?? 0}
          incomeFromCareer={Boolean(incomeFromCareer)}
        />
      );
    case "baoshui":
      return <TaxSim color={color} />;
    case "zuwu":
      return <LeaseSim color={color} colorInk={colorInk} />;
    case "baoxian":
      return <InsuranceSim color={color} colorInk={colorInk} />;
    case "chuangye":
      return <EntrepreneurSim color={color} colorInk={colorInk} />;
    case "caiwujuece":
      return snapshot ? (
        <BuyVsRentSim color={color} colorInk={colorInk} snapshot={snapshot} />
      ) : null;
    default: {
      // Exhaustive on purpose. A new line whose terminal has no case here
      // used to render an empty simulation page with no error — the same
      // silent gap the contract script's A0 guard closes on the server.
      const missing: never = slug;
      throw new Error(`LineSim: no simulation component for line ${String(missing)}`);
    }
  }
}

import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";
import { pageMeta } from "@/lib/pageMeta";

// 11 META-1: the home page keeps the site title as is (no template).
export const metadata: Metadata = {
  ...pageMeta({
    title: "錢途 Finline | 給台灣高中生的免費理財課",
    description: "錢途是給台灣高中生的免費理財課。12 條路線、54 站，每一站讀一份真的帳單、契約或薪資單，做一個決定。",
    path: "/",
  }),
  title: { absolute: "錢途 Finline | 給台灣高中生的免費理財課" },
};

export default function Home() {
  return <Landing />;
}

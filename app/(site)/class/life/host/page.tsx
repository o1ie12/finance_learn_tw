import type { Metadata } from "next";
import "@/app/(game)/game.css";
import { ClassLifeHost } from "@/components/classLife/ClassLifeHost";
import { ClassLifeShell } from "@/components/classLife/ClassLifeShell";

export const metadata: Metadata = {
  title: "人生賽局 課堂模式 · 老師",
  description: "開一場人生賽局：學生分隊，全班同一個開局，依財務健康分排名。",
  robots: { index: false },
};

/** The teacher's screen for a class 人生賽局 round (02 §8). */
export default function ClassLifeHostPage() {
  return (
    <ClassLifeShell>
      <ClassLifeHost />
    </ClassLifeShell>
  );
}

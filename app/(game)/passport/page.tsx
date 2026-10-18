import type { Metadata } from "next";
import { homeFor } from "@/lib/modeModel";
import { getCurrentStudent } from "@/lib/session";
import { getLatestSimulationRunsByLine, isNotConfigured } from "@/lib/db";
import Passport, { buildStamps } from "@/components/Passport";
import { FloatCard } from "@/components/game/FloatCard";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { Crumbs } from "@/components/linePage/parts";
import type { Student, SimulationRun } from "@/lib/types";

export const metadata: Metadata = {
  title: "錢途護照",
  description: "你的累積點數，以及每條線終點模擬的紀念戳章。",
};

export default async function PassportPage() {
  let student: Student | null = null;
  let notConfigured = false;
  let runsByLine: Record<string, SimulationRun> = {};

  try {
    student = await getCurrentStudent();
    if (student) {
      runsByLine = await getLatestSimulationRunsByLine(student.id);
    }
  } catch (e) {
    if (isNotConfigured(e)) notConfigured = true;
  }

  if (!student) {
    return (
      <div className="lp-page lp-page--center">
        <FloatCard as="div" strong>
          <h1 className="lp-h1">錢途護照</h1>
          <p className="lp-muted">
            {notConfigured
              ? "系統的資料庫尚未設定，暫時無法讀取護照。"
              : "先用你的代碼登入，才能看到你的護照。"}
          </p>
          <PrimaryButton href={homeFor(null)} block>
            前往我的路線圖
          </PrimaryButton>
        </FloatCard>
      </div>
    );
  }

  const stamps = buildStamps(runsByLine);

  return (
    <div className="lp-page lp-page--narrow">
      <Crumbs
        items={[
          { label: "我的路線圖", href: homeFor(student?.mode ?? null) },
          { label: "錢途護照" },
        ]}
      />

      <FloatCard as="div" strong index={0}>
        <h1 className="lp-h1">錢途護照</h1>
        <p className="lp-muted">
          每完成一站或一個模擬都會累積點數；走完一條線的終點模擬，就會拿到那條線的紀念戳章。
        </p>
      </FloatCard>

      <Passport
        studentName={student.name}
        pointsTotal={student.points_total}
        stamps={stamps}
      />
    </div>
  );
}

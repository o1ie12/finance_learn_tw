import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FloatCard } from "@/components/game/FloatCard";
import { GoalSetter } from "@/components/onboarding/GoalSetter";
import { isNotConfigured } from "@/lib/db";
import { RECOMMENDED_ORDER } from "@/lib/lifeGame/unlocks";
import { netPay } from "@/lib/lifeGame/payroll";
import { stationLetterCode } from "@/lib/design/lineCode";
import { getLine } from "@/lib/lines";
import { homeFor } from "@/lib/modeModel";
import {
  emergencyGoalAmount,
  starterEssentials,
  starterGross,
  starterMonthlyLeft,
} from "@/lib/onboarding";
import { stationName } from "@/lib/progressModel";
import { getCurrentStudent } from "@/lib/session";
import { readProfile } from "@/lib/studentProfile";
import type { Student } from "@/lib/types";

export const metadata: Metadata = {
  title: "設定你的目標",
  description: "定一個具體、做得到、有期限的存錢目標。",
};

/**
 * Onboarding step 2 (01 §6.3, 04 §1.3) and the first ride. Everything the
 * client needs is resolved here, so the form never loads lib/lines or the
 * module catalogue: the starter budget, the ride's two stations, and the
 * back-view character.
 */
export default async function GoalPage() {
  let student: Student | null = null;
  try {
    student = await getCurrentStudent();
  } catch (e) {
    if (!isNotConfigured(e)) throw e;
    return (
      <div style={{ maxWidth: 480, width: "100%", margin: "40px auto" }}>
        <FloatCard strong title="設定你的目標">
          <p style={{ margin: 0 }}>系統的資料庫還沒設定好，暫時不能存目標。</p>
        </FloatCard>
      </div>
    );
  }
  if (!student) redirect("/signup");

  const profile = readProfile(student.profile);
  const { gross, fromCareerLine } = starterGross(profile);
  const firstLine = getLine(RECOMMENDED_ORDER[0])!;
  const firstStation = firstLine.stationModules[0];
  const goal = profile.goal;

  return (
    <GoalSetter
      monthlyLeft={starterMonthlyLeft(profile)}
      budget={{ gross, net: netPay(gross), essentials: starterEssentials(), fromCareerLine }}
      emergencyAmount={emergencyGoalAmount()}
      initialGoal={
        goal ? { name: goal.name, amount: goal.amount, months: goal.months, reason: goal.reason } : null
      }
      ride={{
        to: {
          lineName: firstLine.name,
          lineEnName: firstLine.enName,
          lineColor: firstLine.color,
          stationName: firstStation != null ? stationName(firstStation) : firstLine.name,
          stationCode: stationLetterCode(firstLine, 1),
        },
      }}
      homeHref={homeFor(student.mode)}
    />
  );
}

import type { Metadata } from "next";
import "@/app/(game)/game.css";
import { FloatCard } from "@/components/game/FloatCard";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { ClassLifePlay } from "@/components/classLife/ClassLifePlay";
import { ClassLifeShell } from "@/components/classLife/ClassLifeShell";
import { readAvatar } from "@/lib/avatar";
import { isNotConfigured } from "@/lib/db";
import { getCurrentStudent } from "@/lib/session";
import type { Student } from "@/lib/types";

export const metadata: Metadata = {
  title: "人生賽局 課堂模式",
  description: "加入老師的房間，和隊友一起過日子。",
  robots: { index: false },
};

/**
 * The student's side of a class 人生賽局 (02 §8). Players must be signed in:
 * a team's save records the student who started it (migration-21,
 * student_id NOT NULL).
 */
export default async function ClassLifePlayPage() {
  let student: Student | null = null;
  let notConfigured = false;
  try {
    student = await getCurrentStudent();
  } catch (e) {
    if (isNotConfigured(e)) notConfigured = true;
    else throw e;
  }

  if (notConfigured || !student) {
    return (
      <ClassLifeShell>
        <div style={{ width: "100%", maxWidth: 560, margin: "0 auto" }}>
          <FloatCard strong title="人生賽局 課堂模式" titleAs="p">
            <h1 className="g-title" style={{ margin: 0 }}>
              {notConfigured ? "暫時不能玩" : "先登入，再加入隊伍"}
            </h1>
            <p className="g-body" style={{ margin: 0 }}>
              {notConfigured
                ? "系統的資料庫還沒設定好，暫時不能玩。"
                : "每一隊的存檔要記在一位同學的帳號下，所以課堂的人生賽局需要先登入。用存取碼或 Google 登入後，再回到這一頁。"}
            </p>
            {notConfigured ? null : (
              <div>
                <PrimaryButton href="/signup">登入或建立帳號</PrimaryButton>
              </div>
            )}
          </FloatCard>
        </div>
      </ClassLifeShell>
    );
  }

  const avatar = readAvatar(student.avatar);
  return (
    <ClassLifeShell>
      <ClassLifePlay studentName={avatar?.name ?? student.name} avatar={avatar} />
    </ClassLifeShell>
  );
}

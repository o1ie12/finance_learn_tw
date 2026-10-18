import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FloatCard } from "@/components/game/FloatCard";
import { CharacterCreator } from "@/components/onboarding/CharacterCreator";
import { readAvatar } from "@/lib/avatar";
import { isNotConfigured } from "@/lib/db";
import { homeFor } from "@/lib/modeModel";
import { needsOnboarding, skipAvatar } from "@/lib/onboarding";
import { getCurrentStudent } from "@/lib/session";
import type { Student } from "@/lib/types";

export const metadata: Metadata = {
  title: "做出你的角色",
  description: "選臉、髮型、衣服和顏色，再取一個名字。",
};

/**
 * Onboarding step 1 (01 §6.2), and the settings menu's 「修改角色」. The
 * first time through, 「完成」 leads on to the goal; after that it is a
 * plain editor that returns home.
 */
export default async function CharacterPage() {
  let student: Student | null = null;
  try {
    student = await getCurrentStudent();
  } catch (e) {
    if (!isNotConfigured(e)) throw e;
    return (
      <div style={{ maxWidth: 480, width: "100%", margin: "40px auto" }}>
        <FloatCard strong title="做出你的角色">
          <p style={{ margin: 0 }}>系統的資料庫還沒設定好，暫時不能存角色。</p>
        </FloatCard>
      </div>
    );
  }
  if (!student) redirect("/signup");

  const onboarding = needsOnboarding(student);
  const home = homeFor(student.mode);
  return (
    <CharacterCreator
      initial={readAvatar(student.avatar) ?? skipAvatar(student.name)}
      next={onboarding ? "/onboarding/goal" : home}
      onboarding={onboarding}
      homeHref={home}
    />
  );
}

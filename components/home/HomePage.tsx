import { redirect } from "next/navigation";
import { needsOnboarding } from "@/lib/onboarding";
import DashboardCodeForm from "@/components/DashboardCodeForm";
import LinkGoogleAccount from "@/components/LinkGoogleAccount";
import { FloatCard } from "@/components/game/FloatCard";
import { getCurrentStudent } from "@/lib/session";
import { isNotConfigured } from "@/lib/db";
import { loadGameHome } from "@/lib/gameHome";
import { readProfile } from "@/lib/studentProfile";
import type { Student } from "@/lib/types";
import { GameHome } from "./GameHome";

/**
 * Shared by /dashboard and /simulate: both render the same game home
 * (01 §6.1). The mode still decides what "required" means (lineStatus is
 * mode-aware) and where homeFor() sends a student; the screen is one.
 */
export async function HomePage({ googleFeedback }: { googleFeedback?: "linked" | "already_used" }) {
  let student: Student | null = null;
  let notConfigured = false;
  try {
    student = await getCurrentStudent();
  } catch (e) {
    if (isNotConfigured(e)) notConfigured = true;
    else throw e;
  }

  if (!student) {
    return (
      <div style={{ maxWidth: 440, width: "100%", margin: "40px auto" }}>
        <FloatCard strong title="找回你的進度">
          <p style={{ margin: 0 }}>用代碼找回你在任何裝置上的進度。</p>
          {notConfigured ? (
            <p style={{ margin: 0 }}>系統的資料庫尚未設定，暫時無法讀取進度。</p>
          ) : (
            <DashboardCodeForm />
          )}
        </FloatCard>
      </div>
    );
  }

  // New and existing students make a character and set a goal once
  // (01 §6.3); both steps can be skipped, which also counts as seen.
  if (needsOnboarding(student)) redirect("/onboarding/character");

  const data = await loadGameHome(student);
  const profile = readProfile(student.profile);
  return (
    <>
      <h1 className="sr-only">{data.name}的首頁</h1>
      {googleFeedback || !student.google_email ? (
        <div style={{ marginBottom: 14 }}>
          <LinkGoogleAccount googleEmail={student.google_email} feedback={googleFeedback} />
        </div>
      ) : null}
      <GameHome data={data} tutorialSeenVersion={profile.tutorialSeenVersion} />
    </>
  );
}

export function feedbackFrom(params: { linked?: string; linked_error?: string }) {
  return params.linked === "1"
    ? ("linked" as const)
    : params.linked_error === "already_used"
      ? ("already_used" as const)
      : undefined;
}

import { redirect } from "next/navigation";
import { needsOnboarding } from "@/lib/onboarding";
import DashboardCodeForm from "@/components/DashboardCodeForm";
import { FloatCard } from "@/components/game/FloatCard";
import { getCurrentStudent } from "@/lib/session";
import { isNotConfigured } from "@/lib/db";
import type { Student } from "@/lib/types";

/**
 * Shared by /dashboard and /simulate. Signed out: the form that finds a
 * student's progress by code. Signed in: on to 今天, the Part E home (or the
 * creator first; a Google-link result goes to 設定).
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
  if (needsOnboarding(student)) redirect("/onboarding/goal");
  // The Part E shell is home now: 今天; a Google-link result shows on 設定.
  if (googleFeedback) redirect(`/settings?${googleFeedback === "linked" ? "linked=1" : "linked_error=already_used"}`);
  redirect("/today");
}

export function feedbackFrom(params: { linked?: string; linked_error?: string }) {
  return params.linked === "1"
    ? ("linked" as const)
    : params.linked_error === "already_used"
      ? ("already_used" as const)
      : undefined;
}

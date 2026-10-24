import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccessCodeReveal from "@/components/AccessCodeReveal";
import LinkGoogleAccount from "@/components/LinkGoogleAccount";
import { feedbackFrom } from "@/components/home/HomePage";
import { isGoogleAuthConfigured } from "@/lib/supabaseAuth";
import ModeToggle from "@/components/ModeToggle";
import SignOutButton from "@/components/SignOutButton";
import { ResetGame } from "@/components/settings/ResetGame";
import TourMenuButton from "@/components/shell/TourMenuButton";
import { TopBar } from "@/components/ui/TopBar";
import { getCurrentStudent } from "@/lib/session";
import s from "@/components/status/status.module.css";

export const metadata: Metadata = { title: "設定" };

/**
 * 設定, from 狀態 (06 E8.7). The rows the older settings menu had, as a
 * list, plus the Google link (it lived on the older home; its ?linked
 * result lands here). No sound or vibration switches: v1 has neither (E13).
 */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string; linked_error?: string }>;
}) {
  const feedback = feedbackFrom(await searchParams);
  const student = await getCurrentStudent().catch(() => null);
  if (!student) redirect("/signup");
  return (
    <>
      <TopBar title="設定" flat back={{ href: "/status" }} />
      <div className={s.page}>
        <div className={s.list} data-list>
          <div className={s.block}>
            <span className={s.cardLabel}>學習模式</span>
            <ModeToggle signedIn placement="page" stay />
          </div>
          <div className={s.row}>
            <TourMenuButton />
          </div>
          {isGoogleAuthConfigured() ? (
            <div className={s.block}>
              <span className={s.cardLabel}>Google 帳號（用 Google 登入，不必記代碼）</span>
              <LinkGoogleAccount googleEmail={student.google_email} feedback={feedback} />
            </div>
          ) : null}
          {student.access_code ? (
            <div className={s.block}>
              <span className={s.cardLabel}>存取碼（換裝置時用來登入）</span>
              <AccessCodeReveal code={student.access_code} />
            </div>
          ) : null}
          <div className={s.block}>
            <span className={s.cardLabel}>人生模擬（路線的進度不受影響）</span>
            <ResetGame />
          </div>
          <div className={s.block}>
            <SignOutButton />
          </div>
        </div>
      </div>
    </>
  );
}

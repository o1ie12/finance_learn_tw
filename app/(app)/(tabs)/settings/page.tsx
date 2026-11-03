import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccessCodeReveal from "@/components/AccessCodeReveal";
import LinkGoogleAccount from "@/components/LinkGoogleAccount";
import { feedbackFrom } from "@/components/home/HomePage";
import { isGoogleAuthConfigured } from "@/lib/supabaseAuth";
import ModeToggle from "@/components/ModeToggle";
import { FLOW_V2 } from "@/lib/flags";
import SignOutButton from "@/components/SignOutButton";
import { ResetGame } from "@/components/settings/ResetGame";
import TourMenuButton from "@/components/shell/TourMenuButton";
import { PageFrame, PageHeader, Panel, pageStyles as ps } from "@/components/page/Page";
import { getCurrentStudent } from "@/lib/session";

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
    <PageFrame>
      <PageHeader kicker="帳號" title="設定" intro="存取碼、使用說明，和重新開始人生模擬。路線的進度都不會受影響。" />
      <div className={ps.grid}>
        {student.access_code ? (
          <Panel label="存取碼（換裝置時用來登入）">
            <AccessCodeReveal code={student.access_code} />
          </Panel>
        ) : null}
        <Panel label="使用說明">
          <TourMenuButton />
        </Panel>
        <Panel label="人生模擬（路線的進度不受影響）">
          <ResetGame />
        </Panel>
        {isGoogleAuthConfigured() ? (
          <Panel label="Google 帳號（用 Google 登入，不必記代碼）">
            <LinkGoogleAccount googleEmail={student.google_email} feedback={feedback} />
          </Panel>
        ) : null}
        {/* 06 G0: one mode; the switch goes with the flag. */}
        {FLOW_V2 ? null : (
          <Panel label="學習模式">
            <ModeToggle signedIn placement="page" stay />
          </Panel>
        )}
        <Panel label="登出">
          <SignOutButton />
        </Panel>
      </div>
    </PageFrame>
  );
}

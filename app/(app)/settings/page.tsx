import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AccessCodeReveal from "@/components/AccessCodeReveal";
import ModeToggle from "@/components/ModeToggle";
import SignOutButton from "@/components/SignOutButton";
import TourMenuButton from "@/components/shell/TourMenuButton";
import { Icon } from "@/components/ui/icons";
import { TopBar } from "@/components/ui/TopBar";
import { getCurrentStudent } from "@/lib/session";
import s from "@/components/status/status.module.css";

export const metadata: Metadata = { title: "設定" };

/**
 * 設定, from 狀態 (06 E8.7). The rows the older settings menu had, as a
 * list. No sound or vibration switches: v1 has neither (E13).
 */
export default async function SettingsPage() {
  const student = await getCurrentStudent().catch(() => null);
  if (!student) redirect("/signup");
  return (
    <>
      <TopBar title="設定" flat back={{ href: "/status" }} />
      <div className={s.page}>
        <div className={s.list} data-list>
          <div className={s.block}>
            <span className={s.cardLabel}>學習模式</span>
            <ModeToggle signedIn placement="page" />
          </div>
          <div className={s.row}>
            <TourMenuButton />
          </div>
          <Link href="/onboarding/character" className={s.row}>
            修改角色
            <Icon name="chevron" size={20} />
          </Link>
          {student.access_code ? (
            <div className={s.block}>
              <span className={s.cardLabel}>存取碼（換裝置時用來登入）</span>
              <AccessCodeReveal code={student.access_code} />
            </div>
          ) : null}
          <div className={s.block}>
            <SignOutButton />
          </div>
        </div>
      </div>
    </>
  );
}

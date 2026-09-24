import type { Metadata } from "next";
import Link from "next/link";
import ModePicker from "@/components/ModePicker";
import { getCurrentStudent } from "@/lib/session";
import { isNotConfigured } from "@/lib/db";
import type { Student } from "@/lib/types";

export const metadata: Metadata = {
  title: "怎麼上這門課",
  description: "選擇你想怎麼走完每一條線：一站一站讀完，或直接開始模擬。",
  robots: { index: false, follow: false },
};

export default async function ModePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Only ever an internal path — never send a student somewhere a query
  // string picked for them.
  const redirectTo = next && next.startsWith("/") ? next : "/dashboard";

  let student: Student | null = null;
  let notConfigured = false;
  try {
    student = await getCurrentStudent();
  } catch (e) {
    if (isNotConfigured(e)) notConfigured = true;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-faint">
        怎麼上這門課
      </p>
      <h1 className="mt-1.5 text-3xl font-black tracking-tight">
        你想怎麼開始？
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
        每一條線都是幾站課程加一個模擬。你可以照順序讀完再做，也可以直接跳進模擬。
      </p>

      <div className="mt-6">
        {notConfigured ? (
          <div className="rounded-2xl border border-hairline bg-surface p-6">
            <p className="text-[15px] leading-relaxed text-ink-soft">
              系統的資料庫尚未設定，暫時無法儲存選擇。
            </p>
          </div>
        ) : student ? (
          <ModePicker current={student.mode} redirectTo={redirectTo} />
        ) : (
          <div className="rounded-2xl border border-hairline bg-surface p-6">
            <p className="text-[15px] leading-relaxed text-ink-soft">
              建立帳號後就能選擇，之後每次回來都會記得。
            </p>
            <Link
              href="/signup"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-ink px-5 py-3 text-base font-semibold text-white hover:-translate-y-0.5"
            >
              建立帳號
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

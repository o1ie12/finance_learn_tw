import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentStudent } from "@/lib/session";
import { getLatestSimulationRunForLine, isNotConfigured } from "@/lib/db";
import { loadSimPortfolioView, toClientView } from "@/lib/simPortfolioModel";
import InvestReplay from "@/components/InvestReplay";
import type { Student } from "@/lib/types";

export const metadata: Metadata = {
  title: "歷史回放投資模擬",
  description: "用一筆模擬資金，盲測一段真實的歷史市場走勢，看看你的配置決定經得起考驗嗎。",
};

export default async function InvestReplayPage() {
  let student: Student | null = null;
  let notConfigured = false;
  let unlocked = false;
  let initialView = null;

  try {
    student = await getCurrentStudent();
    if (student) {
      const touziRun = await getLatestSimulationRunForLine(student.id, "touzi");
      unlocked = Boolean(touziRun);
      if (unlocked) {
        const view = await loadSimPortfolioView(student.id);
        initialView = view ? toClientView(view) : null;
      }
    }
  } catch (e) {
    if (isNotConfigured(e)) notConfigured = true;
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-black tracking-tight">歷史回放投資模擬</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          {notConfigured
            ? "系統的資料庫尚未設定，暫時無法使用這個功能。"
            : "先建立帳號或輸入代碼，才能開始這個模擬。"}
        </p>
        {!notConfigured && (
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-ink px-5 py-3 text-base font-semibold text-white hover:-translate-y-0.5"
          >
            建立帳號或輸入代碼
          </Link>
        )}
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-black tracking-tight">歷史回放投資模擬</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          完成投資線的終點模擬（進場站）後才會解鎖這個功能。
        </p>
        <Link
          href="/line/touzi"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-ink px-5 py-3 text-base font-semibold text-white hover:-translate-y-0.5"
        >
          前往投資線
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="麵包屑" className="mb-3 text-sm text-ink-faint">
        <Link href="/dashboard" className="hover:text-ink">
          我的路線圖
        </Link>{" "}
        <span aria-hidden="true">/</span> 歷史回放投資模擬
      </nav>
      <InvestReplay initialView={initialView} />
    </div>
  );
}

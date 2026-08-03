import type { Metadata } from "next";
import Link from "next/link";
import Simulation from "@/components/Simulation";
import { getCurrentStudent } from "@/lib/session";
import type { Student } from "@/lib/types";

export const metadata: Metadata = {
  title: "第一份薪水模擬",
  description:
    "拿一份 NT$36,000 的台北起薪，練習租屋、交通與儲蓄的取捨，看看一年後的結果，並得到 AI 教練的回饋。",
};

export default async function SimulationPage() {
  let student: Student | null = null;
  let backendReady = true;
  try {
    student = await getCurrentStudent();
  } catch {
    backendReady = false;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-line-1">
          終點站 · 起薪站
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          第一份薪水模擬
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
          你剛畢業、拿到第一份工作。用一份真實的台北起薪，做幾個選擇，看看一年後會走到哪裡。
        </p>
      </header>

      {student ? (
        <Simulation />
      ) : (
        <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-bold">先建立帳號，再開始模擬</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            {backendReady
              ? "模擬結果會存進你的學習路線，之後在儀表板上看得到，也才能拿到 AI 教練的回饋。只需要一組代碼，免密碼、免 email。"
              : "系統的資料庫尚未設定，暫時無法儲存模擬結果。設定完成後即可使用。"}
          </p>
          {backendReady && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-ink px-6 py-3 text-base font-semibold text-white hover:-translate-y-0.5"
              >
                建立帳號
              </Link>
              <Link
                href="/course"
                className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-6 py-3 text-base font-medium hover:border-ink"
              >
                先去上課
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

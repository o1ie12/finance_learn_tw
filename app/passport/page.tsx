import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentStudent } from "@/lib/session";
import { getLatestSimulationRunsByLine, isNotConfigured } from "@/lib/db";
import Passport, { buildStamps } from "@/components/Passport";
import type { Student, SimulationRun } from "@/lib/types";

export const metadata: Metadata = {
  title: "起點護照",
  description: "你的累積點數，以及每條線終點模擬的紀念戳章。",
};

export default async function PassportPage() {
  let student: Student | null = null;
  let notConfigured = false;
  let runsByLine: Record<string, SimulationRun> = {};

  try {
    student = await getCurrentStudent();
    if (student) {
      runsByLine = await getLatestSimulationRunsByLine(student.id);
    }
  } catch (e) {
    if (isNotConfigured(e)) notConfigured = true;
  }

  if (!student) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-black">起點護照</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          {notConfigured
            ? "系統的資料庫尚未設定，暫時無法讀取護照。"
            : "先用你的代碼登入，才能看到你的護照。"}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-ink px-6 py-3 text-base font-semibold text-white"
        >
          前往我的路線圖
        </Link>
      </div>
    );
  }

  const stamps = buildStamps(runsByLine);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="麵包屑" className="text-sm text-ink-faint">
        <Link href="/dashboard" className="hover:text-ink">
          我的路線圖
        </Link>{" "}
        <span aria-hidden="true">/</span> 起點護照
      </nav>

      <header className="mt-4 mb-8">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          起點護照
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          每完成一站或一個模擬都會累積點數；走完一條線的終點模擬，就會拿到那條線的紀念戳章。
        </p>
      </header>

      <Passport
        studentName={student.name}
        pointsTotal={student.points_total}
        stamps={stamps}
      />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import LineCard from "@/components/LineCard";
import { LINES } from "@/lib/lines";
import { allLineStatuses, type LineStatus } from "@/lib/progressModel";
import { getCurrentStudent } from "@/lib/session";
import { getProgress, getLatestSimulationRunsByLine } from "@/lib/db";
import type { ModuleProgress, SimulationRun } from "@/lib/types";

export const metadata: Metadata = {
  title: "所有路線",
  description:
    "起點的路線目錄：起薪線、存錢線、信用線、投資線。每一條都配一套文章課程與一個模擬，用台灣的真實數字學理財。",
};

export default async function LinesPage() {
  let progress: ModuleProgress[] = [];
  let runsByLine: Record<string, SimulationRun> = {};
  let signedIn = false;
  try {
    const student = await getCurrentStudent();
    if (student) {
      signedIn = true;
      [progress, runsByLine] = await Promise.all([
        getProgress(student.id),
        getLatestSimulationRunsByLine(student.id),
      ]);
    }
  } catch {
    /* not configured — show the catalog without progress */
  }

  const statuses = signedIn ? allLineStatuses(progress, runsByLine) : [];
  const statusBySlug = new Map<string, LineStatus>(
    statuses.map((s) => [s.line.slug, s]),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-3xl">
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-line-2">
          路線目錄
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          選一條線，開始你的理財路
        </h1>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-soft">
          每一條線都配一套文章課程與一個真實情境模擬。可以從旗艦的起薪線開始，也可以挑你最想學的先上。
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-[18px] xl:grid-cols-4 xl:gap-5">
        {LINES.map((line) => (
          <LineCard key={line.slug} line={line} status={statusBySlug.get(line.slug)} />
        ))}
      </div>

      {!signedIn && (
        <div className="mt-8 rounded-2xl bg-ink px-6 py-8 text-center text-white">
          <p className="text-lg font-bold">想把進度存起來？</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/75">
            建立一組代碼就能記住你走到哪，免密碼、免 email。
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-ink hover:-translate-y-0.5"
          >
            免費開始
          </Link>
        </div>
      )}
    </div>
  );
}

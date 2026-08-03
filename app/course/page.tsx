import type { Metadata } from "next";
import Link from "next/link";
import RouteMap from "@/components/RouteMap";
import { buildStations } from "@/lib/buildStations";
import { getCurrentStudent } from "@/lib/session";
import { getProgress, getLatestSimulationRun } from "@/lib/db";
import type { ModuleProgress, SimulationRun, Student } from "@/lib/types";

export const metadata: Metadata = {
  title: "課程五站",
  description:
    "五個理財模組：消費心理、預算與行動支付、複利與勞退、台灣的銀行信用與健保、投資與台股證交稅。",
};

export default async function CoursePage() {
  let student: Student | null = null;
  let progress: ModuleProgress[] = [];
  let latestRun: SimulationRun | null = null;

  try {
    student = await getCurrentStudent();
    if (student) {
      [progress, latestRun] = await Promise.all([
        getProgress(student.id),
        getLatestSimulationRun(student.id),
      ]);
    }
  } catch {
    // Backend not configured — render the map in its default (all "todo") state.
  }

  const stations = buildStations(progress, latestRun);
  const completed = progress.filter((p) => p.completed_at).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header>
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-line-2">
          課程路線
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          五站，抵達你的第一份薪水
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
          按順序讀最有感，但你也可以跳到任何一站。每讀完一課、做完小測驗，這條路線就會亮起一段。
        </p>
        {student && (
          <p className="mt-4 text-sm text-ink-faint">
            嗨，{student.name} · 已完成 {completed} / 5 站 ·{" "}
            <Link href="/dashboard" className="font-medium text-line-2 underline">
              查看我的進度
            </Link>
          </p>
        )}
      </header>

      <div className="mt-8 rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
        <RouteMap stations={stations} />
      </div>

      <div className="mt-8 rounded-2xl bg-ink px-6 py-8 text-center text-white">
        <h2 className="text-lg font-bold">讀完五站了嗎？</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/75">
          把學到的東西，用在一份真實的台北起薪上——這是路線的終點站。
        </p>
        <Link
          href="/simulation"
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-ink hover:-translate-y-0.5"
        >
          前往起薪站模擬
        </Link>
      </div>
    </div>
  );
}

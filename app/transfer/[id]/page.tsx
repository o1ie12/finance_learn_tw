import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTransferStation } from "@/lib/transferStations";
import { getLine } from "@/lib/lines";
import { getCurrentStudent } from "@/lib/session";
import { getProgress, getLatestSimulationRunsByLine } from "@/lib/db";
import { allLineStatuses } from "@/lib/progressModel";
import type { Student, ModuleProgress, SimulationRun } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const station = getTransferStation(id);
  if (!station) return { title: "找不到轉乘站" };
  return { title: `轉乘站：${station.title}` };
}

export default async function TransferStationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const station = getTransferStation(id);
  if (!station) notFound();

  const lineA = getLine(station.lineA);
  const lineB = getLine(station.lineB);
  if (!lineA || !lineB) notFound();

  let student: Student | null = null;
  let progress: ModuleProgress[] = [];
  let runsByLine: Record<string, SimulationRun> = {};
  try {
    student = await getCurrentStudent();
    if (student) {
      [progress, runsByLine] = await Promise.all([
        getProgress(student.id),
        getLatestSimulationRunsByLine(student.id),
      ]);
    }
  } catch {
    /* not configured */
  }

  if (!student) notFound();
  const statuses = allLineStatuses(progress, runsByLine);
  const aDone = statuses.find((s) => s.line.slug === lineA.slug)?.complete ?? false;
  const bDone = statuses.find((s) => s.line.slug === lineB.slug)?.complete ?? false;
  if (!aDone || !bDone) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="麵包屑" className="mb-3 text-sm text-ink-faint">
        <Link href="/dashboard" className="hover:text-ink">
          我的路線圖
        </Link>{" "}
        <span aria-hidden="true">/</span> 轉乘站
      </nav>

      {/* Dual line-color bar — the visual tell that this only exists because
          both lines are done. */}
      <div className="flex h-1.5 w-full overflow-hidden rounded-full" aria-hidden="true">
        <div className="flex-1" style={{ background: lineA.color }} />
        <div className="flex-1" style={{ background: lineB.color }} />
      </div>

      <header className="mt-4">
        <p className="font-display text-xs font-bold uppercase tracking-widest text-ink-faint">
          轉乘站 · {lineA.name} × {lineB.name}
        </p>
        <h1 className="mt-1.5 text-3xl font-black tracking-tight">{station.title}</h1>
      </header>

      <div className="mt-6 space-y-4">
        <p className="text-[16px] leading-[1.85] text-ink/90">{station.body}</p>

        <div className="rounded-xl bg-surface p-5" style={{ borderLeft: `4px solid ${lineA.color}` }}>
          <p
            className="font-display text-xs font-bold uppercase tracking-wider"
            style={{ color: lineA.colorInk }}
          >
            台灣現況
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/90">{station.fact}</p>
        </div>

        <div className="rounded-xl bg-surface p-5" style={{ borderLeft: "4px solid #e8542a" }}>
          <p className="font-display text-xs font-bold uppercase tracking-wider" style={{ color: "#e8542a" }}>
            ⚠ 常見錯誤
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/90">{station.mistake}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-3 text-base font-semibold text-white hover:-translate-y-0.5"
        >
          回到我的路線圖
        </Link>
      </div>
    </div>
  );
}

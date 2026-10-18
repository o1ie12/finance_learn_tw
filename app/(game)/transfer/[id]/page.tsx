import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTransferStation } from "@/lib/transferStations";
import { getLine } from "@/lib/lines";
import { getCurrentStudent } from "@/lib/session";
import { getProgress, getLatestSimulationRunsByLine, getLineCompletions } from "@/lib/db";
import { allLineStatuses } from "@/lib/progressModel";
import { effectiveMode, homeFor } from "@/lib/modeModel";
import type { Student, ModuleProgress, SimulationRun } from "@/lib/types";
import { FloatCard } from "@/components/game/FloatCard";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { Crumbs, MistakeBox } from "@/components/linePage/parts";

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
  let completed = new Set<string>();
  try {
    student = await getCurrentStudent();
    if (student) {
      [progress, runsByLine, completed] = await Promise.all([
        getProgress(student.id),
        getLatestSimulationRunsByLine(student.id),
        getLineCompletions(student.id),
      ]);
    }
  } catch {
    /* not configured */
  }

  if (!student) notFound();
  const statuses = allLineStatuses(
    progress,
    runsByLine,
    effectiveMode(student?.mode ?? null),
    completed,
  );
  const aDone = statuses.find((s) => s.line.slug === lineA.slug)?.complete ?? false;
  const bDone = statuses.find((s) => s.line.slug === lineB.slug)?.complete ?? false;
  if (!aDone || !bDone) notFound();

  return (
    <div className="lp-page lp-page--narrow">
      <Crumbs
        items={[
          { label: "我的路線圖", href: homeFor(student?.mode ?? null) },
          { label: "轉乘站" },
        ]}
      />

      <FloatCard as="article" strong index={0}>
        {/* Dual line-color bar: the visual tell that this only exists because
            both lines are done. */}
        <span className="lp-dualbar lp-dualbar--wide" aria-hidden="true">
          <span style={{ background: lineA.color }} />
          <span style={{ background: lineB.color }} />
        </span>
        <p className="lp-eyebrow">
          轉乘站 · {lineA.name} × {lineB.name}
        </p>
        <h1 className="lp-h1">{station.title}</h1>
        <p className="lp-body-text">{station.body}</p>

        <div className="lp-box">
          <p className="lp-box-label">台灣現況</p>
          <p className="lp-lead">{station.fact}</p>
        </div>

        <MistakeBox>{station.mistake}</MistakeBox>
      </FloatCard>

      <div className="lp-actions">
        <PrimaryButton href={homeFor(student?.mode ?? null)}>回到我的路線圖</PrimaryButton>
      </div>
    </div>
  );
}

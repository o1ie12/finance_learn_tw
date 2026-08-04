import type { Metadata } from "next";
import Link from "next/link";
import RouteMap from "@/components/RouteMap";
import CoachPanel from "@/components/CoachPanel";
import DashboardCodeForm from "@/components/DashboardCodeForm";
import SignOutButton from "@/components/SignOutButton";
import { buildStations } from "@/lib/buildStations";
import { getCurrentStudent } from "@/lib/session";
import {
  getProgress,
  getLatestSimulationRun,
  getLatestCoachMessage,
  isNotConfigured,
} from "@/lib/db";
import { RENT_OPTIONS, type RentChoiceId } from "@/lib/simulation";
import { formatNT } from "@/components/Money";
import type {
  Student,
  ModuleProgress,
  SimulationRun,
  CoachMessage,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "我的進度",
  description: "查看你完成的課程模組、測驗分數，以及第一份薪水模擬的結果與教練回饋。",
};

function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function SimSummary({
  run,
  coach,
}: {
  run: SimulationRun;
  coach: CoachMessage | null;
}) {
  const s = run.outcome_summary as Record<string, unknown>;
  const rentOpt = RENT_OPTIONS.find(
    (o) => o.id === (run.rent_choice as RentChoiceId),
  );
  const deficit = Boolean(s.deficit);
  const annual = num(s.annualSavings);
  const leftover = num(s.leftover);
  const tpass = Boolean((run.spending_choices as Record<string, unknown>)?.tpass);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-hairline bg-surface p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-bold">你的模擬結果</h3>
          <Link
            href="/simulation"
            className="text-sm font-medium text-line-2 underline"
          >
            再模擬一次
          </Link>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-ink-faint">住處</dt>
            <dd className="mt-0.5 font-medium">{rentOpt?.label ?? run.rent_choice}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">交通</dt>
            <dd className="mt-0.5 font-medium">{tpass ? "TPASS 月票" : "逐次付"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">儲蓄比例</dt>
            <dd className="money mt-0.5 font-medium">{run.savings_rate}%</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">
              {deficit ? "每月短缺" : "一年約可存"}
            </dt>
            <dd
              className={`money mt-0.5 text-lg font-semibold ${deficit ? "text-negative" : "text-line-3"}`}
            >
              {deficit ? formatNT(Math.abs(leftover)) : formatNT(annual)}
            </dd>
          </div>
        </dl>
      </div>

      <CoachPanel
        runId={run.id}
        initialMessage={coach?.message}
        autoLoad={false}
      />
    </div>
  );
}

export default async function DashboardPage() {
  let student: Student | null = null;
  let notConfigured = false;
  let progress: ModuleProgress[] = [];
  let latestRun: SimulationRun | null = null;
  let coach: CoachMessage | null = null;

  try {
    student = await getCurrentStudent();
    if (student) {
      [progress, latestRun] = await Promise.all([
        getProgress(student.id),
        getLatestSimulationRun(student.id),
      ]);
      if (latestRun) {
        coach = await getLatestCoachMessage(latestRun.id);
      }
    }
  } catch (e) {
    if (isNotConfigured(e)) notConfigured = true;
  }

  // Not signed in (or backend down): show the resume-by-code gate.
  if (!student) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-black tracking-tight">我的進度</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          用代碼找回你在任何裝置上的學習進度。
        </p>
        <div className="mt-6">
          {notConfigured ? (
            <div className="rounded-2xl border border-hairline bg-surface p-6">
              <p className="text-[15px] leading-relaxed text-ink-soft">
                系統的資料庫尚未設定，暫時無法讀取進度。設定完成後即可使用。
              </p>
            </div>
          ) : (
            <DashboardCodeForm />
          )}
        </div>
      </div>
    );
  }

  const stations = buildStations(progress, latestRun);
  const completed = progress.filter((p) => p.completed_at).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {student.name} 的路線圖
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {student.school} · {student.grade} · 完成 {completed} / 5 站
            {latestRun ? " · 模擬已完成" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="money rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm tracking-[0.15em]">
            {student.access_code}
          </span>
          <SignOutButton />
        </div>
      </header>

      <section aria-labelledby="map-heading" className="mt-8">
        <h2 id="map-heading" className="sr-only">
          學習路線
        </h2>
        <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
          <RouteMap stations={stations} />
        </div>
      </section>

      <section aria-labelledby="sim-heading" className="mt-8">
        <h2 id="sim-heading" className="text-xl font-bold">
          終點站：第一份薪水模擬
        </h2>
        <div className="mt-3">
          {latestRun ? (
            <SimSummary run={latestRun} coach={coach} />
          ) : (
            <div className="rounded-2xl border border-hairline bg-surface p-6">
              <p className="text-[15px] leading-relaxed text-ink-soft">
                你還沒跑過模擬。讀完課程後，到終點站用一份真實起薪練習看看。
              </p>
              <Link
                href="/simulation"
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-ink px-5 py-2.5 text-base font-semibold text-white hover:-translate-y-0.5"
              >
                前往起薪站模擬
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

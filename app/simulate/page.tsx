import type { Metadata } from "next";
import Link from "next/link";
import { LINES } from "@/lib/lines";
import { getCurrentStudent } from "@/lib/session";
import {
  getLatestSimulationRunsByLine,
  isNotConfigured,
} from "@/lib/db";
import DashboardCodeForm from "@/components/DashboardCodeForm";
import type { Student, SimulationRun } from "@/lib/types";

export const metadata: Metadata = {
  title: "模擬",
  description: "直接進入每一條線的情境模擬，不必先讀完課程。",
};

/**
 * The 模擬 destination: every line's simulation as a direct entry point.
 *
 * Deliberately not a second dashboard. No route map, no station list, no
 * per-line progress breakdown — the whole point of this screen is that a
 * student who wants to make decisions can start making them.
 *
 * Order comes from the LINES array, not a query against public.lines. Under
 * the agreed ownership split the database holds line *identity* and code
 * owns order, title and presentation; the two happen to agree today, and
 * reading order from the database here would create exactly the second
 * source of truth that split exists to prevent. Flagging rather than
 * silently deviating, as the spec asked.
 */
export default async function SimulatePage() {
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

  const ready = LINES.filter((l) => l.sim.ready);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header>
        <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-faint">
          模擬
        </p>
        <h1 className="mt-1.5 text-3xl font-black tracking-tight sm:text-4xl">
          挑一個情境，直接開始
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          每一個模擬都是一次真實的決定。需要知道的重點會在裡面直接告訴你，不必先讀完課程。
        </p>
      </header>

      {!student && !notConfigured && (
        <div className="mt-6 rounded-2xl border border-hairline bg-surface p-6">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            模擬結果會存進你的學習紀錄。輸入代碼就能接續，或先建立一組。
          </p>
          <div className="mt-4">
            <DashboardCodeForm />
          </div>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {ready.map((line) => {
          const done = Boolean(runsByLine[line.slug]);
          return (
            <li key={line.slug}>
              <Link
                href={`/line/${line.slug}/simulation`}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl border border-hairline bg-surface p-4 transition-colors hover:border-ink/30"
                style={{ borderLeft: `4px solid ${line.color}` }}
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-bold">{line.sim.title}</span>
                    <span className="text-sm text-ink-faint">{line.name}</span>
                    {done && (
                      <span className="text-xs font-semibold text-ink-faint">
                        · 已完成，可以再跑一次
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
                    {line.sim.subtitle}
                  </span>
                </span>
                <span
                  className="shrink-0 whitespace-nowrap text-sm font-semibold"
                  style={{ color: line.colorInk }}
                >
                  開始 <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-sm leading-relaxed text-ink-soft">
        想看完整課程和路網地圖？切到上方的「學習」。兩邊是同一套內容，只是深淺不同。
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLine, lineModules, lineMinutes } from "@/lib/lines";
import { buildLineStations } from "@/lib/buildStations";
import { lineStatus, moduleDoneSet } from "@/lib/progressModel";
import RouteMap from "@/components/RouteMap";
import { getCurrentStudent } from "@/lib/session";
import { getProgress, getLatestSimulationRunForLine, getLineTests } from "@/lib/db";
import { getPrePostQuestions } from "@/lib/prePostQuestions";
import { branchesForLine } from "@/lib/branches";
import type {
  Student,
  ModuleProgress,
  SimulationRun,
  LineTest,
} from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const line = getLine(slug);
  if (!line) return { title: "找不到路線" };
  return { title: `${line.name} · ${line.enName}`, description: line.short };
}

export default async function LineDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const line = getLine(slug);
  if (!line) notFound();

  let student: Student | null = null;
  let progress: ModuleProgress[] = [];
  let run: SimulationRun | null = null;
  let preTest: LineTest | null = null;
  let postTest: LineTest | null = null;
  try {
    student = await getCurrentStudent();
    if (student) {
      const [p, r, tests] = await Promise.all([
        getProgress(student.id),
        getLatestSimulationRunForLine(student.id, line.slug),
        getLineTests(student.id, line.slug),
      ]);
      progress = p;
      run = r;
      preTest = tests.pre;
      postTest = tests.post;
    }
  } catch {
    /* not configured — render the public detail */
  }

  const status = lineStatus(line, moduleDoneSet(progress), run);
  const stations = buildLineStations(line, progress, run);
  const mods = lineModules(line);
  const hasPrePostQuestions = getPrePostQuestions(line.slug).length > 0;
  const branches = branchesForLine(line.slug);
  const firstStationHref = `/line/${line.slug}/course/${line.stationModules[0]}`;

  // Primary call to action.
  let ctaHref = firstStationHref;
  let ctaLabel = "開始第一站";
  if (student) {
    if (status.complete) {
      ctaLabel = "這條線你已完成 · 再看一次";
      ctaHref = firstStationHref;
    } else if (status.next) {
      ctaHref = status.next.href;
      ctaLabel = status.started
        ? `繼續：${status.next.label}`
        : `開始：${status.next.label}`;
    }
  }

  return (
    <div className="pb-12">
      <div
        className="h-1.5 w-full"
        style={{ background: line.color }}
        aria-hidden="true"
      />
      <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <nav aria-label="麵包屑" className="text-sm text-ink-faint">
          <Link href="/lines" className="hover:text-ink">
            所有路線
          </Link>{" "}
          <span aria-hidden="true">/</span> {line.name}
        </nav>

        <header className="mt-4">
          <p
            className="font-display text-sm font-semibold uppercase tracking-widest"
            style={{ color: line.colorInk }}
          >
            {line.enName}
            {line.flagship ? " · 旗艦路線" : ""}
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            {line.name}
          </h1>
          <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-ink-soft">
            {line.short}
          </p>
          <p className="mt-3 text-sm text-ink-faint">
            {mods.length} 站 · 約 {lineMinutes(line)} 分鐘閱讀 · 1 個終點模擬
            {student ? ` · 已完成 ${status.stationsDone}/${status.stationsTotal} 站` : ""}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              {ctaLabel}
            </Link>
            {!student && (
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-6 py-3.5 text-base font-semibold hover:border-ink"
              >
                建立帳號存進度
              </Link>
            )}
          </div>
        </header>

        {/* 前後測 — opt-in, never blocks the line's own progress. */}
        {student && hasPrePostQuestions && (
          <section aria-labelledby="test-heading" className="mt-8">
            {!preTest && !status.started && (
              <div
                className="rounded-2xl bg-surface p-5"
                style={{ borderLeft: `4px solid ${line.color}` }}
              >
                <p className="font-bold">開始前，先測一次自己現在懂多少？</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
                  10 題前測，完成這條線後可以再測一次，看見自己的進步幅度。答錯完全不影響你開始這條線。
                </p>
                <Link
                  href={`/line/${line.slug}/test/pre`}
                  className="mt-3 inline-flex items-center gap-1 rounded-md font-semibold hover:underline"
                  style={{ color: line.colorInk }}
                >
                  開始前測 <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}

            {status.complete && !postTest && (
              <div
                className="rounded-2xl bg-surface p-5"
                style={{ borderLeft: `4px solid ${line.color}` }}
              >
                <p className="font-bold">
                  {preTest ? "來看看你進步了多少" : "來測一次這條線學到的東西"}
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
                  同樣的 10 題後測，{preTest ? "可以跟前測分數比較。" : "沒有前測紀錄也可以直接測。"}
                </p>
                <Link
                  href={`/line/${line.slug}/test/post`}
                  className="mt-3 inline-flex items-center gap-1 rounded-md font-semibold hover:underline"
                  style={{ color: line.colorInk }}
                >
                  開始後測 <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}

            {preTest && postTest && (
              <div
                className="rounded-2xl bg-surface p-5"
                style={{ borderLeft: `4px solid ${line.color}` }}
              >
                <p className="font-bold">
                  前測 {preTest.score} 題 → 後測 {postTest.score} 題
                  {postTest.score > preTest.score
                    ? `，進步了 ${postTest.score - preTest.score} 題`
                    : postTest.score === preTest.score
                      ? "，維持一樣的分數"
                      : ""}
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
                  這就是這條線幫你留下來的東西。
                </p>
              </div>
            )}
          </section>
        )}

        {/* The line's map */}
        <section aria-labelledby="map-heading" className="mt-10">
          <h2 id="map-heading" className="text-xl font-bold">
            這條線怎麼走
          </h2>
          <div className="mt-4 rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
            <RouteMap stations={stations} />
          </div>
        </section>

        {/* Terminal simulation */}
        <section aria-labelledby="sim-heading" className="mt-10">
          <h2 id="sim-heading" className="text-xl font-bold">
            終點站：{line.sim.station}
          </h2>
          <div
            className="mt-4 rounded-2xl bg-surface p-6"
            style={{ borderLeft: `4px solid ${line.color}` }}
          >
            <p className="font-bold">{line.sim.title}</p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
              {line.sim.covers}
            </p>
            {line.sim.ready ? (
              <Link
                href={`/line/${line.slug}/simulation`}
                className="mt-4 inline-flex items-center gap-1 rounded-md font-semibold hover:underline"
                style={{ color: line.colorInk }}
              >
                前往模擬 <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <p className="mt-4 text-sm font-medium text-ink-faint">即將推出</p>
            )}
          </div>
        </section>

        {/* 支線 — optional extra depth, no quiz, not required for "complete" */}
        {branches.length > 0 && (
          <section aria-labelledby="branch-heading" className="mt-10">
            <h2 id="branch-heading" className="text-xl font-bold">
              支線 · 想多知道一點
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {branches.map((b) => (
                <Link
                  key={b.id}
                  href={`/line/${line.slug}/branch/${b.id}`}
                  className="rounded-2xl border border-hairline bg-surface p-4 transition-colors hover:border-ink/40"
                >
                  <p className="font-semibold">{b.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{b.body}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

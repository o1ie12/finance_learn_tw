import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLine } from "@/lib/lines";
import LineSim from "@/components/sims/LineSim";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import { getCurrentStudent } from "@/lib/session";
import TipCard from "@/components/TipCard";
import { effectiveMode, simTips } from "@/lib/modeModel";
import {
  readProfile,
  startingIncome,
  investableAmount,
  financialSnapshot,
} from "@/lib/studentProfile";
import type { Student } from "@/lib/types";
import type { LineSlug } from "@/lib/lines";
import type { StationLesson } from "@/lib/tasks/types";
import { sanitizeHook } from "@/lib/tasks/sanitize";
import { isWrappedTask } from "@/lib/tasks/wrapped";
import { StationRunner } from "@/components/station/StationRunner";
import { WhyFirstCard } from "@/components/station/WhyFirstCard";
import { LessonCardView } from "@/components/tasks/LessonCardView";
import { RevealCard } from "@/components/tasks/RevealCard";
import { FloatCard } from "@/components/game/FloatCard";
import { JourneyCard } from "@/components/station/JourneyCard";
import { capstoneSnapshot } from "@/lib/lifeGame/finale";
import { readAvatar } from "@/lib/avatar";
import { countTaskAttempts, getTaskResults } from "@/lib/db";
import { homeFor } from "@/lib/modeModel";
import { playThenRide } from "@/lib/stationNav";
import { lessonForPage } from "@/lib/tasks/prepare";
import { drawIndices, hashString } from "@/lib/tasks/draw";
import { afterLesson, lineContent, terminalLesson } from "@/lib/tasks/registry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const line = getLine(slug);
  if (!line) return { title: "找不到模擬" };
  return { title: line.sim.title, description: line.sim.covers };
}

export default async function LineSimulationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ classic?: string; hook?: string }>;
}) {
  const { slug } = await params;
  const { classic, hook } = await searchParams;
  const line = getLine(slug);
  if (!line || !line.sim.ready) notFound();

  let student: Student | null = null;
  let backendReady = true;
  try {
    student = await getCurrentStudent();
  } catch {
    backendReady = false;
  }

  const tips = simTips(line, effectiveMode(student?.mode ?? null));
  // Resolved here rather than in the client so the figure cannot be supplied
  // by the browser; the API route resolves it again on submit for the same
  // reason.
  const profile = readProfile(student?.profile);
  const money = startingIncome(profile);
  // Everything a terminal simulation may want to know about this student,
  // resolved once, on the server. Each simulation takes only the piece it
  // needs, and the API route resolves the same values again on submit — the
  // browser is never the source of any of them.
  const investable = investableAmount(profile);
  // The finale reads the life-game state as well (04 §13).
  const finale = student && line.slug === "caiwujuece" ? await capstoneSnapshot(student) : null;
  const snapshot = finale ? finale.snap : financialSnapshot(profile);
  const content = lineContent(line.slug);

  // The redesign's terminal (plan.md §2.3): lines whose simulation became a
  // task set run it here; 詐騙線 runs a random case the student has not
  // played. The original simulation stays reachable as 選讀 (?classic=1)
  // and still writes the profile fields later lines read.
  if (student && classic !== "1") {
    const terminal = await pickTerminal(line.slug, student.id);
    if (terminal) {
      const home = homeFor(student.mode);
      const attempt = (await countTaskAttempts(student.id, terminal.task.id)) + 1;
      return (
        <div className="g-station-page">
          <StationRunner
            lesson={lessonForPage(terminal, student.id, attempt)}
            line={{ slug: line.slug, name: line.name, color: line.color, colorInk: line.colorInk, enName: line.enName }}
            station={{ name: line.sim.station, code: `${line.enName.toUpperCase()} · TERMINAL` }}
            studentId={student.id}
            attempt={attempt}
            goal={profile.goal ? { amount: profile.goal.amount, months: profile.goal.months } : null}
            mode="terminal"
            initialHook={sanitizeHook(terminal.hook.options, hook)}
            // On the first lesson card, so nothing sits under the full-height flow (05 Part C).
            fullLessonHref={`/line/${line.slug}/simulation?classic=1`}
            fullLessonLabel={`玩原本的${line.sim.title}（選讀）`}
            continueHref={playThenRide({ href: home, lineName: "Finline", lineColor: line.color, stationName: "回到首頁", blurb: "看看你的角色和下一站。", lineEnName: "FINLINE", stationCode: "HOME" })}
          />
        </div>
      );
    }
  }
  const after = student && classic !== "1" ? afterLesson(line.slug) : null;
  const afterAttempt = after && student ? (await countTaskAttempts(student.id, after.task.id)) + 1 : 1;
  const wrap = content?.terminal;

  return (
    <div className="g-station-page">
    {content ? (
      <WhyFirstCard
        line={line}
        station={line.sim.station}
        hook={content.hook.question}
        bias={wrap?.reveal.bias ?? content.bias}
        takeaway={content.takeaway}
      />
    ) : null}
    {finale?.journey ? <JourneyCard journey={finale.journey} /> : null}
    {wrap?.lessonCards?.length ? (
      <div className="g-whyfirst">
        {wrap.lessonCards.map((c, i) => (
          <div key={i} style={{ width: "100%", maxWidth: 760 }}>
            <LessonCardView card={c} index={i} />
          </div>
        ))}
      </div>
    ) : null}
    <div className="g-legacy mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="麵包屑" className="mb-3 text-sm text-ink-faint">
        <Link href={`/line/${line.slug}`} className="hover:text-ink">
          {line.name}
        </Link>{" "}
        <span aria-hidden="true">/</span> 終點站
      </nav>

      <PlatformPanel color={line.color} eyebrow={`即將抵達終點站 · ${line.sim.station}`} className="mb-8">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {line.sim.title}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-white/80">
          {line.sim.subtitle}
        </p>
      </PlatformPanel>

      {student ? (
        <>
          {/* sim_first students have not read the stations, so each core
              station's key point comes with them into the decision. In full
              mode this renders nothing — they just read it. */}
          {tips.length > 0 && (
            <section aria-labelledby="tips-heading" className="mb-8 space-y-3">
              <h2
                id="tips-heading"
                className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-faint"
              >
                開始之前，這條線的重點
              </h2>
              {tips.map((t) => (
                <TipCard key={t.moduleNumber} color={line.color} station={t.station}>
                  {t.text}
                </TipCard>
              ))}
            </section>
          )}
          <LineSim
            slug={line.slug}
            color={line.color}
            colorInk={line.colorInk}
            income={money.amount}
            incomeFromCareer={money.fromEarnLine}
            interest={profile.interest ?? null}
            investable={investable}
            snapshot={snapshot}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-bold">先建立帳號，再開始模擬</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            {backendReady
              ? "模擬結果會存進你的學習路線，之後在儀表板上看得到。免密碼、免 email，只需要一個暱稱和你的學校資訊。"
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
                href={`/line/${line.slug}`}
                className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-6 py-3 text-base font-medium hover:border-ink"
              >
                先看看這條線
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
    {after && student ? (
      <StationRunner
        lesson={lessonForPage(after, student.id, afterAttempt)}
        line={{ slug: line.slug, name: line.name, color: line.color, colorInk: line.colorInk, enName: line.enName }}
        station={null}
        studentId={student.id}
        attempt={afterAttempt}
        goal={null}
        mode="library"
        continueHref={playThenRide({ href: homeFor(student.mode), lineName: "Finline", lineColor: line.color, stationName: "回到首頁", blurb: "看看你的角色和下一站。", lineEnName: "FINLINE", stationCode: "HOME" })}
      />
    ) : wrap && student ? (
      <div className="g-whyfirst">
        <div style={{ width: "100%", maxWidth: 760 }}>
          <RevealCard bias={wrap.reveal.bias} text={wrap.reveal.default} />
        </div>
        {wrap.endingText ? (
          <div style={{ width: "100%", maxWidth: 760 }}>
            <FloatCard strong title="終點，也是起點">
              <p style={{ margin: 0 }}>{wrap.endingText.replace("{name}", readAvatar(student.avatar)?.name ?? student.name)}</p>
            </FloatCard>
          </div>
        ) : null}
      </div>
    ) : null}
    </div>
  );
}

/** The terminal task set to run, or null when the line keeps its simulation. */
async function pickTerminal(slug: LineSlug, studentId: string): Promise<StationLesson | null> {
  if (slug === "zhapian") {
    // A case not yet played (station or simulation page: both are logged in
    // task_results), picked by a seed from the student and how many they
    // have played, so a refresh shows the same case.
    // Case files only: a wrapped station quiz is not a case (05 A1).
    const cases = (lineContent(slug)?.lessons ?? []).filter((l) => !isWrappedTask(l.task));
    const played = new Set((await getTaskResults(studentId)).map((r) => r.task_set_id));
    const unplayed = cases.filter((c) => !played.has(c.task.id));
    const pool = unplayed.length ? unplayed : cases;
    if (!pool.length) return null;
    const pick = drawIndices(pool.length, 1, hashString(`${studentId}|zhapian|${played.size}`))[0];
    return { ...pool[pick], placement: "terminal" };
  }
  return terminalLesson(slug);
}

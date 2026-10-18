import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { getLine, lineModules, lineMinutes } from "@/lib/lines";
import { buildLineStations } from "@/lib/buildStations";
import { effectiveMode, optionalStations, readingRequired } from "@/lib/modeModel";
import { lineStatus, moduleDoneSet } from "@/lib/progressModel";
import RouteMap from "@/components/RouteMap";
import { getCurrentStudent } from "@/lib/session";
import { getProgress, getLatestSimulationRunForLine, getLineTests, getLineCompletions } from "@/lib/db";
import { comparablePrePost, getPrePostQuestions } from "@/lib/prePostQuestions";
import { branchesForLine } from "@/lib/branches";
import { libraryLessons, lineContent } from "@/lib/tasks/registry";
import { FloatCard } from "@/components/game/FloatCard";
import { StationSign } from "@/components/game/StationSign";
import { StatBar } from "@/components/game/StatBar";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { Icon } from "@/components/game/icons";
import { ArrowLink, Crumbs, LinkRows, SecondaryButton } from "@/components/linePage/parts";
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
  let completedBefore = false;
  let preTest: LineTest | null = null;
  let postTest: LineTest | null = null;
  let earlierTests: { pre: LineTest | null; post: LineTest | null } = {
    pre: null,
    post: null,
  };
  try {
    student = await getCurrentStudent();
    if (student) {
      const [p, r, tests, c] = await Promise.all([
        getProgress(student.id),
        getLatestSimulationRunForLine(student.id, line.slug),
        getLineTests(student.id, line.slug),
        getLineCompletions(student.id),
      ]);
      progress = p;
      run = r;
      completedBefore = c.has(line.slug);
      preTest = tests.pre;
      postTest = tests.post;
      earlierTests = tests.earlier;
    }
  } catch {
    /* not configured — render the public detail */
  }

  const mode = effectiveMode(student?.mode ?? null);
  const status = lineStatus(line, moduleDoneSet(progress), run, mode, completedBefore);
  const stations = buildLineStations(line, progress, run, mode);
  const mods = lineModules(line);
  const prePostCount = getPrePostQuestions(line.slug).length;
  const hasPrePostQuestions = prePostCount > 0;
  const branches = branchesForLine(line.slug);
  const optional = readingRequired(mode) ? [] : optionalStations(line, mode);
  const content = lineContent(line.slug);
  const library = libraryLessons(line.slug);
  const firstStationHref = `/line/${line.slug}/course/${line.stationModules[0]}`;
  // The certificate page shows the certificate only with a run on record.
  const certificateEarned = Boolean(student && status.complete && run);
  const lineVars = { "--line-color": line.color, "--line-ink": line.colorInk } as CSSProperties;

  // Primary call to action.
  let ctaHref = firstStationHref;
  let ctaLabel = "開始第一站";
  // sim_first sends a student to the decision first; the stations are there
  // for whoever wants them. full keeps the existing station-by-station path.
  if (!readingRequired(mode) && line.sim.ready) {
    ctaHref = `/line/${line.slug}/simulation`;
    ctaLabel = run ? "再跑一次模擬" : `開始：${line.sim.station}`;
  }
  if (student) {
    if (status.complete) {
      ctaLabel = "這條線你已完成 · 再看一次";
      ctaHref = readingRequired(mode)
        ? firstStationHref
        : `/line/${line.slug}/simulation`;
    } else if (status.next && readingRequired(mode)) {
      ctaHref = status.next.href;
      ctaLabel = status.started
        ? `繼續：${status.next.label}`
        : `開始：${status.next.label}`;
    }
  }

  const showPreInvite = Boolean(student && hasPrePostQuestions && !preTest && !status.started);
  const showPostInvite = Boolean(student && hasPrePostQuestions && status.complete && !postTest);
  const showGain = Boolean(
    student && hasPrePostQuestions && preTest && postTest && comparablePrePost(preTest, postTest),
  );
  const showEarlier = Boolean(
    student && hasPrePostQuestions && (earlierTests.pre || earlierTests.post),
  );
  const showTests = showPreInvite || showPostInvite || showGain || showEarlier;

  return (
    <div className="lp-page" style={lineVars}>
      <Crumbs items={[{ label: "所有路線", href: "/lines" }, { label: line.name }]} />

      <div className="lp-grid">
        <div className="lp-col">
          {/* Header: the line's sign, why it exists, and where to start. */}
          <FloatCard as="div" strong className="lp-head" index={0}>
            <StationSign
              as="h1"
              line={line}
              station={line.name}
              code={line.enName.toUpperCase()}
            />
            {line.flagship ? <span className="lp-tag" style={{ alignSelf: "flex-start" }}>旗艦路線</span> : null}
            {content ? (
              <div className="lp-why">
                <p>先想一想：{content.hook.question}</p>
                <p>
                  這條線談的心理陷阱：<strong>「{content.bias}」</strong>
                </p>
              </div>
            ) : null}
            <p className="lp-lead">{line.short}</p>
            <p className="lp-caption g-num">
              {mods.length} 站 · 約 {lineMinutes(line)} 分鐘閱讀 · 1 個終點模擬
            </p>
            {student ? (
              <StatBar
                label="這條線的進度"
                value={`已完成 ${status.stationsDone} / ${status.stationsTotal} 站`}
                percent={status.stationsTotal ? (status.stationsDone / status.stationsTotal) * 100 : 0}
                tone="good"
              />
            ) : null}
            <div className="lp-actions">
              <PrimaryButton href={ctaHref} line={line}>
                {ctaLabel}
                <Icon name="arrow" size={18} />
              </PrimaryButton>
              {!student ? <SecondaryButton href="/signup">建立帳號存進度</SecondaryButton> : null}
            </div>
          </FloatCard>

          {/* 前後測: opt-in, never blocks the line's own progress. */}
          {showTests ? (
            <FloatCard title="前後測" index={1}>
              {showPreInvite ? (
                <div className="lp-box">
                  <p className="lp-h2">開始前，先測一次自己現在懂多少？</p>
                  <p className="lp-muted">
                    {prePostCount} 題前測，完成這條線後可以再測一次，看見自己的進步幅度。答錯完全不影響你開始這條線。
                  </p>
                  <ArrowLink href={`/line/${line.slug}/test/pre`}>開始前測</ArrowLink>
                </div>
              ) : null}

              {showPostInvite ? (
                <div className="lp-box">
                  <p className="lp-h2">
                    {preTest ? "來看看你進步了多少" : "來測一次這條線學到的東西"}
                  </p>
                  <p className="lp-muted">
                    同樣的 {prePostCount} 題後測，{preTest ? "可以跟前測分數比較。" : "沒有前測紀錄也可以直接測。"}
                  </p>
                  <ArrowLink href={`/line/${line.slug}/test/post`}>開始後測</ArrowLink>
                </div>
              ) : null}

              {showGain && preTest && postTest ? (
                <div className="lp-box lp-box--good">
                  <p className="lp-h2 g-num">
                    前測 {preTest.score} 題 → 後測 {postTest.score} 題
                    {postTest.score > preTest.score
                      ? `，進步了 ${postTest.score - preTest.score} 題`
                      : postTest.score === preTest.score
                        ? "，維持一樣的分數"
                        : ""}
                  </p>
                  <p className="lp-muted">這就是這條線幫你留下來的東西。</p>
                </div>
              ) : null}

              {/* Attempts on an earlier version of this line's bank. Shown so a
                  student's history doesn't vanish, and labelled so it is never
                  read against a score on the current questions. */}
              {showEarlier ? (
                <p className="lp-caption g-num">
                  你之前做過這條線的舊版測驗
                  {earlierTests.pre &&
                    `：前測 ${earlierTests.pre.score} / ${earlierTests.pre.total} 題`}
                  {earlierTests.post &&
                    `${earlierTests.pre ? "、" : "："}後測 ${earlierTests.post.score} / ${earlierTests.post.total} 題`}
                  。題目已經更新，舊分數不會拿來跟新題目比較。
                </p>
              ) : null}
            </FloatCard>
          ) : null}

          {/* The line's map */}
          <FloatCard title="這條線怎麼走" index={2}>
            <RouteMap stations={stations} />
          </FloatCard>

          {/* Terminal simulation */}
          <FloatCard title={`終點站：${line.sim.station}`} index={3}>
            <p className="lp-h2">{line.sim.title}</p>
            <p className="lp-muted">{line.sim.covers}</p>
            {line.sim.ready ? (
              <ArrowLink href={`/line/${line.slug}/simulation`}>前往模擬</ArrowLink>
            ) : (
              <p className="lp-caption">即將推出</p>
            )}
          </FloatCard>

          {/* In sim_first the deep stations are still listed and still linked:
              they are optional, not removed. Saying so plainly beats quietly
              dropping them from the page, which would read as content missing
              rather than content offered. */}
          {optional.length > 0 ? (
            <FloatCard title="想多讀一點（不強制）" index={4}>
              <p className="lp-muted">
                你選的是直接做模擬。這幾站不影響你做決定，但想深入的話都在這裡。
              </p>
              <LinkRows
                items={optional.map((m) => ({
                  key: m.number,
                  href: `/line/${line.slug}/course/${m.number}`,
                  title: m.station,
                  sub: m.title,
                }))}
              />
            </FloatCard>
          ) : null}
        </div>

        <div className="lp-col">
          {content ? (
            <FloatCard title="在人生遊戲裡解鎖" index={1}>
              <p className={`lp-unlock${status.complete ? " lp-unlock--on" : ""}`}>
                <Icon name={status.complete ? "check" : "lock"} size={18} />
                <span>{content.unlocks}</span>
              </p>
              <p className="lp-caption">
                {status.complete
                  ? "已解鎖：這些行動已經出現在你的人生遊戲裡。"
                  : "完成這條線後，這些行動會出現在你的人生遊戲裡。"}
              </p>
            </FloatCard>
          ) : null}

          <FloatCard title="完成證書" index={2}>
            <div className="lp-cert-tile">
              <span
                className={`lp-cert-seal${certificateEarned ? " lp-cert-seal--earned" : ""}`}
                aria-hidden="true"
              >
                <Icon name={certificateEarned ? "check" : "lock"} size={22} />
              </span>
              <div className="lp-row-text">
                <p className="lp-h2">
                  {certificateEarned ? `${line.name}完成證書` : "還沒拿到證書"}
                </p>
                <p className="lp-muted">
                  {certificateEarned
                    ? "證書上有你走過的每一站和模擬結果。"
                    : "走完這條線的必經站與終點模擬，就會拿到完成證書。"}
                </p>
              </div>
            </div>
            {certificateEarned ? (
              <ArrowLink href={`/line/${line.slug}/certificate`}>查看完成證書</ArrowLink>
            ) : null}
          </FloatCard>

          {library.length > 0 ? (
            <FloatCard
              title={line.slug === "zhapian" ? "案件庫" : "加碼任務"}
              aside="不影響進度，隨時可以做"
              index={3}
            >
              <LinkRows
                label={line.slug === "zhapian" ? "案件庫" : "加碼任務"}
                items={library.map((lesson) => ({
                  key: lesson.task.id,
                  href: `/line/${line.slug}/task/${encodeURIComponent(lesson.task.id)}`,
                  title: lesson.task.title,
                  end: <span className="g-num">約 {lesson.minutes} 分鐘</span>,
                }))}
              />
            </FloatCard>
          ) : null}

          {/* 支線: optional extra depth, no quiz, not required for "complete" */}
          {branches.length > 0 ? (
            <FloatCard title="支線 · 想多知道一點" index={4}>
              <LinkRows
                items={branches.map((b) => ({
                  key: b.id,
                  href: `/line/${line.slug}/branch/${b.id}`,
                  title: b.title,
                  sub: b.body,
                  clamp: true,
                }))}
              />
            </FloatCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}

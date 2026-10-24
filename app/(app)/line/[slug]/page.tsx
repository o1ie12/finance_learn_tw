import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LinePageE, type LinePageData, type StationRow } from "@/components/linePage/LinePageE";
import { TabFrame } from "@/components/ui/TabFrame";
import { LINE_PAGES } from "@/content/linePages";
import { buildLineStations } from "@/lib/buildStations";
import { getLatestSimulationRunForLine, getLineCompletions, getLineTests, getProgress, getTaskResults } from "@/lib/db";
import { stationLetterCode } from "@/lib/design/lineCode";
import { lineVars } from "@/lib/design/lineVars";
import { branchesForLine } from "@/lib/branches";
import { getLine, lineMinutes, type LineSlug } from "@/lib/lines";
import { effectiveMode, optionalStations, readingRequired } from "@/lib/modeModel";
import { getModule } from "@/lib/modules";
import { comparablePrePost, getPrePostQuestions } from "@/lib/prePostQuestions";
import { lineStatus, moduleDoneSet } from "@/lib/progressModel";
import { getCurrentStudent } from "@/lib/session";
import { lessonForStation, libraryLessons, lineContent, terminalLesson } from "@/lib/tasks/registry";
import type { LineTest, ModuleProgress, SimulationRun, Student, TaskResultRow } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const line = getLine((await params).slug);
  if (!line) return { title: "找不到路線" };
  return { title: `${line.name} · ${line.enName}`, description: line.short };
}

/** Part E stations open on /station/; the older flow keeps /course/. */
const toStation = (href?: string) => href?.replace(/^\/line\/([^/]+)\/course\//, "/line/$1/station/");

/**
 * A line's program page on the Part E design (06 E8.9, F3.5, F3.6). Same
 * data and behavior as before (progress, the terminal, tests, optional
 * stations, 加碼任務, 支線), restyled; plus the promise, the fact row, the
 * achievements and each station's 你會學到 / 你要做的.
 */
export default async function LinePage({ params }: { params: Promise<{ slug: string }> }) {
  const line = getLine((await params).slug);
  if (!line) notFound();
  const slug = line.slug as LineSlug;

  let student: Student | null = null;
  let progress: ModuleProgress[] = [];
  let run: SimulationRun | null = null;
  let completedBefore = false;
  let tests: { pre: LineTest | null; post: LineTest | null } = { pre: null, post: null };
  let results: TaskResultRow[] = [];
  try {
    student = await getCurrentStudent();
    if (student) {
      const [p, r, t, c, tr] = await Promise.all([
        getProgress(student.id),
        getLatestSimulationRunForLine(student.id, slug),
        getLineTests(student.id, slug),
        getLineCompletions(student.id),
        getTaskResults(student.id),
      ]);
      progress = p;
      run = r;
      tests = { pre: t.pre, post: t.post };
      completedBefore = c.has(slug);
      results = tr.filter((x) => x.line_slug === slug);
    }
  } catch {
    /* not configured: the public page */
  }

  const mode = effectiveMode(student?.mode ?? null);
  const status = lineStatus(line, moduleDoneSet(progress), run, mode, completedBefore);
  const page = LINE_PAGES[slug];
  const content = lineContent(slug);
  const terminal = terminalLesson(slug);
  const optionalNums = new Set(readingRequired(mode) ? [] : optionalStations(line, mode).map((m) => m.number));

  // The station list: one row per station, then the terminal.
  const built = buildLineStations(line, progress, run, mode);
  // buildLineStations marks at most one station per line as current.
  const rows: (StationRow & { moduleNumber: number | null })[] = built.map((r, j) => {
    const moduleNumber = r.terminal ? null : Number(r.key.split("-m")[1]);
    const lesson = r.terminal ? terminal : moduleNumber ? lessonForStation(slug, moduleNumber) : null;
    const st: StationRow["status"] = r.status === "done" ? "done" : r.status === "current" ? "current" : "next";
    return {
      key: r.key,
      code: stationLetterCode(line, j + 1),
      moduleNumber,
      name: r.label,
      learn: lesson?.task.brief.learn ?? (r.terminal ? line.sim.covers : (moduleNumber ? getModule(moduleNumber)?.title : null) ?? null),
      does: lesson?.task.brief.do ?? null,
      minutes: lesson?.minutes ?? null,
      status: st,
      href: toStation(r.href),
      terminal: r.terminal,
      meta: r.meta,
    };
  });
  const stations = rows.filter((r) => r.moduleNumber === null || !optionalNums.has(r.moduleNumber));
  const optional = rows.filter((r) => r.moduleNumber !== null && optionalNums.has(r.moduleNumber));

  // 上車 goes to where the student continues (through the tap-in gate).
  const nextRow = student ? rows.find((r) => r.status === "current" && r.href) : null;
  const next = nextRow ? { name: nextRow.name, code: nextRow.code, href: nextRow.href! } : null;
  const doneCount = stations.filter((r) => r.status === "done").length;

  // 學習紀錄用語: built only from what the student actually did (F3.5).
  const done = [...new Map(results.map((r) => [r.task_set_id, r])).keys()];
  const doneLessons = (content?.lessons ?? []).filter((l) => done.includes(l.task.id));
  const minutes = doneLessons.reduce((a, l) => a + l.minutes, 0);
  const snippet = doneLessons.length
    ? `完成 Finline「${line.name}」線上自主學習（${doneLessons.length} 個任務，約 ${minutes} 分鐘），做了「${doneLessons
        .slice(0, 3)
        .map((l) => l.task.title)
        .join("」「")}」${doneLessons.length > 3 ? "等任務" : ""}，練習了${page.skills.slice(0, 3).join("、")}。線上自主學習，非實習或工作經驗。`
    : null;

  // 前後測: opt-in, never blocks progress.
  const count = getPrePostQuestions(slug).length;
  const testCards: LinePageData["tests"] = [];
  if (student && count > 0) {
    if (!tests.pre && !status.started)
      testCards.push({ title: "開始前，先測一次", body: `${count} 題前測，走完這條線後可以再測一次，看見自己的進步。答錯不影響開始。`, href: `/line/${slug}/test/pre`, link: "開始前測" });
    if (status.complete && !tests.post)
      testCards.push({ title: "測一次學到的東西", body: `同樣的 ${count} 題後測${tests.pre ? "，可以和前測比較。" : "。"}`, href: `/line/${slug}/test/post`, link: "開始後測" });
    if (tests.pre && tests.post && comparablePrePost(tests.pre, tests.post))
      testCards.push({ title: `前測 ${tests.pre.score} 題 → 後測 ${tests.post.score} 題`, body: "這就是這條線留下來的東西。", href: `/line/${slug}/test/post`, link: "再測一次" });
  }

  const data: LinePageData = {
    slug,
    name: line.name,
    enName: line.enName,
    code: stationLetterCode(line, 1).replace(/\d+$/, ""),
    color: line.color,
    promise: page.promise,
    facts: ["免費", "自學", `約 ${lineMinutes(line)} 分鐘`, page.difficulty],
    board: [
      { label: "站數", value: `${stations.length} 站` },
      { label: "時間", value: `${lineMinutes(line)} 分` },
      { label: "難度", value: page.difficulty },
    ],
    next,
    done: doneCount,
    total: stations.length,
    signedIn: Boolean(student),
    certificate: { earned: Boolean(student && status.complete && run), href: `/line/${slug}/certificate` },
    snippet,
    interview: page.interview,
    skills: page.skills,
    unlocks: content ? { text: content.unlocks, on: status.complete } : null,
    tests: testCards,
    stations,
    optional,
    library: libraryLessons(slug).map((l) => ({
      key: l.task.id,
      title: l.task.title,
      minutes: l.minutes,
      href: `/line/${slug}/bonus/${encodeURIComponent(l.task.id)}`,
    })),
    libraryTitle: slug === "zhapian" ? "案件庫" : "加碼任務",
    branches: branchesForLine(slug).map((b) => ({ key: b.id, title: b.title, href: `/line/${slug}/branch/${b.id}` })),
    intro: page.intro,
  };

  const body = (
    <div style={{ ...lineVars(line), display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <LinePageE d={data} />
    </div>
  );
  // Signed in, the course page sits beside the sidebar (the tab bar on a phone).
  return student ? <TabFrame>{body}</TabFrame> : body;
}

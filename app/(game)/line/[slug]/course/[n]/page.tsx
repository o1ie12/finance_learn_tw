import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LESSON_BODIES } from "@/components/lessons";
import { Icon } from "@/components/ui/icons";
import { lineVars } from "@/lib/design/lineVars";
import { stationLetterCode } from "@/lib/design/lineCode";
import { LINES, getLine, getLineByModule } from "@/lib/lines";
import { getModule } from "@/lib/modules";
import { getCurrentStudent } from "@/lib/session";
import { lessonForStation } from "@/lib/tasks/registry";
import type { Student } from "@/lib/types";
import s from "./article.module.css";

export function generateStaticParams() {
  return LINES.flatMap((line) => line.stationModules.map((n) => ({ slug: line.slug, n: String(n) })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; n: string }> }): Promise<Metadata> {
  const { n } = await params;
  const mod = getModule(Number(n));
  if (!mod) return { title: "找不到課程" };
  return { title: `${mod.station} · ${mod.title}`, description: mod.subtitle };
}

/**
 * A station's article (2026-11-02): optional reading beside the task, never
 * a gate. Signed in, the station itself is the job-simulation workspace, so
 * this URL opens it unless ?read=1 asks for the article. The article is one
 * scrolling page (no paged reader, no quiz to finish), with the task one tap
 * away.
 */
export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; n: string }>;
  searchParams: Promise<{ read?: string; hook?: string }>;
}) {
  const { slug, n } = await params;
  const { read, hook } = await searchParams;
  const num = Number(n);
  const line = getLine(slug);
  const mod = getModule(num);
  if (!line || !mod) notFound();
  if (!line.stationModules.includes(num)) {
    const owner = getLineByModule(num);
    if (owner) redirect(`/line/${owner.slug}/course/${num}`);
    notFound();
  }

  const lesson = lessonForStation(line.slug, num);
  let student: Student | null = null;
  try {
    student = await getCurrentStudent();
  } catch {
    student = null;
  }
  const stationHref = `/line/${line.slug}/station/${num}${hook ? `?hook=${encodeURIComponent(hook)}` : ""}`;
  if (lesson && student && read !== "1") redirect(stationHref);

  const Body = LESSON_BODIES[num];
  const idx = line.stationModules.indexOf(num);
  const code = stationLetterCode(line, idx + 1);

  return (
    <div className={s.page} style={lineVars(line)}>
      <nav className={s.crumbs} aria-label="位置">
        <Link href={student ? "/map" : "/lines"}>路線圖</Link>
        <Icon name="chevron" size={14} />
        <Link href={`/line/${line.slug}`}>{line.name}</Link>
        <Icon name="chevron" size={14} />
        <span>{mod.station}</span>
      </nav>
      <div className={s.layout}>
        <article className={s.article}>
          <header className={s.head}>
            <p className={s.kicker}>
              <span className={s.badge}>{code}</span>
              延伸閱讀 · {mod.station} · 約 {mod.minutes} 分鐘
            </p>
            <h1 className={s.h1}>{mod.title}</h1>
            <p className={s.sub}>{mod.subtitle}</p>
          </header>
          <div className={`station-content-flow ${s.body}`}>{Body ? <Body /> : <p>這一站的文章還在整理中。</p>}</div>
        </article>
        <aside className={s.side}>
          <div className={s.card}>
            <p className={s.label}>這一站的任務</p>
            <p className={s.cardTitle}>{lesson?.task.title ?? mod.station}</p>
            {lesson ? <p className={s.cardText}>{lesson.task.brief.do}</p> : null}
            <Link href={student ? stationHref : "/signup"} className={s.primary}>
              {student ? "回到任務" : "免費開始，做這個任務"}
              <Icon name="chevron" size={18} />
            </Link>
            <p className={s.fine}>文章是選讀，不影響進度。站點完成看的是任務。</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

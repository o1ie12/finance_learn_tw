import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader, Panel, pageStyles as ps } from "@/components/page/Page";
import { getLine, lineModules } from "@/lib/lines";
import { getPrePostQuestions } from "@/lib/prePostQuestions";
import { getCurrentStudent } from "@/lib/session";
import { getLatestSimulationRunForLine } from "@/lib/db";
import { reviewEligibleLines } from "@/lib/reviewModel";
import ReviewCheck from "@/components/ReviewCheck";
import { LinkRows } from "@/components/linePage/parts";
import type { Student } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const line = getLine(slug);
  if (!line) return { title: "找不到複習" };
  return { title: `複習：${line.name}` };
}

export default async function LineReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const line = getLine(slug);
  if (!line) notFound();

  let student: Student | null = null;
  let eligible = false;
  try {
    student = await getCurrentStudent();
    if (student) {
      const run = await getLatestSimulationRunForLine(student.id, line.slug);
      if (run) {
        eligible = reviewEligibleLines([line], { [line.slug]: run }).length > 0;
      }
    }
  } catch {
    /* not configured */
  }

  if (!student) redirect("/signup");
  // 2026-11-03: not open yet says when it opens, instead of a bare 404.
  if (!eligible) {
    return (
      <PageHeader
        kicker={`${line.name} · 複習`}
        title="複習還沒開放"
        intro={`走完${line.name}一週後，這裡會出現各站的重點和兩題快速回想。`}
        actions={
          <Link href={`/line/${line.slug}`} className={ps.secondary}>
            回到{line.name}
          </Link>
        }
      />
    );
  }

  const mods = lineModules(line);
  const questions = getPrePostQuestions(line.slug).slice(0, 2);

  return (
    <div
      className={ps.stack}
      style={{ "--line-color": line.color, "--line-ink": line.colorInk } as CSSProperties}
    >
      <PageHeader
        kicker={`${line.name} · 複習`}
        title={`${line.name}，一週前你完成了這條線`}
        intro="花一分鐘回顧一下重點，再看看還記得多少。"
        actions={
          <Link href={`/line/${line.slug}`} className={ps.secondary}>
            回到{line.name}
          </Link>
        }
      />

      {questions.length > 0 && (
        <Panel label="快速回想">
          <ReviewCheck questions={questions} color={line.colorInk} />
        </Panel>
      )}

      <Panel label="回顧各站的常見錯誤">
        <LinkRows
          items={mods.map((m) => ({
            key: m.number,
            href: `/line/${line.slug}/course/${m.number}`,
            title: m.station,
            sub: m.title,
          }))}
        />
      </Panel>
    </div>
  );
}

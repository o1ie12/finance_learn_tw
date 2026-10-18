import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { homeFor } from "@/lib/modeModel";
import { notFound } from "next/navigation";
import { getLine, lineModules } from "@/lib/lines";
import { getPrePostQuestions } from "@/lib/prePostQuestions";
import { getCurrentStudent } from "@/lib/session";
import { getLatestSimulationRunForLine } from "@/lib/db";
import { reviewEligibleLines } from "@/lib/reviewModel";
import ReviewCheck from "@/components/ReviewCheck";
import { FloatCard } from "@/components/game/FloatCard";
import { StationSign } from "@/components/game/StationSign";
import { Crumbs, LinkRows, SecondaryButton } from "@/components/linePage/parts";
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

  if (!student) notFound();
  if (!eligible) notFound();

  const mods = lineModules(line);
  const questions = getPrePostQuestions(line.slug).slice(0, 2);

  return (
    <div
      className="lp-page lp-page--narrow"
      style={{ "--line-color": line.color, "--line-ink": line.colorInk } as CSSProperties}
    >
      <Crumbs
        items={[
          { label: "我的路線圖", href: homeFor(student?.mode ?? null) },
          { label: `複習：${line.name}` },
        ]}
      />

      <FloatCard as="div" strong index={0}>
        <StationSign line={line} station="複習站" code={line.enName.toUpperCase()} as="p" />
        <h1 className="lp-h1">{line.name}，一週前你完成了這條線</h1>
        <p className="lp-muted">花一分鐘回顧一下重點，再看看還記得多少。</p>
      </FloatCard>

      {questions.length > 0 && (
        <FloatCard title="快速回想" index={1}>
          <ReviewCheck questions={questions} color={line.colorInk} />
        </FloatCard>
      )}

      <FloatCard title="回顧各站的常見錯誤" index={2}>
        <LinkRows
          items={mods.map((m) => ({
            key: m.number,
            href: `/line/${line.slug}/course/${m.number}`,
            title: m.station,
            sub: m.title,
          }))}
        />
      </FloatCard>

      <div className="lp-actions">
        <SecondaryButton href={`/line/${line.slug}`}>回到{line.name}</SecondaryButton>
      </div>
    </div>
  );
}

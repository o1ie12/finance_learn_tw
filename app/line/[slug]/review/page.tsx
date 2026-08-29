import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLine, lineModules } from "@/lib/lines";
import { getPrePostQuestions } from "@/lib/prePostQuestions";
import { getCurrentStudent } from "@/lib/session";
import { getLatestSimulationRunForLine } from "@/lib/db";
import { reviewEligibleLines } from "@/lib/reviewModel";
import ReviewCheck from "@/components/ReviewCheck";
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
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="麵包屑" className="mb-3 text-sm text-ink-faint">
        <Link href="/dashboard" className="hover:text-ink">
          我的路線圖
        </Link>{" "}
        <span aria-hidden="true">/</span> 複習：{line.name}
      </nav>

      <div className="rounded-2xl bg-surface p-6" style={{ borderLeft: `4px solid ${line.color}` }}>
        <p
          className="font-display text-xs font-bold uppercase tracking-widest"
          style={{ color: line.colorInk }}
        >
          複習站
        </p>
        <h1 className="mt-1 text-2xl font-black">{line.name}，一週前你完成了這條線</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          花一分鐘回顧一下重點，再看看還記得多少。
        </p>
      </div>

      {questions.length > 0 && (
        <section aria-labelledby="check-heading" className="mt-8">
          <h2 id="check-heading" className="text-lg font-bold">
            快速回想
          </h2>
          <div className="mt-3">
            <ReviewCheck questions={questions} color={line.colorInk} />
          </div>
        </section>
      )}

      <section aria-labelledby="stations-heading" className="mt-8">
        <h2 id="stations-heading" className="text-lg font-bold">
          回顧各站的常見錯誤
        </h2>
        <div className="mt-3 space-y-2.5">
          {mods.map((m) => (
            <Link
              key={m.number}
              href={`/line/${line.slug}/course/${m.number}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-surface px-4 py-3 text-[15px] transition-colors hover:border-ink/40"
            >
              <span>
                <span className="font-semibold">{m.station}</span>
                <span className="ml-2 text-ink-soft">{m.title}</span>
              </span>
              <span aria-hidden="true" className="text-ink-faint">→</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link
          href={`/line/${line.slug}`}
          className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-5 py-3 text-base font-semibold hover:border-ink"
        >
          回到{line.name}
        </Link>
      </div>
    </div>
  );
}

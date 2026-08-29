import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLine } from "@/lib/lines";
import { getPrePostQuestions } from "@/lib/prePostQuestions";
import { getCurrentStudent } from "@/lib/session";
import { getLineTests } from "@/lib/db";
import PrePostTest from "@/components/PrePostTest";
import type { Student } from "@/lib/types";

function isPhase(v: string): v is "pre" | "post" {
  return v === "pre" || v === "post";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; phase: string }>;
}): Promise<Metadata> {
  const { slug, phase } = await params;
  const line = getLine(slug);
  if (!line || !isPhase(phase)) return { title: "找不到測驗" };
  return { title: `${line.name}${phase === "pre" ? "前測" : "後測"}` };
}

export default async function LineTestPage({
  params,
}: {
  params: Promise<{ slug: string; phase: string }>;
}) {
  const { slug, phase } = await params;
  const line = getLine(slug);
  if (!line || !isPhase(phase)) notFound();

  const questions = getPrePostQuestions(line.slug);
  if (questions.length === 0) notFound();

  let student: Student | null = null;
  let priorPreScore: number | null = null;
  try {
    student = await getCurrentStudent();
    if (student && phase === "post") {
      const { pre } = await getLineTests(student.id, line.slug);
      priorPreScore = pre?.score ?? null;
    }
  } catch {
    /* not configured — the test still works, just won't save */
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="麵包屑" className="mb-3 text-sm text-ink-faint">
        <Link href="/lines" className="hover:text-ink">
          所有路線
        </Link>{" "}
        <span aria-hidden="true">/</span>{" "}
        <Link href={`/line/${line.slug}`} className="hover:text-ink">
          {line.name}
        </Link>{" "}
        <span aria-hidden="true">/</span> {phase === "pre" ? "前測" : "後測"}
      </nav>

      {!student && (
        <p className="mb-6 rounded-lg bg-line-1/10 px-4 py-3 text-sm text-ink-soft">
          沒有登入也能作答，但分數不會被儲存。
          <Link href="/signup" className="ml-1 font-semibold text-line-2 underline">
            建立帳號或輸入代碼
          </Link>
          。
        </p>
      )}

      <PrePostTest
        lineSlug={line.slug}
        lineName={line.name}
        phase={phase}
        color={line.color}
        colorInk={line.colorInk}
        questions={questions}
        priorPreScore={priorPreScore}
        backHref={`/line/${line.slug}`}
      />
    </div>
  );
}

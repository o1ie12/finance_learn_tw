import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLine } from "@/lib/lines";
import { getPrePostQuestions } from "@/lib/prePostQuestions";
import { getCurrentStudent } from "@/lib/session";
import { getLineTests } from "@/lib/db";
import PrePostTest from "@/components/PrePostTest";
import { FloatCard } from "@/components/game/FloatCard";
import { Crumbs } from "@/components/linePage/parts";
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
      // `pre` is already on the current bank version; the total check guards
      // the post about to be taken against a bank that changed size.
      const { pre } = await getLineTests(student.id, line.slug);
      priorPreScore = pre && pre.total === questions.length ? pre.score : null;
    }
  } catch {
    /* not configured — the test still works, just won't save */
  }

  return (
    <div className="lp-page lp-page--narrow">
      <Crumbs
        items={[
          { label: "所有路線", href: "/lines" },
          { label: line.name, href: `/line/${line.slug}` },
          { label: phase === "pre" ? "前測" : "後測" },
        ]}
      />

      {!student && (
        <FloatCard as="div" arrive={false}>
          <p className="lp-muted">
            沒有登入也能作答，但分數不會被儲存。
            <Link href="/signup" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline", marginLeft: 4 }}>
              建立帳號或輸入代碼
            </Link>
            。
          </p>
        </FloatCard>
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

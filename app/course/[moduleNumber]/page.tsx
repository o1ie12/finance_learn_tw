import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MODULES, getModule } from "@/lib/modules";
import { LESSON_BODIES } from "@/components/lessons";
import Quiz from "@/components/Quiz";

export function generateStaticParams() {
  return MODULES.map((m) => ({ moduleNumber: String(m.number) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ moduleNumber: string }>;
}): Promise<Metadata> {
  const { moduleNumber } = await params;
  const mod = getModule(Number(moduleNumber));
  if (!mod) return { title: "找不到課程" };
  return {
    title: `第 ${mod.number} 站 · ${mod.title}`,
    description: mod.subtitle,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleNumber: string }>;
}) {
  const { moduleNumber } = await params;
  const n = Number(moduleNumber);
  const mod = getModule(n);
  if (!mod) notFound();

  const Body = LESSON_BODIES[n];

  const isLast = n === MODULES.length;
  const nextModule = getModule(n + 1);
  const nextHref = isLast ? "/simulation" : `/course/${n + 1}`;
  const nextLabel = isLast
    ? "前往起薪站模擬"
    : `下一站：${nextModule?.station ?? ""}`;

  return (
    <article className="pb-10">
      {/* Module line strip */}
      <div
        className="h-1.5 w-full"
        style={{ background: mod.color }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
        <nav aria-label="麵包屑" className="text-sm text-ink-faint">
          <Link href="/course" className="hover:text-ink">
            課程
          </Link>{" "}
          <span aria-hidden="true">/</span> 第 {mod.number} 站
        </nav>

        <header className="mt-4">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-8 items-center rounded-full px-3 font-display text-sm font-bold text-white"
              style={{ background: mod.color }}
            >
              {mod.station}
            </span>
            <span className="text-sm text-ink-faint">
              約 {mod.minutes} 分鐘閱讀
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {mod.title}
          </h1>
          <p className="mt-2 font-display text-sm font-medium uppercase tracking-wide text-ink-faint">
            {mod.enTitle}
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
            {mod.subtitle}
          </p>
        </header>

        <div className="mt-8">
          <Body />
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: mod.color }}
              aria-hidden="true"
            />
            <h2 className="text-xl font-bold sm:text-2xl">課後小測驗</h2>
          </div>
          <p className="mt-2 text-[15px] text-ink-soft">
            答完送出就會把這一站標記完成，並記錄你的分數。
          </p>
          <div className="mt-5">
            <Quiz
              moduleNumber={mod.number}
              color={mod.color}
              questions={mod.quiz}
              nextHref={nextHref}
              nextLabel={nextLabel}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

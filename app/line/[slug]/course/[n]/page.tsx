import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getModule } from "@/lib/modules";
import { LINES, getLine, getLineByModule } from "@/lib/lines";
import { LESSON_BODIES } from "@/components/lessons";
import Quiz from "@/components/Quiz";

export function generateStaticParams() {
  return LINES.flatMap((line) =>
    line.stationModules.map((n) => ({ slug: line.slug, n: String(n) })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  const mod = getModule(Number(n));
  if (!mod) return { title: "找不到課程" };
  return { title: `${mod.station} · ${mod.title}`, description: mod.subtitle };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; n: string }>;
}) {
  const { slug, n } = await params;
  const num = Number(n);
  const line = getLine(slug);
  const mod = getModule(num);
  if (!line || !mod) notFound();

  // Self-heal: if this module belongs to another line, send them there.
  if (!line.stationModules.includes(num)) {
    const owner = getLineByModule(num);
    if (owner) redirect(`/line/${owner.slug}/course/${num}`);
    notFound();
  }

  const Body = LESSON_BODIES[num];

  // Next step within this line: next station, else the terminal simulation.
  const idx = line.stationModules.indexOf(num);
  const nextModuleNumber = line.stationModules[idx + 1];
  let nextHref = "/dashboard";
  let nextLabel = "回到我的路線圖";
  if (nextModuleNumber) {
    const nextMod = getModule(nextModuleNumber);
    nextHref = `/line/${line.slug}/course/${nextModuleNumber}`;
    nextLabel = `下一站：${nextMod?.station ?? ""}`;
  } else if (line.sim.ready) {
    nextHref = `/line/${line.slug}/simulation`;
    nextLabel = `前往終點站：${line.sim.station}`;
  }

  return (
    <article className="pb-10">
      <div
        className="h-1.5 w-full"
        style={{ background: line.color }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
        <nav aria-label="麵包屑" className="text-sm text-ink-faint">
          <Link href="/lines" className="hover:text-ink">
            所有路線
          </Link>{" "}
          <span aria-hidden="true">/</span>{" "}
          <Link href={`/line/${line.slug}`} className="hover:text-ink">
            {line.name}
          </Link>
        </nav>

        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex h-8 items-center rounded-full px-3 font-display text-sm font-bold text-white"
              style={{ background: line.colorInk }}
            >
              {mod.station}
            </span>
            <span className="text-sm text-ink-faint">
              {line.name} · 約 {mod.minutes} 分鐘閱讀
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
              style={{ background: line.color }}
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
              color={line.colorInk}
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

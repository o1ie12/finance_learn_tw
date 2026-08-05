import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLine } from "@/lib/lines";
import LineSim from "@/components/sims/LineSim";
import { getCurrentStudent } from "@/lib/session";
import type { Student } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const line = getLine(slug);
  if (!line) return { title: "找不到模擬" };
  return { title: line.sim.title, description: line.sim.covers };
}

export default async function LineSimulationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const line = getLine(slug);
  if (!line || !line.sim.ready) notFound();

  let student: Student | null = null;
  let backendReady = true;
  try {
    student = await getCurrentStudent();
  } catch {
    backendReady = false;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <nav aria-label="麵包屑" className="mb-3 text-sm text-ink-faint">
          <Link href={`/line/${line.slug}`} className="hover:text-ink">
            {line.name}
          </Link>{" "}
          <span aria-hidden="true">/</span> 終點站
        </nav>
        <p
          className="font-display text-sm font-semibold uppercase tracking-widest"
          style={{ color: line.colorInk }}
        >
          終點站 · {line.sim.station}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          {line.sim.title}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
          {line.sim.subtitle}
        </p>
      </header>

      {student ? (
        <LineSim slug={line.slug} color={line.color} colorInk={line.colorInk} />
      ) : (
        <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-bold">先建立帳號，再開始模擬</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            {backendReady
              ? "模擬結果會存進你的學習路線，之後在儀表板上看得到。只需要一組代碼，免密碼、免 email。"
              : "系統的資料庫尚未設定，暫時無法儲存模擬結果。設定完成後即可使用。"}
          </p>
          {backendReady && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-ink px-6 py-3 text-base font-semibold text-white hover:-translate-y-0.5"
              >
                建立帳號
              </Link>
              <Link
                href={`/line/${line.slug}`}
                className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-6 py-3 text-base font-medium hover:border-ink"
              >
                先看看這條線
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLine } from "@/lib/lines";
import LineSim from "@/components/sims/LineSim";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import { getCurrentStudent } from "@/lib/session";
import TipCard from "@/components/TipCard";
import { effectiveMode, simTips } from "@/lib/modeModel";
import {
  readProfile,
  startingIncome,
  investableAmount,
} from "@/lib/studentProfile";
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

  const tips = simTips(line, effectiveMode(student?.mode ?? null));
  // Resolved here rather than in the client so the figure cannot be supplied
  // by the browser; the API route resolves it again on submit for the same
  // reason.
  const profile = readProfile(student?.profile);
  const money = startingIncome(profile);
  // Everything a terminal simulation may want to know about this student,
  // resolved once, on the server. Each simulation takes only the piece it
  // needs, and the API route resolves the same values again on submit — the
  // browser is never the source of any of them.
  const investable = investableAmount(profile);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="麵包屑" className="mb-3 text-sm text-ink-faint">
        <Link href={`/line/${line.slug}`} className="hover:text-ink">
          {line.name}
        </Link>{" "}
        <span aria-hidden="true">/</span> 終點站
      </nav>

      <PlatformPanel color={line.color} eyebrow={`即將抵達終點站 · ${line.sim.station}`} className="mb-8">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {line.sim.title}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-white/80">
          {line.sim.subtitle}
        </p>
      </PlatformPanel>

      {student ? (
        <>
          {/* sim_first students have not read the stations, so each core
              station's key point comes with them into the decision. In full
              mode this renders nothing — they just read it. */}
          {tips.length > 0 && (
            <section aria-labelledby="tips-heading" className="mb-8 space-y-3">
              <h2
                id="tips-heading"
                className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-faint"
              >
                開始之前，這條線的重點
              </h2>
              {tips.map((t) => (
                <TipCard key={t.moduleNumber} color={line.color} station={t.station}>
                  {t.text}
                </TipCard>
              ))}
            </section>
          )}
          <LineSim
            slug={line.slug}
            color={line.color}
            colorInk={line.colorInk}
            income={money.amount}
            incomeFromCareer={money.fromEarnLine}
            interest={profile.interest ?? null}
            investable={investable}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
          <h2 className="text-xl font-bold">先建立帳號，再開始模擬</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            {backendReady
              ? "模擬結果會存進你的學習路線，之後在儀表板上看得到。免密碼、免 email，只需要一個暱稱和你的學校資訊。"
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

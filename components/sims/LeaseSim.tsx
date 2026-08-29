"use client";

import { useEffect, useState } from "react";
import { LEASE_CLAUSES, type LeaseOutcome } from "@/lib/sims/leaseContract";
import { useSimRun } from "@/components/sims/useSimRun";
import { OutcomeActions } from "@/components/sims/ui";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";

const GAME_SECONDS = 90;

export default function LeaseSim({ color, colorInk }: { color: string; colorInk: string }) {
  const [phase, setPhase] = useState<"intro" | "playing">("intro");
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);

  const { submitting, error, result, submit, reset } = useSimRun<LeaseOutcome>("zuwu");

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  const timeUp = timeLeft === 0;
  useEffect(() => {
    if (phase === "playing" && timeUp && !submitting && !result) {
      void submit({ flagged: Array.from(flagged) });
    }
  }, [phase, timeUp, submitting, result, flagged, submit]);

  function toggle(id: string) {
    if (timeUp) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submitNow() {
    if (timeUp || submitting) return;
    void submit({ flagged: Array.from(flagged) });
  }

  function playAgain() {
    setPhase("intro");
    setFlagged(new Set());
    setTimeLeft(GAME_SECONDS);
    reset();
  }

  if (result) {
    const o = result.outcome;
    const perfect = o.correctFlags >= o.totalBad && o.falseFlags.length === 0;
    return (
      <div className="space-y-8">
        <PlatformPanel color={color} eyebrow="契約找碴 · 結果">
          <h2 className="text-4xl font-black">
            <span className="money">{o.correctFlags}</span>
            <span className="text-lg font-semibold text-white/70"> / {o.totalBad} 找到問題條款</span>
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/85">
            {perfect
              ? "全部找到了，而且沒有誤判——這份細心，簽任何合約前都用得上。"
              : "簽約前逐條看清楚是很花時間的事，多練幾次，抓問題條款會越來越快。"}
            {o.falseFlags.length > 0 ? `另外標記了 ${o.falseFlags.length} 條其實沒問題的條款。` : ""}
          </p>
          <StampReveal outcomeTitle={result.outcomeTitle} pointsAwarded={result.pointsAwarded} />
        </PlatformPanel>

        {o.missed.length > 0 && (
          <section aria-labelledby="missed-heading">
            <h3 id="missed-heading" className="text-lg font-bold">
              沒找到的問題條款
            </h3>
            <div className="mt-3 space-y-3">
              {o.missed.map((c) => (
                <div key={c.id} className="rounded-2xl border border-hairline bg-surface p-4" style={{ borderLeft: "4px solid #c8102e" }}>
                  <p className="text-sm font-semibold text-ink-faint">第 {c.number} 條</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink/90">{c.text}</p>
                  <p className="mt-2 rounded-lg bg-bg px-3 py-2 text-sm leading-relaxed text-ink-soft">{c.explain}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {o.falseFlags.length > 0 && (
          <section aria-labelledby="false-heading">
            <h3 id="false-heading" className="text-lg font-bold">
              誤判的條款（其實沒問題）
            </h3>
            <div className="mt-3 space-y-3">
              {o.falseFlags.map((c) => (
                <div key={c.id} className="rounded-2xl border border-hairline bg-surface p-4">
                  <p className="text-sm font-semibold text-ink-faint">第 {c.number} 條</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink/90">{c.text}</p>
                  <p className="mt-2 rounded-lg bg-bg px-3 py-2 text-sm leading-relaxed text-ink-soft">{c.explain}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <OutcomeActions onReset={playAgain} resetLabel="再找一次" />
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <PlatformPanel color={color} eyebrow="契約找碴">
          <h2 className="text-2xl font-black">90 秒，找出問題條款</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/85">
            接下來是一份看似正常的租賃合約，共 14 條。裡面藏了幾條違法或對房客不利的條款。點選你認為有問題的條款，時間到自動送出。
          </p>
        </PlatformPanel>
        <button
          type="button"
          onClick={() => setPhase("playing")}
          className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          開始檢查合約
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-10 -mx-4 flex items-center justify-between bg-bg/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <span className="money text-sm text-ink-faint">已標記 {flagged.size} 條</span>
        <span
          className="money rounded-full px-3 py-1 text-sm font-bold text-white"
          style={{ background: timeLeft <= 15 ? "#c8102e" : colorInk }}
        >
          {timeUp ? "結算中…" : `${timeLeft}s`}
        </span>
      </div>

      <div className="space-y-3">
        {LEASE_CLAUSES.map((c) => {
          const isFlagged = flagged.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              disabled={timeUp}
              className={`w-full rounded-2xl border-2 p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                isFlagged ? "bg-negative/5" : "border-hairline bg-surface hover:border-ink/30"
              }`}
              style={isFlagged ? { borderColor: "#c8102e" } : undefined}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                  style={{ background: isFlagged ? "#c8102e" : "var(--color-hairline)" }}
                >
                  {isFlagged ? "✕" : c.number}
                </span>
                <span className="text-[15px] leading-relaxed text-ink/90">{c.text}</span>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submitNow}
        disabled={timeUp || submitting}
        className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "結算中…" : "送出檢查結果"}
      </button>
    </div>
  );
}

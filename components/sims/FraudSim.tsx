"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FRAUD_CARDS, type FraudOutcome } from "@/lib/sims/fraud";
import { useSimRun } from "@/components/sims/useSimRun";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";

const GAME_SECONDS = 60;

export default function FraudSim({
  color,
  colorInk,
}: {
  color: string;
  colorInk: string;
}) {
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [feedback, setFeedback] = useState<null | { correct: boolean; explain: string }>(null);

  const { submitting, error, result, submit, reset } =
    useSimRun<FraudOutcome>("zhapian");

  const card = FRAUD_CARDS[index];
  const allAnswered = Object.keys(answers).length >= FRAUD_CARDS.length;

  // The countdown itself.
  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  // React to the clock running out (or every card answered) by submitting.
  // No local "done" phase to track: once `result` is set below, that branch
  // takes over rendering regardless of what `phase` still says.
  const timeUp = timeLeft === 0 || allAnswered;
  useEffect(() => {
    if (phase === "playing" && timeUp && !submitting && !result) {
      void submit({ answers });
    }
  }, [phase, timeUp, submitting, result, answers, submit]);

  function answer(saidScam: boolean) {
    if (!card || answers[card.id] !== undefined || timeUp) return;
    setAnswers((a) => ({ ...a, [card.id]: saidScam }));
    setFeedback({ correct: saidScam === card.isScam, explain: card.explain });
  }

  function next() {
    setFeedback(null);
    setIndex((i) => Math.min(i + 1, FRAUD_CARDS.length - 1));
  }

  function playAgain() {
    setPhase("intro");
    setIndex(0);
    setAnswers({});
    setTimeLeft(GAME_SECONDS);
    setFeedback(null);
    reset();
  }

  if (result) {
    const o = result.outcome;
    const pct = o.total > 0 ? o.correct / o.total : 0;
    return (
      <div className="space-y-8">
        <PlatformPanel color={color} eyebrow="165 判讀中心 · 結果">
          <h2 className="text-4xl font-black">
            <span className="money">{o.correct}</span>
            <span className="text-lg font-semibold text-white/70"> / {o.total} 答對</span>
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/85">
            {pct >= 0.75
              ? "反應很快，判斷也很準——這就是「先觀察、再行動」的本能。"
              : "詐騙手法一直在變，多練幾次，你的直覺會越來越準。"}
            {o.timedOut > 0 ? `還有 ${o.timedOut} 則來不及判讀。` : ""}
          </p>
          <StampReveal outcomeTitle={result.outcomeTitle} pointsAwarded={result.pointsAwarded} />
        </PlatformPanel>

        {o.wrong.length > 0 && (
          <section aria-labelledby="review-heading">
            <h3 id="review-heading" className="text-lg font-bold">
              答錯的訊息，來看看為什麼
            </h3>
            <div className="mt-3 space-y-3">
              {o.wrong.map(({ card: c, userSaidScam }) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-hairline bg-surface p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink-soft">{c.sender}</span>
                    <span className="text-xs font-bold text-negative">
                      你判斷「{userSaidScam ? "詐" : "真"}」，正解是「{c.isScam ? "詐" : "真"}」
                    </span>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink/90">{c.text}</p>
                  <p className="mt-2 rounded-lg bg-bg px-3 py-2 text-sm leading-relaxed text-ink-soft">
                    {c.explain}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={playAgain}
            className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-5 py-3 text-base font-medium hover:border-ink"
          >
            再玩一次
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-3 text-base font-semibold text-white hover:-translate-y-0.5"
          >
            回到我的路線圖
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <PlatformPanel color={color} eyebrow="165 判讀中心">
          <h2 className="text-2xl font-black">60 秒，判讀真偽</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/85">
            接下來會出現一連串真實風格的訊息。每一則，判斷它是「真」的日常訊息，還是「詐」——詐騙集團常見的話術。答錯會馬上告訴你為什麼，時間到自動結算。
          </p>
        </PlatformPanel>
        <button
          type="button"
          onClick={() => setPhase("playing")}
          className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          開始判讀
        </button>
      </div>
    );
  }

  // phase === "playing"
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="money text-sm text-ink-faint">
          第 {index + 1} / {FRAUD_CARDS.length} 則
        </span>
        <span
          className="money rounded-full px-3 py-1 text-sm font-bold text-white"
          style={{ background: timeLeft <= 10 ? "#c8102e" : colorInk }}
        >
          {timeLeft}s
        </span>
      </div>

      {card && (
        <div className="rounded-2xl border border-hairline bg-surface p-5 sm:p-6">
          <p className="text-sm font-semibold text-ink-soft">{card.sender}</p>
          <p className="mt-2 text-[17px] leading-relaxed text-ink">{card.text}</p>

          {feedback ? (
            <div className="mt-5 space-y-4">
              <p
                className={`rounded-lg px-3.5 py-2.5 text-sm font-semibold ${
                  feedback.correct ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                }`}
                role="status"
              >
                {feedback.correct ? "✓ 判斷正確" : "✕ 判斷錯誤"} — {feedback.explain}
              </p>
              <button
                type="button"
                onClick={next}
                disabled={index >= FRAUD_CARDS.length - 1}
                className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-3 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {index >= FRAUD_CARDS.length - 1 ? "等待結算…" : "下一則 →"}
              </button>
            </div>
          ) : timeUp ? (
            <p className="mt-5 text-sm text-ink-faint">時間到，結算中…</p>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => answer(false)}
                className="rounded-xl border-2 border-hairline bg-surface px-4 py-4 text-lg font-bold hover:border-positive hover:text-positive"
              >
                真
              </button>
              <button
                type="button"
                onClick={() => answer(true)}
                className="rounded-xl border-2 border-hairline bg-surface px-4 py-4 text-lg font-bold hover:border-negative hover:text-negative"
              >
                詐
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative" role="alert">
          {error}
        </p>
      )}
      {submitting && <p className="text-sm text-ink-faint">結算中…</p>}
    </div>
  );
}

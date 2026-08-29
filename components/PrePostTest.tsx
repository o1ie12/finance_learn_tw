"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { QuizQuestion } from "@/lib/modules";
import PlatformPanel from "@/components/mrt/PlatformPanel";

type SaveState = "idle" | "saving" | "saved" | "no_session" | "error";

export default function PrePostTest({
  lineSlug,
  lineName,
  phase,
  color,
  colorInk,
  questions,
  priorPreScore,
  backHref,
}: {
  lineSlug: string;
  lineName: string;
  phase: "pre" | "post";
  color: string;
  colorInk: string;
  questions: QuizQuestion[];
  priorPreScore: number | null; // pre-test score, only meaningful when phase === "post"
  backHref: string;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [delta, setDelta] = useState<number | null>(null);

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === total;

  const score = useMemo(
    () =>
      questions.reduce((acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0), 0),
    [answers, questions],
  );

  async function save(finalScore: number) {
    setSaveState("saving");
    try {
      const res = await fetch("/api/line-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line_slug: lineSlug, phase, score: finalScore }),
      });
      if (res.status === 401) {
        setSaveState("no_session");
        return;
      }
      if (!res.ok) {
        setSaveState("error");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (typeof data.delta === "number") setDelta(data.delta);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered || submitted) return;
    setSubmitted(true);
    void save(score);
  }

  const isPost = phase === "post";
  const eyebrow = isPost ? "後測" : "前測";
  const title = isPost
    ? `${lineName}後測：完成後，看看你進步了多少`
    : `${lineName}前測：開始前，先測一次自己現在懂多少`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label={`${lineName}${eyebrow}`}>
      <PlatformPanel color={color} eyebrow={eyebrow}>
        <h2 className="text-xl font-black">{title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-white/85">
          {isPost
            ? "同樣的 10 題，這次答對幾題不是重點，看見自己的進步幅度才是。"
            : "答錯完全沒關係，這只是幫你看見「現在的自己」，完成這條線後會再測一次。"}
        </p>
      </PlatformPanel>

      {questions.map((q, qi) => {
        const chosen = answers[q.id];
        return (
          <fieldset key={q.id} className="rounded-2xl border border-hairline bg-surface p-5 sm:p-6">
            <legend className="flex gap-2 px-1 text-base font-bold">
              <span className="font-display tabular-nums" style={{ color: colorInk }} aria-hidden="true">
                {qi + 1}.
              </span>
              <span>{q.q}</span>
            </legend>

            <div className="mt-4 space-y-2.5">
              {q.options.map((opt, oi) => {
                const selected = chosen === oi;
                const isCorrect = oi === q.answer;
                let stateClass = "border-hairline hover:border-ink/40 bg-bg";
                if (submitted) {
                  if (isCorrect) stateClass = "border-positive bg-positive/10";
                  else if (selected) stateClass = "border-negative bg-negative/10";
                  else stateClass = "border-hairline bg-bg opacity-70";
                } else if (selected) {
                  stateClass = "border-ink bg-bg";
                }

                return (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-[15px] leading-relaxed transition-colors ${stateClass} ${
                      submitted ? "cursor-default" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={oi}
                      checked={selected}
                      disabled={submitted}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
                      style={{ ["--accent" as string]: color }}
                    />
                    <span>{opt}</span>
                    {submitted && isCorrect && (
                      <span className="ml-auto shrink-0 text-sm font-semibold text-positive">正解</span>
                    )}
                  </label>
                );
              })}
            </div>

            {submitted && (
              <p className="mt-3 rounded-lg bg-bg px-4 py-3 text-sm leading-relaxed text-ink-soft" role="note">
                {answers[q.id] === q.answer ? "✓ 答對了。" : "重點："}
                {q.explain}
              </p>
            )}
          </fieldset>
        );
      })}

      {!submitted ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!allAnswered}
            className="inline-flex items-center justify-center rounded-xl bg-ink px-6 py-3 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            送出
          </button>
          <span className="text-sm text-ink-faint" aria-live="polite">
            已作答 {answeredCount} / {total}
          </span>
        </div>
      ) : (
        <PlatformPanel color={color} eyebrow="結果" className="mrt-slide-in">
          <h3 className="text-3xl font-black">
            <span className="money">{score}</span>
            <span className="text-lg font-semibold text-white/70"> / {total}</span>
          </h3>
          {isPost && (delta !== null || priorPreScore !== null) && (
            <p className="mt-2 text-[15px] leading-relaxed text-white/85">
              {(() => {
                const preScore = delta !== null ? score - delta : priorPreScore;
                const gain = delta !== null ? delta : preScore !== null ? score - preScore : null;
                if (gain === null) return "這條線還沒有前測紀錄可以比較。";
                if (gain > 0) return `比前測進步了 ${gain} 題——這條線的內容真的留下來了。`;
                if (gain === 0) return "跟前測分數一樣，代表這些內容你本來就掌握得不錯。";
                return "這次分數比前測低，可能是題目剛好比較刁鑽，可以回頭看看不熟的站再試一次。";
              })()}
            </p>
          )}
          <p className="mt-3 text-sm text-white/70">
            {saveState === "saving" && "儲存中…"}
            {saveState === "saved" && "✓ 已記錄。"}
            {saveState === "no_session" && (
              <>
                想儲存這次結果嗎？{" "}
                <Link href="/signup" className="font-semibold underline">
                  建立帳號或輸入代碼
                </Link>
                。
              </>
            )}
            {saveState === "error" && "儲存時發生問題，這次分數僅顯示在畫面上。"}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={backHref}
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-base font-semibold text-ink hover:-translate-y-0.5"
            >
              回到{lineName} <span aria-hidden="true" className="ml-1">→</span>
            </Link>
          </div>
        </PlatformPanel>
      )}
    </form>
  );
}

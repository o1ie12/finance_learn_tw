"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { QuizQuestion } from "@/lib/modules";

interface QuizProps {
  moduleNumber: number;
  color: string;
  questions: QuizQuestion[];
  nextHref: string;
  nextLabel: string;
}

type SaveState = "idle" | "saving" | "saved" | "no_session" | "error";

export default function Quiz({
  moduleNumber,
  color,
  questions,
  nextHref,
  nextLabel,
}: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === total;

  const score = useMemo(
    () =>
      questions.reduce(
        (acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0),
        0,
      ),
    [answers, questions],
  );

  async function saveProgress(finalScore: number) {
    setSaveState("saving");
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_number: moduleNumber,
          quiz_score: finalScore,
          quiz_total: total,
        }),
      });
      if (res.status === 401) {
        setSaveState("no_session");
        return;
      }
      if (!res.ok) {
        setSaveState("error");
        return;
      }
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered || submitted) return;
    setSubmitted(true);
    void saveProgress(score);
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    setSaveState("idle");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="課後測驗">
      {questions.map((q, qi) => {
        const chosen = answers[q.id];
        return (
          <fieldset
            key={q.id}
            className="rounded-2xl border border-hairline bg-surface p-5 sm:p-6"
          >
            <legend className="flex gap-2 px-1 text-base font-bold">
              <span
                className="font-display tabular-nums"
                style={{ color }}
                aria-hidden="true"
              >
                {qi + 1}.
              </span>
              <span>{q.q}</span>
            </legend>

            <div className="mt-4 space-y-2.5">
              {q.options.map((opt, oi) => {
                const selected = chosen === oi;
                const isCorrect = oi === q.answer;
                let stateClass =
                  "border-hairline hover:border-ink/40 bg-bg";
                if (submitted) {
                  if (isCorrect)
                    stateClass = "border-positive bg-positive/10";
                  else if (selected)
                    stateClass = "border-negative bg-negative/10";
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
                      onChange={() =>
                        setAnswers((a) => ({ ...a, [q.id]: oi }))
                      }
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
                      style={{ ["--accent" as string]: color }}
                    />
                    <span>{opt}</span>
                    {submitted && isCorrect && (
                      <span className="ml-auto shrink-0 text-sm font-semibold text-positive">
                        正解
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {submitted && (
              <p
                className="mt-3 rounded-lg bg-bg px-4 py-3 text-sm leading-relaxed text-ink-soft"
                role="note"
              >
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
            送出答案
          </button>
          <span className="text-sm text-ink-faint" aria-live="polite">
            已作答 {answeredCount} / {total}
          </span>
        </div>
      ) : (
        <div
          className="rounded-2xl border border-hairline bg-surface p-5 sm:p-6"
          aria-live="polite"
        >
          <div className="flex items-baseline gap-3">
            <span className="text-base font-bold">你的分數</span>
            <span
              className="money text-3xl font-semibold"
              style={{ color }}
            >
              {score} / {total}
            </span>
          </div>

          <p className="mt-2 text-sm text-ink-soft">
            {saveState === "saving" && "儲存進度中…"}
            {saveState === "saved" && "✓ 進度已儲存到你的路線圖。"}
            {saveState === "no_session" && (
              <>
                想儲存進度嗎？{" "}
                <Link href="/signup" className="font-semibold text-line-2 underline">
                  建立帳號或輸入代碼
                </Link>
                ，再回來送出一次即可。
              </>
            )}
            {saveState === "error" && (
              <>
                進度暫時沒能存起來。{" "}
                <button
                  type="button"
                  onClick={() => saveProgress(score)}
                  className="font-semibold text-line-2 underline"
                >
                  重試
                </button>
              </>
            )}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={nextHref}
              className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-2.5 text-base font-semibold text-white hover:-translate-y-0.5"
            >
              {nextLabel} <span aria-hidden="true" className="ml-1">→</span>
            </Link>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-5 py-2.5 text-base font-medium hover:border-ink"
            >
              再做一次
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

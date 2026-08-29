"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/modules";

/**
 * 複習站's "1-2 short scenario questions pulled from the pre/post test
 * bank" — ungraded, nothing saved. Just a quick retrieval prompt, same
 * immediate-reveal pattern as the pre/post test and station quizzes.
 */
export default function ReviewCheck({
  questions,
  color,
}: {
  questions: QuizQuestion[];
  color: string;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  return (
    <div className="space-y-4">
      {questions.map((q) => {
        const chosen = answers[q.id];
        return (
          <fieldset key={q.id} className="rounded-2xl border border-hairline bg-surface p-5">
            {/* A native <legend> always renders straddling the <fieldset>'s
                border, no matter the padding — visually hidden here and
                replaced with a normal, fully-contained heading. */}
            <legend className="sr-only">{q.q}</legend>
            <p className="text-base font-bold" aria-hidden="true">{q.q}</p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => {
                const selected = chosen === oi;
                const isCorrect = oi === q.answer;
                let stateClass = "border-hairline hover:border-ink/40 bg-bg";
                if (chosen !== undefined) {
                  if (isCorrect) stateClass = "border-positive bg-positive/10";
                  else if (selected) stateClass = "border-negative bg-negative/10";
                  else stateClass = "border-hairline bg-bg opacity-70";
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    disabled={chosen !== undefined}
                    className={`block w-full rounded-xl border px-4 py-2.5 text-left text-[15px] transition-colors disabled:cursor-default ${stateClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {chosen !== undefined && (
              <p className="mt-3 rounded-lg bg-bg px-4 py-3 text-sm leading-relaxed text-ink-soft">
                {chosen === q.answer ? "✓ 答對了。" : "重點："}
                {q.explain}
              </p>
            )}
          </fieldset>
        );
      })}
      <p className="text-xs text-ink-faint" style={{ color }}>
        這只是快速複習，不會被記錄分數。
      </p>
    </div>
  );
}

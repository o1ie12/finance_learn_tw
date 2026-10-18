"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/modules";
import { Icon } from "@/components/game/icons";
import "@/components/linePage/linePage.css";

/**
 * 複習站's "1-2 short scenario questions pulled from the pre/post test
 * bank": ungraded, nothing saved. Just a quick retrieval prompt, same
 * immediate-reveal pattern as the pre/post test and station quizzes.
 *
 * `color` is kept for callers; the game shell keeps line color to signs and
 * the route, so it is not painted here.
 */
export default function ReviewCheck({
  questions,
}: {
  questions: QuizQuestion[];
  color: string;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  return (
    <>
      {questions.map((q) => {
        const chosen = answers[q.id];
        const answered = chosen !== undefined;
        return (
          <fieldset key={q.id} className="lp-q lp-col" style={{ border: 0, padding: 0 }}>
            {/* A native <legend> always renders straddling the <fieldset>'s
                border, no matter the padding: visually hidden here and
                replaced with a normal, fully-contained heading. */}
            <legend className="sr-only">{q.q}</legend>
            <p className="lp-q-text" aria-hidden="true">
              {q.q}
            </p>
            <div className="lp-options">
              {q.options.map((opt, oi) => {
                const selected = chosen === oi;
                const isCorrect = oi === q.answer;
                let state = "";
                if (answered) {
                  if (isCorrect) state = "lp-option--right";
                  else if (selected) state = "lp-option--wrong";
                  else state = "lp-option--dim";
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    disabled={answered}
                    className={`lp-option ${state}`}
                  >
                    <span className="lp-option-text">{opt}</span>
                    {answered && isCorrect ? (
                      <span className="lp-option-flag lp-option-flag--right">
                        <Icon name="check" size={14} />
                        正解
                      </span>
                    ) : null}
                    {answered && selected && !isCorrect ? (
                      <span className="lp-option-flag lp-option-flag--wrong">
                        <Icon name="close" size={14} />
                        你的選擇
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {answered && (
              <p className="lp-explain" role="note">
                <Icon name={chosen === q.answer ? "check" : "info"} size={16} />
                <span>
                  {chosen === q.answer ? "答對了。" : "重點："}
                  {q.explain}
                </span>
              </p>
            )}
          </fieldset>
        );
      })}
      <p className="lp-caption">這只是快速複習，不會被記錄分數。</p>
    </>
  );
}

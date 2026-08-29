"use client";

import { useState } from "react";

/**
 * Inline retrieval-practice question (build spec section 2c) — backed by
 * the testing effect (Roediger & Karpicke 2006): a quick retrieval prompt
 * during reading beats passive rereading for long-term retention. Not a
 * gate — wrong answers still reveal the explanation and let the reader
 * continue. Visually a plain card with the line color as a left border, so
 * it reads as distinct from 情報站 (dark board) and 常見錯誤 (alert-orange)
 * on the same page.
 */
export function MicroCheck({
  color,
  question,
  options,
  correctIndex,
  explain,
}: {
  color: string;
  question: string;
  options: string[];
  correctIndex: number;
  explain: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  return (
    <div
      className="rounded-lg bg-surface py-3 pl-4 pr-4"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-wider"
        style={{ color }}
      >
        快速回想
      </p>
      <p className="mt-1 text-[15px] font-semibold text-ink">{question}</p>
      <div className="mt-2.5 flex flex-col gap-1.5">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === correctIndex;
          let extra = "border-hairline text-ink-soft hover:border-ink/30";
          if (answered && isCorrect) {
            extra = "border-transparent bg-[color-mix(in_srgb,var(--color-positive)_12%,white)] text-ink font-medium";
          } else if (answered && isSelected && !isCorrect) {
            extra = "border-transparent bg-[color-mix(in_srgb,var(--color-negative)_10%,white)] text-ink-soft line-through decoration-1";
          } else if (answered) {
            extra = "border-hairline text-ink-faint";
          }
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => setSelected(i)}
              className={`rounded-md border px-3 py-2 text-left text-[14px] leading-snug transition-colors disabled:cursor-default ${extra}`}
            >
              {opt}
              {answered && isCorrect && (
                <span className="ml-1.5 text-xs" style={{ color: "var(--color-positive)" }}>
                  ✓ 正確答案
                </span>
              )}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className="mt-2.5 text-[13px] leading-relaxed text-ink-soft">
          {explain}
        </p>
      )}
    </div>
  );
}

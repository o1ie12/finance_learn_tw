"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { QuizQuestion } from "@/lib/modules";
import type { CSSProperties } from "react";
import { FloatCard } from "@/components/game/FloatCard";
import { StationSign } from "@/components/game/StationSign";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { Icon } from "@/components/game/icons";
import "@/components/linePage/linePage.css";

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
    <form
      onSubmit={handleSubmit}
      className="lp-col"
      aria-label={`${lineName}${eyebrow}`}
      style={{ "--line-color": color, "--line-ink": colorInk } as CSSProperties}
    >
      <FloatCard as="div" strong index={0}>
        <StationSign line={{ color, enName: "" }} station={eyebrow} code={isPost ? "POST-TEST" : "PRE-TEST"} as="p" />
        <h1 className="lp-h1">{title}</h1>
        <p className="lp-muted">
          {isPost
            ? `同樣的 ${total} 題，這次答對幾題不是重點，看見自己的進步幅度才是。`
            : "答錯完全沒關係，這只是幫你看見「現在的自己」，完成這條線後會再測一次。"}
        </p>
      </FloatCard>

      {questions.map((q, qi) => {
        const chosen = answers[q.id];
        return (
          <fieldset key={q.id} className="g-card lp-q">
            {/* A native <legend> always renders straddling the <fieldset>'s
                border, no matter the padding: visually hidden here and
                replaced with a normal, fully-contained heading. */}
            <legend className="sr-only">{q.q}</legend>
            <p className="lp-q-text" aria-hidden="true">
              <span className="lp-q-num">{qi + 1}.</span>
              <span>{q.q}</span>
            </p>

            <div className="lp-options">
              {q.options.map((opt, oi) => {
                const selected = chosen === oi;
                const isCorrect = oi === q.answer;
                let state = "";
                if (submitted) {
                  if (isCorrect) state = "lp-option--right";
                  else if (selected) state = "lp-option--wrong";
                  else state = "lp-option--dim";
                } else if (selected) {
                  state = "lp-option--picked";
                }

                return (
                  <label
                    key={oi}
                    className={`lp-option ${state}${submitted ? " lp-option--locked" : ""}`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={oi}
                      checked={selected}
                      disabled={submitted}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    />
                    <span className="lp-option-text">{opt}</span>
                    {submitted && isCorrect && (
                      <span className="lp-option-flag lp-option-flag--right">
                        <Icon name="check" size={14} />
                        正解
                      </span>
                    )}
                    {submitted && selected && !isCorrect && (
                      <span className="lp-option-flag lp-option-flag--wrong">
                        <Icon name="close" size={14} />
                        你的選擇
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {submitted && (
              <p className="lp-explain" role="note">
                <Icon name={answers[q.id] === q.answer ? "check" : "info"} size={16} />
                <span>
                  {answers[q.id] === q.answer ? "答對了。" : "重點："}
                  {q.explain}
                </span>
              </p>
            )}
          </fieldset>
        );
      })}

      {!submitted ? (
        <div className="lp-submit">
          <PrimaryButton type="submit" disabled={!allAnswered}>
            送出
          </PrimaryButton>
          <span className="lp-count" aria-live="polite">
            已作答 {answeredCount} / {total}
          </span>
        </div>
      ) : (
        <FloatCard as="section" strong title="結果">
          <p className="lp-score">
            <span className="g-hero-number">{score}</span>
            <span className="lp-score-of"> / {total}</span>
          </p>
          {isPost && (delta !== null || priorPreScore !== null) && (
            <p className="lp-lead">
              {(() => {
                const preScore = delta !== null ? score - delta : priorPreScore;
                const gain = delta !== null ? delta : preScore !== null ? score - preScore : null;
                if (gain === null) return "這條線還沒有前測紀錄可以比較。";
                if (gain > 0) return `比前測進步了 ${gain} 題。這條線的內容真的留下來了。`;
                if (gain === 0) return "跟前測分數一樣，代表這些內容你本來就掌握得不錯。";
                return "這次分數比前測低，可能是題目剛好比較刁鑽，可以回頭看看不熟的站再試一次。";
              })()}
            </p>
          )}
          <p className="lp-caption" aria-live="polite">
            {saveState === "saving" && "儲存中…"}
            {saveState === "saved" && "已記錄。"}
            {saveState === "no_session" && (
              <>
                想儲存這次結果嗎？{" "}
                <Link href="/signup" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline" }}>
                  建立帳號或輸入代碼
                </Link>
                。
              </>
            )}
            {saveState === "error" && "儲存時發生問題，這次分數僅顯示在畫面上。"}
          </p>
          <div className="lp-actions">
            <PrimaryButton href={backHref} line={{ color, colorInk }}>
              回到{lineName}
              <Icon name="arrow" size={18} />
            </PrimaryButton>
          </div>
        </FloatCard>
      )}
    </form>
  );
}

"use client";

import { useState } from "react";
import type { WriteStep } from "@/lib/tasks/types";
import s from "./steps/write.module.css";

/**
 * 06 F3.3 on the model-answer screen: the student's text, one possible
 * reply, then the self-check as checkboxes. The tick count is private: it
 * stays on this screen and is never sent anywhere.
 */
export function WriteAnswer({ step, answer }: { step: WriteStep; answer: unknown }) {
  const text = answer && typeof answer === "object" ? String((answer as { text?: unknown }).text ?? "") : "";
  const [ticks, setTicks] = useState<boolean[]>(() => step.selfCheck.map(() => false));
  const done = ticks.filter(Boolean).length;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <p className={s.label}>你的答案</p>
        {/* Plain text, never HTML. */}
        <p className={s.text}>{text || "（沒有作答）"}</p>
      </div>
      <div>
        <p className={s.label}>一種寫法</p>
        <p className={s.text}>{step.modelAnswer}</p>
      </div>
      <fieldset className={s.checks}>
        <legend className={s.label}>對照看看，你有做到嗎？</legend>
        {step.selfCheck.map((c, i) => (
          <label key={c} className={s.check}>
            <input type="checkbox" checked={ticks[i]} onChange={(e) => setTicks((t) => t.map((v, j) => (j === i ? e.target.checked : v)))} />
            <span>{c}</span>
          </label>
        ))}
      </fieldset>
      <p className={s.count} style={{ textAlign: "left" }} aria-live="polite">
        你做到了 {step.selfCheck.length} 項中的 {done} 項
      </p>
    </div>
  );
}

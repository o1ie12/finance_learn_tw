"use client";

import type { WriteStep } from "@/lib/tasks/types";
import type { WriteDraft } from "../answers";
import type { StepViewProps } from "./types";
import s from "./write.module.css";

/**
 * 06 F3.3: a text area (17/28) with a 「23 / 80」 counter. Plain text only;
 * what is typed goes to the student's own profile and nowhere else.
 */
export function WriteStepView({ step, value, onChange, disabled, promptId }: StepViewProps<WriteStep, WriteDraft>) {
  const max = step.maxChars ?? 80;
  const count = [...value.text].length;
  return (
    <div className={s.wrap}>
      <textarea
        className={s.area}
        aria-labelledby={promptId}
        aria-describedby={`${promptId}-count`}
        value={value.text}
        maxLength={max}
        disabled={disabled}
        rows={4}
        onChange={(e) => onChange({ text: [...e.target.value].slice(0, max).join("") })}
      />
      <p id={`${promptId}-count`} className={s.count}>
        {count} / {max}
      </p>
      <p className={s.note}>只存在你自己的帳號裡，不會給別人看。</p>
    </div>
  );
}

"use client";

import { useId, useRef, type KeyboardEvent } from "react";
import type { ChoiceStep } from "@/lib/tasks/types";
import { showsReasons, type ChoiceDraft } from "../answers";
import s from "../tasks.module.css";
import type { StepViewProps } from "./types";

/**
 * Pick one option, then (when the step lists 2+ reasons) one reason.
 * Native radio groups: arrow keys move, Enter confirms. Enter on the option
 * group moves to the reason group; Enter on the reason group sends the step.
 */
export function ChoiceStepView({
  step,
  value,
  onChange,
  onConfirm,
  disabled,
  promptId,
}: StepViewProps<ChoiceStep, ChoiceDraft>) {
  const uid = useId();
  const reasonsRef = useRef<HTMLDivElement>(null);
  const withReasons = showsReasons(step);
  const reasonLabelId = `${uid}-reason`;

  function focusReasons() {
    const group = reasonsRef.current;
    if (!group) return;
    const target =
      group.querySelector<HTMLInputElement>("input:checked") ?? group.querySelector<HTMLInputElement>("input");
    target?.focus();
  }

  function onOptionKey(e: KeyboardEvent<HTMLInputElement>, optionId: string) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const next = { ...value, option: optionId };
    onChange(next);
    if (withReasons) focusReasons();
    else onConfirm(next);
  }

  function onReasonKey(e: KeyboardEvent<HTMLInputElement>, reasonId: string) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const next = { ...value, reason: reasonId };
    onChange(next);
    onConfirm(next);
  }

  return (
    <div className={s.stepBody}>
      <div role="radiogroup" aria-labelledby={promptId} className={s.optList}>
        {step.options.map((o) => (
          <label key={o.id} className={s.opt}>
            <input
              type="radio"
              className={s.optInput}
              name={`${uid}-option`}
              value={o.id}
              checked={value.option === o.id}
              disabled={disabled}
              onChange={() => onChange({ ...value, option: o.id })}
              onKeyDown={(e) => onOptionKey(e, o.id)}
            />
            <span className={s.optDot} aria-hidden="true" />
            <span className={s.optText}>{o.label}</span>
          </label>
        ))}
      </div>

      {withReasons ? (
        <div className={s.reasonBlock}>
          <p id={reasonLabelId} className={`g-label ${s.reasonLabel}`}>
            為什麼？選一個理由
          </p>
          <div ref={reasonsRef} role="radiogroup" aria-labelledby={reasonLabelId} className={s.optList}>
            {step.reasons!.map((r) => (
              <label key={r.id} className={s.opt}>
                <input
                  type="radio"
                  className={s.optInput}
                  name={`${uid}-reason`}
                  value={r.id}
                  checked={value.reason === r.id}
                  disabled={disabled}
                  onChange={() => onChange({ ...value, reason: r.id })}
                  onKeyDown={(e) => onReasonKey(e, r.id)}
                />
                <span className={s.optDot} aria-hidden="true" />
                <span className={s.optText}>{r.label}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

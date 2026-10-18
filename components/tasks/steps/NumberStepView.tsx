"use client";

import { useId } from "react";
import type { NumberStep } from "@/lib/tasks/types";
import type { NumberDraft } from "../answers";
import s from "../tasks.module.css";
import type { StepViewProps } from "./types";

/**
 * A labelled text input with a numeric keyboard. "6,390" and "NT$6,390" are
 * both accepted (scoring.ts parseNumberAnswer). NT$ shows as a prefix and %
 * as a suffix; any other unit is a suffix. Enter sends the step.
 */
export function NumberStepView({ step, value, onChange, onConfirm, disabled, promptId }: StepViewProps<NumberStep, NumberDraft>) {
  const uid = useId();
  const unit = step.unit;
  const prefix = unit === "NT$" ? "NT$" : null;
  const suffix = unit && unit !== "NT$" ? unit : null;
  const hintId = `${uid}-hint`;
  return (
    <form
      className={s.stepBody}
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm();
      }}
    >
      <div className={s.numField}>
        {prefix ? (
          <span className={s.numAffix} aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
          id={`${uid}-input`}
          className={s.numInput}
          type="text"
          inputMode={unit === "%" ? "decimal" : "numeric"}
          autoComplete="off"
          enterKeyHint="done"
          aria-labelledby={`${promptId} ${uid}-input-unit`}
          aria-describedby={hintId}
          value={value.raw}
          disabled={disabled}
          onChange={(e) => onChange({ raw: e.target.value })}
        />
        <span id={`${uid}-input-unit`} className="sr-only">
          {unit === "NT$" ? "單位：新臺幣元" : unit ? `單位：${unit}` : ""}
        </span>
        {suffix ? (
          <span className={s.numAffix} aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </div>
      <p id={hintId} className="g-caption">
        只填數字，可以加逗號，例如 6,390。
      </p>
    </form>
  );
}

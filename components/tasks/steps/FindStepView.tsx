"use client";

import { useMemo } from "react";
import { renderMaterial } from "@/components/documents";
import type { FindStep, Material } from "@/lib/tasks/types";
import type { FindDraft } from "../answers";
import s from "../tasks.module.css";
import type { StepViewProps } from "./types";

export interface FindStepViewProps extends StepViewProps<FindStep, FindDraft> {
  material: Material | undefined;
  onExpand(materialIndex: number): void;
}

/** Toggle one field id in a find draft. Shared with the large viewer. */
export function toggleFind(draft: FindDraft, id: string): FindDraft {
  return draft.selected.includes(id)
    ? { selected: draft.selected.filter((x) => x !== id) }
    : { selected: [...draft.selected, id] };
}

/**
 * The document in find mode: every field is a toggle button (aria-pressed),
 * so Tab and Enter/Space work. The count says how many are picked out of how
 * many the prompt asks for.
 */
export function FindStepView({ step, material, value, onChange, disabled, promptId, onExpand }: FindStepViewProps) {
  const selected = useMemo(() => new Set(value.selected), [value.selected]);
  return (
    <div className={s.stepBody}>
      <div className={s.findBar}>
        <p className={s.findCount} aria-live="polite">
          已選 <strong className="g-num">{value.selected.length}</strong> 個 · 要找{" "}
          <strong className="g-num">{step.targets.length}</strong> 個
        </p>
        {material ? (
          <button
            type="button"
            className={s.ghostBtn}
            aria-label="放大文件來點選"
            onClick={() => onExpand(step.materialIndex)}
          >
            放大
          </button>
        ) : null}
      </div>
      <p className="g-caption">點文件上的欄位來選取，再點一次取消。</p>
      <div role="group" aria-labelledby={promptId} className={s.findDoc}>
        {material
          ? renderMaterial(material, {
              headingLevel: 4,
              find: { selected, onToggle: (id) => onChange(toggleFind(value, id)), disabled },
            })
          : null}
      </div>
    </div>
  );
}

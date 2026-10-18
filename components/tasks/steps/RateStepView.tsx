"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { renderMaterial } from "@/components/documents";
import type { Material, RateStep } from "@/lib/tasks/types";
import type { RateDraft } from "../answers";
import s from "../tasks.module.css";
import type { StepViewProps } from "./types";

export interface RateStepViewProps extends StepViewProps<RateStep, RateDraft> {
  /** The items drawn for this attempt (lib/tasks/draw.ts drawRateItems). */
  items: RateStep["items"];
  materials: Material[];
  /** Open a material in the large viewer. */
  onExpand(materialIndex: number): void;
}

const RATING_KEYS: Record<string, 1 | 2 | 3> = { "1": 1, "2": 2, "3": 3 };

/**
 * Rate each drawn item 1, 2 or 3. Each item shows its document (a credit
 * report), then a native radio group. With focus anywhere in an item's
 * group, the keys 1, 2 and 3 set the rating directly.
 */
export function RateStepView({
  step,
  items,
  materials,
  value,
  onChange,
  onConfirm,
  disabled,
  promptId,
  onExpand,
}: RateStepViewProps) {
  const uid = useId();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const rated = items.filter((i) => value.ratings[i.id]).length;

  function setRating(itemId: string, r: 1 | 2 | 3): RateDraft {
    const next = { ratings: { ...value.ratings, [itemId]: r } };
    onChange(next);
    return next;
  }

  function onGroupKey(e: KeyboardEvent<HTMLFieldSetElement>, itemId: string) {
    if (disabled || e.altKey || e.ctrlKey || e.metaKey) return;
    const r = RATING_KEYS[e.key];
    if (r) {
      e.preventDefault();
      setRating(itemId, r);
      e.currentTarget.querySelector<HTMLInputElement>(`input[value="${r}"]`)?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      onConfirm();
    }
  }

  return (
    <div className={s.stepBody}>
      <dl className={s.scaleLegend} aria-label="分數的意思">
        {step.scale.map((sc) => (
          <div key={sc.value} className={s.scaleRow}>
            <dt className={s.scaleNum}>{sc.value}</dt>
            <dd>{sc.label}</dd>
          </div>
        ))}
      </dl>
      <p className="g-caption">在一份資料的分數上，也可以直接按 1、2、3。</p>

      <ol className={s.rateList} aria-labelledby={promptId}>
        {items.map((item, n) => {
          const material = materials[item.materialIndex];
          const open = !collapsed[item.id];
          const headId = `${uid}-${item.id}-h`;
          const docId = `${uid}-${item.id}-doc`;
          const legendId = `${uid}-${item.id}-legend`;
          return (
            <li key={item.id} className={s.rateItem} aria-labelledby={headId}>
              <div className={s.rateHead}>
                <h4 id={headId} className={s.rateTitle}>
                  <span className={s.rateIndex}>{n + 1}</span>
                  {item.label}
                </h4>
                {material ? (
                  <div className={s.rateTools}>
                    <button
                      type="button"
                      className={s.ghostBtn}
                      aria-expanded={open}
                      aria-controls={docId}
                      onClick={() => setCollapsed((c) => ({ ...c, [item.id]: open }))}
                    >
                      {open ? "收起資料" : "看資料"}
                    </button>
                    <button
                      type="button"
                      className={s.ghostBtn}
                      aria-label={`放大「${item.label}」的資料`}
                      onClick={() => onExpand(item.materialIndex)}
                    >
                      放大
                    </button>
                  </div>
                ) : null}
              </div>
              {material ? (
                <div id={docId} className={s.rateDoc} hidden={!open}>
                  {renderMaterial(material, { headingLevel: 4 })}
                </div>
              ) : null}
              <fieldset className={s.rateField} onKeyDown={(e) => onGroupKey(e, item.id)} disabled={disabled}>
                <legend id={legendId} className="sr-only">
                  {`給「${item.label}」幾分（可按 1、2、3）`}
                </legend>
                <div className={s.rateOpts}>
                  {step.scale.map((sc) => (
                    <label key={sc.value} className={s.rateOpt}>
                      <input
                        type="radio"
                        className={s.optInput}
                        name={`${uid}-${item.id}`}
                        value={sc.value}
                        checked={value.ratings[item.id] === sc.value}
                        onChange={() => setRating(item.id, sc.value)}
                      />
                      <span className={s.rateOptNum}>{sc.value}</span>
                      <span className={s.rateOptLabel}>{sc.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </li>
          );
        })}
      </ol>
      <p className="g-caption" aria-live="polite">
        已給分 {rated} / {items.length} 份
      </p>
    </div>
  );
}

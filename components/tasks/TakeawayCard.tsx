"use client";

import { useId, useState, type CSSProperties } from "react";
import { Icon } from "@/components/game/icons";
import type { Takeaway } from "@/lib/tasks/types";
import s from "./tasks.module.css";

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * The takeaway framework as a small card (01 §6.5 panel 4). 「存到工具箱」
 * calls `onSave(name)`; the button then says it is saved. No button when
 * there is nowhere to save.
 */
export function TakeawayCard({
  takeaway,
  onSave,
  initiallySaved = false,
  index = 0,
}: {
  takeaway: Takeaway;
  onSave?: (name: string) => Promise<void>;
  initiallySaved?: boolean;
  index?: number;
}) {
  const titleId = useId();
  const [state, setState] = useState<SaveState>(initiallySaved ? "saved" : "idle");

  async function save() {
    if (!onSave || state === "saving" || state === "saved") return;
    setState("saving");
    try {
      await onSave(takeaway.name);
      setState("saved");
    } catch {
      setState("error");
    }
  }

  return (
    <section
      className={`g-card g-card--strong ga-card-in ${s.takeawayCard}`}
      style={{ "--ga-i": index } as CSSProperties}
      aria-labelledby={titleId}
    >
      <p className="g-label">帶走一個工具</p>
      <h3 id={titleId} className={s.takeawayTitle}>
        {takeaway.name}
      </h3>
      <ol className={s.takeawayLines}>
        {takeaway.lines.map((line, i) => (
          <li key={i}>
            <span className={s.takeawayNum} aria-hidden="true">
              {i + 1}
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ol>
      {onSave ? (
        <div className={s.takeawayActions}>
          <button
            type="button"
            className={s.secondaryBtn}
            onClick={save}
            aria-disabled={state === "saving" || state === "saved" || undefined}
            data-saved={state === "saved" || undefined}
          >
            {state === "saved" ? (
              <>
                <Icon name="check" size={18} />
                已存到工具箱
              </>
            ) : state === "saving" ? (
              "存檔中…"
            ) : (
              "存到工具箱"
            )}
          </button>
          <p className="g-caption" aria-live="polite">
            {state === "error" ? "沒有存成功，請再按一次。" : state === "saved" ? "之後在「工具箱」可以再看到它。" : ""}
          </p>
        </div>
      ) : null}
    </section>
  );
}

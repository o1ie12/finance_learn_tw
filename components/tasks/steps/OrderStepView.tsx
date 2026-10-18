"use client";

import { useEffect, useRef, useState } from "react";
import type { OrderStep } from "@/lib/tasks/types";
import type { OrderDraft } from "../answers";
import s from "../tasks.module.css";
import type { StepViewProps } from "./types";

/**
 * Put items in order with 上移 / 下移 buttons. Each move is announced
 * (aria-live) and focus follows the moved item: it stays on the same button,
 * or on the other one when the item reached the top or the bottom.
 */
export function OrderStepView({ step, value, onChange, disabled, promptId }: StepViewProps<OrderStep, OrderDraft>) {
  const [announce, setAnnounce] = useState("");
  const pendingFocus = useRef<{ id: string; dir: "up" | "down" } | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement | null>());
  const label = (id: string) => step.items.find((i) => i.id === id)?.label ?? id;
  const order = value.order;

  function move(index: number, dir: "up" | "down") {
    const to = dir === "up" ? index - 1 : index + 1;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [id] = next.splice(index, 1);
    next.splice(to, 0, id);
    onChange({ order: next });
    setAnnounce(`「${label(id)}」移到第 ${to + 1} 個，共 ${next.length} 個。`);
    // At an end, the button just used is disabled; focus its partner.
    const atEnd = (dir === "up" && to === 0) || (dir === "down" && to === next.length - 1);
    pendingFocus.current = { id, dir: atEnd ? (dir === "up" ? "down" : "up") : dir };
  }

  // React moves the <li> in the DOM, which drops focus; put it back.
  useEffect(() => {
    const p = pendingFocus.current;
    if (!p) return;
    pendingFocus.current = null;
    buttons.current.get(`${p.id}:${p.dir}`)?.focus();
  }, [order]);

  return (
    <div className={s.stepBody}>
      <ol className={s.orderList} aria-labelledby={promptId}>
        {order.map((id, i) => (
          <li key={id} className={s.orderItem}>
            <span className={s.orderNum} aria-hidden="true">
              {i + 1}
            </span>
            <span className={s.orderLabel}>{label(id)}</span>
            <span className={s.orderBtns}>
              <button
                type="button"
                ref={(el) => {
                  buttons.current.set(`${id}:up`, el);
                }}
                className={s.orderBtn}
                disabled={disabled || i === 0}
                aria-label={`上移「${label(id)}」`}
                onClick={() => move(i, "up")}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M12 19V5M6 11l6-6 6 6" />
                </svg>
                <span aria-hidden="true">上移</span>
              </button>
              <button
                type="button"
                ref={(el) => {
                  buttons.current.set(`${id}:down`, el);
                }}
                className={s.orderBtn}
                disabled={disabled || i === order.length - 1}
                aria-label={`下移「${label(id)}」`}
                onClick={() => move(i, "down")}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
                <span aria-hidden="true">下移</span>
              </button>
            </span>
          </li>
        ))}
      </ol>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";
import s from "./ui.module.css";

/**
 * 06 E7.14: the app's only alert (reset the game). A complete-sentence title,
 * one line on what is lost, the chosen action on top, 取消 below. No default
 * button: focus starts on the dialog, so a stray Enter does nothing.
 */
export function Alert({
  title,
  body,
  action,
  onAction,
  onCancel,
}: {
  title: string;
  body: string;
  action: string;
  onAction: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <div className={s.backdrop}>
      <div ref={ref} className={`${s.alert} squircle`} role="alertdialog" aria-modal="true" aria-labelledby="alert-title" aria-describedby="alert-body" tabIndex={-1}>
        <h2 id="alert-title">{title}</h2>
        <p id="alert-body">{body}</p>
        <Button variant="secondary" onClick={onAction}>
          {action}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          取消
        </Button>
      </div>
    </div>
  );
}

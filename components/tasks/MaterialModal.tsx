"use client";

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "@/components/game/icons";
import s from "./tasks.module.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), summary';

/**
 * The large material viewer (03 §3): a native modal <dialog>, so the page
 * behind it is inert. Tab cycles inside it, Escape closes it, a click on the
 * backdrop closes it, and focus returns to whatever opened it.
 */
export function MaterialModal({ title, onClose, children }: { title: string; onClose(): void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // No cleanup on purpose: removing an open dialog takes it out of the top
  // layer, and closing it in a cleanup would fire `close` under Strict Mode's
  // double effect run.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
  }, []);

  function handleClose() {
    const back = opener.current;
    onClose();
    if (back && back.isConnected) back.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key !== "Tab") return;
    const nodes = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => !el.closest("[hidden]"),
    );
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    // Keyboard users close it with Escape (native) or the 關閉 button; the
    // backdrop click is a pointer convenience only.
    <dialog
      ref={ref}
      className={s.modal}
      aria-labelledby={titleId}
      onClose={handleClose}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className={s.modalInner}>
        <div className={s.modalHead}>
          <h2 id={titleId} className={s.modalTitle}>
            {title}
          </h2>
          <button
            type="button"
            className={s.modalClose}
            aria-label="關閉"
            autoFocus
            onClick={() => ref.current?.close()}
          >
            <Icon name="close" size={22} />
          </button>
        </div>
        <div className={s.modalBody}>{children}</div>
      </div>
    </dialog>
  );
}

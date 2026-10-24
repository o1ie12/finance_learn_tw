"use client";

import { useEffect, useRef, type ReactNode } from "react";
import s from "./ui.module.css";

/**
 * 06 E7.12. One sheet at a time, a grabber, Esc closes, focus moves in on
 * open and back on close. No dimming on Compact (the world stays visible);
 * a centered dialog with a backdrop on Regular. Always paired with a visible
 * way out in the bar above it (E6.2).
 */
export function Sheet({ children, label, onClose }: { children: ReactNode; label: string; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    ref.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (before?.isConnected) before.focus({ preventScroll: true });
    };
  }, [onClose]);
  return (
    <>
      <div className={s.sheetBackdrop} aria-hidden="true" onClick={onClose} />
      <div ref={ref} className={`${s.sheet} squircle`} role="dialog" aria-label={label} tabIndex={-1}>
        <div className={s.grabber} aria-hidden="true" />
        {children}
      </div>
    </>
  );
}

"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./Button";
import s from "./ui.module.css";

/** Closes the sheet with its exit motion; for buttons inside it. */
const CloseContext = createContext<() => void>(() => {});

/** Exit length (E12: 200ms --ease-in; reduced motion: a 120ms fade). */
const EXIT_MS = 200;

/**
 * 06 E7.12. One sheet at a time, a grabber, Esc closes, focus moves in on
 * open and back on close. No dimming on Compact (the world stays visible);
 * a centered dialog with a backdrop on Regular. Enters in 380ms on the soft
 * spring, leaves in 200ms (E12); the parent unmounts it after the exit.
 * Always paired with a visible way out (E6.2): SheetClose below.
 */
export function Sheet({ children, label, onClose }: { children: ReactNode; label: string; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const latest = useRef(onClose);
  useEffect(() => {
    latest.current = onClose;
  });
  const close = useCallback(() => {
    setClosing(true);
    // A timeout, not animationend: it must also finish in a hidden tab.
    window.setTimeout(() => latest.current?.(), EXIT_MS);
  }, []);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    ref.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (before?.isConnected) before.focus({ preventScroll: true });
    };
  }, [close]);
  return (
    <CloseContext.Provider value={close}>
      <div className={s.sheetBackdrop} aria-hidden="true" onClick={close} data-closing={closing || undefined} />
      <div ref={ref} className={`${s.sheet} squircle`} role="dialog" aria-label={label} tabIndex={-1} data-closing={closing || undefined}>
        <div className={s.grabber} aria-hidden="true" />
        {children}
      </div>
    </CloseContext.Provider>
  );
}

/** The sheet's 關閉 button (secondary), closing with the exit motion. */
export function SheetClose({ children = "關閉" }: { children?: ReactNode }) {
  const close = useContext(CloseContext);
  return (
    <Button variant="secondary" onClick={close}>
      {children}
    </Button>
  );
}

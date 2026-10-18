"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon } from "./icons";

export interface SettingsMenuProps {
  /** Menu rows: links or buttons. Direct <a>/<button> children get row styling. */
  children: ReactNode;
  /** Accessible name of the 44×44 trigger. Default 設定. */
  label?: string;
}

/**
 * The settings button and its small panel. Disclosure pattern (button with
 * aria-expanded + panel), not role="menu", so Tab moves through the rows as
 * ordinary links and buttons. Escape closes and returns focus to the button;
 * so do clicking outside and tabbing out of the panel.
 */
export function SettingsMenu({ children, label = "設定" }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="g-settings"
      onBlur={(e) => {
        if (open && e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="g-icon-btn"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="gear" size={20} />
      </button>
      <div
        id={panelId}
        className="g-menu-panel"
        hidden={!open}
        onClick={(e) => {
          // Choosing a row closes the panel.
          if ((e.target as HTMLElement).closest("a, button")) setOpen(false);
        }}
      >
        {children}
      </div>
    </div>
  );
}

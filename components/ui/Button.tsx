"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";
import s from "./ui.module.css";

type Common = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "destructive";
  icon?: IconName;
  className?: string;
};

/**
 * 06 E7.3. One primary per screen. A disabled button stays focusable, says
 * so with aria-disabled, and needs a visible reason nearby (helper). While
 * busy the label stays and a spinner replaces the icon, shown only after
 * 250 ms so fast answers never flash it.
 */
export function Button(
  props: Common &
    (
      | { href: string; onClick?: never; disabled?: never; busy?: never; type?: never }
      | { href?: never; onClick?: () => void; disabled?: boolean; busy?: boolean; type?: "button" | "submit" }
    ),
) {
  const { children, variant = "primary", icon, className } = props;
  const classes = [s.btn, s[variant], "squircle", className].filter(Boolean).join(" ");
  const busy = "busy" in props ? !!props.busy : false;
  const [showSpin, setShowSpin] = useState(false);
  useEffect(() => {
    if (!busy) return;
    const t = window.setTimeout(() => setShowSpin(true), 250);
    return () => {
      window.clearTimeout(t);
      setShowSpin(false);
    };
  }, [busy]);
  const lead = busy && showSpin ? <span className={s.spinner} aria-hidden="true" /> : icon ? <Icon name={icon} size={20} /> : null;

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={classes}>
        {lead}
        {children}
      </Link>
    );
  }
  const disabled = !!props.disabled;
  return (
    <button
      type={props.type ?? "button"}
      className={classes}
      aria-disabled={disabled || undefined}
      aria-busy={busy || undefined}
      onClick={disabled || busy ? undefined : props.onClick}
    >
      {lead}
      {children}
    </button>
  );
}

/** The action zone at the bottom: an optional helper line, then the buttons. */
export function Actions({ children, helper }: { children: ReactNode; helper?: string | null }) {
  return (
    <div className={s.actions}>
      {helper ? <p className={s.helper}>{helper}</p> : null}
      {children}
    </div>
  );
}

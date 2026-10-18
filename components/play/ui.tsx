import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "@/components/game/icons";
import s from "./play.module.css";

/** Extra stroke icons the turn screen needs (2px, round caps, currentColor). */
const EXTRA = {
  alert: (
    <>
      <path d="M12 4 2.5 20h19L12 4z" />
      <path d="M12 10v4.5M12 17.5h.01" />
    </>
  ),
  shield: <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3z" />,
  coin: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M9.5 10a2.5 2 0 0 1 2.5-1.5h.5a2 2 0 0 1 0 4h-1a2 2 0 0 0 0 4h.5a2.5 2 0 0 0 2.5-1.5" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
    </>
  ),
  forward: <path d="M4 6l7 6-7 6V6zM13 6l7 6-7 6V6z" />,
} as const;

export type ExtraIconName = keyof typeof EXTRA;

export function PlayIcon({ name, size = 18, className }: { name: ExtraIconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {EXTRA[name]}
    </svg>
  );
}

/** The small 「示意」 tag on illustrative amounts (00 rule 3). */
export function SampleTag() {
  return <span className={s.sample}>示意</span>;
}

export type NoticeTone = "good" | "warn" | "bad" | "info";

/** A line with an icon and a word, so meaning never rests on color alone. */
export function Notice({ tone, children, live = false }: { tone: NoticeTone; children: ReactNode; live?: boolean }) {
  const icon =
    tone === "good" ? (
      <Icon name="check" size={18} />
    ) : tone === "info" ? (
      <Icon name="info" size={18} />
    ) : (
      <PlayIcon name="alert" />
    );
  return (
    <div className={`${s.notice} ${s[`notice_${tone}`]}`} role={live ? "status" : undefined}>
      <span className={s.noticeIcon}>{icon}</span>
      <div className={s.noticeText}>{children}</div>
    </div>
  );
}

/** Outline button for second choices (快轉, 先不買, 取消). */
export function SecondaryButton({ className, type = "button", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={[s.secondary, className].filter(Boolean).join(" ")} {...rest} />;
}

/** Label / value rows. */
export function Rows({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <dl className={s.rows} aria-label={label}>
      {children}
    </dl>
  );
}

export function Row({
  label,
  value,
  strong = false,
  tone,
}: {
  label: ReactNode;
  value: ReactNode;
  strong?: boolean;
  tone?: "good" | "bad";
}) {
  return (
    <div className={[s.row, strong && s.rowStrong].filter(Boolean).join(" ")}>
      <dt>{label}</dt>
      <dd className={tone ? s[`tone_${tone}`] : undefined}>{value}</dd>
    </div>
  );
}

/** The row of buttons at the bottom of a step card. */
export function Actions({ children }: { children: ReactNode }) {
  return <div className={s.actionsRow}>{children}</div>;
}

/** A polite line for request errors. */
export function ErrorLine({ message }: { message: string | null }) {
  return (
    <p className={s.errorLine} role="alert">
      {message ? (
        <>
          <PlayIcon name="alert" />
          <span>{message}</span>
        </>
      ) : null}
    </p>
  );
}

/**
 * Move focus to the current step's heading (after a step or sub-view
 * changes), so keyboard and screen-reader users continue from the top of
 * the new card. A timeout, not rAF: it must also run in a hidden tab.
 */
export function focusStepHeading(): void {
  window.setTimeout(() => {
    const el = document.querySelector<HTMLElement>("[data-step-heading]");
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ block: "nearest" });
  }, 0);
}

/**
 * Click handler that does nothing while `blocked`. Buttons use
 * aria-disabled instead of `disabled` so they keep keyboard focus while a
 * request is in flight (a disabled button drops focus to the page).
 */
export function guard(blocked: boolean, fn: () => void): () => void {
  return () => {
    if (!blocked) fn();
  };
}

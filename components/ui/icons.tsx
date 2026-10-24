/**
 * The one icon set (06 E5): 24×24, 2.2px round stroke, currentColor. Tab
 * icons have a filled form (E5, E7.13: tab bar icons are always filled).
 * The prototype's paths (screens.mjs) are not in the repo; these are drawn to
 * the same rules. Decorative by default: an icon button carries the label.
 */
import type { SVGProps } from "react";

export type IconName =
  | "back"
  | "close"
  | "flame"
  | "check"
  | "today"
  | "me"
  | "map"
  | "bolt"
  | "lock"
  | "chevron"
  | "plus"
  | "minus"
  | "info"
  | "up"
  | "down"
  | "award"
  | "doc"
  | "chat";

const STROKE: Record<IconName, React.ReactNode> = {
  back: <path d="M15 5l-7 7 7 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  flame: <path d="M12 3c1 3.5 5 5.6 5 10a5 5 0 0 1-10 0c0-2.4 1.3-3.9 2.5-5 .2 1.6 1 2.6 2 3 0-3.1-.2-5.6.5-8z" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  today: <path d="M4 11l8-6.5 8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" />,
  me: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20c.8-3.8 3.9-6 7.5-6s6.7 2.2 7.5 6" />
    </>
  ),
  map: (
    <>
      <path d="M4 6.5l5-2 6 2 5-2v13l-5 2-6-2-5 2z" />
      <path d="M9 4.5v13M15 6.5v13" />
    </>
  ),
  bolt: <path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  chevron: <path d="M9 5l7 7-7 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.8v.4" />
    </>
  ),
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
  award: (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8.8 13.5 7.5 21l4.5-2.5 4.5 2.5-1.3-7.5" />
    </>
  ),
  doc: (
    <>
      <path d="M6.5 3.5h8l4 4v13h-12z" />
      <path d="M14.5 3.5v4h4M9.5 12.5h5M9.5 16h5" />
    </>
  ),
  chat: <path d="M4.5 6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4.5 3.5V16h0a2 2 0 0 1-2-2z" />,
};

/** Filled forms for the tab bar (inactive and active alike). */
const FILLED: Partial<Record<IconName, React.ReactNode>> = {
  today: <path d="M3.3 10.6l8.1-6.6a1 1 0 0 1 1.2 0l8.1 6.6a1 1 0 0 1 .3.8V19a2 2 0 0 1-2 2h-4v-5.5h-6V21H5a2 2 0 0 1-2-2v-7.6a1 1 0 0 1 .3-.8z" />,
  me: (
    <>
      <circle cx="12" cy="8.3" r="4.3" />
      <path d="M3.7 20.2C4.6 15.9 8 13.5 12 13.5s7.4 2.4 8.3 6.7a1 1 0 0 1-1 1.3H4.7a1 1 0 0 1-1-1.3z" />
    </>
  ),
  map: <path d="M3 6.3a1 1 0 0 1 .6-.9l5-2a1 1 0 0 1 .7 0L15 5.2l4.6-1.8A1 1 0 0 1 21 4.3v13.4a1 1 0 0 1-.6.9l-5 2a1 1 0 0 1-.7 0L9 18.8l-4.6 1.8A1 1 0 0 1 3 19.7z" />,
  bolt: <path d="M13.6 2.4a.7.7 0 0 1 1.1.7l-1.5 6.4h5.3a.7.7 0 0 1 .6 1.1l-8.7 11a.7.7 0 0 1-1.1-.7l1.5-6.4H5.5a.7.7 0 0 1-.6-1.1z" />,
  flame: <path d="M12.6 2.6c.9 3.5 5.4 5.6 5.4 10.4a6 6 0 0 1-12 0c0-2.8 1.5-4.5 2.9-5.7a.6.6 0 0 1 1 .4c.1 1.3.6 2.2 1.4 2.7.1-2.9-.1-5.3.6-7.7a.4.4 0 0 1 .7-.1z" />,
};

export function Icon({
  name,
  size = 24,
  filled = false,
  ...rest
}: { name: IconName; size?: number; filled?: boolean } & Omit<SVGProps<SVGSVGElement>, "name">) {
  const fill = filled ? FILLED[name] : undefined;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...(fill
        ? { fill: "currentColor", stroke: "none" }
        : { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" })}
      {...rest}
    >
      {fill ?? STROKE[name]}
    </svg>
  );
}

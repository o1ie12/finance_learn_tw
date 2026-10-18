import type { ReactNode } from "react";
import { Icon } from "./icons";

export interface ChipProps {
  children: ReactNode;
  /** Locked: grey with a 12px lock icon and a screen-reader-only 未解鎖. */
  locked?: boolean;
  className?: string;
}

/** Pill chip for life-game moves (01 §5). Wrap several in `.g-chips`. */
export function Chip({ children, locked = false, className }: ChipProps) {
  return (
    <span className={["g-chip", locked && "g-chip--locked", className].filter(Boolean).join(" ")}>
      {locked ? <Icon name="lock" size={12} /> : null}
      {children}
      {locked ? <span className="sr-only">（未解鎖）</span> : null}
    </span>
  );
}

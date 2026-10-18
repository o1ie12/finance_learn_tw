import type { CSSProperties, ReactNode } from "react";

export type MeaningTone = "good" | "warn" | "bad" | "money" | "info";

export interface StatBarProps {
  /** Left label, e.g. 壓力. */
  label: string;
  /** Right value, shown bold, e.g. "1.2 / 3 個月". */
  value: string;
  /** Fill, 0 to 100 (clamped). */
  percent: number;
  /** Fill color by meaning (01 §2.3). */
  tone: MeaningTone;
  /** Optional text color for the value. Pair it with a word (低/高), never color alone. */
  valueTone?: "good" | "bad";
  /** Optional caption under the bar. */
  caption?: ReactNode;
  className?: string;
}

/**
 * Label + value + 10px bar on --track (01 §5). The bar is a role="meter"
 * named by the label, with the visible value as its aria-valuetext, so a
 * screen reader hears "壓力, 低" rather than a bare percentage.
 */
export function StatBar({ label, value, percent, tone, valueTone, caption, className }: StatBarProps) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
  return (
    <div className={["g-stat", className].filter(Boolean).join(" ")}>
      <div className="g-stat-row" aria-hidden="true">
        <span>{label}</span>
        <span className={["g-stat-value", valueTone && `g-stat-value--${valueTone}`].filter(Boolean).join(" ")}>
          {value}
        </span>
      </div>
      <div
        className="g-track"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-valuetext={value}
      >
        <div className={`g-fill g-fill--${tone}`} style={{ "--p": pct / 100 } as CSSProperties} />
      </div>
      {caption ? <div className="g-caption">{caption}</div> : null}
    </div>
  );
}

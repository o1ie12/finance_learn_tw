import s from "./ui.module.css";

/**
 * 06 E7.2, the signature: the yellow tactile strip fills with progress. A
 * full-width fill clipped with clip-path, so the dashes never stretch and
 * nothing re-lays out.
 */
export function Rail({ step, total, label }: { step: number; total: number; label?: string }) {
  const pct = total > 0 ? Math.min(Math.max(step / total, 0), 1) * 100 : 0;
  return (
    <div
      className={s.rail}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={step}
      aria-label={label ?? `第 ${step} 步，共 ${total} 步`}
    >
      <div className={s.railFill} style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }} />
    </div>
  );
}

/** One row of the dashboard's per-line progress list: name, a colored fill
 * bar, and the fraction — each line in its own wayfinding color so the
 * dashboard reads as one system with the transit map above it. */
export default function ProgressBar({
  name,
  done,
  total,
  color,
}: {
  name: string;
  done: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-sm font-medium sm:w-20">{name}</span>
      <div
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-hairline"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${name}：已完成 ${done}/${total} 站`}
      >
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="money w-10 shrink-0 text-right text-xs text-ink-faint">
        {done}/{total}
      </span>
    </div>
  );
}

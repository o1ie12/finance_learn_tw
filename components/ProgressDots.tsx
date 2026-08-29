/** Line-colored dot pattern (●●●○○) for compact per-line progress, e.g. on
 * /lines catalog cards. Decorative — pair with a visible text fraction
 * nearby for the actual numbers; screen readers get that text instead. */
export default function ProgressDots({
  done,
  total,
  color,
  size = 7,
}: {
  done: number;
  total: number;
  color: string;
  size?: number;
}) {
  if (total <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="shrink-0 rounded-full"
          style={{
            width: size,
            height: size,
            background: i < done ? color : "var(--color-hairline)",
          }}
        />
      ))}
    </span>
  );
}

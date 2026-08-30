/** Line-colored dot pattern (●●●○○) for compact per-line progress, e.g. on
 * /lines catalog cards. Decorative — pair with a visible text fraction
 * nearby for the actual numbers; screen readers get that text instead. */
export default function ProgressDots({
  done,
  total,
  color,
  size = 8,
}: {
  done: number;
  total: number;
  color: string;
  size?: number;
}) {
  if (total <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < done;
        return (
          <span
            key={i}
            className="shrink-0 rounded-full"
            style={
              filled
                ? { width: size, height: size, background: color }
                : {
                    width: size,
                    height: size,
                    background: "#E4E6E8",
                    border: "1px solid #C7CCD1",
                    boxSizing: "border-box",
                  }
            }
          />
        );
      })}
    </span>
  );
}

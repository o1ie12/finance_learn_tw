/**
 * A minimal inline-SVG sparkline — deliberately hand-rolled rather than
 * pulling in a charting library for one line chart, matching this
 * codebase's existing pattern of custom SVG over generic chart defaults.
 * Plots against array index (simulated day index), never real dates —
 * the caller is responsible for not passing anything date-labeled.
 */
export default function Sparkline({
  points,
  color,
  light = false,
  height = 48,
}: {
  points: number[];
  color: string;
  light?: boolean; // true when rendered on a dark background
  height?: number;
}) {
  if (points.length < 2) {
    return <div style={{ height }} className="flex items-center text-xs text-ink-faint">還沒有足夠的資料</div>;
  }

  const width = 280;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return [x, y] as const;
  });

  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lastX, lastY] = coords[coords.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" opacity={light ? 0.9 : 1} />
      <circle cx={lastX} cy={lastY} r={3} fill={color} />
    </svg>
  );
}

/**
 * Right-rail progress-through-station indicator (UI/UX overhaul spec
 * section 5). Positional within the line — "you're on station X of Y" —
 * not completion-aware, so this stays on a statically generated page with
 * no per-student data fetch.
 */
export default function StationRail({
  lineName,
  color,
  colorInk,
  index,
  total,
}: {
  lineName: string;
  color: string;
  colorInk: string;
  index: number; // 0-based
  total: number;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: colorInk }}>
        {lineName}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink-soft">
        第 {index + 1} 站，共 {total} 站
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="h-2 w-2 shrink-0 rounded-full"
            style={
              i <= index
                ? { background: color }
                : { background: "#E4E6E8", border: "1px solid #C7CCD1" }
            }
          />
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import type { RouteStation } from "@/components/RouteMap";
import type { LineMeta } from "@/lib/lines";

/**
 * One line rendered as a compact horizontal track (for the dashboard's
 * multi-line map). Stations are dots on the line's colored track; the whole
 * row links to the line's detail page.
 */

function Dot({
  station,
  color,
}: {
  station: RouteStation;
  color: string;
}) {
  const size = station.terminal ? 18 : 14;
  if (station.status === "done") {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full"
        style={{ width: size, height: size, background: color }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width="9" height="9" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (station.status === "current") {
    return (
      <span
        className="shrink-0 rounded-full"
        style={{
          width: size,
          height: size,
          background: "#fff",
          boxShadow: `0 0 0 3px ${color}`,
        }}
        aria-hidden="true"
      />
    );
  }
  return (
    <span
      className="shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: "var(--color-bg)",
        boxShadow: "0 0 0 2px var(--color-hairline)",
      }}
      aria-hidden="true"
    />
  );
}

export default function LineTrack({
  line,
  stations,
  progressLabel,
}: {
  line: LineMeta;
  stations: RouteStation[];
  progressLabel: string;
}) {
  return (
    <Link
      href={`/line/${line.slug}`}
      className="block rounded-2xl border border-hairline bg-surface p-4 transition-colors hover:border-ink/30 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-3.5 w-3.5 rounded-sm"
            style={{ background: line.color }}
            aria-hidden="true"
          />
          <span className="font-bold">{line.name}</span>
        </div>
        <span className="text-xs text-ink-faint">{progressLabel}</span>
      </div>

      <div className="mt-3 flex items-center" aria-hidden="true">
        {stations.map((s, i) => (
          <div key={s.key} className="flex flex-1 items-center last:flex-none">
            <Dot station={s} color={line.color} />
            {i < stations.length - 1 && (
              <span
                className="h-1 flex-1 rounded"
                style={{
                  background:
                    stations[i + 1].status === "todo"
                      ? "var(--color-hairline)"
                      : line.color,
                  opacity: stations[i + 1].status === "todo" ? 1 : 0.9,
                }}
              />
            )}
          </div>
        ))}
      </div>

      <p className="mt-2.5 text-sm leading-snug text-ink-soft">{line.short}</p>
    </Link>
  );
}

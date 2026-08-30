import Link from "next/link";

export interface RouteStation {
  key: string;
  label: string; // station name
  title: string; // topic / sub label
  color: string; // Metro line color (dot + segment)
  colorInk?: string; // AA-safe variant for the label text (falls back to color)
  href?: string;
  status: "done" | "current" | "todo";
  meta?: string; // e.g. quiz score "3 / 3"
  terminal?: boolean; // the simulation terminal station
}

function Dot({ station }: { station: RouteStation }) {
  const { status, color, terminal } = station;
  const size = terminal ? 28 : 22;
  const base =
    "relative z-10 flex items-center justify-center rounded-full transition-colors";

  if (status === "done") {
    return (
      <span
        className={base}
        style={{ width: size, height: size, background: color }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (status === "current") {
    return (
      <span
        className={base}
        style={{
          width: size,
          height: size,
          background: "#fff",
          boxShadow: `0 0 0 4px ${color}`,
        }}
        aria-hidden="true"
      />
    );
  }
  // status === "todo" — a station not yet started
  return (
    <span
      className={base}
      style={{
        width: size,
        height: size,
        background: "var(--color-bg)",
        boxShadow: `0 0 0 3px var(--color-hairline)`,
      }}
      aria-hidden="true"
    />
  );
}

const STATUS_TEXT: Record<RouteStation["status"], string> = {
  done: "已完成",
  current: "進行中",
  todo: "尚未開始",
};

export default function RouteMap({
  stations,
  className = "",
}: {
  stations: RouteStation[];
  className?: string;
}) {
  return (
    <ol className={className} role="list">
      {stations.map((s, i) => {
        const isLast = i === stations.length - 1;
        const segmentColor =
          s.status === "todo" ? "var(--color-hairline)" : s.color;
        const RowInner = (
          <>
            <div className="relative flex w-8 flex-col items-center self-stretch">
              <Dot station={s} />
              {!isLast && (
                <span
                  className="w-1 flex-1"
                  style={{
                    background: segmentColor,
                    opacity: s.status === "todo" ? 1 : 0.9,
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className={isLast ? "pb-1 pt-0.5" : "pb-8 pt-0.5"}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span
                  className="font-display text-sm font-bold"
                  style={{
                    color:
                      s.status === "todo"
                        ? undefined
                        : (s.colorInk ?? s.color),
                  }}
                >
                  {s.label}
                </span>
                {s.terminal && (
                  <span className="rounded-full border border-hairline px-2 py-0.5 text-[11px] font-medium text-ink-soft">
                    終點站
                  </span>
                )}
                <span className="text-[11px] text-ink-faint">
                  {STATUS_TEXT[s.status]}
                  {s.meta ? ` · ${s.meta}` : ""}
                </span>
              </div>
              <p className="mt-0.5 text-[15px] font-medium leading-snug">
                {s.title}
              </p>
            </div>
          </>
        );

        return (
          <li key={s.key}>
            {s.href ? (
              <Link
                href={s.href}
                className="flex gap-4 rounded-lg outline-offset-4 hover:opacity-90"
              >
                {RowInner}
              </Link>
            ) : (
              <div className="flex gap-4">{RowInner}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

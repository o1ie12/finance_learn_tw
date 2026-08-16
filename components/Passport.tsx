import { LINES } from "@/lib/lines";
import { outcomeTitleFor } from "@/lib/outcomeTitle";
import type { SimulationRun } from "@/lib/types";

/** Small original "tap" glyph — an NFC/contactless read icon, not any real
 * transit card's mark. */
function TapIcon() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
      <circle cx="16" cy="19" r="3.2" fill="#fff" />
      <path
        d="M22 15c2 2 2 6 0 8"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <path
        d="M26 11c4 4 4 10 0 14"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
}

function StampIcon({ stampId }: { stampId: string }) {
  // Small original glyph per stamp family, not tied to any real brand.
  switch (stampId) {
    case "planner":
    case "steady-saver":
    case "saver":
    case "roommate":
    case "homebody":
      return (
        <path
          d="M-5,0.5 L-1.5,4 L5.5,-4.5"
          stroke="currentColor"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case "spender":
    case "impulse-buyer":
    case "enjoyer":
      return <circle r="3.4" fill="currentColor" />;
    case "independent":
      return <rect x="-3.5" y="-3.5" width="7" height="7" rx="1.5" fill="currentColor" />;
    case "risk-taker":
      return <path d="M-4,3.5 L0,-4.5 L4,3.5 Z" fill="currentColor" />;
    case "balancer":
      return (
        <>
          <circle cx="-3" cy="0" r="2.6" fill="currentColor" />
          <circle cx="3" cy="0" r="2.6" fill="currentColor" />
        </>
      );
    default:
      return <circle r="3" fill="currentColor" />;
  }
}

export interface PassportStamp {
  lineSlug: string;
  lineName: string;
  color: string;
  colorInk: string;
  earned: boolean;
  stampId?: string;
  title?: string;
  enTitle?: string;
}

export function buildStamps(
  runsByLine: Record<string, SimulationRun>,
): PassportStamp[] {
  return LINES.map((line) => {
    const run = runsByLine[line.slug];
    const outcome = run ? outcomeTitleFor(run) : null;
    return {
      lineSlug: line.slug,
      lineName: line.name,
      color: line.color,
      colorInk: line.colorInk,
      earned: Boolean(outcome),
      stampId: outcome?.id,
      title: outcome?.title,
      enTitle: outcome?.enTitle,
    };
  });
}

export default function Passport({
  studentName,
  pointsTotal,
  stamps,
}: {
  studentName: string;
  pointsTotal: number;
  stamps: PassportStamp[];
}) {
  const earnedCount = stamps.filter((s) => s.earned).length;

  return (
    <div className="space-y-5">
      {/* The card face — EasyCard/悠遊卡-style proportions, entirely original design */}
      <div
        className="relative aspect-[85.6/54] w-full max-w-sm overflow-hidden rounded-2xl p-5 text-white shadow-lg sm:p-6"
        style={{
          background:
            "linear-gradient(135deg, #151a21 0%, #1c2430 55%, #0f2a45 100%)",
        }}
      >
        {/* window-motif texture, static and very subtle — a card face, not a scene */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
          aria-hidden="true"
        >
          <defs>
            <pattern id="passport-windows" width="34" height="34" patternUnits="userSpaceOnUse">
              <rect x="4" y="6" width="20" height="12" rx="4" fill="#fff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#passport-windows)" />
        </svg>

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
                起點護照
              </p>
              <p className="font-display text-lg font-bold">{studentName}</p>
            </div>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <TapIcon />
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/55">
                累積點數
              </p>
              <p className="money text-3xl font-bold tabular-nums">
                {pointsTotal}
              </p>
            </div>
            <p className="money text-xs text-white/55">
              {earnedCount}/{stamps.length} 站戳章
            </p>
          </div>
        </div>
      </div>

      {/* Stamps — one per line's terminal simulation, ticket-punch styling */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stamps.map((s) => (
          <div
            key={s.lineSlug}
            className="flex flex-col items-center gap-2 rounded-2xl border border-hairline bg-surface p-4 text-center"
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                border: s.earned
                  ? `2.5px dashed ${s.color}`
                  : "2.5px dashed var(--color-hairline)",
                color: s.earned ? s.colorInk : "var(--color-ink-faint)",
                background: s.earned
                  ? `color-mix(in srgb, ${s.color} 10%, white)`
                  : "transparent",
              }}
              aria-hidden="true"
            >
              <svg viewBox="-10 -10 20 20" width="26" height="26">
                {s.earned ? (
                  <StampIcon stampId={s.stampId ?? "default"} />
                ) : (
                  <circle r="1.6" fill="currentColor" opacity="0.5" />
                )}
              </svg>
            </span>
            <div>
              <p className="text-[11px] font-medium text-ink-faint">{s.lineName}</p>
              {s.earned ? (
                <>
                  <p className="text-sm font-bold" style={{ color: s.colorInk }}>
                    {s.title}
                  </p>
                  <p className="font-display text-[10px] uppercase tracking-wide text-ink-faint">
                    {s.enTitle}
                  </p>
                </>
              ) : (
                <p className="mt-0.5 text-xs text-ink-faint">尚未搭乘</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

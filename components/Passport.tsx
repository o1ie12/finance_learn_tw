import type { CSSProperties } from "react";
import { LINES } from "@/lib/lines";
import { FloatCard } from "@/components/game/FloatCard";
import "@/components/linePage/linePage.css";
import { outcomeTitleFor } from "@/lib/outcomeTitle";
import type { SimulationRun } from "@/lib/types";

/** Small original "tap" glyph (an NFC/contactless read icon), not any real
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
    <>
      {/* The card face: transit-card proportions, entirely original design */}
      <div className="lp-pass-face ga-card-in" style={{ "--ga-i": 1 } as CSSProperties}>
        {/* window-motif texture, static and very subtle: a card face, not a scene */}
        <svg className="lp-pass-texture" aria-hidden="true">
          <defs>
            <pattern id="passport-windows" width="34" height="34" patternUnits="userSpaceOnUse">
              <rect x="4" y="6" width="20" height="12" rx="4" fill="#fff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#passport-windows)" />
        </svg>

        <div className="lp-pass-inner">
          <div className="lp-pass-row">
            <div>
              <p className="lp-pass-kicker">錢途護照</p>
              <p className="lp-pass-name">{studentName}</p>
            </div>
            <span className="lp-pass-tap">
              <TapIcon />
            </span>
          </div>

          <div className="lp-pass-row lp-pass-row--end">
            <div>
              <p className="lp-pass-kicker">累積點數</p>
              <p className="lp-pass-points">{pointsTotal.toLocaleString("en-US")}</p>
            </div>
            <p className="lp-pass-count">
              {earnedCount}/{stamps.length} 站戳章
            </p>
          </div>
        </div>
      </div>

      {/* Stamps: one per line's terminal simulation, ticket-punch styling */}
      <FloatCard title="紀念戳章" aside={`${earnedCount} / ${stamps.length}`} index={2}>
        <ul className="lp-stamps">
          {stamps.map((s) => (
            <li
              key={s.lineSlug}
              className={`lp-stamp${s.earned ? " lp-stamp--earned" : ""}`}
              style={{ "--line-color": s.color, "--line-ink": s.colorInk } as CSSProperties}
            >
              <span className="lp-stamp-seal" aria-hidden="true">
                <svg viewBox="-10 -10 20 20" width="26" height="26">
                  {s.earned ? (
                    <StampIcon stampId={s.stampId ?? "default"} />
                  ) : (
                    <circle r="1.6" fill="currentColor" opacity="0.5" />
                  )}
                </svg>
              </span>
              <p className="lp-stamp-line">{s.lineName}</p>
              {s.earned ? (
                <>
                  <p className="lp-stamp-title">{s.title}</p>
                  <p className="lp-stamp-en" lang="en">
                    {s.enTitle}
                  </p>
                </>
              ) : (
                <p className="lp-stamp-line">尚未搭乘</p>
              )}
            </li>
          ))}
        </ul>
      </FloatCard>
    </>
  );
}

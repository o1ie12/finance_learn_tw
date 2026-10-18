import type { CSSProperties } from "react";
import type { LineMeta } from "@/lib/lines";

export interface StationSignProps {
  /** The line this station is on. Its `color` paints the side bars. */
  line: Pick<LineMeta, "color" | "enName">;
  /** Station name, e.g. 帳單站. */
  station: string;
  /** 1-based station number on the line. Renders "· STATION n". */
  stationNumber?: number;
  /** Overrides the whole English line, e.g. "CREDIT LINE · TERMINAL". */
  code?: string;
  /** Element for the station name. Default "h2". */
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
}

/** Metro station sign: ink box, 12px line-color bars both sides (01 §5). */
export function StationSign({
  line,
  station,
  stationNumber,
  code,
  as: Name = "h2",
  className,
}: StationSignProps) {
  const english =
    code ??
    [line.enName.toUpperCase(), stationNumber != null ? `STATION ${stationNumber}` : null]
      .filter(Boolean)
      .join(" · ");
  return (
    <div
      className={["g-sign", className].filter(Boolean).join(" ")}
      style={{ "--line-color": line.color } as CSSProperties}
    >
      <span className="g-sign-bar" aria-hidden="true" />
      <div className="g-sign-body">
        <Name className="g-sign-name">{station}</Name>
        <span className="g-sign-en" lang="en">
          {english}
        </span>
      </div>
      <span className="g-sign-bar" aria-hidden="true" />
    </div>
  );
}

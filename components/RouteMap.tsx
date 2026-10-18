import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/game/icons";
import "@/components/linePage/linePage.css";

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
  /** False for a station shown but not required in this mode (選讀). */
  required?: boolean;
}

/**
 * How a stop is drawn (01 §6.6). Derived from the station data, never
 * stored: "next" is the first required stop after the current one, and a
 * stop with nowhere to go (a simulation not built yet) is "locked".
 */
type StopState = "done" | "current" | "next" | "todo" | "locked";

const STATE_TEXT: Record<StopState, string> = {
  done: "已完成",
  current: "目前這站",
  next: "下一站",
  todo: "尚未開始",
  locked: "未開放",
};

function stopStates(stations: RouteStation[]): StopState[] {
  const currentAt = stations.findIndex((s) => s.status === "current");
  let nextAssigned = false;
  return stations.map((s, i) => {
    if (s.status === "done") return "done";
    if (s.status === "current") return "current";
    if (!s.href) return "locked";
    if (currentAt >= 0 && i > currentAt && !nextAssigned && s.required !== false) {
      nextAssigned = true;
      return "next";
    }
    return "todo";
  });
}

/** One line's stations as a vertical route: dots on a line-color track. */
export default function RouteMap({
  stations,
  className = "",
}: {
  stations: RouteStation[];
  className?: string;
}) {
  const states = stopStates(stations);
  return (
    <ol className={["lp-route", className].filter(Boolean).join(" ")}>
      {stations.map((s, i) => {
        const state = states[i];
        const isLast = i === stations.length - 1;
        const style = {
          "--line-color": s.color,
          "--line-ink": s.colorInk ?? s.color,
        } as CSSProperties;
        const inner = (
          <>
            <span className="lp-rail" aria-hidden="true">
              <span className="lp-dot">
                {state === "done" ? <Icon name="check" size={13} strokeWidth={3} /> : null}
                {state === "locked" ? <Icon name="lock" size={12} /> : null}
              </span>
              {!isLast ? (
                <span className={`lp-seg${state === "done" ? " lp-seg--on" : ""}`} />
              ) : null}
            </span>
            <span className="lp-stop-body">
              <span className="lp-stop-head">
                <span className="lp-stop-name">{s.label}</span>
                {s.terminal ? <span className="lp-tag">終點站</span> : null}
                {state === "current" ? (
                  <span className="lp-tag lp-tag--now">{STATE_TEXT.current}</span>
                ) : (
                  <span className="lp-stop-status">{STATE_TEXT[state]}</span>
                )}
                {s.meta ? <span className="lp-stop-status">{s.meta}</span> : null}
              </span>
              <span className="lp-stop-title">{s.title}</span>
            </span>
          </>
        );

        return (
          <li
            key={s.key}
            className={`lp-stop lp-stop--${state}${s.terminal ? " lp-stop--terminal" : ""}`}
            style={style}
          >
            {s.href ? (
              <Link
                href={s.href}
                className="lp-stop-row"
                aria-current={state === "current" ? "step" : undefined}
              >
                {inner}
              </Link>
            ) : (
              <div className="lp-stop-row">{inner}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

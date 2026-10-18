import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./icons";
import { SettingsMenu } from "./SettingsMenu";

export interface GameTopBarProps {
  /** Where the Finline wordmark links (the student's home). */
  homeHref: string;
  /** Streak length. The "連續 N 天" pill is hidden when undefined or 0. */
  streakDays?: number;
  /** Small note beside the wordmark, e.g. 範例資料. */
  note?: string;
  /** Settings panel rows (links or buttons). The settings button is hidden when there are none. */
  children?: ReactNode;
  className?: string;
}

/** Top bar of every game-shell screen (01 §6): wordmark pill left, streak pill and settings right. */
export function GameTopBar({ homeHref, streakDays, note, children, className }: GameTopBarProps) {
  return (
    <header className={["g-topbar", className].filter(Boolean).join(" ")}>
      <Link href={homeHref} className="g-pill">
        <span className="g-wordmark" lang="en">
          Finline
        </span>
        {note ? <span className="g-wordmark-note">{note}</span> : null}
        <span className="sr-only">回到首頁</span>
      </Link>
      <div className="g-topbar-right">
        {streakDays ? (
          <span className="g-pill">
            <Icon name="flame" size={16} className="g-flame" />
            <span className="g-num">連續 {streakDays} 天</span>
          </span>
        ) : null}
        {children ? <SettingsMenu>{children}</SettingsMenu> : null}
      </div>
    </header>
  );
}

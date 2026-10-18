import type { ReactNode } from "react";
import { StationScene } from "@/components/game/StationScene";
import s from "./classLife.module.css";

/**
 * The game look (station behind floating cards) for the class pages, which
 * live in the public site layout. The page imports app/(game)/game.css; every
 * rule there is scoped under .game-shell, so nothing else on the page changes.
 */
export function ClassLifeShell({ children }: { children: ReactNode }) {
  return (
    <div className="game-shell">
      <StationScene />
      <div className={s.frame}>{children}</div>
    </div>
  );
}

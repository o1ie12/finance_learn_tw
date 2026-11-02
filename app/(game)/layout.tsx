import type { Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import FontLink from "@/components/FontLink";
import { LowEndFlag } from "@/components/shell/LowEndFlag";
import { TabFrame } from "@/components/ui/TabFrame";
import { THEME_COLOR } from "@/lib/design/themeColor";
import "./game.css";
import shell from "../(app)/shell.module.css";
import s from "./gameShell.module.css";

// Same fonts as the app shell: Inter for Latin and numbers, Noto Sans TC
// (runtime, unicode-range) for Chinese. The older Huninn and Taipei Sans are gone.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap", adjustFontFallback: true });
const barlow = Barlow_Condensed({ variable: "--font-barlow", subsets: ["latin"], weight: ["600"], display: "swap" });
const VOICE_HREF = "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap";

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: THEME_COLOR,
};

/**
 * The older pages (護照, 工具箱, 證書, 複習, 前後測, 支線, the line simulations,
 * the article reader, the goal step) in the same shell as everything else
 * (2026-11-02): the glass sidebar on desktop, the tab bar on a phone, paper
 * ground, one scrolling column. Their own components keep their g-* classes,
 * which game.css now draws on the new tokens.
 */
export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`fl-shell game-shell ${shell.shell} ${inter.variable} ${barlow.variable}`}>
      <FontLink href={VOICE_HREF} />
      <LowEndFlag />
      <TabFrame>
        <main id="content" className={`g-main ${s.main}`}>
          <div className={s.inner}>{children}</div>
        </main>
      </TabFrame>
    </div>
  );
}

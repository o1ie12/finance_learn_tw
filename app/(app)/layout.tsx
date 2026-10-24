import type { Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import FontLink from "@/components/FontLink";
import { THEME_COLOR } from "@/lib/design/themeColor";
import { LowEndFlag } from "@/components/shell/LowEndFlag";
import s from "./shell.module.css";

/**
 * The Part E shell (06 E6): the four tab screens and, later, every screen
 * after login. Plain paper ground, no older top bar or scene: each screen
 * draws its own bar and world. Fonts as in E4.1 (CJK faces load at runtime,
 * nothing CJK preloaded).
 */
// Inter is a variable font: one file covers 400 to 700.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap", adjustFontFallback: true });
const barlow = Barlow_Condensed({ variable: "--font-barlow", subsets: ["latin"], weight: ["600"], display: "swap" });
// The voice face (questions, headings): Noto Sans TC, loaded at runtime in unicode-range slices.
const VOICE_HREF = "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap";

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: THEME_COLOR,
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`fl-shell ${s.shell} ${inter.variable} ${barlow.variable}`}>
      <FontLink href={VOICE_HREF} />
      <LowEndFlag />
      {children}
    </div>
  );
}

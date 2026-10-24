import type { Viewport } from "next";
import Link from "next/link";
import { Barlow_Condensed, Inter } from "next/font/google";
import FontLink from "@/components/FontLink";
import "./game.css";
import { GameTopBar } from "@/components/game/GameTopBar";
import { StationScene } from "@/components/game/StationScene";
import ModeToggle from "@/components/ModeToggle";
import SignOutButton from "@/components/SignOutButton";
import AccessCodeReveal from "@/components/AccessCodeReveal";
import TourMenuButton from "@/components/shell/TourMenuButton";
import { getCurrentStudent } from "@/lib/session";
import { getDailyActivity } from "@/lib/db";
import { homeFor } from "@/lib/modeModel";
import { streakFrom, taipeiDay } from "@/lib/streak";
import type { Student } from "@/lib/types";

// Fonts (06 E4.1). Inter for Latin and numbers, Barlow Condensed for the
// station sign's English line. The two CJK faces (Noto Sans TC from the root
// layout, Huninn below) load at runtime from Google's unicode-range CSS, like
// the root layout already does for LCP: nothing CJK is preloaded or inlined.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
});
const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});
// Huninn ships one weight; never ask it for bold (06 E4.1).
const HUNINN_HREF = "https://fonts.googleapis.com/css2?family=Huninn&display=swap";

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e141b" },
  ],
};

/**
 * The game shell (01 §6): every page after login. One lit platform behind
 * every screen, cards floating over it, no site header and no footer. The
 * top bar carries the wordmark (home), the streak, and a settings menu with
 * the mode toggle, the tour, the access code and sign-out — the things the
 * site header used to hold.
 */
export default async function GameLayout({ children }: { children: React.ReactNode }) {
  let student: Student | null = null;
  let streak = 0;
  try {
    student = await getCurrentStudent();
    if (student) {
      const today = taipeiDay(new Date());
      const since = taipeiDay(new Date(Date.now() - 400 * 86_400_000));
      const days = await getDailyActivity(student.id, since);
      streak = streakFrom(days.filter((d) => d.actions > 0).map((d) => d.day), today);
    }
  } catch {
    // Backend not configured: the pages themselves explain that.
  }

  return (
    <div className={`game-shell ${inter.variable} ${barlow.variable}`}>
      <FontLink href={HUNINN_HREF} />
      <StationScene />
      <div className="g-shell-frame">
        <GameTopBar homeHref={homeFor(student?.mode ?? null)} streakDays={streak}>
          {student ? (
            <>
              <div className="g-menu-block">
                <ModeToggle signedIn placement="page" />
              </div>
              <TourMenuButton />
              <Link href="/passport">我的護照</Link>
              <Link href="/tools">我的工具</Link>
              <Link href="/play">人生遊戲</Link>
              <Link href="/onboarding/character">修改角色</Link>
              {student.access_code ? (
                <div className="g-menu-block">
                  <span className="g-menu-label">我的存取碼</span>
                  <AccessCodeReveal code={student.access_code} />
                </div>
              ) : null}
              <div className="g-menu-block">
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <Link href="/signup">建立帳號</Link>
              <Link href="/">回到首頁</Link>
            </>
          )}
        </GameTopBar>
        <main id="content" className="g-main">
          {children}
        </main>
      </div>
    </div>
  );
}

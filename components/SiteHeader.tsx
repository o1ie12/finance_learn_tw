"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ModeToggle from "@/components/ModeToggle";
import { FLOW_V2 } from "@/lib/flags";
import { hasSessionCookie, readHomeHref } from "@/lib/clientCookies";
import HelpButton from "@/components/tour/HelpButton";

// 06 G0: with the one-mode flow the header is brand, 路線圖, help, 我的進度
// (關於我們 is in the footer; class mode is on hold and keeps its own URL).
const NAV: Array<{ href: string; label: string; wide?: boolean }> = FLOW_V2
  ? [{ href: "/lines", label: "路線圖" }]
  : [
      { href: "/lines", label: "路線圖" },
      { href: "/class", label: "給老師", wide: true },
      { href: "/about", label: "關於我們", wide: true },
    ];

export default function SiteHeader() {
  const pathname = usePathname();

  // Deliberately state+effect, not read-during-render: this attribute
  // legitimately differs between the server render (always "/", no cookie
  // access) and a signed-in client ("/dashboard") — exactly the case
  // suppressHydrationWarning exists for. But suppressHydrationWarning only
  // silences React's mismatch *warning*; it doesn't reliably force the DOM
  // attribute itself to update to the client-computed value, so the link
  // was found to stay stuck at the server's "/" for signed-in visitors even
  // though hasSessionCookie() was computing correctly. Starting both server
  // and client renders at the same "/" and correcting it in an effect after
  // mount sidesteps the mismatch entirely instead of relying on hydration
  // reconciliation for it.
  const [logoHref, setLogoHref] = useState("/");
  const [signedIn, setSignedIn] = useState(false);
  // Correcting browser-only state (a cookie) after mount, not mirroring a
  // prop/state change — the case react-hooks/set-state-in-effect doesn't
  // distinguish from the anti-pattern it's meant to catch.
  useEffect(() => {
    if (!hasSessionCookie()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSignedIn(true);
    // Home goes to whichever destination matches the student's stored mode,
    // which is what "returning to the app lands them in the right place"
    // actually means in practice.
    setLogoHref(readHomeHref());
    // Re-read on navigation, not just on mount. The header persists across
    // client-side routing, so a mount-only effect leaves the logo pointing at
    // whatever the mode was when the tab opened — switching to 模擬 and then
    // clicking home would send the student back to 學習.
  }, [pathname]);

  const pill = "flex h-11 items-center rounded-full px-3.5 text-[15px] transition-colors";
  return (
    <>
      <div className="flex h-1.5" aria-hidden="true" style={{ background: "var(--stripe)" }} />
      <header
        className="sticky top-3 z-40 mx-auto mt-3 flex h-16 w-[calc(100%-32px)] max-w-[1200px] items-center gap-2 rounded-full pl-5 pr-2.5 sm:top-4 sm:mt-4 sm:w-[calc(100%-48px)] sm:gap-5"
        style={{
          background: "var(--glass)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          border: "1px solid var(--glass-edge)",
          boxShadow: "var(--glass-shadow)",
        }}
      >
        <Link href={logoHref} className="flex shrink-0 items-baseline gap-2.5 rounded-md">
          <span className="text-[22px] font-black tracking-[0.04em]">錢途</span>
          <span className="hidden text-[11px] font-bold tracking-[0.22em] text-ink-soft sm:inline">FINLINE</span>
        </Link>
        <nav aria-label="主要導覽" className="min-w-0">
          <ul className="flex items-center gap-0.5">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href} className={item.wide ? "hidden md:block" : undefined}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`${pill} font-medium ${active ? "bg-black/[.06] text-ink" : "text-ink hover:bg-black/5"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <span className="flex-1" />
        {FLOW_V2 ? null : <ModeToggle signedIn={signedIn} />}
        <HelpButton signedIn={signedIn} />
        {signedIn ? (
          <Link href={logoHref} className={`${pill} bg-ink px-5 font-bold text-white`}>
            我的進度
          </Link>
        ) : (
          <>
            <Link href="/signup#login" className={`${pill} hidden font-semibold text-ink hover:bg-black/5 sm:flex`}>
              用代碼登入
            </Link>
            <Link href="/signup" className={`${pill} bg-ink px-5 font-bold text-white`}>
              上車
            </Link>
          </>
        )}
      </header>
    </>
  );
}

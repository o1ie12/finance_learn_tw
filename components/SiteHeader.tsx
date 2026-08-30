"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/lines", label: "路線" },
  { href: "/dashboard", label: "我的進度" },
];

// Mirrors lib/session.ts's HAS_SESSION_COOKIE — a non-httpOnly marker set
// alongside the real (httpOnly) session cookie, so the logo link can be
// correct without a fetch or forcing every page into dynamic rendering.
const HAS_SESSION_COOKIE = "fs_signed_in";

function hasSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((c) => c === `${HAS_SESSION_COOKIE}=1`);
}

function BrandMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="26"
      height="26"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="32" height="32" rx="7" fill="#151a21" />
      <line
        x1="16"
        y1="4"
        x2="16"
        y2="28"
        stroke="#0070bd"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle
        cx="16"
        cy="16"
        r="6.5"
        fill="#151a21"
        stroke="#ffffff"
        strokeWidth="3.2"
      />
    </svg>
  );
}

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
  // Correcting browser-only state (a cookie) after mount, not mirroring a
  // prop/state change — the case react-hooks/set-state-in-effect doesn't
  // distinguish from the anti-pattern it's meant to catch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hasSessionCookie()) setLogoHref("/dashboard");
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href={logoHref}
          className="flex items-center gap-2 rounded-md font-display text-lg font-bold tracking-tight"
        >
          <BrandMark />
          <span>起點</span>
        </Link>
        <nav aria-label="主要導覽">
          <ul className="flex items-center gap-1 sm:gap-2">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md px-2.5 py-2 text-sm font-medium transition-colors sm:px-3 ${
                      active
                        ? "bg-ink text-white"
                        : "text-ink-soft hover:bg-black/5 hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

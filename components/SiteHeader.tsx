"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/course", label: "課程" },
  { href: "/simulation", label: "模擬" },
  { href: "/dashboard", label: "我的進度" },
];

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

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-display text-lg font-bold tracking-tight"
        >
          <BrandMark />
          <span>起薪線</span>
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

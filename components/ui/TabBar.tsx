"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";
import s from "./ui.module.css";

/** 06 E6.1: four tabs, single-word labels; they navigate, never act. */
export const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/today", label: "今天", icon: "today" },
  { href: "/status", label: "狀態", icon: "me" },
  { href: "/map", label: "路線", icon: "map" },
  { href: "/moves", label: "行動", icon: "bolt" },
];

/**
 * 06 E7.13. Always-filled icons; the active tab is shown by ink color, weight
 * 700 and aria-current together. No badges in v1. A left rail on Regular.
 */
export function TabBar() {
  const path = usePathname();
  return (
    <nav className={s.tabbar} aria-label="主要分頁">
      {TABS.map((t) => {
        const on = path === t.href || path.startsWith(`${t.href}/`);
        return (
          <Link key={t.href} href={t.href} className={s.tab} aria-current={on ? "page" : undefined}>
            <Icon name={t.icon} size={24} filled />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

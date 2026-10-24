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
 * 06 E7.13, restyled 2026-10-24: a floating Liquid Glass pill on a phone, a
 * glass sidebar with the 錢途 brand on Regular. The active tab is shown by a
 * white ground, ink color, weight 700 and aria-current together. No badges.
 */
export function TabBar() {
  const path = usePathname();
  return (
    <nav className={s.tabbar} aria-label="主要分頁">
      {/* Desktop only: the brand at the top of the sidebar. */}
      <Link href="/today" className={s.tabBrand}>
        <span className={s.tabBrandName}>錢途</span>
        <span className={s.tabBrandEn}>FINLINE</span>
      </Link>
      {TABS.map((t) => {
        // a course page belongs to 路線
        const on = path === t.href || path.startsWith(`${t.href}/`) || (t.href === "/map" && path.startsWith("/line/"));
        return (
          <Link key={t.href} href={t.href} className={s.tab} aria-current={on ? "page" : undefined}>
            <Icon name={t.icon} size={24} filled />
            <span>{t.label}</span>
          </Link>
        );
      })}
      <Link href="/settings" className={`${s.tab} ${s.tabSettings}`} aria-current={path.startsWith("/settings") ? "page" : undefined}>
        <Icon name="me" size={24} filled />
        <span>設定</span>
      </Link>
    </nav>
  );
}

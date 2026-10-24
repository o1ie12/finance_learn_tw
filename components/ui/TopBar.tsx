import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";
import s from "./ui.module.css";

/** A 44×44 icon button: a link or a button, always with a label (E5, E7.1). */
export function IconButton({
  icon,
  label,
  href,
  onClick,
}: {
  icon: IconName;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  if (href) {
    return (
      <Link href={href} className={s.iconbtn} aria-label={label}>
        <Icon name={icon} size={22} />
      </Link>
    );
  }
  return (
    <button type="button" className={s.iconbtn} aria-label={label} onClick={onClick}>
      <Icon name={icon} size={22} />
    </button>
  );
}

/**
 * 06 E7.1. Material over a scene, flat on plain paper. ‹ 返回 left, the title
 * and subtitle centered, ✕ 關閉 right. The title is the screen's h1, so focus
 * can move to it on every screen change (E14.5).
 */
export function TopBar({
  title,
  subtitle,
  flat = false,
  back,
  close,
}: {
  title: string;
  subtitle?: string;
  flat?: boolean;
  back?: { href?: string; onClick?: () => void };
  close?: { href?: string; onClick?: () => void };
}) {
  return (
    <header className={`${s.bar} ${flat ? s.barFlat : ""}`}>
      {back ? <IconButton icon="back" label="返回" {...back} /> : <span />}
      <div className={s.barTitle}>
        <h1 tabIndex={-1} data-screen-heading>
          {title}
        </h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {close ? <IconButton icon="close" label="關閉" {...close} /> : <span />}
    </header>
  );
}

/** 今天's bar: two pills instead of a title (E7.1, E8.1). */
export function PillBar({ month, streak }: { month: number; streak: number }) {
  return (
    <header className={s.bar}>
      <div className={s.barPills} style={{ gridColumn: "1 / -1" }}>
        <span className={s.pill}>第 {month} 個月</span>
        <span className={s.pill}>
          <Icon name="flame" size={16} filled className={s.flame} />
          連續 {streak} 天
        </span>
      </div>
    </header>
  );
}

export function BarSlot({ children }: { children: ReactNode }) {
  return <div className={s.barPills}>{children}</div>;
}

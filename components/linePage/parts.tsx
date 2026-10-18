import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Icon } from "@/components/game/icons";
import "./linePage.css";

/** Breadcrumb in a pill, so it never sits on the dark platform glass. */
export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="麵包屑" className="lp-crumb">
      {items.map((it, i) => (
        <Fragment key={`${it.label}-${i}`}>
          {i > 0 ? <span aria-hidden="true">/</span> : null}
          {it.href ? (
            <Link href={it.href}>{it.label}</Link>
          ) : (
            <span aria-current="page">{it.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

export interface LinkRowItem {
  key: string | number;
  href: string;
  title: ReactNode;
  sub?: ReactNode;
  /** Clamp the sub line to two lines (long branch bodies). */
  clamp?: boolean;
  /** Right-hand text before the arrow, e.g. 約 8 分鐘. */
  end?: ReactNode;
}

/** A list of whole-row links inside a card. */
export function LinkRows({ items, label }: { items: LinkRowItem[]; label?: string }) {
  return (
    <ul className="lp-rows" aria-label={label}>
      {items.map((it) => (
        <li key={it.key}>
          <Link href={it.href} className="lp-row">
            <span className="lp-row-text">
              <span className="lp-row-title">{it.title}</span>
              {it.sub ? (
                <span className={`lp-row-sub${it.clamp ? " lp-row-sub--clamp" : ""}`}>{it.sub}</span>
              ) : null}
            </span>
            <span className="lp-row-end">
              {it.end}
              <Icon name="arrow" size={18} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Text link with a trailing arrow, 44px tall. */
export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="lp-link">
      {children}
      <Icon name="arrow" size={18} />
    </Link>
  );
}

/** Secondary button: same size as PrimaryButton, white. */
export function SecondaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="lp-btn2">
      {children}
    </Link>
  );
}

/** "常見錯誤" box: warning tone with an icon, not color alone. */
export function MistakeBox({ children }: { children: ReactNode }) {
  return (
    <div className="lp-box lp-box--warn">
      <p className="lp-box-label">
        <Icon name="info" size={18} />
        常見錯誤
      </p>
      <p className="lp-lead">{children}</p>
    </div>
  );
}

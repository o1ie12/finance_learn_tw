import type { ReactNode } from "react";
import s from "./page.module.css";

/**
 * The header every page opens with (2026-11-02): where you are, what this
 * page is for in one sentence, and its actions. Pages never start with a
 * bare box.
 */
export function PageHeader({ kicker, title, intro, actions }: { kicker?: string; title: string; intro?: ReactNode; actions?: ReactNode }) {
  return (
    <header className={s.head}>
      <div className={s.headText}>
        {kicker ? <p className={s.kicker}>{kicker}</p> : null}
        <h1 className={s.title}>{title}</h1>
        {intro ? <p className={s.intro}>{intro}</p> : null}
      </div>
      {actions ? <div className={s.actions}>{actions}</div> : null}
    </header>
  );
}

/** A white panel with an optional label. */
export function Panel({ label, children, className = "" }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`${s.panel} ${className}`}>
      {label ? <p className={s.label}>{label}</p> : null}
      {children}
    </section>
  );
}

export const pageStyles = s;

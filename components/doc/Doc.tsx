import type { ReactNode } from "react";
import s from "@/components/ui/ui.module.css";

/**
 * 06 E7.6. Documents look like paper: one header tint, no colored fills, the
 * same markup for every field during a task (05 A3). A definition list, so a
 * screen reader reads it in order. Every document carries 名稱皆為虛構。
 */
export function Doc({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle?: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <figure style={{ margin: 0 }}>
      <div className={`${s.doc} squircle`}>
        <div className={s.docHead}>
          <div>
            <p className={s.docTitle}>{title}</p>
            {subtitle ? <p className={s.docSub}>{subtitle}</p> : null}
          </div>
          <span className={s.badge}>{badge}</span>
        </div>
        {children}
      </div>
      <figcaption className={s.fine}>名稱皆為虛構。</figcaption>
    </figure>
  );
}

export function DocGrid({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className={s.grid2}>
      {rows.map((r) => (
        <div key={r.label} className={s.cell}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

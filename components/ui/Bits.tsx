import type { CSSProperties, ReactNode } from "react";
import s from "./ui.module.css";

/** 06 E7.7. Line-color stripes either side; the name, then the English line. */
export function Sign({ name, code, style }: { name: string; code: string; style?: CSSProperties }) {
  return (
    <div className={s.sign} style={style}>
      <b aria-hidden="true" />
      <span className={s.signText}>
        <span className={s.signName}>{name}</span>
        <span className={s.signCode} lang="en">
          {code}
        </span>
      </span>
      <b aria-hidden="true" />
    </div>
  );
}

/** 06 E7.8. The name is plain text, never HTML. */
export function NamePlate({ name, sub }: { name: string; sub: string }) {
  return (
    <div className={s.plate}>
      <span className={s.plateName}>{name}</span>
      <span className={s.plateSub}>{sub}</span>
    </div>
  );
}

/** 06 E7.9. One status or one hint; a status carries a dot and words. */
export function Bubble({ children, tone }: { children: ReactNode; tone?: "good" | "warn" | "bad" }) {
  const dot = tone === "good" ? s.dotGood : tone === "warn" ? s.dotWarn : tone === "bad" ? s.dotBad : null;
  return (
    <div className={s.bubble}>
      {dot ? <span className={`${s.dot} ${dot}`} aria-hidden="true" /> : null}
      <span className={s.bubbleText}>{children}</span>
    </div>
  );
}

/** 06 E7.10. Who or where; not tappable. */
export function Chip({ children }: { children: ReactNode }) {
  return <span className={s.chip}>{children}</span>;
}

/** 06 E7.11. Solid card; a line's own cards add a 4px top border. */
export function Card({
  children,
  label,
  raised = false,
  line = false,
  className,
  style,
}: {
  children: ReactNode;
  label?: string;
  raised?: boolean;
  line?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section className={[s.card, raised && s.cardRaised, line && s.cardLine, "squircle", className].filter(Boolean).join(" ")} style={style}>
      {label ? <p className={s.cardLabel}>{label}</p> : null}
      {children}
    </section>
  );
}

/** Voice text (Noto Sans TC, bold): questions and key sentences (E4). */
export function Voice({ children, size = 3, as: Tag = "p" }: { children: ReactNode; size?: 2 | 3; as?: "p" | "h2" }) {
  return <Tag className={`${s.voice} ${size === 2 ? s.title2 : s.title3}`}>{children}</Tag>;
}

export function Label({ children }: { children: ReactNode }) {
  return <p className={s.label}>{children}</p>;
}

export function Body({ children }: { children: ReactNode }) {
  return <p className={s.body}>{children}</p>;
}

/** 06 E7.15. A short past-tense confirmation, announced politely. */
export function Toast({ children }: { children: ReactNode }) {
  return (
    <div className={s.toast} role="status">
      {children}
    </div>
  );
}

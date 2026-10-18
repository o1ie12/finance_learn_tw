import { useId, type ReactNode } from "react";
import s from "./documents.module.css";
import { cx } from "./fields";

/**
 * The paper every document sits on (01 §8): --card-strong, 1px border,
 * radius 10, the title, an optional 示意 tag and the 「名稱皆為虛構」
 * footnote (on unless `fictional={false}`).
 */
export default function DocumentFrame({
  title,
  subtitle,
  sample = false,
  fictional = true,
  footnote,
  headingLevel = 3,
  className,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  /** Show the 「示意」 tag. */
  sample?: boolean;
  fictional?: boolean;
  /** Extra footnote lines (a source line, a disclaimer). */
  footnote?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  const H = `h${headingLevel}` as "h2" | "h3" | "h4";
  const hasFoot = fictional || footnote;
  return (
    <section aria-labelledby={id} className={cx(s.doc, className)}>
      <header className={s.head}>
        <div>
          <H id={id} className={s.title}>
            {title}
          </H>
          {subtitle && <p className={s.subtitle}>{subtitle}</p>}
        </div>
        {sample && <span className={s.tag}>示意</span>}
      </header>
      {children}
      {hasFoot && (
        <footer className={s.foot}>
          {typeof footnote === "string" ? <p>{footnote}</p> : footnote}
          {fictional && <p>名稱皆為虛構</p>}
        </footer>
      )}
    </section>
  );
}

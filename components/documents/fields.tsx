/**
 * Shared pieces of every document: find mode (FindStep, 03 §2) and the
 * after-answer highlight. No hooks with state here, so a document renders the
 * same from a server or a client component; find mode needs a client parent
 * because it carries callbacks.
 *
 * Reading mode: a field is plain text (label, then value) in reading order.
 * Find mode: each field is a toggle <button aria-pressed> whose selected state
 * shows a check mark as well as a color.
 */

import type { ReactNode } from "react";
import s from "./documents.module.css";

export interface FindMode {
  selected: ReadonlySet<string>;
  onToggle(fieldId: string): void;
  disabled?: boolean;
}

/** Props every document accepts. */
export interface DocumentProps {
  find?: FindMode;
  /** Field ids to highlight after answering (the detail that mattered). */
  highlight?: readonly string[];
  /** Heading level of the document title inside its page. Default 3. */
  headingLevel?: 2 | 3 | 4;
}

export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

export function isOn(find: FindMode | undefined, id: string): boolean {
  return !!find && find.selected.has(id);
}

export function isHl(highlight: readonly string[] | undefined, id: string): boolean {
  return !!highlight && highlight.includes(id);
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <polyline points="5 12.5 10 17.5 19 7" />
    </svg>
  );
}

/** The ring that fills with a check when a field is selected. */
export function Mark() {
  return (
    <span className={s.mark} aria-hidden="true">
      <CheckIcon />
    </span>
  );
}

/** 「關鍵」: the after-answer highlight in words, not color alone. */
export function KeyTag() {
  return <span className={s.keyTag}>關鍵</span>;
}

/** Container for KV rows: a <dl> when reading, a plain group in find mode. */
export function KVList({
  find,
  label,
  className,
  children,
}: {
  find?: FindMode;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  if (find) {
    return (
      <div role="group" aria-label={label} className={cx(s.kvList, s.kvListFind, className)}>
        {children}
      </div>
    );
  }
  return <dl className={cx(s.kvList, className)}>{children}</dl>;
}

export function KV({
  id,
  label,
  value,
  find,
  highlight,
  big,
  text,
}: {
  id: string;
  label: ReactNode;
  value: ReactNode;
  find?: FindMode;
  highlight?: readonly string[];
  /** A headline number (實發金額, 本期應繳總額). */
  big?: boolean;
  /** Value is words, not a number: lighter weight. */
  text?: boolean;
}) {
  const hl = isHl(highlight, id);
  const valueClass = cx(s.v, text && s.vText);
  if (find) {
    const on = isOn(find, id);
    return (
      <button
        type="button"
        aria-pressed={on}
        disabled={find.disabled}
        onClick={() => find.onToggle(id)}
        className={cx(s.pick, big && s.kvBig, hl && s.hl)}
        data-field={id}
      >
        <span className={s.kvInner}>
          <span className={s.k}>{label}</span>
          <span className={valueClass}>
            {value}
            {hl && <KeyTag />}
          </span>
        </span>
        <Mark />
      </button>
    );
  }
  return (
    <div className={cx(s.kv, big && s.kvBig, hl && s.hl)} data-field={id}>
      <dt className={s.k}>{label}</dt>
      <dd className={valueClass}>
        {value}
        {hl && <KeyTag />}
      </dd>
    </div>
  );
}

/** A toggle inside a table cell (a column header or a row header). */
export function CellPick({
  id,
  find,
  kind,
  label,
  children,
}: {
  id: string;
  find: FindMode;
  kind: "col" | "row";
  /** Accessible name when the visible text alone is not enough (rows). */
  label?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={isOn(find, id)}
      aria-label={label}
      disabled={find.disabled}
      onClick={() => find.onToggle(id)}
      className={kind === "col" ? s.colPick : s.rowPick}
      data-field={id}
    >
      <span>{children}</span>
      <Mark />
    </button>
  );
}

/** Horizontal scroll inside the document only, keyboard reachable. */
export function TableWrap({ label, children }: { label: string; children: ReactNode }) {
  return (
    // A focusable scroll region so keyboard users can scroll a wide table.
    <div className={s.tableWrap} role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}

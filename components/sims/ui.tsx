"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { formatNT } from "@/components/Money";

/** A dt/dd money row for ledger-style breakdowns. */
export function Row({
  label,
  value,
  sign,
  strong,
  tone,
  raw,
}: {
  label: ReactNode;
  value: number;
  sign?: "plus" | "minus";
  strong?: boolean;
  tone?: "negative" | "positive";
  raw?: string; // override the formatted value
}) {
  const prefix = sign === "minus" ? "−" : sign === "plus" ? "+" : "";
  const toneClass =
    tone === "negative"
      ? "text-negative"
      : tone === "positive"
        ? "text-positive"
        : "text-ink";
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt
        className={`text-[15px] ${strong ? "font-bold text-ink" : "text-ink-soft"}`}
      >
        {label}
      </dt>
      <dd
        className={`money text-[15px] ${strong ? "text-lg font-semibold" : ""} ${toneClass}`}
      >
        {raw ?? `${prefix}${formatNT(value)}`}
      </dd>
    </div>
  );
}

/** A selectable radio card. Titles are ink for contrast; the line color marks
 *  the selected state (dot + border). */
export function SelectCard({
  name,
  selected,
  onSelect,
  color,
  title,
  meta,
  sub,
  disabled,
}: {
  name: string;
  selected: boolean;
  onSelect: () => void;
  color: string;
  title: ReactNode;
  meta?: ReactNode;
  sub?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 bg-surface p-4 transition-colors ${
        selected ? "" : "border-hairline hover:border-ink/30"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      style={selected ? { borderColor: color } : undefined}
    >
      <input
        type="radio"
        name={name}
        checked={selected}
        onChange={onSelect}
        disabled={disabled}
        className="sr-only"
      />
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        style={{
          background: selected ? color : "var(--color-bg)",
          boxShadow: selected ? undefined : "0 0 0 3px var(--color-hairline)",
        }}
        aria-hidden="true"
      >
        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="font-bold text-ink">{title}</span>
          {meta != null && (
            <span className="money font-semibold text-ink">{meta}</span>
          )}
        </span>
        {sub && (
          <span className="mt-0.5 block text-sm text-ink-soft">{sub}</span>
        )}
      </span>
    </label>
  );
}

/** The reset + dashboard actions shown under every simulation outcome. */
export function OutcomeActions({
  onReset,
  resetLabel = "換個選擇再試一次",
}: {
  onReset: () => void;
  resetLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-5 py-3 text-base font-medium hover:border-ink"
      >
        {resetLabel}
      </button>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-3 text-base font-semibold text-white hover:-translate-y-0.5"
      >
        回到我的路線圖
      </Link>
    </div>
  );
}

/** Submit button with disabled/loading states, shared across sim builders. */
export function SubmitButton({
  onClick,
  disabled,
  submitting,
  idleLabel,
  disabledLabel,
}: {
  onClick: () => void;
  disabled: boolean;
  submitting: boolean;
  idleLabel: string;
  disabledLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || submitting}
      className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {submitting ? "計算中…" : disabled ? disabledLabel : idleLabel}
    </button>
  );
}

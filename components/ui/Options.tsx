"use client";

import { useRef, type KeyboardEvent } from "react";
import { Icon } from "./icons";
import s from "./ui.module.css";

/**
 * 06 E7.4. A radiogroup of option rows: arrow keys move, Space or Enter
 * selects. Selection shows as a 2px border, a filled radio and a check:
 * never color alone.
 */
export function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (i + d + options.length) % options.length;
    refs.current[next]?.focus();
    onChange(options[next].id);
  };
  const focusIndex = Math.max(
    options.findIndex((o) => o.id === value),
    0,
  );
  return (
    <div role="radiogroup" aria-label={label} className={s.optList}>
      {options.map((o, i) => {
        const sel = o.id === value;
        return (
          <button
            key={o.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={sel}
            tabIndex={i === focusIndex ? 0 : -1}
            className={`${s.opt} ${sel ? s.optSel : ""} squircle`}
            onClick={() => onChange(o.id)}
            onKeyDown={(e) => move(e, i)}
          >
            <span className={s.radio} aria-hidden="true">
              {sel ? <Icon name="check" size={18} strokeWidth={3} /> : null}
            </span>
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const RATE = [
  { value: 1, label: "不核准" },
  { value: 2, label: "小額" },
  { value: 3, label: "核准" },
] as const;

/** 06 E7.5. Three big choices; keys 1, 2, 3 select (the screen binds them). */
export function RatingRow({ value, onChange }: { value: 1 | 2 | 3 | null; onChange: (v: 1 | 2 | 3) => void }) {
  return (
    <div role="radiogroup" aria-label="你的決定" className={s.rate}>
      {RATE.map((r) => (
        <button
          key={r.value}
          type="button"
          role="radio"
          aria-checked={value === r.value}
          aria-label={`${r.value}，${r.label}`}
          className={`${s.rateOpt} ${value === r.value ? s.rateSel : ""} squircle`}
          onClick={() => onChange(r.value)}
        >
          <span className={s.rateNum}>{r.value}</span>
          <span className={s.rateLabel}>{r.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Segmented control (E7.6 文件/問題, E8.8 creator parts). */
export function Segmented<T extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div role="tablist" aria-label={label} className={s.seg}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          aria-selected={it.id === value}
          className={s.segBtn}
          onClick={() => onChange(it.id)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

import type { ReactNode } from "react";

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-[16px] leading-[1.85] text-ink/90">{children}</p>;
}

export function Term({ children }: { children: ReactNode }) {
  return <strong className="font-bold text-ink">{children}</strong>;
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-1">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 text-[16px] leading-[1.8] text-ink/90">
          <span
            className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/40"
            aria-hidden="true"
          />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function Callout({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-xl bg-surface p-5"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <p
        className="font-display text-xs font-bold uppercase tracking-wider"
        style={{ color }}
      >
        {label}
      </p>
      <div className="mt-1.5 space-y-2 text-[15px] leading-relaxed text-ink/90">
        {children}
      </div>
    </div>
  );
}

/** US-vs-Taiwan comparison, the recurring "this is not America" device. */
export function Compare({
  us,
  tw,
  accent,
}: {
  us: ReactNode;
  tw: ReactNode;
  accent: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-hairline bg-bg p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
          🇺🇸 美國常見做法
        </p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{us}</p>
      </div>
      <div
        className="rounded-xl bg-surface p-4"
        style={{ border: `1.5px solid ${accent}` }}
      >
        <p
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: accent }}
        >
          🇹🇼 台灣
        </p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink/90">{tw}</p>
      </div>
    </div>
  );
}

export function Worked({
  title,
  rows,
  note,
  accent,
}: {
  title: string;
  rows: { label: string; value: string; strong?: boolean }[];
  note?: ReactNode;
  accent: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
      <div
        className="px-5 py-3 text-sm font-bold text-white"
        style={{ background: accent }}
      >
        {title}
      </div>
      <dl className="divide-y divide-hairline">
        {rows.map((r, i) => (
          <div
            key={i}
            className="flex items-baseline justify-between gap-4 px-5 py-2.5"
          >
            <dt
              className={`text-[15px] ${r.strong ? "font-bold text-ink" : "text-ink-soft"}`}
            >
              {r.label}
            </dt>
            <dd
              className={`money text-[15px] ${r.strong ? "text-lg font-semibold text-ink" : "text-ink"}`}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
      {note && (
        <p className="border-t border-hairline px-5 py-3 text-sm leading-relaxed text-ink-soft">
          {note}
        </p>
      )}
    </div>
  );
}

export function Scenario({
  children,
  color,
}: {
  children: ReactNode;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 sm:p-6"
      style={{ background: `color-mix(in srgb, ${color} 8%, white)` }}
    >
      <p
        className="font-display text-sm font-bold uppercase tracking-wider"
        style={{ color }}
      >
        換你想想看
      </p>
      <div className="mt-2 space-y-3 text-[16px] leading-[1.8] text-ink/90">
        {children}
      </div>
    </div>
  );
}

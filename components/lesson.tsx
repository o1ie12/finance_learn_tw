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

/**
 * 情報站 — the design system's signature element (build spec section 7): a
 * miniature split-flap departure board for every 台灣現況 stat. Same
 * container every time, so a reader learns "this box = verified Taiwan
 * fact" — the visual backbone of the accuracy story for SFI.
 *
 * `stat` is optional because not every 台灣現況 note in the existing lesson
 * content has a single clean headline number to extract (some are a
 * definition or a named rule rather than a stat) — those still get the
 * board's dark/amber framing, just without the settle-in flip motion on a
 * missing headline.
 */
export function InfoBoard({
  label = "台灣現況",
  stat,
  source,
  children,
}: {
  label?: string;
  stat?: string;
  source?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border shadow-sm"
      style={{
        background: "var(--color-board)",
        borderColor: "color-mix(in srgb, var(--color-board-text) 18%, black)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-1.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <span
          className="font-display text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "color-mix(in srgb, var(--color-board-text) 70%, transparent)" }}
        >
          情報站
        </span>
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "color-mix(in srgb, var(--color-board-text) 70%, transparent)" }}
          aria-hidden="true"
        />
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
          {label}
        </p>
        {stat && (
          <p
            key={stat}
            className="board-flip money mt-1 text-3xl font-bold leading-none sm:text-4xl"
            style={{ color: "var(--color-board-text)" }}
          >
            {stat}
          </p>
        )}
        <div className="mt-2 space-y-1.5 text-[14px] leading-relaxed text-white/80">
          {children}
        </div>
        {source && (
          <p className="mt-2.5 money text-[11px] text-white/40">{source}</p>
        )}
      </div>
    </div>
  );
}

/**
 * 常見錯誤 — deliberately lighter than 情報站: an alert-orange left border,
 * not a full block, so the two callout styles stay visually distinct on the
 * same page (section 7). Always the design system's reserved alert color,
 * regardless of which line's page it appears on.
 */
export function MistakeNote({ children }: { children: ReactNode }) {
  return (
    <div
      className="border-l-4 py-1 pl-4"
      style={{ borderColor: "var(--color-alert)" }}
    >
      <p
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: "var(--color-alert)" }}
      >
        ⚠ 常見錯誤
      </p>
      <div className="mt-1 space-y-2 text-[15px] leading-relaxed text-ink/90">
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

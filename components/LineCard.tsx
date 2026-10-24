import Link from "next/link";
import type { LineMeta } from "@/lib/lines";
import { lineStats } from "@/lib/lineStats";
import type { LineStatus } from "@/lib/progressModel";
import ProgressDots from "@/components/ProgressDots";

/** A catalog card for one line, with optional per-user progress + CTA. */
export default function LineCard({
  line,
  status,
  done,
}: {
  line: LineMeta;
  status?: LineStatus;
  /** Stations done, counted the same way as the total (06 G5 item 5). */
  done?: number;
}) {
  const stats = lineStats(line);
  let cta = "查看這條線";
  if (status) {
    // 06 G5 item 5: nothing done yet is 開始, whatever else was touched.
    if (status.complete) cta = "已完成 · 再看一次";
    else if ((done ?? 0) > 0 && status.next) cta = `繼續：${status.next.label}`;
    else cta = "開始";
  }

  return (
    <Link
      href={`/line/${line.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface transition-transform hover:-translate-y-0.5"
    >
      <span className="h-1.5 w-full" style={{ background: line.color }} aria-hidden="true" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: line.color }}
            aria-hidden="true"
          />
          {/* Never shrink or wrap the Chinese name itself — the English name
              is what gives way (wraps to its own line)
              when the row is tight, not this. */}
          <span className="shrink-0 whitespace-nowrap text-[17px] font-bold">
            {line.name}
          </span>
          <span
            className="font-display text-[11px] font-bold uppercase tracking-[0.03em]"
            style={{ color: line.colorInk }}
          >
            {line.enName}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-1 text-[13.5px] text-[#565C63]">
          {line.short}
        </p>
        <p className="mt-2 text-xs text-[#565C63]">
          {stats.stations} 站 · 約 {stats.minutes} 分鐘
        </p>
        <div className="mt-1 flex items-center gap-2">
          <ProgressDots
            done={done ?? 0}
            total={stats.stations}
            color={line.color}
          />
          {status && (
            <span className="money text-xs text-ink-faint">
              {done ?? 0}/{stats.stations} 站
            </span>
          )}
        </div>
        <span
          className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold group-hover:underline"
          style={{ color: line.colorInk }}
        >
          {cta} <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

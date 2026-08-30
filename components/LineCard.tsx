import Link from "next/link";
import { lineMinutes, type LineMeta } from "@/lib/lines";
import type { LineStatus } from "@/lib/progressModel";
import ProgressDots from "@/components/ProgressDots";

/** A catalog card for one line, with optional per-user progress + CTA. */
export default function LineCard({
  line,
  status,
}: {
  line: LineMeta;
  status?: LineStatus;
}) {
  let cta = "查看這條線";
  if (status) {
    if (status.complete) cta = "已完成 · 再看一次";
    else if (status.started && status.next) cta = `繼續：${status.next.label}`;
    else cta = "開始這條線";
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
              and flagship badge are what give way (wrap to their own line)
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
          {line.flagship && (
            <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium text-ink-soft">
              旗艦
            </span>
          )}
        </div>
        <p className="mt-1.5 line-clamp-1 text-[13.5px] text-[#565C63]">
          {line.short}
        </p>
        <p className="mt-2 text-xs text-[#565C63]">
          {line.stationModules.length} 站 · 約 {lineMinutes(line)} 分鐘
        </p>
        <div className="mt-1 flex items-center gap-2">
          <ProgressDots
            done={status?.stationsDone ?? 0}
            total={status?.stationsTotal ?? line.stationModules.length}
            color={line.color}
          />
          {status && (
            <span className="money text-xs text-ink-faint">
              {status.stationsDone}/{status.stationsTotal} 站
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

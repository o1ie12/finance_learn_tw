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
        <div className="flex items-center gap-2">
          <span
            className="font-display text-xs font-bold uppercase tracking-wider"
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
        <h3 className="mt-1 text-xl font-bold">{line.name}</h3>
        <p className="mt-1.5 flex-1 text-[15px] leading-relaxed text-ink-soft">
          {line.short}
        </p>
        <p className="mt-3 text-xs text-ink-faint">
          {line.stationModules.length} 站 · 約 {lineMinutes(line)} 分鐘
        </p>
        {status && (
          <div className="mt-2 flex items-center gap-2">
            <ProgressDots
              done={status.stationsDone}
              total={status.stationsTotal}
              color={line.color}
            />
            <span className="money text-xs text-ink-faint">
              {status.stationsDone}/{status.stationsTotal} 站
            </span>
          </div>
        )}
        <span
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline"
          style={{ color: line.colorInk }}
        >
          {cta} <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

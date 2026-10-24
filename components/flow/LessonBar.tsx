import { IconButton } from "@/components/ui/TopBar";
import s from "./lessonBar.module.css";

const STOPS: Record<number, string[]> = {
  5: ["想一想", "先懂", "任務", "對答案", "人生"],
  2: ["任務", "對答案"],
};

/**
 * The lesson's glass bar (2026-10-24 redesign): ✕ and ‹ on the left, the
 * station and the screen's title, and the stops rail. Five steps (or a
 * Short's two) get named stops; any other count (你是銀行's applicants) is a
 * plain segmented rail. Same props as TopBar plus Rail, so screens swap one
 * for the other.
 */
export function LessonBar({
  title,
  subtitle,
  back,
  close,
  step,
  total,
  label,
}: {
  title: string;
  subtitle?: string;
  flat?: boolean;
  back?: { href?: string; onClick?: () => void };
  close?: { href?: string; onClick?: () => void };
  step: number;
  total: number;
  label?: string;
}) {
  const names = STOPS[total];
  const at = Math.min(Math.max(Math.ceil(step), 1), total);
  return (
    <header className={s.bar}>
      <div className={s.buttons}>
        {close ? <IconButton icon="close" label="關閉" {...close} /> : null}
        {back && back.onClick ? <IconButton icon="back" label="返回" {...back} /> : null}
      </div>
      <div className={s.title}>
        {subtitle ? <p>{subtitle}</p> : null}
        <h1 tabIndex={-1} data-screen-heading>
          {title}
        </h1>
      </div>
      <div
        className={s.stops}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-label={label ?? (names ? `第 ${at} 步，共 ${total} 步：${names[at - 1]}` : `第 ${at} 步，共 ${total} 步`)}
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={s.stop} data-state={i + 1 < at ? "done" : i + 1 === at ? "on" : undefined} aria-hidden="true">
            <span className={s.seg} />
            {names ? <span className={s.name}>{names[i]}</span> : null}
          </span>
        ))}
      </div>
    </header>
  );
}

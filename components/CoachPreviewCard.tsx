/**
 * Placeholder for the AI coach on lesson pages, sitting under StationRail
 * in the right rail. Not interactive yet — the real coach only has
 * something to react to once a simulation run exists (see lib/coach.ts),
 * which doesn't happen until the line's terminal station. This is just a
 * preview so the coach feels present throughout the line, not only at the
 * very end.
 */
export default function CoachPreviewCard({ colorInk }: { colorInk: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-hairline bg-surface p-5">
      <div className="flex items-center gap-2">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: colorInk }}
          aria-hidden="true"
        >
          AI
        </span>
        <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
          AI 教練
        </p>
      </div>
      <p className="mt-2.5 text-[13px] leading-relaxed text-ink-soft">
        完成這條線的終點模擬後，AI
        教練會根據你的選擇給你一對一回饋——先把這幾站讀完，教練在終點等你。
      </p>
    </div>
  );
}

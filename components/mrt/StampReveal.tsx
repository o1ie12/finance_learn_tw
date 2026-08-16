import Link from "next/link";
import type { OutcomeTitle } from "@/lib/outcomeTitle";

/** The points/stamp reveal shown inside a simulation's outro hero — the
 * exact moment both are earned. Silent on a replay with no new points
 * (pointsAwarded is 0), but still shows the (possibly updated) stamp. */
export default function StampReveal({
  outcomeTitle,
  pointsAwarded,
}: {
  outcomeTitle: OutcomeTitle | null;
  pointsAwarded: number;
}) {
  if (!outcomeTitle && !pointsAwarded) return null;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
      {outcomeTitle && (
        <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold">
          護照戳章：{outcomeTitle.title}
        </span>
      )}
      {pointsAwarded > 0 && (
        <span className="money text-sm font-semibold text-white/90">
          +{pointsAwarded} 點
        </span>
      )}
      <Link
        href="/passport"
        className="ml-auto text-sm font-semibold underline underline-offset-2"
      >
        查看護照 →
      </Link>
    </div>
  );
}

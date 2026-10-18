/**
 * Streaks (02 §7.3): consecutive days, in Asia/Taipei, with at least one
 * completed station task or life-game turn, ending today or yesterday.
 */

/** The calendar day in Asia/Taipei as YYYY-MM-DD. */
export function taipeiDay(at: Date): string {
  // Taiwan has no daylight saving time: UTC+8 all year.
  const t = new Date(at.getTime() + 8 * 60 * 60 * 1000);
  return t.toISOString().slice(0, 10);
}

function prevDay(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Streak length from the days that had activity, as of `today`. */
export function streakFrom(activeDays: Iterable<string>, today: string): number {
  const days = new Set(activeDays);
  let cursor = days.has(today) ? today : prevDay(today);
  let n = 0;
  while (days.has(cursor)) {
    n++;
    cursor = prevDay(cursor);
  }
  return n;
}

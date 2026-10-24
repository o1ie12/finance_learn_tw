/**
 * 06 G5 item 7: a task whose facts are not all in VERIFIED.md stays off the
 * site until they are. NEXT_PUBLIC_SHOW_UNVERIFIED=1 shows them (for review
 * on a preview). The content check still validates them.
 *
 * - xinyong.borrow.v1 (借錢之前, P2): its card says a student loan's rate is
 *   lower than an ordinary loan's; VERIFIED.md has no item for it. The loan
 *   offer itself is illustrative (示意).
 */
export const UNVERIFIED_TASKS: ReadonlySet<string> = new Set(["xinyong.borrow.v1"]);

/** The task, or a Short taken from it, is hidden. */
export function isHiddenTask(taskSetId: string): boolean {
  if (process.env.NEXT_PUBLIC_SHOW_UNVERIFIED === "1") return false;
  const source = taskSetId.startsWith("short.") ? taskSetId.slice(6).split(".").slice(0, 3).join(".") : taskSetId;
  return UNVERIFIED_TASKS.has(source);
}

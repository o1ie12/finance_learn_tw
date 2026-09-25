/**
 * 投資線's TWSE-linkout mode: built, testable, and off.
 *
 * Whether 投資線 ends up sending students to TWSE's own tool depends on two
 * things only a person can settle — whether the tool works outside a
 * promotional window, and what its signup actually demands of a minor.
 * Neither is decided, so nothing here is switched on.
 *
 * What IS decided is that the answer should not cost a rebuild. The whole
 * mechanism exists below; the only missing piece is a URL nobody has
 * confirmed. Supplying it and setting the flag is the entire activation step.
 *
 * The custom simulator is not a stopgap and is not deprecated. With the flag
 * off it remains exactly what 投資線 does, unchanged, and it may well remain
 * the permanent answer — that is a live possibility, not a fallback.
 */

/**
 * The destination. Deliberately empty.
 *
 * No guessed, plausible or "probably right" URL belongs here. A wrong link on
 * this page sends a student somewhere nobody vetted, which is worse than the
 * line simply not linking out at all. A human supplies this after confirming
 * the tool, or it stays empty.
 */
export const TWSE_TOOL_URL: string | null =
  process.env.NEXT_PUBLIC_TWSE_TOOL_URL?.trim() || null;

/** The operator's intent: do we want the linkout at all? */
const LINKOUT_FLAG = process.env.NEXT_PUBLIC_INVEST_LINKOUT === "1";

/**
 * Whether 投資線 runs the linkout instead of the custom simulator.
 *
 * The URL check is a guard rather than a second switch: turning the flag on
 * without a confirmed destination would put students in front of a task they
 * cannot perform, so that combination resolves to "off" rather than to a
 * broken screen. Flipping the flag WITH a URL is the only activation step,
 * exactly as specified — the guard only refuses the half-done version of it.
 */
export const INVEST_LINKOUT_ENABLED: boolean =
  LINKOUT_FLAG && TWSE_TOOL_URL !== null;

/**
 * Why the linkout is off, for an operator reading logs or a dev checking
 * their env. Never shown to students.
 */
export function linkoutStatus(): string {
  if (INVEST_LINKOUT_ENABLED) return "enabled";
  if (!LINKOUT_FLAG && TWSE_TOOL_URL === null)
    return "disabled: no flag, no URL (default state)";
  if (!LINKOUT_FLAG) return "disabled: URL supplied but flag not set";
  return "disabled: flag set but NEXT_PUBLIC_TWSE_TOOL_URL is empty";
}

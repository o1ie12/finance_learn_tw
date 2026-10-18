/**
 * The pure core of the life-game API: parse what the browser sent, refuse
 * anything that tries to set a number the server owns, run the engine.
 * The route handlers only add sessions and storage around this.
 *
 * Class-mode score injection shipped once (02 intro). The browser sends a
 * choice; it never sends a balance, a score or a total.
 */

import { applyAction, type ApplyResult, type GameContext } from "./engine";
import { ActionSchema, type LifeState } from "./types";

/** Keys the browser may never send, at any depth. */
const FORBIDDEN_KEYS = new Set([
  "state",
  "stats",
  "cash",
  "accounts",
  "balance",
  "netWorth",
  "score",
  "health",
  "total",
  "freedomPct",
  "holdings",
  "debts",
  "seed",
]);

function findForbidden(v: unknown, depth = 0): string | null {
  if (depth > 6 || v === null || typeof v !== "object") return null;
  for (const [k, child] of Object.entries(v as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.has(k)) return k;
    const deeper = findForbidden(child, depth + 1);
    if (deeper) return deeper;
  }
  return null;
}

export interface ActionRequest {
  expect?: { turn: number; phase: string };
  action: unknown;
}

export type HandleResult =
  | ApplyResult
  | { ok: false; error: "forbidden_field"; detail: string }
  | { ok: false; error: "invalid_action"; detail: string }
  | { ok: false; error: "stale"; detail: string };

export function handleAction(state: LifeState, body: unknown, ctx: GameContext): HandleResult {
  const forbidden = findForbidden(body);
  if (forbidden) return { ok: false, error: "forbidden_field", detail: forbidden };
  const b = (body ?? {}) as ActionRequest;
  if (b.expect && (b.expect.turn !== state.turn || b.expect.phase !== state.phase)) {
    return { ok: false, error: "stale", detail: `at turn ${state.turn} ${state.phase}` };
  }
  const parsed = ActionSchema.safeParse(b.action);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: "invalid_action", detail: `${issue.path.join(".")}: ${issue.message}` };
  }
  return applyAction(state, parsed.data, ctx);
}

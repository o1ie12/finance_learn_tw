/**
 * Browser calls to the life-game API. The browser sends a choice and the
 * turn/phase it saw; it never sends a balance, a score or a total.
 */

import type { Action, Phase } from "@/lib/lifeGame/types";
import type { GamePayload } from "@/lib/lifeGame/view";

export interface ApiError {
  status: number;
  error: string;
  detail?: string;
  needsConfirm?: { kind: "readiness"; reason: string };
}

export type ApiResult = { ok: true; payload: GamePayload } | { ok: false; err: ApiError };

async function read(res: Response): Promise<ApiResult> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (res.ok && body && typeof body === "object" && "state" in body && "view" in body) {
    return { ok: true, payload: body as GamePayload };
  }
  const b = (body ?? {}) as Partial<ApiError>;
  return {
    ok: false,
    err: { status: res.status, error: b.error ?? "server_error", detail: b.detail, needsConfirm: b.needsConfirm },
  };
}

/** Where the screen loads and advances its game. The class-mode team page passes its own. */
export interface PlayEndpoints {
  state: string;
  action: string;
}

export const SOLO_ENDPOINTS: PlayEndpoints = { state: "/api/life-game", action: "/api/life-game/action" };

export async function fetchGame(endpoints: PlayEndpoints = SOLO_ENDPOINTS): Promise<ApiResult> {
  try {
    const res = await fetch(endpoints.state, { cache: "no-store" });
    return await read(res);
  } catch {
    return { ok: false, err: { status: 0, error: "network" } };
  }
}

export async function postAction(
  expect: { turn: number; phase: Phase },
  action: Action,
  endpoints: PlayEndpoints = SOLO_ENDPOINTS,
): Promise<ApiResult> {
  try {
    const res = await fetch(endpoints.action, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expect, action }),
    });
    return await read(res);
  } catch {
    return { ok: false, err: { status: 0, error: "network" } };
  }
}

/**
 * Browser calls for the class 人生賽局 (02 §8): join, the team's state, and
 * the teacher's room controls. Turn actions go through components/play
 * (PlayScreen with class endpoints). Nothing here sends a balance or a score.
 */

import type { ApiError } from "@/components/play/api";
import type { TeamStanding } from "@/lib/lifeGame/class";
import type { GamePayload } from "@/lib/lifeGame/view";
import type { ClassRoomStatus } from "@/lib/types";

export type { ApiError };

export interface TeamPayload extends GamePayload {
  room: { id: string; status: ClassRoomStatus };
  team: string;
}

export type TeamResult = { ok: true; payload: TeamPayload } | { ok: false; err: ApiError & { roomStatus?: ClassRoomStatus } };

async function readJson(res: Response): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await res.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function errOf(res: Response, b: Record<string, unknown>) {
  return {
    status: res.status,
    error: typeof b.error === "string" ? b.error : "server_error",
    detail: typeof b.detail === "string" ? b.detail : undefined,
    needsConfirm: b.needsConfirm as ApiError["needsConfirm"],
    roomStatus: typeof b.status === "string" ? (b.status as ClassRoomStatus) : undefined,
  };
}

async function readTeam(res: Response): Promise<TeamResult> {
  const b = await readJson(res);
  if (res.ok && "state" in b && "view" in b && "room" in b) return { ok: true, payload: b as unknown as TeamPayload };
  return { ok: false, err: errOf(res, b) };
}

const NETWORK = { ok: false as const, err: { status: 0, error: "network" } };

export async function fetchTeam(roomId: string): Promise<TeamResult> {
  try {
    return await readTeam(await fetch(`/api/class/life/state?room_id=${encodeURIComponent(roomId)}`, { cache: "no-store" }));
  } catch {
    return NETWORK;
  }
}

export type JoinResult =
  | { ok: true; roomId: string; team: string; status: ClassRoomStatus }
  | { ok: false; error: string };

export async function joinRoom(code: string, displayName: string, team: string): Promise<JoinResult> {
  try {
    const res = await fetch("/api/class/life/join", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, display_name: displayName, team }),
    });
    const b = await readJson(res);
    if (res.ok && typeof b.room_id === "string" && typeof b.team === "string") {
      return { ok: true, roomId: b.room_id, team: b.team, status: b.status as ClassRoomStatus };
    }
    return { ok: false, error: typeof b.error === "string" ? b.error : "server_error" };
  } catch {
    return { ok: false, error: "network" };
  }
}

export interface HostRoom {
  room_id: string;
  code: string;
  host_token: string;
  status: ClassRoomStatus;
}

export async function createRoom(): Promise<{ ok: true; room: HostRoom } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/class/life/create", { method: "POST" });
    const b = await readJson(res);
    if (res.ok && typeof b.room_id === "string") return { ok: true, room: b as unknown as HostRoom };
    return { ok: false, error: typeof b.error === "string" ? b.error : "server_error" };
  } catch {
    return { ok: false, error: "network" };
  }
}

export async function setRoomStatus(room: HostRoom, status: "active" | "finished"): Promise<boolean> {
  try {
    const res = await fetch("/api/class/life/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ room_id: room.room_id, host_token: room.host_token, status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface Leaderboard {
  status: ClassRoomStatus;
  players: number;
  standings: (TeamStanding & { members: number })[];
  waitingTeams: { team: string; members: number }[];
}

export async function fetchLeaderboard(roomId: string): Promise<Leaderboard | null> {
  try {
    const res = await fetch(`/api/class/life/leaderboard?room_id=${encodeURIComponent(roomId)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const b = await readJson(res);
    return Array.isArray(b.standings) ? (b as unknown as Leaderboard) : null;
  } catch {
    return null;
  }
}

const ERROR_TEXT: Record<string, string> = {
  invalid_code: "請輸入老師給的房間代碼。",
  invalid_team: "請選一個隊伍，或輸入 12 個字以內的隊名。",
  room_not_found: "找不到這個房間，請確認代碼。",
  not_life_room: "這個代碼是測驗房間，請到「課堂測驗」加入。",
  room_finished: "這場已經結束了。",
  room_not_active: "老師還沒開始，或這場已經結束。",
  not_joined: "你還沒加入這個房間，請重新加入。",
  no_session: "請先登入，才能和隊友一起玩。",
  backend_not_configured: "系統的資料庫還沒設定好，暫時不能玩。",
  network: "連不上伺服器，請檢查網路後再試一次。",
};

export function classErrorText(code: string): string {
  return ERROR_TEXT[code] ?? "出了一點問題，請再試一次。";
}

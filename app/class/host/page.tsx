"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LINES } from "@/lib/lines";
import type { LineSlug } from "@/lib/lines";
import type { ClassParticipant, ClassRoomStatus } from "@/lib/types";

interface RoomState {
  room_id: string;
  code: string;
  host_token: string;
  line_slug: string;
  status: ClassRoomStatus;
}

export default function ClassHostPage() {
  const [lineSlug, setLineSlug] = useState<LineSlug>(LINES[0].slug);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [status, setStatus] = useState<ClassRoomStatus>("waiting");
  const [participants, setParticipants] = useState<ClassParticipant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (!room) return;
    async function poll() {
      try {
        const res = await fetch(`/api/class/leaderboard?room_id=${room!.room_id}`);
        const data = await res.json();
        if (Array.isArray(data.participants)) setParticipants(data.participants);
      } catch {
        /* keep last known state on a transient poll failure */
      }
    }
    void poll();
    pollRef.current = window.setInterval(poll, 3000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [room]);

  async function createRoom() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/class/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line_slug: lineSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("建立房間時發生問題，請再試一次。");
        return;
      }
      setRoom(data);
      setStatus(data.status);
    } catch {
      setError("網路連線出了問題，請再試一次。");
    } finally {
      setCreating(false);
    }
  }

  async function setRoomStatus(action: "active" | "finished") {
    if (!room) return;
    try {
      const res = await fetch("/api/class/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: room.room_id, host_token: room.host_token, action }),
      });
      if (res.ok) setStatus(action);
    } catch {
      /* keep current status; the button stays available to retry */
    }
  }

  const line = LINES.find((l) => l.slug === lineSlug)!;

  if (!room) {
    return (
      <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
        <p className="font-display text-xs font-bold uppercase tracking-widest text-ink-faint">
          Class Mode · 老師
        </p>
        <h1 className="mt-1.5 text-3xl font-black tracking-tight">開一個房間</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          選一條路線，題目就是那條路線的 10 題前後測題庫。
        </p>

        <fieldset className="mt-6 space-y-2">
          {LINES.map((l) => (
            <label
              key={l.slug}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 bg-surface p-3 transition-colors ${
                lineSlug === l.slug ? "" : "border-hairline hover:border-ink/30"
              }`}
              style={lineSlug === l.slug ? { borderColor: l.color } : undefined}
            >
              <input
                type="radio"
                name="line"
                checked={lineSlug === l.slug}
                onChange={() => setLineSlug(l.slug)}
                className="sr-only"
              />
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: l.color }} aria-hidden="true" />
              <span className="font-semibold">{l.name}</span>
            </label>
          ))}
        </fieldset>

        {error && <p className="mt-4 text-sm text-negative">{error}</p>}

        <button
          type="button"
          onClick={createRoom}
          disabled={creating}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {creating ? "建立中…" : "建立房間"}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-display text-xs font-bold uppercase tracking-widest" style={{ color: line.colorInk }}>
        Class Mode · {line.name}
      </p>

      <div className="mt-3 rounded-2xl bg-ink p-8 text-center text-white">
        <p className="text-sm text-white/70">房間代碼</p>
        <p className="money mt-1 text-6xl font-black tracking-[0.15em]">{room.code}</p>
        <p className="mt-3 text-sm text-white/70">
          學生到 <span className="font-semibold text-white">/class/play</span> 輸入這組代碼加入
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {status === "waiting" && (
          <button
            type="button"
            onClick={() => setRoomStatus("active")}
            className="inline-flex items-center justify-center rounded-xl bg-ink px-6 py-3 text-base font-semibold text-white hover:-translate-y-0.5"
          >
            開始測驗
          </button>
        )}
        {status === "active" && (
          <button
            type="button"
            onClick={() => setRoomStatus("finished")}
            className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-6 py-3 text-base font-semibold hover:border-ink"
          >
            結束這場
          </button>
        )}
        <span className="text-sm text-ink-faint">
          {status === "waiting" && "等待中 · 學生可以先加入，按「開始測驗」後大家同時開始作答"}
          {status === "active" && "進行中"}
          {status === "finished" && "已結束"}
        </span>
      </div>

      <section aria-labelledby="leaderboard-heading" className="mt-8">
        <h2 id="leaderboard-heading" className="text-lg font-bold">
          即時排行榜 · {participants.length} 人加入
        </h2>
        <div className="mt-3 space-y-2">
          {participants.length === 0 && (
            <p className="text-sm text-ink-faint">還沒有人加入。</p>
          )}
          {participants.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-surface px-4 py-3"
            >
              <span className="flex items-center gap-3">
                <span className="money w-6 text-sm font-bold text-ink-faint">{i + 1}</span>
                <span className="font-semibold">{p.display_name}</span>
              </span>
              <span className="flex items-center gap-3 text-sm">
                {p.submitted_at ? (
                  <>
                    <span className="money font-semibold">{p.score} / 10</span>
                    <span className="text-ink-faint">{(p.total_ms! / 1000).toFixed(1)}s</span>
                  </>
                ) : (
                  <span className="text-ink-faint">作答中…</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link href="/class" className="text-sm font-medium text-line-2 underline">
          結束並回到 Class Mode 首頁
        </Link>
      </div>
    </div>
  );
}

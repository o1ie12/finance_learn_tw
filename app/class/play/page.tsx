"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getLine, isLineSlug } from "@/lib/lines";
import { getPrePostQuestions } from "@/lib/prePostQuestions";
import type { ClassRoomStatus } from "@/lib/types";

type Phase = "join" | "waiting" | "playing" | "submitted";

export default function ClassPlayPage() {
  const [phase, setPhase] = useState<Phase>("join");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const [participantId, setParticipantId] = useState<string | null>(null);
  const [lineSlug, setLineSlug] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; totalMs: number } | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "waiting" || !code) return;
    async function poll() {
      try {
        const res = await fetch(`/api/class/room?code=${code}`);
        const data = await res.json();
        const status = data.status as ClassRoomStatus | undefined;
        if (status === "active") {
          startedAtRef.current = Date.now();
          setPhase("playing");
        }
      } catch {
        /* keep waiting; the poll retries */
      }
    }
    void poll();
    pollRef.current = window.setInterval(poll, 2000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [phase, code]);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setJoining(true);
    setError(null);
    try {
      const res = await fetch("/api/class/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, display_name: name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "room_not_found"
            ? "找不到這個房間代碼，請跟老師確認。"
            : data.error === "room_finished"
              ? "這場測驗已經結束了。"
              : "加入時發生問題，請再試一次。",
        );
        return;
      }
      setParticipantId(data.participant_id);
      setLineSlug(data.line_slug);
      if (data.status === "active") {
        startedAtRef.current = Date.now();
        setPhase("playing");
      } else {
        setPhase("waiting");
      }
    } catch {
      setError("網路連線出了問題，請再試一次。");
    } finally {
      setJoining(false);
    }
  }

  async function submitAll(finalAnswers: Record<string, number>) {
    if (!participantId || !lineSlug) return;
    const questions = isLineSlug(lineSlug) ? getPrePostQuestions(lineSlug) : [];
    const score = questions.reduce(
      (acc, q) => acc + (finalAnswers[q.id] === q.answer ? 1 : 0),
      0,
    );
    const totalMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
    setResult({ score, totalMs });
    setPhase("submitted");
    try {
      await fetch("/api/class/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participant_id: participantId, score, total_ms: totalMs }),
      });
    } catch {
      /* the score is already shown locally; a failed write just won't reach the leaderboard */
    }
  }

  if (phase === "join") {
    return (
      <div className="mx-auto max-w-sm px-4 py-14 sm:px-6">
        <p className="font-display text-xs font-bold uppercase tracking-widest text-ink-faint">
          Class Mode · 學生
        </p>
        <h1 className="mt-1.5 text-3xl font-black tracking-tight">加入房間</h1>
        <form onSubmit={join} className="mt-6 space-y-4">
          <div>
            <label htmlFor="code" className="text-sm font-semibold">
              房間代碼
            </label>
            <input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="money mt-1.5 w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-lg tracking-[0.15em]"
              placeholder="ABC123"
              required
            />
          </div>
          <div>
            <label htmlFor="name" className="text-sm font-semibold">
              你的名字
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className="mt-1.5 w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-base"
              placeholder="讓老師認得出你就好"
              required
            />
          </div>
          {error && <p className="text-sm text-negative">{error}</p>}
          <button
            type="submit"
            disabled={joining}
            className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {joining ? "加入中…" : "加入"}
          </button>
        </form>
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <div className="mx-auto max-w-sm px-4 py-14 text-center sm:px-6">
        <p className="text-2xl font-black">已加入房間</p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          等老師按下「開始測驗」，畫面會自動開始。
        </p>
      </div>
    );
  }

  if (phase === "playing" && lineSlug) {
    const line = isLineSlug(lineSlug) ? getLine(lineSlug) : undefined;
    const questions = isLineSlug(lineSlug) ? getPrePostQuestions(lineSlug) : [];
    const answeredCount = Object.keys(answers).length;
    const allAnswered = answeredCount === questions.length;

    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <p
          className="font-display text-xs font-bold uppercase tracking-widest"
          style={{ color: line?.colorInk ?? "var(--color-ink)" }}
        >
          {line?.name} · 越快越準分數越高
        </p>
        <div className="mt-4 space-y-4">
          {questions.map((q, qi) => (
            <fieldset key={q.id} className="rounded-2xl border border-hairline bg-surface p-4">
              <legend className="text-[15px] font-bold">
                {qi + 1}. {q.q}
              </legend>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    className={`block w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
                      answers[q.id] === oi
                        ? "border-ink bg-bg"
                        : "border-hairline bg-bg hover:border-ink/40"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <button
          type="button"
          onClick={() => submitAll(answers)}
          disabled={!allAnswered}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          送出（已作答 {answeredCount} / {questions.length}）
        </button>
      </div>
    );
  }

  if (phase === "submitted" && result) {
    return (
      <div className="mx-auto max-w-sm px-4 py-14 text-center sm:px-6">
        <p className="text-2xl font-black">
          {result.score} / 10，用了 {(result.totalMs / 1000).toFixed(1)} 秒
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          看老師的畫面，排行榜會即時更新。
        </p>
        <Link
          href="/class"
          className="mt-6 inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-5 py-3 text-base font-semibold hover:border-ink"
        >
          回到 Class Mode
        </Link>
      </div>
    );
  }

  return null;
}

"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import s from "./resetGame.module.css";

/**
 * 06 E7.14: 重新開始人生模擬, the app's one alert. The row is destructive text
 * on a quiet surface, never filled and never the primary; the alert has no
 * default button. After a reset the student lands on 今天 at month 1.
 */
export function ResetGame() {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const rowRef = useRef<HTMLButtonElement>(null);
  // Closing the alert puts focus back on the row that opened it.
  const close = () => {
    setAsking(false);
    window.setTimeout(() => rowRef.current?.focus(), 0);
  };

  async function reset() {
    if (busy) return;
    setBusy(true);
    setProblem(null);
    try {
      const res = await fetch("/api/life-game/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: "reset" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setAsking(false);
      router.push("/today");
      router.refresh();
    } catch {
      close();
      setProblem("沒有重新開始。檢查網路後再試一次。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button ref={rowRef} type="button" className={s.row} onClick={() => setAsking(true)} aria-haspopup="dialog">
        重新開始人生模擬
      </button>
      {problem ? (
        <p className={s.problem} role="alert">
          {problem}
        </p>
      ) : null}
      {asking ? (
        <Alert
          title="要重新開始遊戲嗎？"
          body="目前的進度和存款會清除，無法復原。"
          action={busy ? "重新開始中…" : "重新開始"}
          onAction={() => void reset()}
          onCancel={close}
        />
      ) : null}
    </>
  );
}

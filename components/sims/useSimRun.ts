"use client";

import { useState } from "react";

export interface SimRunResult<T> {
  runId: string;
  outcome: T;
}

/**
 * Shared submit/loading/error/result state for a simulation. POSTs the payload
 * (with line_slug) to /api/simulation and exposes the run id + outcome.
 */
export function useSimRun<TOutcome>(lineSlug: string) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimRunResult<TOutcome> | null>(null);

  async function submit(payload: Record<string, unknown>) {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line_slug: lineSlug, ...payload }),
      });
      if (res.status === 401) {
        setError("請先建立帳號或輸入代碼，才能儲存模擬結果。");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.run_id) {
        setError("計算時發生問題，請再試一次。");
        return;
      }
      setResult({ runId: data.run_id, outcome: data.outcome as TOutcome });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("網路連線出了問題，請再試一次。");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return { submitting, error, result, submit, reset };
}

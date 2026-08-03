"use client";

import { useState } from "react";
import Link from "next/link";

interface CoachPanelProps {
  runId: string;
  /** Existing coach message (e.g. shown on the dashboard); skips the fetch. */
  initialMessage?: string;
  autoLoad?: boolean;
}

type Status = "idle" | "loading" | "done" | "error" | "not_configured";

export default function CoachPanel({
  runId,
  initialMessage,
  autoLoad = true,
}: CoachPanelProps) {
  const [message, setMessage] = useState<string | null>(
    initialMessage ?? null,
  );
  const [status, setStatus] = useState<Status>(
    initialMessage ? "done" : "idle",
  );
  const [hasRequested, setHasRequested] = useState(Boolean(initialMessage));

  async function requestCoach() {
    setStatus("loading");
    setHasRequested(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run_id: runId }),
      });
      if (res.status === 503) {
        setStatus("not_configured");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.message) {
        setStatus("error");
        return;
      }
      setMessage(data.message as string);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  // Kick off automatically on first render if asked to.
  if (autoLoad && status === "idle" && !hasRequested) {
    // schedule a microtask so we don't setState during render
    queueMicrotask(requestCoach);
  }

  return (
    <section
      aria-labelledby="coach-heading"
      className="overflow-hidden rounded-2xl border border-hairline bg-surface"
    >
      <div className="flex items-center gap-2 border-b border-hairline bg-bg px-5 py-3">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full bg-line-3 text-sm font-bold text-white"
          aria-hidden="true"
        >
          AI
        </span>
        <h3 id="coach-heading" className="text-base font-bold">
          理財教練的回饋
        </h3>
      </div>

      {/* Non-negotiable safety disclaimer, shown above every coach response */}
      <p className="border-b border-hairline bg-line-4/10 px-5 py-2.5 text-xs leading-relaxed text-ink-soft">
        這是針對「模擬情境」的教育性回饋，不是個人化的投資或財務建議。
      </p>

      <div className="px-5 py-5" aria-live="polite">
        {status === "loading" && (
          <div className="flex items-center gap-3 text-sm text-ink-soft">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-line-3 border-t-transparent"
              aria-hidden="true"
            />
            教練正在看你的選擇…
          </div>
        )}

        {status === "done" && message && (
          <p className="whitespace-pre-line text-[15px] leading-[1.9] text-ink/90">
            {message}
          </p>
        )}

        {status === "error" && (
          <div className="text-sm">
            <p className="text-ink-soft">
              教練暫時沒能回覆，可能是網路或伺服器忙碌。
            </p>
            <button
              type="button"
              onClick={requestCoach}
              className="mt-3 inline-flex items-center justify-center rounded-lg border border-ink bg-surface px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-white"
            >
              重試
            </button>
          </div>
        )}

        {status === "not_configured" && (
          <p className="text-sm leading-relaxed text-ink-soft">
            AI 教練尚未設定（需要 Anthropic API 金鑰）。你的模擬結果已經儲存，其他功能不受影響。
          </p>
        )}

        {status === "idle" && (
          <button
            type="button"
            onClick={requestCoach}
            className="inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:-translate-y-0.5"
          >
            請教練看看我的選擇
          </button>
        )}
      </div>

      <p className="border-t border-hairline px-5 py-3 text-xs text-ink-faint">
        教練只會針對你剛剛的模擬回覆。想更深入，回到{" "}
        <Link href="/course" className="underline hover:text-ink">
          課程模組
        </Link>
        。
      </p>
    </section>
  );
}

"use client";

import { useState } from "react";

/**
 * 9c, dashboard placement: a signed-in student's persistent way to email
 * themselves a backup of their code, for picking up progress on a second
 * device. Unlike the signup-success-view copy of this feature, this one
 * doesn't need the code passed in — the session cookie already proves
 * who's asking, so /api/email-code derives it server-side.
 */
export default function EmailCodeBackup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<
    { ok: true; stub: boolean } | { ok: false; message: string } | null
  >(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setResult(null);
    setSending(true);
    try {
      const res = await fetch("/api/email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({
          ok: false,
          message:
            data?.error === "invalid_email"
              ? "這個 email 格式怪怪的，再檢查一次。"
              : "寄送時發生問題，請再試一次。",
        });
        return;
      }
      setResult({ ok: true, stub: Boolean(data.stub) });
    } catch {
      setResult({ ok: false, message: "網路連線出了問題，請再試一次。" });
    } finally {
      setSending(false);
    }
  }

  if (result) {
    return (
      <p
        className={`rounded-lg px-3 py-1.5 text-sm ${
          result.ok && !result.stub
            ? "bg-positive/10 text-positive"
            : "bg-negative/10 text-negative"
        }`}
        role="status"
      >
        {result.ok
          ? result.stub
            ? "email 寄送功能尚未設定完成，這次沒有真的寄出。"
            : "代碼已經寄出了，記得檢查收件匣。"
          : result.message}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-ink hover:text-ink"
      >
        email 我的代碼備份
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <label htmlFor="dash-backup-email" className="sr-only">
        備份用 email
      </label>
      <input
        id="dash-backup-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="你的 email"
        className="w-44 rounded-lg border border-hairline bg-bg px-3 py-1.5 text-sm outline-none focus:border-line-2"
      />
      <button
        type="submit"
        disabled={sending}
        className="shrink-0 rounded-lg border border-ink px-3 py-1.5 text-sm font-semibold hover:bg-ink hover:text-white disabled:opacity-60"
      >
        {sending ? "寄送中…" : "寄給我"}
      </button>
    </form>
  );
}

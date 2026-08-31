"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_code: code }),
      });
      if (res.status === 404) {
        setError("找不到這組代碼，請確認後再試。");
        return;
      }
      if (!res.ok) {
        setError("查詢時發生問題，請再試一次。");
        return;
      }
      router.refresh();
    } catch {
      setError("網路連線出了問題，請再試一次。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
      <h2 className="text-xl font-bold">輸入你的代碼，查看進度</h2>
      <p className="mt-1 text-sm text-ink-soft">
        用建立帳號時拿到的 6 碼，找回你的學習路線與模擬結果。
      </p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row" noValidate>
        <label htmlFor="dash-code" className="sr-only">
          你的代碼
        </label>
        <input
          id="dash-code"
          type="text"
          autoCapitalize="characters"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="money w-full flex-1 rounded-lg border border-hairline bg-bg px-3.5 py-2.5 text-lg tracking-[0.2em] outline-none focus:border-line-2"
          placeholder="輸入 6 碼"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg bg-ink px-5 py-2.5 text-base font-semibold text-white hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? "查詢中…" : "查看進度"}
        </button>
      </form>
      {error && (
        <p className="mt-3 rounded-lg bg-negative/10 px-3.5 py-2.5 text-sm text-negative" role="alert">
          {error}
        </p>
      )}
      <p className="mt-4 text-sm text-ink-faint">
        還沒有帳號？{" "}
        <Link href="/signup" className="font-medium text-line-2 underline">
          免費建立一組
        </Link>
      </p>
    </div>
  );
}

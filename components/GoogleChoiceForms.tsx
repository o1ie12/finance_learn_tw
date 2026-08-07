"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GRADES = ["高一", "高二", "高三", "其他"];

function errorMessage(code: string | undefined): string {
  switch (code) {
    case "missing_fields":
      return "請填寫暱稱、學校與年級。";
    case "missing_code":
      return "請輸入你的代碼。";
    case "code_not_found":
      return "找不到這組代碼，請確認後再試一次。";
    case "code_linked_to_different_google":
      return "這組代碼已經連結過另一個 Google 帳號。";
    case "already_linked_elsewhere":
      return "這個 Google 帳號已經連結過另一組代碼。";
    case "google_session_expired":
      return "驗證已過期，請重新用 Google 登入一次。";
    case "backend_not_configured":
      return "系統的資料庫尚未設定，暫時無法建立帳號。請稍後再試或聯絡老師。";
    default:
      return "發生了一點問題，請再試一次。";
  }
}

export default function GoogleChoiceForms() {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "link" | "fresh">("choose");

  const [code, setCode] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState(GRADES[0]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function submitLink(e: React.FormEvent) {
    e.preventDefault();
    if (linking) return;
    setLinkError(null);
    setLinking(true);
    try {
      const res = await fetch("/api/auth/google/link-by-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_code: code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLinkError(errorMessage(data?.error));
        return;
      }
      router.push("/dashboard");
    } catch {
      setLinkError("網路連線出了問題，請再試一次。");
    } finally {
      setLinking(false);
    }
  }

  async function submitFresh(e: React.FormEvent) {
    e.preventDefault();
    if (creating) return;
    setCreateError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/auth/google/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, school, grade }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCreateError(errorMessage(data?.error));
        return;
      }
      router.push("/dashboard");
    } catch {
      setCreateError("網路連線出了問題，請再試一次。");
    } finally {
      setCreating(false);
    }
  }

  if (mode === "choose") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setMode("link")}
          className="w-full rounded-2xl border border-hairline bg-surface p-6 text-left hover:border-ink"
        >
          <p className="text-lg font-bold">已經有代碼了？</p>
          <p className="mt-1 text-sm text-ink-soft">
            輸入代碼，把 Google 帳號連結到你原本的進度。
          </p>
        </button>
        <button
          type="button"
          onClick={() => setMode("fresh")}
          className="w-full rounded-2xl border border-hairline bg-surface p-6 text-left hover:border-ink"
        >
          <p className="text-lg font-bold">從頭開始</p>
          <p className="mt-1 text-sm text-ink-soft">建立一個全新的帳號，之後也能加上代碼。</p>
        </button>
      </div>
    );
  }

  if (mode === "link") {
    return (
      <form
        onSubmit={submitLink}
        className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8"
        noValidate
      >
        <button
          type="button"
          onClick={() => setMode("choose")}
          className="text-sm text-ink-faint underline"
        >
          ← 返回
        </button>
        <h2 className="mt-3 text-xl font-bold">輸入你的代碼</h2>
        <p className="mt-1 text-sm text-ink-soft">用建立帳號時拿到的 6 碼，接續你的進度。</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="google-link-code" className="sr-only">
            你的代碼
          </label>
          <input
            id="google-link-code"
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
            disabled={linking}
            className="shrink-0 rounded-lg bg-ink px-5 py-2.5 text-base font-semibold text-white hover:-translate-y-0.5 disabled:opacity-60"
          >
            {linking ? "連結中…" : "連結帳號"}
          </button>
        </div>
        {linkError && (
          <p
            className="mt-3 rounded-lg bg-negative/10 px-3.5 py-2.5 text-sm text-negative"
            role="alert"
          >
            {linkError}
          </p>
        )}
      </form>
    );
  }

  return (
    <form
      onSubmit={submitFresh}
      className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8"
      noValidate
    >
      <button
        type="button"
        onClick={() => setMode("choose")}
        className="text-sm text-ink-faint underline"
      >
        ← 返回
      </button>
      <h2 className="mt-3 text-xl font-bold">建立你的帳號</h2>
      <p className="mt-1 text-sm text-ink-soft">只需要一個暱稱和你的學校資訊。</p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="google-name" className="block text-sm font-medium">
            暱稱或名字
          </label>
          <input
            id="google-name"
            type="text"
            required
            maxLength={40}
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 text-base outline-none focus:border-line-2"
            placeholder="例如：小明"
          />
        </div>
        <div>
          <label htmlFor="google-school" className="block text-sm font-medium">
            學校
          </label>
          <input
            id="google-school"
            type="text"
            required
            maxLength={60}
            autoComplete="off"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 text-base outline-none focus:border-line-2"
            placeholder="例如：市立第一高中"
          />
        </div>
        <div>
          <label htmlFor="google-grade" className="block text-sm font-medium">
            年級
          </label>
          <select
            id="google-grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 text-base outline-none focus:border-line-2"
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {createError && (
        <p
          className="mt-4 rounded-lg bg-negative/10 px-3.5 py-2.5 text-sm text-negative"
          role="alert"
        >
          {createError}
        </p>
      )}

      <button
        type="submit"
        disabled={creating}
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {creating ? "建立中…" : "建立帳號並開始"}
      </button>
    </form>
  );
}

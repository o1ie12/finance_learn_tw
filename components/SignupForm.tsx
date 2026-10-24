"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const GRADES = ["高一", "高二", "高三", "其他"];

function errorMessage(code: string | undefined): string {
  switch (code) {
    case "missing_fields":
      return "請填寫暱稱與年級。";
    case "backend_not_configured":
      return "系統的資料庫尚未設定，暫時無法建立帳號。請稍後再試或聯絡老師。";
    case "not_found":
      return "找不到這組代碼，請確認後再輸入一次。";
    case "missing_code":
      return "請輸入你的代碼。";
    default:
      return "發生了一點問題，請再試一次。";
  }
}

export default function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState(GRADES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // returning student
  const [resumeCode, setResumeCode] = useState("");
  const [resuming, setResuming] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, school, grade }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(errorMessage(data?.error));
        return;
      }
      setCode(data.access_code as string);
    } catch {
      setError("網路連線出了問題，請再試一次。");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResume(e: React.FormEvent) {
    e.preventDefault();
    if (resuming) return;
    setResumeError(null);
    setResuming(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_code: resumeCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResumeError(errorMessage(data?.error));
        return;
      }
      router.push(typeof data?.destination === "string" ? data.destination : "/today");
    } catch {
      setResumeError("網路連線出了問題，請再試一次。");
    } finally {
      setResuming(false);
    }
  }

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  // --- Success view: show the access code ---
  if (code) {
    return (
      <div
        className="rounded-[32px] border border-white/80 bg-white/70 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.95),0_18px_48px_rgba(20,23,26,.09)] [backdrop-filter:var(--glass-blur)] sm:p-8"
        aria-live="polite"
      >
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-line-3">
          帳號已建立
        </p>
        <h2 className="mt-2 text-2xl font-bold">這是你的專屬代碼</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
          把它記下來或拍照存好。換一台電腦或手機時，用它就能找回你的進度——沒有它就無法復原。
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-ink/30 bg-bg px-5 py-4">
          <span className="money text-3xl font-semibold tracking-[0.3em]">
            {code}
          </span>
          <button
            type="button"
            onClick={copyCode}
            className="shrink-0 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm font-medium hover:border-ink"
          >
            {copied ? "已複製" : "複製"}
          </button>
        </div>

        {/* A new account sets a goal once (今天 sends it to the goal step),
            then rides on to 今天. */}
        <Link
          href="/today"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          上車
        </Link>
      </div>
    );
  }

  // --- Create + resume forms ---
  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="rounded-[32px] border border-white/80 bg-white/70 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.95),0_18px_48px_rgba(20,23,26,.09)] [backdrop-filter:var(--glass-blur)] sm:p-8"
        noValidate
      >
        <h2 className="text-[22px] font-extrabold">你的學習卡</h2>
        <p className="mt-1 text-sm text-ink-soft">
          只需要暱稱，學校選填。不收真實姓名、電話或金融帳號。
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              暱稱或名字
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={40}
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 h-[52px] w-full rounded-[14px] border border-black/[.14] bg-white px-4 text-base outline-none focus:border-[#0070bd]"
              placeholder="例如：小明"
            />
          </div>

          <div>
            <label htmlFor="school" className="block text-sm font-medium">
              學校（選填）
            </label>
            <input
              id="school"
              name="school"
              type="text"
              maxLength={60}
              autoComplete="off"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="mt-2 h-[52px] w-full rounded-[14px] border border-black/[.14] bg-white px-4 text-base outline-none focus:border-[#0070bd]"
              placeholder="例如：市立第一高中"
            />
          </div>

          <div>
            <label htmlFor="grade" className="block text-sm font-medium">
              年級
            </label>
            <select
              id="grade"
              name="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-2 h-[52px] w-full rounded-[14px] border border-black/[.14] bg-white px-4 text-base outline-none focus:border-[#0070bd]"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p
            className="mt-4 rounded-lg bg-negative/10 px-3.5 py-2.5 text-sm text-negative"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-full bg-ink px-6 text-[17px] font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "建立中…" : "建立並上車"}
        </button>
      </form>

      <form
        id="login"
        onSubmit={handleResume}
        className="rounded-[32px] border border-white/80 bg-white/70 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.95),0_18px_48px_rgba(20,23,26,.09)] [backdrop-filter:var(--glass-blur)] sm:p-8"
        noValidate
      >
        <h2 className="text-lg font-bold">已經有代碼了？</h2>
        <p className="mt-1 text-sm text-ink-soft">
          在另一台裝置上輸入代碼，接續你的進度。
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="resume-code" className="sr-only">
            你的代碼
          </label>
          <input
            id="resume-code"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            maxLength={6}
            value={resumeCode}
            onChange={(e) => setResumeCode(e.target.value.toUpperCase())}
            className="money h-[52px] w-full flex-1 rounded-[14px] border border-black/[.14] bg-white px-4 text-lg tracking-[0.2em] outline-none focus:border-[#0070bd]"
            placeholder="輸入 6 碼"
          />
          <button
            type="submit"
            disabled={resuming}
            className="h-[52px] shrink-0 rounded-full border border-ink bg-surface px-6 text-base font-semibold hover:bg-ink hover:text-white disabled:opacity-60"
          >
            {resuming ? "查詢中…" : "找回進度"}
          </button>
        </div>
        {resumeError && (
          <p
            className="mt-3 rounded-lg bg-negative/10 px-3.5 py-2.5 text-sm text-negative"
            role="alert"
          >
            {resumeError}
          </p>
        )}
      </form>
    </div>
  );
}

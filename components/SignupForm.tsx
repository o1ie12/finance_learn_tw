"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const GRADES = ["高一", "高二", "高三", "其他"];

function errorMessage(code: string | undefined): string {
  switch (code) {
    case "missing_fields":
      return "請填寫暱稱、學校與年級。";
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

  // 9c — optional "email me my code" fallback
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<
    { ok: true; stub: boolean } | { ok: false; message: string } | null
  >(null);

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
      router.push("/dashboard");
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

  async function sendCodeEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!code || emailSending) return;
    setEmailResult(null);
    setEmailSending(true);
    try {
      const res = await fetch("/api/email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email: emailInput }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEmailResult({
          ok: false,
          message:
            data?.error === "invalid_email"
              ? "這個 email 格式怪怪的，再檢查一次。"
              : "寄送時發生問題，請再試一次，或直接把代碼記下來。",
        });
        return;
      }
      setEmailResult({ ok: true, stub: Boolean(data.stub) });
    } catch {
      setEmailResult({
        ok: false,
        message: "網路連線出了問題，請再試一次。",
      });
    } finally {
      setEmailSending(false);
    }
  }

  // --- Success view: show the access code ---
  if (code) {
    return (
      <div
        className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8"
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

        {!showEmailForm && !emailResult && (
          <button
            type="button"
            onClick={() => setShowEmailForm(true)}
            className="mt-3 text-sm font-medium text-line-2 underline"
          >
            也想寄一份到 email 備份？
          </button>
        )}

        {showEmailForm && !emailResult && (
          <form
            onSubmit={sendCodeEmail}
            className="mt-3 flex flex-col gap-2 sm:flex-row"
            noValidate
          >
            <label htmlFor="backup-email" className="sr-only">
              備份用 email
            </label>
            <input
              id="backup-email"
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="你的 email"
              className="w-full flex-1 rounded-lg border border-hairline bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-line-2"
            />
            <button
              type="submit"
              disabled={emailSending}
              className="shrink-0 rounded-lg border border-ink px-4 py-2.5 text-sm font-semibold hover:bg-ink hover:text-white disabled:opacity-60"
            >
              {emailSending ? "寄送中…" : "寄給我"}
            </button>
          </form>
        )}

        {emailResult && (
          <p
            className={`mt-3 rounded-lg px-3.5 py-2.5 text-sm ${
              emailResult.ok
                ? "bg-positive/10 text-positive"
                : "bg-negative/10 text-negative"
            }`}
            role="status"
          >
            {emailResult.ok
              ? "代碼已經寄出了，記得檢查收件匣。"
              : emailResult.message}
          </p>
        )}

        <p className="mt-3 text-xs text-ink-faint">
          我們只會用這個 email 寄這一封信，不會儲存它或用在其他地方。
        </p>

        <Link
          href="/course"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          開始上第一課
        </Link>
      </div>
    );
  }

  // --- Create + resume forms ---
  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8"
        noValidate
      >
        <h2 className="text-xl font-bold">建立你的帳號</h2>
        <p className="mt-1 text-sm text-ink-soft">
          免密碼、免 email。只需要一個暱稱和你的學校資訊。
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
              className="mt-1.5 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 text-base outline-none focus:border-line-2"
              placeholder="例如：小明"
            />
          </div>

          <div>
            <label htmlFor="school" className="block text-sm font-medium">
              學校
            </label>
            <input
              id="school"
              name="school"
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
            <label htmlFor="grade" className="block text-sm font-medium">
              年級
            </label>
            <select
              id="grade"
              name="grade"
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
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "建立中…" : "建立帳號並開始"}
        </button>
      </form>

      <form
        onSubmit={handleResume}
        className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8"
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
            className="money w-full flex-1 rounded-lg border border-hairline bg-bg px-3.5 py-2.5 text-lg tracking-[0.2em] outline-none focus:border-line-2"
            placeholder="輸入 6 碼"
          />
          <button
            type="submit"
            disabled={resuming}
            className="shrink-0 rounded-lg border border-ink bg-surface px-5 py-2.5 text-base font-semibold hover:bg-ink hover:text-white disabled:opacity-60"
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

"use client";

import { useState } from "react";

/**
 * The student's access code, masked until they ask to see it.
 *
 * The dashboard is the screen a student screenshots to show a friend their
 * progress, and the code is the credential that resumes their account on any
 * device. Masking by default keeps the resume flow — one tap and it is there
 * to copy — without putting the credential in every screenshot. Revealed
 * state is deliberately not persisted: a reload masks it again.
 */
export default function AccessCodeReveal({ code }: { code: string }) {
  const [shown, setShown] = useState(false);
  const masked = "•".repeat(code.length);
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-hairline bg-surface py-0.5 pl-3 pr-0.5">
      <span
        className="money text-sm tracking-[0.15em]"
        aria-label={shown ? `你的代碼 ${code}` : "你的代碼（已隱藏）"}
      >
        {shown ? code : masked}
      </span>
      {/* 44x44 is the usual minimum touch target, and this one guards a
          credential on the screen most likely to be used on a phone. The
          label stays small; the hit area does not. */}
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-pressed={shown}
        aria-label={shown ? "隱藏代碼" : "顯示代碼"}
        className="flex h-11 min-w-11 items-center justify-center rounded-md px-2 text-xs font-semibold text-ink-soft hover:bg-black/5 hover:text-ink"
      >
        {shown ? "隱藏" : "顯示"}
      </button>
    </span>
  );
}

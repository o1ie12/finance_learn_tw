"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { emitSessionChange } from "@/lib/sessionEvents";

/**
 * Signs out (DELETE /api/session clears the session cookies) and refreshes.
 * `label`: the navbar says 登出; settings keeps 切換帳號.
 */
export default function SignOutButton({ label = "切換帳號", className }: { label?: string; className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/session", { method: "DELETE" });
      emitSessionChange();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={loading}
      className={
        className ??
        "rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-ink hover:text-ink disabled:opacity-60"
      }
    >
      {loading ? "登出中…" : label}
    </button>
  );
}

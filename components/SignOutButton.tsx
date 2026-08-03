"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/session", { method: "DELETE" });
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
      className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-ink hover:text-ink disabled:opacity-60"
    >
      {loading ? "登出中…" : "切換帳號"}
    </button>
  );
}

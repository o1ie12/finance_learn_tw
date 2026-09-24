"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SelectCard, SubmitButton } from "@/components/sims/ui";
import type { StudentMode } from "@/lib/types";

/**
 * The one-time choice of how a student works through a line.
 *
 * Reuses the simulation SelectCard rather than introducing another card
 * style, so this reads as part of the app rather than a bolted-on settings
 * screen. Neutral ink accent instead of a line colour, because the choice is
 * not about any one line.
 *
 * Both options are framed by what the student will DO, not by what the mode
 * is called. Nobody picks "sim_first"; they pick "skip the reading".
 */

// Not a line colour — this choice sits above the lines.
const ACCENT = "#14171a";

export default function ModePicker({
  current,
  redirectTo = "/dashboard",
}: {
  current: StudentMode | null;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<StudentMode>(current ?? "full");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (saving) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (res.status === 401) {
        setError("請先建立帳號或輸入代碼。");
        return;
      }
      if (!res.ok) {
        setError("儲存時發生問題，請再試一次。");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("網路連線出了問題，請再試一次。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <SelectCard
          name="mode"
          selected={mode === "full"}
          onSelect={() => setMode("full")}
          color={ACCENT}
          title="一站一站走完"
          sub="每一站先讀完、做個小測驗，最後再用整條線學到的東西跑一次模擬。"
        />
        <SelectCard
          name="mode"
          selected={mode === "sim_first"}
          onSelect={() => setMode("sim_first")}
          color={ACCENT}
          title="直接開始模擬"
          sub="跳過閱讀，直接做決定。需要知道的重點會在模擬裡直接告訴你。"
        />
      </div>

      {error && (
        <p
          className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative"
          role="alert"
        >
          {error}
        </p>
      )}

      <SubmitButton
        onClick={save}
        disabled={false}
        submitting={saving}
        idleLabel={current ? "換成這個方式" : "就這樣開始"}
        disabledLabel=""
      />

      <p className="text-xs leading-relaxed text-ink-faint">
        兩種方式看的是同一套內容，只是順序不同。隨時可以換，進度和戳章都不會不見。
      </p>
    </div>
  );
}

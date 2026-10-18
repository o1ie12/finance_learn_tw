"use client";

/**
 * Dev-only preview of <TrainTransition>. 404 in production builds.
 */

import { useState } from "react";
import { notFound } from "next/navigation";

import TrainTransition from "@/components/transition/TrainTransition";
import { getLine } from "@/lib/lines";

const FROM_LINE = getLine("xinyong");
const TO_LINE = getLine("touzi");

/* Placeholder back-view character (the real avatar is built elsewhere). */
function PlaceholderCharacter() {
  return (
    <svg viewBox="0 0 220 320" aria-hidden="true">
      <ellipse cx="110" cy="308" rx="70" ry="9" fill="#16202A" opacity="0.18" />
      <rect x="86" y="206" width="22" height="92" rx="9" fill="#33475B" />
      <rect x="112" y="206" width="22" height="92" rx="9" fill="#33475B" />
      <rect x="78" y="290" width="34" height="14" rx="7" fill="#F4F6F8" />
      <rect x="108" y="290" width="34" height="14" rx="7" fill="#F4F6F8" />
      <rect x="46" y="126" width="24" height="80" rx="12" fill="#2F6FDB" />
      <rect x="150" y="126" width="24" height="80" rx="12" fill="#2F6FDB" />
      <rect x="64" y="116" width="92" height="104" rx="34" fill="#2F6FDB" />
      <rect x="84" y="180" width="52" height="22" rx="10" fill="#285FBE" />
      <ellipse cx="110" cy="120" rx="34" ry="12" fill="#285FBE" />
      <circle cx="70" cy="82" r="9" fill="#EDC09A" />
      <circle cx="150" cy="82" r="9" fill="#EDC09A" />
      <ellipse cx="110" cy="78" rx="40" ry="42" fill="#2A1E17" />
    </svg>
  );
}

type Run = { id: number; seenFullRides: number; startedAt: number };

export default function TransitionPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Preview />;
}

function Preview() {
  const [run, setRun] = useState<Run | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const play = (seenFullRides: number) =>
    setRun({ id: Date.now(), seenFullRides, startedAt: performance.now() });

  const append = (line: string) => setLog((l) => [line, ...l].slice(0, 12));

  return (
    <main className="mx-auto max-w-2xl p-6 font-sans">
      <h1 className="text-2xl font-bold">TrainTransition preview</h1>
      <p className="mt-2 text-sm">開發用頁面，正式環境回傳 404。</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="min-h-11 rounded-xl bg-neutral-900 px-5 py-3 font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          onClick={() => play(0)}
        >
          完整版（2.6 秒）
        </button>
        <button
          type="button"
          className="min-h-11 rounded-xl bg-neutral-900 px-5 py-3 font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          onClick={() => play(3)}
        >
          簡短版（已看 3 次，0.4 秒）
        </button>
      </div>

      <p className="mt-4 text-sm leading-relaxed">
        減少動態：在系統設定開啟「減少動態效果」，或在 DevTools 的 Rendering
        面板模擬 prefers-reduced-motion: reduce，再按任一按鈕。畫面不會移動，只以
        0.12 秒淡入下一站卡片。
      </p>

      <h2 className="mt-6 font-bold">Callback log</h2>
      <ul className="mt-2 text-sm tabular-nums">
        {log.map((line, i) => (
          <li key={`${i}-${line}`}>{line}</li>
        ))}
      </ul>

      {run && FROM_LINE && TO_LINE && (
        <TrainTransition
          key={run.id}
          from={{
            lineColor: FROM_LINE.color,
            stationName: "帳單站",
            lineEnName: FROM_LINE.enName,
            stationCode: "Station 2",
          }}
          to={{
            lineName: TO_LINE.name,
            lineColor: TO_LINE.color,
            stationName: "第一站",
            blurb: "先檢查：你有緊急預備金嗎？",
          }}
          character={<PlaceholderCharacter />}
          seenFullRides={run.seenFullRides}
          onFullRideComplete={() => append("onFullRideComplete")}
          onDone={() => {
            append(
              `onDone at ${Math.round(performance.now() - run.startedAt)}ms (seenFullRides=${run.seenFullRides})`,
            );
            setRun(null);
          }}
        />
      )}
    </main>
  );
}

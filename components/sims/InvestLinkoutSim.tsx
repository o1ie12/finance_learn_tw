"use client";

import { useState } from "react";
import {
  FOCUS_OPTIONS,
  SURPRISE_OPTIONS,
  INTENT_OPTIONS,
  type FocusId,
  type SurpriseId,
  type IntentId,
  type InvestReflectionOutcome,
} from "@/lib/sims/investReflection";
import { formatNT } from "@/components/Money";
import { Row, SelectCard, SubmitButton, OutcomeActions } from "@/components/sims/ui";
import { useSimRun } from "@/components/sims/useSimRun";
import CoachPanel from "@/components/CoachPanel";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";
import type { OutcomeTitle } from "@/lib/outcomeTitle";

/**
 * 投資線 in linkout mode: framing, the task, then the reflection.
 *
 * Only rendered when lib/investLinkout.ts is switched on, which it is not.
 * The destination URL arrives as a prop rather than being read here, so this
 * component cannot render a link to a URL the config refused to supply.
 */
export default function InvestLinkoutSim({
  color,
  colorInk,
  toolUrl,
  investable,
}: {
  color: string;
  colorInk: string;
  /** Confirmed by a human, never guessed. Absent means this never renders. */
  toolUrl: string;
  investable?: { amount: number; fromSavingsLine: boolean; inShortfall: boolean };
}) {
  const [stage, setStage] = useState<"brief" | "reflect">("brief");
  const [planned, setPlanned] = useState(0);
  const [focus, setFocus] = useState<FocusId | null>(null);
  const [surprise, setSurprise] = useState<SurpriseId | null>(null);
  const [intent, setIntent] = useState<IntentId | null>(null);
  const { submitting, error, result, submit, reset } =
    useSimRun<InvestReflectionOutcome>("touzi");

  const available = investable?.amount ?? 0;

  function handleReset() {
    setStage("brief");
    setPlanned(0);
    setFocus(null);
    setSurprise(null);
    setIntent(null);
    reset();
  }

  if (result) {
    return (
      <ReflectionOutcomeView
        outcome={result.outcome}
        runId={result.runId}
        color={color}
        colorInk={colorInk}
        onReset={handleReset}
        outcomeTitle={result.outcomeTitle}
        pointsAwarded={result.pointsAwarded}
      />
    );
  }

  if (stage === "brief") {
    return (
      <div className="space-y-8">
        <section>
          <p className="text-sm leading-relaxed text-ink-soft">
            根據你目前的財務狀況，你大概有{" "}
            <span className="money font-medium text-ink">{formatNT(available)}</span>
            {investable?.fromSavingsLine
              ? "（你在存錢線實際存下來的）"
              : "（預設金額——去存錢線跑一次，這個數字就會變成你自己的）"}
            可以拿來練習。
          </p>
          {investable?.inShortfall && (
            <p className="mt-3 rounded-lg bg-alert/10 px-4 py-3 text-sm leading-relaxed text-ink/90">
              提醒一下：你在消費線的那個月是差錢收尾的。先把月底補起來，通常比先開始投資更要緊。
            </p>
          )}
        </section>

        <section
          className="rounded-2xl bg-surface p-5"
          style={{ borderLeft: `4px solid ${color}` }}
        >
          <p
            className="font-display text-xs font-bold uppercase tracking-wider"
            style={{ color: colorInk }}
          >
            這一站要做的事
          </p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-ink/90">
            <li>打開證交所的模擬工具，用剛剛那個金額試著配置看看。</li>
            <li>至少看兩種不同的標的，比較它們的波動和費用。</li>
            <li>回到這裡，回答三個問題。</li>
          </ol>
          <a
            href={toolUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center rounded-xl px-5 py-3 text-[15px] font-bold text-white"
            style={{ background: color }}
          >
            開啟證交所模擬工具 <span aria-hidden="true">↗</span>
          </a>
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            這個連結會開新分頁，你在那邊做的事不會傳回這裡——回來之後填的內容，才是這一站記錄的東西。
          </p>
        </section>

        <SubmitButton
          onClick={() => setStage("reflect")}
          disabled={false}
          submitting={false}
          idleLabel="我做完了，回來作答"
          disabledLabel=""
        />
      </div>
    );
  }

  const ready = focus !== null && surprise !== null && intent !== null;

  return (
    <div className="space-y-8">
      <section>
        <label
          htmlFor="planned"
          className="font-display text-xs font-bold uppercase tracking-[0.14em] text-ink-faint"
        >
          你決定投入多少？
        </label>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm text-ink-soft">
            你手上大約有 {formatNT(available)}
          </span>
          <span className="money text-2xl font-black">{formatNT(planned)}</span>
        </div>
        <input
          id="planned"
          type="range"
          min={0}
          max={Math.max(available * 1.5, 10000)}
          step={1000}
          value={planned}
          onChange={(e) => setPlanned(Number(e.target.value))}
          className="mt-3 w-full"
          style={{ accentColor: color }}
        />
        {/* Deliberately allows more than they have. The point is to see what
            they choose, not to prevent the choice — a slider that stops at
            the "right" answer teaches nothing about over-committing. */}
        {planned > available && (
          <p className="mt-2 text-sm text-alert">
            這超過你目前手上的金額了。還是可以送出——等一下會算給你看差多少。
          </p>
        )}
      </section>

      <fieldset>
        <legend className="text-xl font-bold">你主要看的是什麼？</legend>
        <div className="mt-3 space-y-3">
          {FOCUS_OPTIONS.map((o) => (
            <SelectCard
              key={o.id}
              name="focus"
              selected={focus === o.id}
              onSelect={() => setFocus(o.id)}
              color={color}
              title={o.label}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold">最讓你意外的是什麼？</legend>
        <div className="mt-3 space-y-3">
          {SURPRISE_OPTIONS.map((o) => (
            <SelectCard
              key={o.id}
              name="surprise"
              selected={surprise === o.id}
              onSelect={() => setSurprise(o.id)}
              color={color}
              title={o.label}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold">之後你會真的開始嗎？</legend>
        <div className="mt-3 space-y-3">
          {INTENT_OPTIONS.map((o) => (
            <SelectCard
              key={o.id}
              name="intent"
              selected={intent === o.id}
              onSelect={() => setIntent(o.id)}
              color={color}
              title={o.label}
            />
          ))}
        </div>
      </fieldset>

      {error && (
        <p
          className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative"
          role="alert"
        >
          {error}
        </p>
      )}

      <SubmitButton
        onClick={() =>
          ready && submit({ plannedAmount: planned, focus, surprise, intent })
        }
        disabled={!ready}
        submitting={submitting}
        idleLabel="送出"
        disabledLabel="三題都要回答"
      />
    </div>
  );
}

function ReflectionOutcomeView({
  outcome,
  runId,
  color,
  colorInk,
  onReset,
  outcomeTitle,
  pointsAwarded,
}: {
  outcome: InvestReflectionOutcome;
  runId: string;
  color: string;
  colorInk: string;
  onReset: () => void;
  outcomeTitle: OutcomeTitle | null;
  pointsAwarded: number;
}) {
  const surpriseLabel = SURPRISE_OPTIONS.find((o) => o.id === outcome.surprise)?.label;

  return (
    <div className="space-y-8">
      <PlatformPanel color={color} eyebrow="配置站 · 你的決定">
        {outcome.beyondPosition ? (
          <>
            <p className="text-sm text-white/70">超出你手上的金額</p>
            <h2 className="mt-1 text-4xl font-black">
              <span className="money">{formatNT(outcome.overCommitment)}</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/85">
              你規劃投入 {formatNT(outcome.plannedAmount)}，但目前大約只有{" "}
              {formatNT(outcome.suggestedAmount)}。
            </p>
          </>
        ) : outcome.hasInvested ? (
          <>
            <p className="text-sm text-white/70">你規劃投入</p>
            <h2 className="mt-1 text-4xl font-black">
              <span className="money">{formatNT(outcome.plannedAmount)}</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/85">
              佔你手上金額的 {Math.round(outcome.shareOfAvailable * 100)}%。
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-black">這次先不投入</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/85">
              不投入也是一個決定，而且是一個需要理由的決定。
            </p>
          </>
        )}
        <StampReveal outcomeTitle={outcomeTitle} pointsAwarded={pointsAwarded} />
      </PlatformPanel>

      <section>
        <h3 className="text-lg font-bold">你的紀錄</h3>
        <div className="mt-3 rounded-2xl border border-hairline bg-surface p-5">
          <dl className="divide-y divide-hairline">
            <Row label="你手上大約有" value={outcome.suggestedAmount} strong />
            <Row label="你規劃投入" value={outcome.plannedAmount} />
            {outcome.beyondPosition && (
              <Row label="超出的部分" value={outcome.overCommitment} sign="minus" />
            )}
          </dl>
        </div>
      </section>

      <section
        className="rounded-2xl bg-surface p-5"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <p
          className="font-display text-xs font-bold uppercase tracking-wider"
          style={{ color: colorInk }}
        >
          你注意到的事
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
          「{surpriseLabel}」——真正在工具裡看過一次，比讀十篇介紹更容易記住。這一站不要求你現在就開始投資，只要求你知道自己在看什麼。
        </p>
      </section>

      <p className="rounded-lg bg-line-1/10 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        這一站使用的是證交所提供的公開工具，本平台不經手任何資金，也不會取得你在該工具上的任何資料。所有情境與數字皆為教學用途，非個人化投資或財務建議。
      </p>

      <CoachPanel runId={runId} />
      <OutcomeActions onReset={onReset} resetLabel="再做一次" />
    </div>
  );
}

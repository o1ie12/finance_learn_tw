"use client";

import { useMemo, useState } from "react";
import {
  computeInvesting,
  INVEST_CHOICES,
  getInvestChoice,
  INVEST_START,
  taxRateLabel,
  type InvestChoiceId,
  type InvestOutcome,
  type InvestBand,
} from "@/lib/sims/investing";
import { formatNT } from "@/components/Money";
import { SelectCard, SubmitButton, OutcomeActions } from "@/components/sims/ui";
import { useSimRun } from "@/components/sims/useSimRun";
import CoachPanel from "@/components/CoachPanel";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";
import type { OutcomeTitle } from "@/lib/outcomeTitle";

export default function InvestingSim({
  color,
  colorInk,
  investable,
}: {
  color: string;
  colorInk: string;
  /**
   * What the student actually has, resolved on the server from their
   * profile. Shown, not enforced: seeing your real position is the point,
   * being locked out of a choice because of it is not.
   */
  investable?: { amount: number; fromSavingsLine: boolean; inShortfall: boolean };
}) {
  const start = investable?.amount ?? INVEST_START;
  const [choice, setChoice] = useState<InvestChoiceId>("buy0050");
  const [ipo, setIpo] = useState(false);
  const { submitting, error, result, submit, reset } =
    useSimRun<InvestOutcome>("touzi");

  const preview = useMemo(() => computeInvesting({ choice, ipo }), [choice, ipo]);

  if (result) {
    return (
      <InvestOutcomeView
        outcome={result.outcome}
        runId={result.runId}
        color={color}
        colorInk={colorInk}
        onReset={reset}
        outcomeTitle={result.outcomeTitle}
        pointsAwarded={result.pointsAwarded}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm leading-relaxed text-ink-soft">
          根據你目前的財務狀況，你大概有{" "}
          <span className="money font-medium text-ink">{formatNT(start)}</span>
          {investable?.fromSavingsLine
            ? "（你在存錢線實際存下來的）"
            : "（預設金額——去存錢線跑一次，這個數字就會變成你自己的）"}
          。這筆錢，你想怎麼處理？
        </p>
        {investable?.inShortfall && (
          <p className="mt-3 rounded-lg bg-alert/10 px-4 py-3 text-sm leading-relaxed text-ink/90">
            提醒一下：你在消費線的那個月是差錢收尾的。手上有錢可以投資，跟每個月撐不撐得住，是兩件不同的事——先把月底補起來，通常比先開始投資更要緊。
          </p>
        )}
      </section>

      <fieldset>
        <legend className="text-xl font-bold">你的選擇</legend>
        <div className="mt-4 space-y-3">
          {INVEST_CHOICES.map((c) => (
            <SelectCard
              key={c.id}
              name="choice"
              selected={choice === c.id}
              onSelect={() => setChoice(c.id)}
              color={color}
              title={c.label}
              sub={c.blurb}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold">要不要參加抽籤？</legend>
        <p className="mt-1 text-sm text-ink-soft">
          抽籤（申購）只花一點手續費，沒抽中會退錢，是很低風險的第一次接觸。
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIpo(true)}
            aria-pressed={ipo}
            className={`rounded-xl border-2 px-4 py-3 text-center font-semibold transition-colors ${ipo ? "bg-surface" : "border-hairline bg-surface hover:border-ink/30"}`}
            style={ipo ? { borderColor: color } : undefined}
          >
            參加抽籤
          </button>
          <button
            type="button"
            onClick={() => setIpo(false)}
            aria-pressed={!ipo}
            className={`rounded-xl border-2 px-4 py-3 text-center font-semibold transition-colors ${!ipo ? "bg-surface" : "border-hairline bg-surface hover:border-ink/30"}`}
            style={!ipo ? { borderColor: color } : undefined}
          >
            這次不參加
          </button>
        </div>
      </fieldset>

      <section className="rounded-2xl border border-hairline bg-surface p-5">
        <p className="text-sm leading-relaxed text-ink-soft">
          <span className="font-semibold text-ink">重要觀念：</span>
          投資沒有保證數字。同一筆錢，一年後可能變多、也可能變少——我們會給你一個「範圍」，而不是單一答案。
          {preview.chosen.sellable &&
            `（而且只要賣出，就要繳 ${taxRateLabel(preview.chosen.taxRate)} 證交稅——這是 ETF 的稅率，股票是 0.3%。）`}
        </p>
      </section>

      {error && (
        <p className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative" role="alert">
          {error}
        </p>
      )}

      <SubmitButton
        onClick={() => submit({ choice, ipo })}
        disabled={false}
        submitting={submitting}
        idleLabel="看看一年後的範圍"
        disabledLabel=""
      />
    </div>
  );
}

function BandBar({ band, color }: { band: InvestBand; color: string }) {
  if (band.id === "spend") {
    return (
      <p className="money text-lg font-semibold text-ink-soft">
        NT$0（財務上）
      </p>
    );
  }
  if (band.certain) {
    return (
      <p className="money text-lg font-semibold">{formatNT(band.mid)}</p>
    );
  }
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="money text-base text-negative">{formatNT(band.low)}</span>
      <span className="text-ink-faint">→</span>
      <span className="money text-lg font-semibold" style={{ color }}>
        {formatNT(band.mid)}
      </span>
      <span className="text-ink-faint">→</span>
      <span className="money text-base text-positive">{formatNT(band.high)}</span>
    </div>
  );
}

function InvestOutcomeView({
  outcome,
  runId,
  color,
  colorInk,
  onReset,
  outcomeTitle,
  pointsAwarded,
}: {
  outcome: InvestOutcome;
  runId: string;
  color: string;
  colorInk: string;
  onReset: () => void;
  outcomeTitle: OutcomeTitle | null;
  pointsAwarded: number;
}) {
  const c = outcome.chosen;
  const isSpend = c.id === "spend";

  return (
    <div className="space-y-8">
      <PlatformPanel color={color} eyebrow="進場站 · 一年後（範圍）">
        {isSpend ? (
          <>
            <h2 className="text-3xl font-black">你把它花掉了</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/85">
              你換到了當下想要的東西，但這筆 {formatNT(outcome.start)} 就沒有成長的機會了。花或投資沒有絕對對錯——重點是那是不是你有意識的選擇。
            </p>
          </>
        ) : c.certain ? (
          <>
            <h2 className="text-4xl font-black">
              <span className="money">{formatNT(c.mid)}</span>
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/85">
              放定存幾乎不會虧，一年後大約 {formatNT(c.mid)}。穩，但成長最慢。
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-black">
              <span className="money">{formatNT(c.low)}</span>
              <span className="text-white/60"> ~ </span>
              <span className="money">{formatNT(c.high)}</span>
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/85">
              選擇「{c.label}」，一年後這筆 {formatNT(outcome.start)} 可能落在這個範圍，中間值大約{" "}
              <span className="money font-semibold text-white">{formatNT(c.mid)}</span>
              。上下都有可能，這就是風險。
            </p>
          </>
        )}
        <StampReveal outcomeTitle={outcomeTitle} pointsAwarded={pointsAwarded} />
      </PlatformPanel>

      {c.sellable && (
        <section
          className="rounded-2xl bg-surface p-5"
          style={{ borderLeft: `4px solid ${color}` }}
        >
          <p className="font-display text-xs font-bold uppercase tracking-wider" style={{ color: colorInk }}>
            這裡不是美國 · 證交稅
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
            賺到的價差<span className="font-semibold">不課所得稅</span>；但只要你「賣出」，就會按成交金額課{" "}
            <span className="font-semibold">{taxRateLabel(c.taxRate)} 證交稅</span>
            （ETF 的稅率；賣股票是 0.3%），不論賺賠。以中間值 {formatNT(c.mid)} 賣出為例，會被自動收走約{" "}
            <span className="money font-semibold" style={{ color: colorInk }}>
              {formatNT(c.taxOnMidSale)}
            </span>
            ，實拿約 {formatNT(c.netAfterTaxMid)}。
          </p>
        </section>
      )}

      <section aria-labelledby="cmp-heading">
        <h3 id="cmp-heading" className="text-lg font-bold">
          四種選擇，一年後的範圍
        </h3>
        <div className="mt-3 space-y-2">
          {outcome.all.map((b) => {
            const isChosen = b.id === c.id;
            return (
              <div
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border border-hairline bg-surface px-4 py-3"
                style={isChosen ? { borderColor: color } : undefined}
              >
                <span className={isChosen ? "font-bold" : "text-ink-soft"}>
                  {b.label}
                  {isChosen ? "（你的選擇）" : ""}
                </span>
                <BandBar band={b} color={color} />
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          範圍為教學用的示意，不是預測。紅＝悲觀、黑＝中間、綠＝樂觀。
        </p>
      </section>

      <section className="rounded-2xl bg-surface p-5" style={{ borderLeft: `4px solid ${color}` }}>
        <p className="text-sm leading-relaxed text-ink-soft">
          <span className="font-semibold text-ink">抽籤：</span>
          {outcome.ipoNote}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          <span className="font-semibold text-ink">分散風險：</span>
          把錢分散到很多家公司（像 ETF），一家表現不好還有其他家撐著。這是降低風險最基本的方法。
        </p>
      </section>

      <p className="rounded-lg bg-line-1/10 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        ⚠️ 這是教育性的模擬與示意數字，不是個人化的投資建議。真實投資有賺有賠，請自行評估。
      </p>

      <CoachPanel runId={runId} />
      <OutcomeActions onReset={onReset} resetLabel="換個選擇再試一次" />
    </div>
  );
}

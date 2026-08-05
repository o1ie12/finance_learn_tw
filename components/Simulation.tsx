"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  RENT_OPTIONS,
  computeRentOutcome,
  GROSS_SALARY,
  LABOR_INSURANCE,
  NHI_PREMIUM,
  INCOME_TAX,
  NET_SALARY,
  EMPLOYER_PENSION,
  LIVING_COST,
  TPASS_COST,
  TRANSIT_PER_RIDE,
  type RentChoiceId,
  type SimOutcome,
} from "@/lib/simulation";
import { formatNT } from "@/components/Money";
import CoachPanel from "@/components/CoachPanel";

const RENT_COLOR: Record<RentChoiceId, string> = {
  roommates: "#008659",
  studio: "#0070bd",
  central: "#e3002c",
};

interface RunResult {
  runId: string;
  outcome: SimOutcome;
}

function Row({
  label,
  value,
  sign,
  strong,
  tone,
}: {
  label: string;
  value: number;
  sign?: "plus" | "minus";
  strong?: boolean;
  tone?: "negative" | "positive";
}) {
  const prefix = sign === "minus" ? "−" : sign === "plus" ? "+" : "";
  const toneClass =
    tone === "negative"
      ? "text-negative"
      : tone === "positive"
        ? "text-positive"
        : "text-ink";
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt
        className={`text-[15px] ${strong ? "font-bold text-ink" : "text-ink-soft"}`}
      >
        {label}
      </dt>
      <dd
        className={`money text-[15px] ${strong ? "text-lg font-semibold" : ""} ${toneClass}`}
      >
        {prefix}
        {formatNT(value)}
      </dd>
    </div>
  );
}

export default function Simulation() {
  const [rent, setRent] = useState<RentChoiceId | null>(null);
  const [tpass, setTpass] = useState(true);
  const [savingsRate, setSavingsRate] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);

  const preview = useMemo(
    () => (rent ? computeRentOutcome(rent, tpass, savingsRate) : null),
    [rent, tpass, savingsRate],
  );

  async function handleSubmit() {
    if (!rent || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line_slug: "qixin", rent, tpass, savingsRate }),
      });
      if (res.status === 401) {
        setError("請先建立帳號或輸入代碼，才能儲存模擬結果。");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.run_id) {
        setError("計算時發生問題，請再試一次。");
        return;
      }
      setResult({ runId: data.run_id, outcome: data.outcome });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("網路連線出了問題，請再試一次。");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  // ---- Outcome view ----
  if (result) {
    return <Outcome result={result} onReset={reset} />;
  }

  // ---- Builder view ----
  return (
    <div className="space-y-8">
      {/* Salary + deductions (shown automatically, before any choice) */}
      <section aria-labelledby="salary-heading">
        <h2 id="salary-heading" className="text-xl font-bold">
          你的月薪與扣除額
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          起薪固定為{" "}
          <span className="money font-medium text-ink">
            {formatNT(GROSS_SALARY)}
          </span>
          （台灣大學畢業生平均起薪）。以下先自動扣掉法定項目：
        </p>
        <dl className="mt-4 rounded-2xl border border-hairline bg-surface px-5 py-3">
          <Row label="月薪（稅前）" value={GROSS_SALARY} />
          <div className="border-t border-hairline" />
          <Row label="勞保（自付額）" value={LABOR_INSURANCE} sign="minus" />
          <Row label="健保（自付額）" value={NHI_PREMIUM} sign="minus" />
          <Row label="所得稅（此薪資約為 0）" value={INCOME_TAX} sign="minus" />
          <div className="border-t border-hairline" />
          <Row label="實際入帳（可用）" value={NET_SALARY} strong />
        </dl>
        <p className="mt-2 rounded-lg bg-line-3/10 px-4 py-2.5 text-xs leading-relaxed text-ink-soft">
          另外，雇主每月還提繳{" "}
          <span className="money font-medium text-ink">
            {formatNT(EMPLOYER_PENSION)}
          </span>
          （月薪 6%）到你的勞退專戶——這是額外的，不從薪水扣。
        </p>
      </section>

      {/* Rent: three stations on a line */}
      <fieldset aria-describedby="rent-desc">
        <legend className="text-xl font-bold">第一個決定：住哪裡？</legend>
        <p id="rent-desc" className="mt-1 text-sm text-ink-soft">
          房租是最大的固定開銷。三個選擇，像路線上的三站：
        </p>
        <div className="mt-4 space-y-3">
          {RENT_OPTIONS.map((opt) => {
            const selected = rent === opt.id;
            const color = RENT_COLOR[opt.id];
            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 bg-surface p-4 transition-colors ${
                  selected ? "" : "border-hairline hover:border-ink/30"
                }`}
                style={selected ? { borderColor: color } : undefined}
              >
                <input
                  type="radio"
                  name="rent"
                  value={opt.id}
                  checked={selected}
                  onChange={() => setRent(opt.id)}
                  className="sr-only"
                />
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: selected ? color : "var(--color-bg)",
                    boxShadow: selected
                      ? undefined
                      : "0 0 0 3px var(--color-hairline)",
                  }}
                  aria-hidden="true"
                >
                  {selected && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-bold" style={{ color }}>
                      {opt.label}
                    </span>
                    <span className="money font-semibold">
                      {formatNT(opt.cost)} / 月
                    </span>
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-soft">
                    {opt.area}——{opt.blurb}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Transit */}
      <fieldset>
        <legend className="text-xl font-bold">交通：要不要買 TPASS？</legend>
        <p className="mt-1 text-sm text-ink-soft">
          TPASS 月票 {formatNT(TPASS_COST)}，涵蓋捷運、公車與 YouBike
          前 30 分鐘；不買則逐次付車資（估算 {formatNT(TRANSIT_PER_RIDE)} / 月）。
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTpass(true)}
            aria-pressed={tpass}
            className={`rounded-xl border-2 px-4 py-3 text-left transition-colors ${
              tpass
                ? "border-line-2 bg-line-2/5"
                : "border-hairline bg-surface hover:border-ink/30"
            }`}
          >
            <span className="block font-semibold">TPASS 月票</span>
            <span className="money mt-0.5 block text-sm text-ink-soft">
              {formatNT(TPASS_COST)} / 月
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTpass(false)}
            aria-pressed={!tpass}
            className={`rounded-xl border-2 px-4 py-3 text-left transition-colors ${
              !tpass
                ? "border-line-2 bg-line-2/5"
                : "border-hairline bg-surface hover:border-ink/30"
            }`}
          >
            <span className="block font-semibold">逐次付車資</span>
            <span className="money mt-0.5 block text-sm text-ink-soft">
              約 {formatNT(TRANSIT_PER_RIDE)} / 月
            </span>
          </button>
        </div>
      </fieldset>

      {/* Savings */}
      <section aria-labelledby="savings-heading">
        <h2 id="savings-heading" className="text-xl font-bold">
          每月結餘，要存下多少比例？
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          扣掉房租、交通與生活費後剩下的錢，你想存下幾成？
        </p>
        <div className="mt-4 rounded-2xl border border-hairline bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <label htmlFor="savings" className="text-sm font-medium">
              儲蓄比例
            </label>
            <output
              htmlFor="savings"
              className="money text-2xl font-semibold text-line-3"
            >
              {savingsRate}%
            </output>
          </div>
          <input
            id="savings"
            type="range"
            min={0}
            max={100}
            step={5}
            value={savingsRate}
            onChange={(e) => setSavingsRate(Number(e.target.value))}
            className="mt-3 w-full accent-line-3"
          />
          <div className="mt-1 flex justify-between text-xs text-ink-faint">
            <span>0%（全部花掉）</span>
            <span>100%（全部存起來）</span>
          </div>
        </div>
      </section>

      {/* Live preview */}
      <section
        aria-live="polite"
        className="rounded-2xl border border-hairline bg-surface p-5"
      >
        {!preview ? (
          <p className="text-sm text-ink-soft">
            選好上面的住處後，這裡會即時算出你每月剩多少、一年能存多少。
          </p>
        ) : preview.deficit ? (
          <div>
            <p className="text-sm font-semibold text-negative">
              目前的選擇入不敷出
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              房租、交通與生活費加起來，比你每月實拿的{" "}
              <span className="money">{formatNT(NET_SALARY)}</span> 還多，
              每月短缺{" "}
              <span className="money font-semibold text-negative">
                {formatNT(Math.abs(preview.leftover))}
              </span>
              。試試更便宜的住處。
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <p className="text-xs text-ink-faint">每月結餘</p>
              <p className="money text-lg font-semibold">
                {formatNT(preview.leftover)}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-faint">每月存下</p>
              <p className="money text-lg font-semibold text-line-3">
                {formatNT(preview.monthlySavings)}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-faint">一年約可存</p>
              <p className="money text-lg font-semibold text-line-3">
                {formatNT(preview.annualSavings)}
              </p>
            </div>
          </div>
        )}
      </section>

      {error && (
        <p
          className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!rent || submitting}
        className="inline-flex w-full items-center justify-center rounded-xl bg-ink px-6 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "計算中…" : !rent ? "請先選擇住處" : "看看一年後的結果"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
function Outcome({
  result,
  onReset,
}: {
  result: RunResult;
  onReset: () => void;
}) {
  const { outcome } = result;
  const chosen = outcome.chosen;
  const chosenOpt = RENT_OPTIONS.find((o) => o.id === chosen.rent)!;

  return (
    <div className="space-y-8">
      {/* Headline */}
      <section
        className="rounded-3xl p-6 text-white sm:p-8"
        style={{ background: chosen.deficit ? "#7a1020" : "#151a21" }}
      >
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-white/70">
          起薪站 · 一年後
        </p>
        {chosen.deficit ? (
          <>
            <h2 className="mt-2 text-3xl font-black">入不敷出</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/85">
              以「{chosenOpt.label}」的房租，扣掉交通與生活費後，每月短缺{" "}
              <span className="money font-semibold text-white">
                {formatNT(Math.abs(chosen.leftover))}
              </span>
              ，一年下來無法存錢，還會透支。
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-2 text-4xl font-black">
              <span className="money">{formatNT(chosen.annualSavings)}</span>
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/85">
              選擇「{chosenOpt.label}」、存下每月結餘的 {outcome.savingsRate}%，
              一年後你大約能存下這麼多。
            </p>
          </>
        )}
      </section>

      {/* Monthly breakdown */}
      <section aria-labelledby="breakdown-heading">
        <h3 id="breakdown-heading" className="text-lg font-bold">
          每月的錢怎麼分？
        </h3>
        <dl className="mt-3 rounded-2xl border border-hairline bg-surface px-5 py-3">
          <Row label="實際入帳" value={outcome.net} />
          <Row
            label={`房租（${chosenOpt.label}）`}
            value={chosen.rentCost}
            sign="minus"
          />
          <Row
            label={outcome.tpass ? "交通（TPASS 月票）" : "交通（逐次付）"}
            value={chosen.transitCost}
            sign="minus"
          />
          <Row
            label="生活開銷（伙食、電話、雜支）"
            value={chosen.livingCost}
            sign="minus"
          />
          <div className="border-t border-hairline" />
          <Row
            label="每月結餘"
            value={chosen.leftover}
            strong
            tone={chosen.deficit ? "negative" : undefined}
          />
          {!chosen.deficit && (
            <>
              <Row
                label={`每月存下（${outcome.savingsRate}%）`}
                value={chosen.monthlySavings}
                tone="positive"
              />
              <Row label="每月可自由花" value={chosen.monthlySpending} />
            </>
          )}
        </dl>
      </section>

      {/* Rent comparison — the "what if" that makes it a real decision */}
      <section aria-labelledby="compare-heading">
        <h3 id="compare-heading" className="text-lg font-bold">
          如果換一個住處呢？
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          同樣的交通與儲蓄比例（{outcome.savingsRate}%）下，三種住處一年後的差別：
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline text-xs text-ink-faint">
                <th className="py-2 pr-3 font-medium">住處</th>
                <th className="py-2 px-3 text-right font-medium">
                  每月結餘
                </th>
                <th className="py-2 pl-3 text-right font-medium">
                  一年約可存
                </th>
              </tr>
            </thead>
            <tbody>
              {outcome.all.map((o) => {
                const opt = RENT_OPTIONS.find((r) => r.id === o.rent)!;
                const isChosen = o.rent === chosen.rent;
                return (
                  <tr
                    key={o.rent}
                    className="border-b border-hairline last:border-0"
                    style={
                      isChosen
                        ? { background: "color-mix(in srgb,#151a21 5%,white)" }
                        : undefined
                    }
                  >
                    <td className="py-2.5 pr-3">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: RENT_COLOR[o.rent] }}
                          aria-hidden="true"
                        />
                        <span
                          className={isChosen ? "font-bold" : "text-ink-soft"}
                        >
                          {opt.label}
                          {isChosen ? "（你的選擇）" : ""}
                        </span>
                      </span>
                    </td>
                    <td className="money py-2.5 px-3 text-right">
                      <span className={o.deficit ? "text-negative" : ""}>
                        {formatNT(o.leftover)}
                      </span>
                    </td>
                    <td className="money py-2.5 pl-3 text-right font-medium">
                      {o.deficit ? "—" : formatNT(o.annualSavings)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* AI coach */}
      <CoachPanel runId={result.runId} />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-xl border border-hairline bg-surface px-5 py-3 text-base font-medium hover:border-ink"
        >
          換個選擇再試一次
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-3 text-base font-semibold text-white hover:-translate-y-0.5"
        >
          查看我的進度
        </Link>
      </div>
    </div>
  );
}

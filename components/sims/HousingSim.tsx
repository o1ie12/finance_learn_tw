"use client";

import { useMemo, useState } from "react";
import {
  computeHousing,
  HOUSING_OPTIONS,
  getHousing,
  HOUSING_NET,
  FURNISH_CASH,
  FURNISH_INSTALLMENT_MONTHLY,
  FURNISH_INSTALLMENT_MONTHS,
  type HousingId,
  type FurnishId,
  type HousingOutcome,
} from "@/lib/sims/housing";
import { formatNT } from "@/components/Money";
import {
  Row,
  SelectCard,
  SubmitButton,
  OutcomeActions,
} from "@/components/sims/ui";
import { useSimRun } from "@/components/sims/useSimRun";
import CoachPanel from "@/components/CoachPanel";

export default function HousingSim({
  color,
  colorInk,
}: {
  color: string;
  colorInk: string;
}) {
  const [housing, setHousing] = useState<HousingId>("roommates");
  const [furnish, setFurnish] = useState<FurnishId>("cash");
  const { submitting, error, result, submit, reset } =
    useSimRun<HousingOutcome>("xinyong");

  const renting = housing !== "parents";
  const preview = useMemo(
    () => computeHousing({ housing, furnish }),
    [housing, furnish],
  );

  if (result) {
    return (
      <HousingOutcomeView
        outcome={result.outcome}
        runId={result.runId}
        color={color}
        colorInk={colorInk}
        onReset={reset}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm leading-relaxed text-ink-soft">
          你剛畢業、拿到第一份工作，月薪 NT$36,000，扣掉勞健保後每月實拿約{" "}
          <span className="money font-medium text-ink">{formatNT(HOUSING_NET)}</span>
          （和起薪線一致）。
        </p>
        <div
          className="mt-3 rounded-xl bg-surface p-4 text-sm leading-relaxed text-ink/90"
          style={{ borderLeft: `4px solid ${color}` }}
        >
          <p className="font-semibold" style={{ color: colorInk }}>
            先開一個銀行帳戶
          </p>
          <p className="mt-1 text-ink-soft">
            第一份工作通常是「薪轉」入帳，付房租、押金也多半用轉帳。所以第一步，是去開一個自己的銀行帳戶——這也是信用紀錄的起點。
          </p>
        </div>
      </section>

      <fieldset>
        <legend className="text-xl font-bold">你要住哪裡？</legend>
        <p className="mt-1 text-sm text-ink-soft">房租是最大的固定開銷，也影響你每月剩多少。</p>
        <div className="mt-4 space-y-3">
          {HOUSING_OPTIONS.map((o) => (
            <SelectCard
              key={o.id}
              name="housing"
              selected={housing === o.id}
              onSelect={() => setHousing(o.id)}
              color={color}
              title={o.label}
              meta={`${o.housingLabel} ${formatNT(o.housingCost)} / 月`}
              sub={o.blurb}
            />
          ))}
        </div>
      </fieldset>

      {renting && (
        <fieldset>
          <legend className="text-xl font-bold">布置新家：一次付清還是分期？</legend>
          <p className="mt-1 text-sm text-ink-soft">
            床、桌椅、家電大約 {formatNT(FURNISH_CASH)}。這是你第一次碰到「分期（信用）」的決定。
          </p>
          <div className="mt-4 space-y-3">
            <SelectCard
              name="furnish"
              selected={furnish === "cash"}
              onSelect={() => setFurnish("cash")}
              color={color}
              title="一次付清"
              meta={formatNT(FURNISH_CASH)}
              sub="現在一次付清，總花費最少，但一開始要拿出比較多現金。"
            />
            <SelectCard
              name="furnish"
              selected={furnish === "installment"}
              onSelect={() => setFurnish("installment")}
              color={color}
              title={`分 ${FURNISH_INSTALLMENT_MONTHS} 期`}
              meta={`${formatNT(FURNISH_INSTALLMENT_MONTHLY)} / 期`}
              sub={`每月付一點，但 ${FURNISH_INSTALLMENT_MONTHS} 期總共 ${formatNT(FURNISH_INSTALLMENT_MONTHLY * FURNISH_INSTALLMENT_MONTHS)}，多付了 ${formatNT(FURNISH_INSTALLMENT_MONTHLY * FURNISH_INSTALLMENT_MONTHS - FURNISH_CASH)} 手續費。`}
            />
          </div>
        </fieldset>
      )}

      <section
        aria-live="polite"
        className="rounded-2xl border border-hairline bg-surface p-5"
      >
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <p className="text-xs text-ink-faint">每月結餘</p>
            <p
              className={`money text-lg font-semibold ${preview.chosen.deficit ? "text-negative" : ""}`}
            >
              {formatNT(preview.chosen.leftover)}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-faint">一開始要準備的現金</p>
            <p className="money text-lg font-semibold">
              {formatNT(preview.chosen.upfrontCash)}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          一開始的現金＝押金
          {preview.chosen.deposit > 0 ? `（${formatNT(preview.chosen.deposit)}）` : "（0）"}
          {renting ? " ＋ 布置費" : ""}。
        </p>
      </section>

      {error && (
        <p className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative" role="alert">
          {error}
        </p>
      )}

      <SubmitButton
        onClick={() => submit({ housing, furnish })}
        disabled={false}
        submitting={submitting}
        idleLabel="算算每月的現金流"
        disabledLabel=""
      />
    </div>
  );
}

function HousingOutcomeView({
  outcome,
  runId,
  color,
  colorInk,
  onReset,
}: {
  outcome: HousingOutcome;
  runId: string;
  color: string;
  colorInk: string;
  onReset: () => void;
}) {
  const c = outcome.chosen;
  const opt = getHousing(c.id)!;
  const installment = outcome.furnish === "installment";

  return (
    <div className="space-y-8">
      <section
        className="rounded-3xl p-6 text-white sm:p-8"
        style={{ background: c.deficit ? "#7a1020" : "#151a21" }}
      >
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-white/70">
          成家站 · 每月現金流
        </p>
        <h2 className="mt-2 text-4xl font-black">
          <span className="money">{formatNT(c.leftover)}</span>
          <span className="text-lg font-semibold text-white/70"> / 月</span>
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-white/85">
          選擇「{opt.label}」，扣掉{opt.housingLabel}、交通與生活費後，每月大約剩這麼多可以存或自由花。
          {installment
            ? `布置分期的前 ${outcome.furnishInstallmentMonths} 個月，還要再扣 ${formatNT(outcome.furnishInstallmentMonthly)}，只剩 ${formatNT(c.leftoverDuringInstallment)}。`
            : ""}
        </p>
      </section>

      <section aria-labelledby="flow-heading">
        <h3 id="flow-heading" className="text-lg font-bold">
          每月的錢怎麼流？
        </h3>
        <dl className="mt-3 rounded-2xl border border-hairline bg-surface px-5 py-3">
          <Row label="實際入帳" value={outcome.net} />
          <Row label={`${opt.housingLabel}（${opt.label}）`} value={c.housingCost} sign="minus" />
          <Row label="交通（TPASS 月票）" value={c.transit} sign="minus" />
          <Row label="生活開銷（伙食、雜支）" value={c.living} sign="minus" />
          <div className="border-t border-hairline" />
          <Row
            label="每月結餘"
            value={c.leftover}
            strong
            tone={c.deficit ? "negative" : "positive"}
          />
        </dl>
      </section>

      <section aria-labelledby="upfront-heading">
        <h3 id="upfront-heading" className="text-lg font-bold">
          搬進去前，要先拿出多少？
        </h3>
        <dl className="mt-3 rounded-2xl border border-hairline bg-surface px-5 py-3">
          <Row
            label="押金"
            value={c.deposit}
            raw={c.deposit > 0 ? `${formatNT(c.deposit)}（${opt.housingCost === 0 ? 0 : c.deposit / opt.housingCost} 個月房租）` : formatNT(0)}
          />
          {outcome.furnish !== "none" && (
            <Row
              label={installment ? "布置費（第一期）" : "布置費（一次付清）"}
              value={installment ? outcome.furnishInstallmentMonthly : FURNISH_CASH}
            />
          )}
          <div className="border-t border-hairline" />
          <Row label="一開始要準備的現金" value={c.upfrontCash} strong />
        </dl>
      </section>

      <section aria-labelledby="cmp-heading">
        <h3 id="cmp-heading" className="text-lg font-bold">
          三種住法，每月差多少？
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline text-xs text-ink-faint">
                <th className="py-2 pr-3 font-medium">住處</th>
                <th className="py-2 px-3 text-right font-medium">房租/孝親費</th>
                <th className="py-2 pl-3 text-right font-medium">每月結餘</th>
              </tr>
            </thead>
            <tbody>
              {outcome.all.map((o) => {
                const oo = getHousing(o.id)!;
                const isChosen = o.id === c.id;
                return (
                  <tr
                    key={o.id}
                    className="border-b border-hairline last:border-0"
                    style={isChosen ? { background: "color-mix(in srgb,#151a21 5%,white)" } : undefined}
                  >
                    <td className="py-2.5 pr-3">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} aria-hidden="true" />
                        <span className={isChosen ? "font-bold" : "text-ink-soft"}>
                          {oo.label}
                          {isChosen ? "（你的選擇）" : ""}
                        </span>
                      </span>
                    </td>
                    <td className="money py-2.5 px-3 text-right">{formatNT(o.housingCost)}</td>
                    <td className="money py-2.5 pl-3 text-right font-medium">
                      <span className={o.deficit ? "text-negative" : ""}>{formatNT(o.leftover)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {installment && (
          <p className="mt-3 rounded-xl bg-line-4/10 px-4 py-3 text-sm leading-relaxed text-ink-soft">
            分期讓你一開始輕鬆，但{" "}
            <span className="font-semibold" style={{ color: colorInk }}>
              總共多付了 {formatNT(FURNISH_INSTALLMENT_MONTHLY * FURNISH_INSTALLMENT_MONTHS - FURNISH_CASH)} 手續費
            </span>
            。這就是「信用／借貸」的成本——方便，但不是免費的。
          </p>
        )}
      </section>

      <CoachPanel runId={runId} />
      <OutcomeActions onReset={onReset} resetLabel="換個住法再試一次" />
    </div>
  );
}

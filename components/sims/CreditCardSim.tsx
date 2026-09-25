"use client";

import { useMemo, useState } from "react";
import type { InterestId } from "@/lib/studentProfile";
import {
  computeRound,
  roundsFor,
  CREDIT_LIMIT,
  type PayChoice,
  type CreditCardOutcome,
} from "@/lib/sims/creditCard";
import { formatNT } from "@/components/Money";
import { Row, SelectCard, SubmitButton, OutcomeActions } from "@/components/sims/ui";
import { useSimRun } from "@/components/sims/useSimRun";
import CoachPanel from "@/components/CoachPanel";
import PlatformPanel from "@/components/mrt/PlatformPanel";
import StampReveal from "@/components/mrt/StampReveal";
import type { OutcomeTitle } from "@/lib/outcomeTitle";

export default function CreditCardSim({
  color,
  colorInk,
  interest,
}: {
  /** From the student's profile. Chooses how the three purchases are worded. */
  interest?: InterestId | null;
  color: string;
  colorInk: string;
}) {
  const [choices, setChoices] = useState<PayChoice[]>([]);
  const [pendingChoice, setPendingChoice] = useState<PayChoice>("full");
  const { submitting, error, result, submit, reset } =
    useSimRun<CreditCardOutcome>("xinyong");

  const currentRound = choices.length;

  // Same amounts, same interest, same minimum-payment rule for everyone —
  // only the wording of what was bought follows the student's interest.
  const bills = useMemo(() => roundsFor(interest), [interest]);

  const carryIn = useMemo(() => {
    let carry = 0;
    for (let i = 0; i < choices.length; i++) {
      carry = computeRound(bills[i], carry, choices[i]).carryOut;
    }
    return carry;
  }, [choices, bills]);

  const currentBill = useMemo(() => {
    if (currentRound >= bills.length) return null;
    return computeRound(bills[currentRound], carryIn, "full");
  }, [currentRound, carryIn, bills]);

  function handleConfirm() {
    const allChoices = [...choices, pendingChoice];
    if (allChoices.length < bills.length) {
      setChoices(allChoices);
      setPendingChoice("full");
    } else {
      submit({ choices: allChoices });
    }
  }

  function handleReset() {
    setChoices([]);
    setPendingChoice("full");
    reset();
  }

  if (result) {
    return (
      <CreditCardOutcomeView
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

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm leading-relaxed text-ink-soft">
          你辦了人生第一張信用卡，額度{" "}
          <span className="money font-medium text-ink">{formatNT(CREDIT_LIMIT)}</span>
          。接下來三個月的帳單來了，每一期你要決定：全額繳清，還是只繳最低應繳金額？
        </p>
      </section>

      {/* Round progress */}
      <div className="flex items-center gap-1.5">
        {bills.map((_, i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full transition-colors"
            style={{
              background: i <= currentRound ? color : "var(--color-hairline)",
            }}
          />
        ))}
      </div>

      {/* Previous rounds summary */}
      {choices.length > 0 && (
        <div className="space-y-2">
          {choices.map((c, i) => {
            let carry = 0;
            for (let j = 0; j < i; j++) {
              carry = computeRound(bills[j], carry, choices[j]).carryOut;
            }
            const r = computeRound(bills[i], carry, c);
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-hairline bg-surface/50 px-4 py-3"
              >
                <span className="text-sm">
                  <span className="font-semibold">{r.label}</span>
                  <span className="ml-2 text-ink-faint">{r.reason}</span>
                </span>
                <span
                  className="text-sm font-semibold"
                  style={c === "full" ? { color: colorInk } : undefined}
                >
                  {c === "full" ? "全額繳清" : `最低 ${formatNT(r.minimumPayment)}`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Current round */}
      {currentBill && (
        <fieldset>
          <legend className="text-xl font-bold">{currentBill.label}</legend>
          <p className="mt-1 text-sm text-ink-soft">{currentBill.reason}</p>

          {/* The bill states only what is owed. Itemising the carried
              balance and its interest here would reveal the cost of
              revolving before the student has chosen — the results screen
              is where that lands. */}
          <div className="mt-4 rounded-2xl border border-hairline bg-surface p-5">
            <p className="text-sm text-ink-soft">本期應繳金額</p>
            <p className="money mt-1 text-3xl font-black">
              {formatNT(currentBill.totalOwed)}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <SelectCard
              name="payment"
              selected={pendingChoice === "full"}
              onSelect={() => setPendingChoice("full")}
              color={color}
              title="全額繳清"
              meta={formatNT(currentBill.totalOwed)}
            />
            <SelectCard
              name="payment"
              selected={pendingChoice === "minimum"}
              onSelect={() => setPendingChoice("minimum")}
              color={color}
              title="只繳最低應繳金額"
              meta={formatNT(currentBill.minimumPayment)}
            />
          </div>
        </fieldset>
      )}

      {error && (
        <p
          className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative"
          role="alert"
        >
          {error}
        </p>
      )}

      <SubmitButton
        onClick={handleConfirm}
        disabled={false}
        submitting={submitting}
        idleLabel={
          currentRound < bills.length - 1
            ? "確認，看下一期帳單"
            : "確認，看三個月的結果"
        }
        disabledLabel=""
      />
    </div>
  );
}

function CreditCardOutcomeView({
  outcome,
  runId,
  color,
  colorInk,
  onReset,
  outcomeTitle,
  pointsAwarded,
}: {
  outcome: CreditCardOutcome;
  runId: string;
  color: string;
  colorInk: string;
  onReset: () => void;
  outcomeTitle: OutcomeTitle | null;
  pointsAwarded: number;
}) {
  const remainingBalance =
    outcome.rounds[outcome.rounds.length - 1].carryOut;

  return (
    <div className="space-y-8">
      <PlatformPanel color={color} eyebrow="帳單站 · 三個月結算">
        {outcome.totalInterest > 0 ? (
          <>
            <p className="text-sm text-white/70">三個月下來，你產生了</p>
            <h2 className="mt-1 text-4xl font-black">
              <span className="money">{formatNT(outcome.totalInterest)}</span>
              <span className="ml-2 text-lg font-normal text-white/60">
                總利息成本
              </span>
            </h2>
            {remainingBalance > 0 ? (
              <p className="mt-3 text-[15px] leading-relaxed text-white/85">
                你消費了{" "}
                {formatNT(outcome.totalIfNoInterest)}，目前只付了{" "}
                <span className="money font-semibold text-white">
                  {formatNT(outcome.totalPaid)}
                </span>
                ，還欠{" "}
                <span className="money font-semibold text-white">
                  {formatNT(remainingBalance)}
                </span>
                ——而且這筆餘額下個月還會繼續產生利息。
              </p>
            ) : (
              <p className="mt-3 text-[15px] leading-relaxed text-white/85">
                你消費了{" "}
                {formatNT(outcome.totalIfNoInterest)}，實際付了{" "}
                <span className="money font-semibold text-white">
                  {formatNT(outcome.totalPaid)}
                </span>
                ——多出來的{" "}
                {formatNT(outcome.totalInterest)} 就是循環利息的代價。
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="text-3xl font-black">零利息</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/85">
              你每期都全額繳清，消費了{" "}
              {formatNT(outcome.totalIfNoInterest)}，就付了{" "}
              <span className="money font-semibold text-white">
                {formatNT(outcome.totalPaid)}
              </span>
              ——沒有多花一塊錢。
            </p>
          </>
        )}
        <StampReveal
          outcomeTitle={outcomeTitle}
          pointsAwarded={pointsAwarded}
        />
      </PlatformPanel>

      {/* Round-by-round breakdown */}
      <section>
        <h3 className="text-lg font-bold">每期帳單明細</h3>
        <div className="mt-3 space-y-3">
          {outcome.rounds.map((r) => (
            <div
              key={r.month}
              className="rounded-2xl border border-hairline bg-surface p-4"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-bold">{r.label}</span>
                <span className="text-sm text-ink-soft">{r.reason}</span>
              </div>
              <dl className="mt-2 divide-y divide-hairline text-sm">
                <Row label="本月消費" value={r.newCharge} />
                {r.carryIn > 0 && (
                  <>
                    <Row label="上期未繳餘額" value={r.carryIn} />
                    <Row
                      label="循環利息"
                      value={r.interestAccrued}
                      tone="negative"
                    />
                  </>
                )}
                <Row label="應繳總額" value={r.totalOwed} strong />
                <Row
                  label={
                    r.choice === "full" ? "全額繳清" : "繳最低金額"
                  }
                  value={r.amountPaid}
                  strong
                />
                {r.carryOut > 0 && (
                  <Row
                    label="轉入下期餘額"
                    value={r.carryOut}
                    tone="negative"
                  />
                )}
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* Credit record */}
      <section
        className="rounded-2xl bg-surface p-5"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <p
          className="font-display text-xs font-bold uppercase tracking-wider"
          style={{ color: colorInk }}
        >
          你的信用記錄
        </p>
        <p className="mt-2 text-lg font-bold">
          {outcome.creditRecord}
          {outcome.creditRecord === "普通" && (
            <span className="ml-2 text-sm font-normal text-ink-soft">
              有循環利息，但無不良記錄
            </span>
          )}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          {outcome.consequenceLine}
        </p>
      </section>

      <p className="rounded-lg bg-line-1/10 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        本模擬使用簡化的利率計算（年利率 15% / 12），實際信用卡計息方式因發卡機構而異。教育用途，非個人財務建議。
      </p>

      <CoachPanel runId={runId} />
      <OutcomeActions onReset={onReset} resetLabel="換個選擇再試一次" />
    </div>
  );
}

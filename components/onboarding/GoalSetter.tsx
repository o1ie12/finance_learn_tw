"use client";

/**
 * Onboarding step 2, 「設定目標」 (01 §6.3, 04 §1.3): pick a goal card or
 * write your own, set amount and months, pick a reason, and watch the five
 * SMART ticks fill in. Then the first ride (01 §7.3) to the first line, and
 * the student's home, where the guided tour starts.
 */
import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar/Avatar";
import { FloatCard } from "@/components/game/FloatCard";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { formatMoney } from "@/components/game/format";
import TrainTransition, { type TrainTransitionProps } from "@/components/transition/TrainTransition";
import { GOAL_CARDS, GOAL_MONTHLY_LINE, GOAL_REASONS, WHY_TEXT } from "@/content/global";
import type { Avatar as AvatarData } from "@/lib/avatar";
import {
  GOAL_MONTHS_MAX,
  GOAL_MONTHS_MIN,
  GOAL_NAME_MAX,
  parseWholeNumber,
  smartCheck,
  type SmartTickId,
} from "@/lib/onboarding";
import { ErrorIcon } from "./CharacterCreator";
import s from "./onboarding.module.css";

export interface GoalSetterProps {
  /** starterMonthlyLeft(profile): 實發 − essentials. */
  monthlyLeft: number;
  /** For the budget explainer. */
  budget: { gross: number; net: number; essentials: number; fromCareerLine: boolean };
  /** 3 × essentials, the emergency card's default. */
  emergencyAmount: number;
  /** The stored goal, when the student set one before. */
  initialGoal: { name: string; amount: number; months: number; reason: string } | null;
  ride: Pick<TrainTransitionProps, "from" | "to">;
  avatar: AvatarData;
  seenFullRides: number;
  homeHref: string;
}

function money(n: number): string {
  return n.toLocaleString("en-US");
}

export function GoalSetter({
  monthlyLeft,
  budget,
  emergencyAmount,
  initialGoal,
  ride,
  avatar,
  seenFullRides,
  homeHref,
}: GoalSetterProps) {
  const router = useRouter();
  const id = useId();
  const initialCard = initialGoal
    ? (GOAL_CARDS.find((c) => c.label === initialGoal.name)?.id ?? "custom")
    : null;
  const [cardId, setCardId] = useState<string | null>(initialCard);
  const [name, setName] = useState(initialGoal?.name ?? "");
  const [amount, setAmount] = useState(initialGoal ? money(initialGoal.amount) : "");
  const [months, setMonths] = useState(initialGoal ? String(initialGoal.months) : "");
  const [reason, setReason] = useState<string | null>(initialGoal?.reason ?? null);
  const [busy, setBusy] = useState<"save" | "skip" | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** 設定目標 was pressed with ticks missing: show the live count until fixed. */
  const [attempted, setAttempted] = useState(false);
  const [riding, setRiding] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const monthsRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLInputElement>(null);

  const draft = { name, amount: parseWholeNumber(amount), months: parseWholeNumber(months), reason };
  const result = smartCheck(draft, monthlyLeft);
  const metCount = result.ticks.filter((t) => t.met).length;

  function chooseCard(cid: string) {
    const card = GOAL_CARDS.find((c) => c.id === cid);
    if (!card) return;
    setCardId(cid);
    setError(null);
    if (card.id === "custom") {
      setName("");
      setAmount("");
      setMonths("");
      return;
    }
    const value = card.amount === "essentials3" ? emergencyAmount : card.amount;
    setName(card.label);
    setAmount(value == null ? "" : money(value));
    setMonths(card.months == null ? "" : String(card.months));
  }

  function focusFor(tick: SmartTickId) {
    const ref =
      tick === "specific"
        ? nameRef
        : tick === "measurable" || tick === "achievable"
          ? amountRef
          : tick === "timebound"
            ? monthsRef
            : reasonRef;
    ref.current?.focus();
  }

  async function post(body: unknown): Promise<boolean> {
    try {
      const res = await fetch("/api/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        setError("登入已經過期，請重新登入。");
        return false;
      }
      if (!res.ok) {
        setError("目標沒有存起來。照五個提示檢查一次，再試一次。");
        return false;
      }
      return true;
    } catch {
      setError("網路連線出了問題，請再試一次。");
      return false;
    }
  }

  async function submit() {
    if (busy) return;
    setError(null);
    if (!result.allMet) {
      setAttempted(true);
      focusFor(result.ticks.find((t) => !t.met)!.id);
      return;
    }
    setBusy("save");
    const ok = await post({ name, amount: draft.amount, months: draft.months, reason });
    setBusy(null);
    if (ok) setRiding(true);
  }

  async function skip() {
    if (busy) return;
    setError(null);
    setBusy("skip");
    const ok = await post({ skip: true });
    setBusy(null);
    if (ok) setRiding(true);
  }

  const customCard = cardId === "custom";

  return (
    <div className={s.goal}>
      <FloatCard strong as="section" className={s.goalMain}>
        <div className={s.head}>
          <p className={s.step}>步驟 2／2</p>
          <h1 className={s.title}>設定你的目標</h1>
        </div>
        {/* 04 §1.1 behind a disclosure, so the screen keeps to ~80 characters of body text. */}
        <details className={s.why}>
          <summary>為什麼要設目標？</summary>
          {WHY_TEXT.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </details>

        <fieldset className={s.fieldset}>
          <legend className={s.legend}>先選一個目標</legend>
          <div className={s.goalCards}>
            {GOAL_CARDS.map((card) => {
              const value = card.amount === "essentials3" ? emergencyAmount : card.amount;
              return (
                <label key={card.id} className={s.choice}>
                  <input
                    type="radio"
                    name={`${id}-card`}
                    value={card.id}
                    checked={cardId === card.id}
                    onChange={() => chooseCard(card.id)}
                    className={s.choiceInput}
                  />
                  <span className={s.choiceBox}>
                    <span className={s.choiceName}>{card.label}</span>
                    <span className={s.choiceMeta}>
                      {value != null && card.months != null
                        ? `${formatMoney(value)} · ${card.months} 個月`
                        : "名稱、金額、期限你決定"}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className={s.fieldHint}>金額和期限是建議值（示意），可以改成你自己的。</p>
        </fieldset>

        <div className={s.inputs}>
          <div className={s.field}>
            <label htmlFor={`${id}-name`} className={s.fieldLabel}>
              目標
            </label>
            <input
              ref={nameRef}
              id={`${id}-name`}
              type="text"
              value={name}
              placeholder={customCard ? "例如：一雙籃球鞋" : undefined}
              onChange={(e) => {
                setName(e.target.value);
                if (cardId == null) setCardId("custom");
              }}
              aria-describedby={`${id}-name-hint`}
              className={s.input}
            />
            <p id={`${id}-name-hint`} className={s.fieldHint}>
              最多 {GOAL_NAME_MAX} 個字。
            </p>
          </div>
          <div className={s.fieldRow}>
            <div className={s.field}>
              <label htmlFor={`${id}-amount`} className={s.fieldLabel}>
                金額
              </label>
              <div className={s.affix}>
                <span className={s.affixText} aria-hidden="true">
                  NT$
                </span>
                <input
                  ref={amountRef}
                  id={`${id}-amount`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  aria-describedby={`${id}-amount-hint`}
                  className={`${s.input} ${s.numInput}`}
                />
              </div>
              <p id={`${id}-amount-hint`} className={s.fieldHint}>
                新台幣，整數。
              </p>
            </div>
            <div className={s.field}>
              <label htmlFor={`${id}-months`} className={s.fieldLabel}>
                期限
              </label>
              <div className={s.affix}>
                <input
                  ref={monthsRef}
                  id={`${id}-months`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  aria-describedby={`${id}-months-hint`}
                  className={`${s.input} ${s.numInput}`}
                />
                <span className={s.affixText} aria-hidden="true">
                  個月
                </span>
              </div>
              <p id={`${id}-months-hint`} className={s.fieldHint}>
                {GOAL_MONTHS_MIN} 到 {GOAL_MONTHS_MAX} 個月。
              </p>
            </div>
          </div>
        </div>

        <fieldset className={s.fieldset}>
          <legend className={s.legend}>為什麼想要這個目標？</legend>
          <div className={s.reasons}>
            {GOAL_REASONS.map((r, i) => (
              <label key={r.id} className={s.choice}>
                <input
                  ref={i === 0 ? reasonRef : undefined}
                  type="radio"
                  name={`${id}-reason`}
                  value={r.id}
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                  className={s.choiceInput}
                />
                <span className={`${s.choiceBox} ${s.choiceBoxSmall}`}>
                  <span className={s.choiceName}>{r.label}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </FloatCard>

      <div className={s.goalSide}>
        <FloatCard strong as="section" index={1} title="SMART 檢查" aside={`${metCount}／5`}>
          <p className="sr-only" aria-live="polite">
            {`SMART 檢查：達成 ${metCount} 項，共 5 項。`}
          </p>
          <ul className={s.ticks}>
            {result.ticks.map((t) => (
              <li key={t.id} className={t.met ? `${s.tick} ${s.tickMet}` : s.tick}>
                <span className={s.tickMark} aria-hidden="true">
                  {t.met ? <CheckIcon /> : <EmptyIcon />}
                </span>
                <span className={s.tickBody}>
                  <span className={s.tickHead}>
                    <span className={s.tickLabel}>{t.label}</span>
                    <span className={s.tickState}>{t.met ? "達成" : "還沒"}</span>
                  </span>
                  {t.met ? null : <span className={s.tickHint}>{t.hint}</span>}
                </span>
              </li>
            ))}
          </ul>

          <p className={s.monthly}>
            {result.monthly != null ? (
              GOAL_MONTHLY_LINE.replace("{X}", money(result.monthly))
            ) : (
              <span className={s.monthlyPending}>每個月要存：填好金額和期限就算給你看</span>
            )}
          </p>

          <div className={s.budget}>
            <p className={s.budgetRow}>
              <span>你目前每個月能存</span>
              <strong className={s.budgetNum}>{formatMoney(monthlyLeft)}</strong>
            </p>
            <p className={s.fieldHint}>
              {budget.fromCareerLine ? "月薪來自 職涯線" : "起薪是預設值，完成 職涯線 後更新"}
              ：實發 {formatMoney(budget.net)} − 基本開銷 {formatMoney(budget.essentials)}（示意）。
            </p>
          </div>
        </FloatCard>

        {error || (attempted && !result.allMet) ? (
          <p role="alert" className={s.formError}>
            <ErrorIcon />
            {error ?? `還有 ${5 - metCount} 項沒打勾。照提示改一改，就能設定目標。`}
          </p>
        ) : null}

        <div className={s.actions}>
          <PrimaryButton onClick={submit} aria-disabled={busy != null || !result.allMet} className={s.mainBtn}>
            {busy === "save" ? "存檔中…" : "設定目標"}
          </PrimaryButton>
          <button type="button" className={s.textBtn} onClick={skip} aria-disabled={busy != null}>
            {busy === "skip" ? "略過中…" : "先跳過"}
          </button>
        </div>
        {!result.allMet ? <p className={s.fieldHint}>五項都打勾，就能設定目標。</p> : null}
      </div>

      {riding ? (
        <TrainTransition
          from={ride.from}
          to={ride.to}
          character={<Avatar avatar={avatar} view="back" size={120} />}
          seenFullRides={seenFullRides}
          onFullRideComplete={() => {
            void fetch("/api/rides", { method: "POST", keepalive: true }).catch(() => {});
          }}
          onDone={() => {
            router.push(homeHref);
          }}
        />
      ) : null}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
    </svg>
  );
}

export default GoalSetter;

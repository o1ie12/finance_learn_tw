"use client";

import { useId, useState } from "react";
import { EVENT_COSTS, INSURANCE } from "@/lib/lifeGame/constants";
import { Icon } from "@/components/game/icons";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import type { EventResolution, PendingEvent, PublicLifeState } from "@/lib/lifeGame/types";
import type { TurnView } from "@/lib/lifeGame/view";
import { eventBody, eventIsIllustrative, eventText, isChoice, nt, optionLabel, parseAmount } from "./playModel";
import { Actions, ErrorLine, Notice, PlayIcon, SampleTag, guard } from "./ui";
import s from "./play.module.css";

// The engine's own figures (lib/lifeGame/constants.ts, 示意).
const CONCERT_PRICE = EVENT_COSTS.concert;
const MEDICAL = INSURANCE.medical;

export interface EventChoice {
  option: string;
  payWith?: "cash" | "card";
  amount?: number;
}

interface Draft {
  option?: string;
  payWith?: "cash" | "card";
  amount: string;
}

/**
 * Step 5 人生事件 (01 §6.4, 02 §6). Each card flips in (rotateY, under
 * 400ms; a plain fade under reduced motion; readable if the animation never
 * runs). Choice events need a pick; one-option events need a tap so the
 * student reads them. Then 「繼續」 sends every choice at once.
 */
export function EventsStep({
  state,
  view,
  name,
  busy,
  error,
  onSubmit,
}: {
  state: PublicLifeState;
  view: TurnView;
  name: string;
  busy: boolean;
  error: string | null;
  onSubmit: (choices: Record<string, EventChoice>) => void;
}) {
  const events = state.pending.events;
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const update = (key: string, patch: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [key]: { ...(prev[key] ?? { amount: "" }), ...patch } }));
  const cash = Math.max(state.accounts.cash, 0);

  const ready = events.every((e) => {
    const dr = drafts[e.key];
    if (!dr?.option) return false;
    if (e.id === "market_drop" && dr.option === "add") {
      const n = parseAmount(dr.amount);
      return n !== null && n > 0 && n <= cash;
    }
    return true;
  });

  const send = () => {
    const choices: Record<string, EventChoice> = {};
    for (const e of events) {
      if (!isChoice(e.id)) continue;
      const dr = drafts[e.key];
      if (!dr?.option) continue;
      const c: EventChoice = { option: dr.option };
      if (e.id === "concert" && dr.option === "buy" && dr.payWith === "card") c.payWith = "card";
      if (e.id === "market_drop" && dr.option === "add") c.amount = parseAmount(dr.amount) ?? 0;
      choices[e.key] = c;
    }
    onSubmit(choices);
  };

  if (events.length === 0) {
    return (
      <div className={s.stepBody}>
        <h2 className="g-question" tabIndex={-1} data-step-heading>
          這個月平安無事
        </h2>
        <p className="g-body">沒有意外，也沒有驚喜。平凡的一個月，也是存錢的好時機。</p>
        <ErrorLine message={error} />
        <Actions>
          <PrimaryButton onClick={guard(busy, () => onSubmit({}))} aria-disabled={busy || undefined} aria-busy={busy}>
            繼續
          </PrimaryButton>
        </Actions>
      </div>
    );
  }

  return (
    <div className={s.stepBody}>
      <h2 className="g-question" tabIndex={-1} data-step-heading>
        這個月發生了 {events.length} 件事
      </h2>
      <div className={s.eventList}>
        {events.map((e, i) => (
          <EventCard
            key={e.key}
            index={i}
            event={e}
            name={name}
            state={state}
            view={view}
            draft={drafts[e.key]}
            onChange={(patch) => update(e.key, patch)}
          />
        ))}
      </div>
      {!ready ? <p className="g-caption">每張卡都選好之後，就可以繼續。</p> : null}
      <ErrorLine message={error} />
      <Actions>
        <PrimaryButton onClick={guard(busy || !ready, send)} aria-disabled={(busy || !ready) || undefined} aria-busy={busy}>
          繼續
        </PrimaryButton>
      </Actions>
    </div>
  );
}

function protectionLine(id: string, state: PublicLifeState): { tone: "good" | "warn" | "info"; text: string } | null {
  if (id === "hospital") {
    return state.insurance.medical
      ? {
          tone: "good",
          text: `你有醫療險：住院費用理賠 ${Math.round(MEDICAL.share * 100)}%，每次最多 ${nt(MEDICAL.capPerEvent)}（示意）。`,
        }
      : { tone: "warn", text: "你沒有醫療險，要全部自己付。" };
  }
  if (id === "accident") {
    return state.insurance.accident
      ? { tone: "good", text: "你有意外險：醫藥費全額理賠。" }
      : { tone: "warn", text: "你沒有意外險，要全部自己付。" };
  }
  if (id === "phone_break" || id === "dental" || id === "scooter_service") {
    return { tone: "info", text: "保險不賠這種小又常見的開銷，要靠緊急預備金。" };
  }
  if (id === "layoff") return { tone: "info", text: "緊急預備金，就是為這種月份存的。" };
  return null;
}

function EventCard({
  index,
  event,
  name,
  state,
  view,
  draft,
  onChange,
}: {
  index: number;
  event: PendingEvent;
  name: string;
  state: PublicLifeState;
  view: TurnView;
  draft: Draft | undefined;
  onChange: (patch: Partial<Draft>) => void;
}) {
  const uid = useId();
  const t = eventText(event.id);
  const choice = isChoice(event.id);
  const scamHelp = event.id === "scam_msg" && state.unlocked.includes("scamHelp");
  const protection = protectionLine(event.id, state);
  const cardOk = state.unlocked.includes("card") && view.card.available >= CONCERT_PRICE;
  const cash = Math.max(state.accounts.cash, 0);
  const addAmount = draft?.amount ?? "";
  const addN = parseAmount(addAmount);
  const addBad = addAmount.trim() !== "" && (addN === null || addN <= 0 || addN > cash);

  return (
    <article className={s.flip} style={{ ["--flip-i" as string]: index }} aria-labelledby={`${uid}-t`}>
      <div className={s.flipInner}>
        <div className={s.flipBack} aria-hidden="true">
          <PlayIcon name="bulb" size={36} />
          <span>人生事件</span>
        </div>
        <div className={s.flipFront}>
          <div className={s.eventHead}>
            <h3 id={`${uid}-t`} className={s.eventTitle}>
              {t.title}
            </h3>
            {eventIsIllustrative(event.id) ? <SampleTag /> : null}
          </div>
          <p className={s.eventText}>{eventBody(event.id, event.vars, name)}</p>
          {protection ? <Notice tone={protection.tone}>{protection.text}</Notice> : null}
          {scamHelp ? (
            <p className={s.scamHelp}>
              <PlayIcon name="shield" size={16} />
              <span>
                <strong>防詐提示：</strong>不信、不理、不轉帳。有懷疑就打 165。
              </span>
            </p>
          ) : null}

          <div className={s.options} role="group" aria-label={`${t.title}：你的選擇`}>
            {t.options.map((o) => {
              const picked = draft?.option === o.id;
              const safe = scamHelp && t.safeOptions?.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  className={[s.option, picked && s.optionPicked, safe && s.optionSafe].filter(Boolean).join(" ")}
                  aria-pressed={picked}
                  onClick={() => onChange({ option: o.id })}
                >
                  {picked ? <Icon name="check" size={16} /> : null}
                  <span>{o.label}</span>
                  {safe ? <span className={s.safeTag}>防詐提示</span> : null}
                </button>
              );
            })}
          </div>
          {!choice ? <span className="sr-only">按下按鈕表示看完了。</span> : null}

          {event.id === "concert" && draft?.option === "buy" && cardOk ? (
            <fieldset className={s.fieldset}>
              <legend className={s.fieldLabel}>怎麼付？</legend>
              <div className={s.radios}>
                {(["cash", "card"] as const).map((p) => (
                  <label key={p} className={s.radio}>
                    <input
                      type="radio"
                      name={`${uid}-pay`}
                      checked={(draft.payWith ?? "cash") === p}
                      onChange={() => onChange({ payWith: p })}
                    />
                    <span>{p === "cash" ? "付現金" : "刷卡（下個月的帳單會出現）"}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {event.id === "market_drop" && draft?.option === "add" ? (
            <div className={s.field}>
              <label htmlFor={`${uid}-add`} className={s.fieldLabel}>
                加碼多少？（手上現金 {nt(cash)}）
              </label>
              <div className={s.moneyInput}>
                <span aria-hidden="true">NT$</span>
                <input
                  id={`${uid}-add`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={addAmount}
                  onChange={(e) => onChange({ amount: e.target.value })}
                  aria-invalid={addBad || undefined}
                />
              </div>
              {addBad ? <p className={s.fieldError}>請填 1 到 {nt(cash)} 之間的整數。</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** After 「繼續」: what each event did, and the one-line lesson (04 §14). */
export function EventResults({
  resolutions,
  onNext,
  nextLabel,
}: {
  resolutions: EventResolution[];
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className={s.stepBody}>
      <h2 className="g-question" tabIndex={-1} data-step-heading>
        結果
      </h2>
      <ul className={s.resultList}>
        {resolutions.map((r, i) => {
          const t = eventText(r.id);
          const label = optionLabel(r.id, r.option);
          return (
            <li key={`${r.id}-${i}`} className={s.result}>
              <p className={s.eventTitle}>{t.title}</p>
              {label && isChoice(r.id) ? <p className="g-caption">你選了「{label}」</p> : null}
              <ul className={s.resultMoney}>
                {r.covered > 0 ? (
                  <li>
                    <PlayIcon name="shield" size={16} />
                    保險付了 {nt(r.covered)}
                  </li>
                ) : null}
                {r.paid > 0 ? (
                  <li>
                    <PlayIcon name="coin" size={16} />
                    你付了 {nt(r.paid)}
                  </li>
                ) : null}
                {r.gain > 0 ? (
                  <li>
                    <PlayIcon name="coin" size={16} />
                    收到 {nt(r.gain)}
                  </li>
                ) : null}
              </ul>
              {/* The insurance note repeats the two lines above. */}
              {r.note && r.covered === 0 ? <p className="g-body">{r.note}</p> : null}
              {t.teaches ? (
                <p className={s.teaches}>
                  <PlayIcon name="bulb" size={16} />
                  <span>{t.teaches}</span>
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
      <Actions>
        <PrimaryButton onClick={onNext}>{nextLabel}</PrimaryButton>
      </Actions>
    </div>
  );
}

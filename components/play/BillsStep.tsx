"use client";

import { useState } from "react";
import BillSheet from "@/components/documents/BillSheet";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import type { BillSource, PublicLifeState } from "@/lib/lifeGame/types";
import type { TurnView } from "@/lib/lifeGame/view";
import { nt } from "./playModel";
import { Actions, ErrorLine, Notice, SampleTag, guard } from "./ui";
import s from "./play.module.css";

interface CoverOption {
  id: BillSource;
  label: string;
  detail: string;
}

/**
 * Step 3 帳單 (02 §4 step 3): the bill sheet, its total, and when cash is
 * short, the ways to cover it in the spec's order. The engine applies the
 * chosen sources in the order sent.
 */
export function BillsStep({
  state,
  view,
  busy,
  error,
  onPay,
}: {
  state: PublicLifeState;
  view: TurnView;
  busy: boolean;
  error: string | null;
  onPay: (cover: BillSource[]) => void;
}) {
  const cash = Math.max(state.accounts.cash, 0);
  const short = view.billsTotal - cash;
  const options = coverOptions(state, view);
  const [picked, setPicked] = useState<Set<BillSource>>(() => new Set(options.length ? [options[0].id] : []));
  const hasIllustrative = view.bills.some((b) => b.illustrative);
  const hasCard = view.bills.some((b) => b.id === "card");

  const toggle = (id: BillSource, on: boolean) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const submit = () => {
    if (short <= 0) return onPay([]);
    onPay(options.filter((o) => picked.has(o.id)).map((o) => o.id));
  };

  return (
    <div className={s.stepBody}>
      <h2 className="g-question" tabIndex={-1} data-step-heading>
        繳這個月的帳單
      </h2>
      <BillSheet
        data={{
          title: "這個月的帳單",
          rows: view.bills.map((b) => ({
            item: b.illustrative ? `${b.label}（示意）` : b.label,
            amount: b.amount,
            day: `${b.day} 日`,
          })),
        }}
      />
      {hasIllustrative ? (
        <p className="g-caption">
          <SampleTag /> 標示示意的金額是舉例，不是真實價格。
        </p>
      ) : null}
      {hasCard ? <p className="g-caption">卡費先繳最低應繳。想多還，到「行動」選還卡債。</p> : null}

      <p className={s.billLine}>
        手上現金 <strong className="g-num">{nt(cash)}</strong>
      </p>

      {short <= 0 ? (
        <Notice tone="good">
          <strong>現金夠付。</strong>繳完還剩 {nt(cash - view.billsTotal)}。
        </Notice>
      ) : (
        <>
          <Notice tone="warn">
            <strong>現金不夠。</strong>還差 {nt(short)}，要從哪裡補？
          </Notice>
          {options.length > 0 ? (
            <fieldset className={s.fieldset}>
              <legend className="g-label">依照順序補，先勾的先用</legend>
              <ol className={s.coverList}>
                {options.map((o, i) => (
                  <li key={o.id}>
                    <label className={s.check}>
                      <input
                        type="checkbox"
                        checked={picked.has(o.id)}
                        onChange={(e) => toggle(o.id, e.target.checked)}
                      />
                      <span>
                        <span className={s.coverNum} aria-hidden="true">
                          {i + 1}
                        </span>
                        {o.label}
                        <span className="g-caption"> {o.detail}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ol>
              {picked.size === 0 ? (
                <p className="g-caption">都不勾的話，系統會照上面的順序幫你補。</p>
              ) : null}
            </fieldset>
          ) : null}
          <p className="g-caption">補不夠的部分會變成欠款，下個月要繳，壓力也會變大。</p>
        </>
      )}

      <ErrorLine message={error} />
      <Actions>
        <PrimaryButton onClick={guard(busy, submit)} aria-disabled={busy || undefined} aria-busy={busy}>
          繳費
        </PrimaryButton>
      </Actions>
    </div>
  );
}

function coverOptions(state: PublicLifeState, view: TurnView): CoverOption[] {
  const out: CoverOption[] = [];
  const takeBack = Math.min(state.pending.savedFirst - state.pending.tookBackSaving, state.accounts.demand);
  if (takeBack > 0) {
    out.push({ id: "saving", label: "拿回一部分這個月存的錢", detail: `最多 ${nt(takeBack)}` });
  }
  if (state.accounts.demand > 0) {
    out.push({ id: "demand", label: "從活存領", detail: `活存有 ${nt(state.accounts.demand)}` });
  }
  if (state.accounts.timeDeposits.length > 0) {
    out.push({ id: "deposit", label: "解約定存", detail: "利息會改用活存利率算（示意，實際是原利率的八成）" });
  }
  if (state.unlocked.includes("card") && view.card.available > 0) {
    out.push({ id: "card", label: "刷信用卡", detail: `可用額度 ${nt(view.card.available)}，下個月要繳` });
  }
  const etf = view.etf.broadValue + view.etf.dividendValue;
  if (etf > 0) {
    out.push({ id: "etf", label: "賣 ETF", detail: `市值 ${nt(etf)}，要付手續費和稅` });
  }
  return out;
}

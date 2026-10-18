"use client";

import { useId, useState, type ReactNode } from "react";
import { Icon } from "@/components/game/icons";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import {
  BILLS,
  BUY_FEE_RATE,
  DEMAND_RATE,
  FLEX_BOUNDS,
  MIN_BROKER_FEE,
  SELL_TAX_RATE,
  SIDE_BUSINESS,
  SKILL,
  TIME_DEPOSIT_RATE,
  TRANSPORT,
} from "@/lib/lifeGame/constants";
import type { ActionsPayload, MoveId, PublicLifeState } from "@/lib/lifeGame/types";
import type { TurnView } from "@/lib/lifeGame/view";
import type { ApiError } from "./api";
import { amountOrZero, nt, parseAmount } from "./playModel";
import { Actions, ErrorLine, Notice, PlayIcon, SampleTag, SecondaryButton, focusStepHeading, guard } from "./ui";
import s from "./play.module.css";

/** Moves that get a card on this step, in the order of 01 §6.4. */
const CARD_MOVES: MoveId[] = [
  "demand",
  "timeDeposit",
  "housingFund",
  "etfBroad",
  "etfDividend",
  "etfMonthly",
  "etfSell",
  "cardRepay",
  "insurance",
  "skill",
  "give",
  "sideBusiness",
  "moveOut",
  "editBills",
];

type SellPart = "none" | "half" | "all";

interface Draft {
  demand: string;
  withdrawDemand: string;
  timeDeposit: string;
  breakDeposit: string; // index or ""
  housingFund: string;
  etfBroad: string;
  etfDividend: string;
  etfMonthly: string;
  sellBroad: SellPart;
  sellDividend: SellPart;
  cardRepay: string;
  insurance: { medical: boolean; accident: boolean; life: boolean };
  startSkill: boolean;
  give: string;
  giveMonthly: boolean;
  startSideBusiness: boolean;
  moveOut: "" | "shared" | "studio";
  food: number;
  daily: number;
  transport: "tpass" | "bike";
}

function initialDraft(state: PublicLifeState): Draft {
  return {
    demand: "",
    withdrawDemand: "",
    timeDeposit: "",
    breakDeposit: "",
    housingFund: "",
    etfBroad: "",
    etfDividend: "",
    etfMonthly: String(state.plan.etfMonthly),
    sellBroad: "none",
    sellDividend: "none",
    cardRepay: "",
    insurance: { ...(state.insuranceNext ?? state.insurance) },
    startSkill: false,
    give: state.plan.givingMonthly > 0 ? String(state.plan.givingMonthly) : "",
    giveMonthly: state.plan.givingMonthly > 0,
    startSideBusiness: false,
    moveOut: "",
    food: state.bills.food,
    daily: state.bills.daily,
    transport: state.bills.transport,
  };
}

const SELL_SHARE: Record<SellPart, number> = { none: 0, half: 0.5, all: 1 };

const pct = (r: number, digits = 3) => `${(r * 100).toFixed(digits).replace(/0+$/, "").replace(/\.$/, "")}%`;

/**
 * Step 4 行動 (02 §3.4, §4 step 4): one card per move. Unlocked moves are
 * interactive; locked ones show a lock and how to unlock them. The student
 * spends leftover cash; the remaining amount is a live preview only.
 */
export function ActionsStep({
  state,
  view,
  busy,
  error,
  onSubmit,
}: {
  state: PublicLifeState;
  view: TurnView;
  busy: boolean;
  error: string | null;
  onSubmit: (moves: ActionsPayload) => Promise<ApiError | null>;
}) {
  const [d, setD] = useState<Draft>(() => initialDraft(state));
  const [readiness, setReadiness] = useState<string | null>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((prev) => ({ ...prev, [k]: v }));

  const has = (m: MoveId) => state.unlocked.includes(m);
  const cash = Math.max(state.accounts.cash, 0);
  const holdsBroad = state.holdings.etfBroad.units > 0;
  const holdsDividend = state.holdings.etfDividend.units > 0;
  const skillRunning = state.skills.find((k) => k.monthsLeft > 0) ?? null;

  // --- live preview (what the student typed, against server balances) ---
  const withdraw = Math.min(amountOrZero(d.withdrawDemand), state.accounts.demand);
  const breakIdx = d.breakDeposit === "" ? null : Number(d.breakDeposit);
  const breakAmount = breakIdx !== null ? (state.accounts.timeDeposits[breakIdx]?.amount ?? 0) : 0;
  // A rough figure for the preview; the server sells at this month's price after fees and tax.
  const saleEstimate =
    Math.round(state.holdings.etfBroad.units * SELL_SHARE[d.sellBroad] * view.prices.etfBroad * (1 - BUY_FEE_RATE - SELL_TAX_RATE)) +
    Math.round(state.holdings.etfDividend.units * SELL_SHARE[d.sellDividend] * view.prices.etfDividend * (1 - BUY_FEE_RATE - SELL_TAX_RATE));
  const giveAmount = amountOrZero(d.give);
  const outflow =
    amountOrZero(d.demand) +
    amountOrZero(d.timeDeposit) +
    amountOrZero(d.housingFund) +
    amountOrZero(d.etfBroad) +
    amountOrZero(d.etfDividend) +
    amountOrZero(d.cardRepay) +
    (d.giveMonthly ? 0 : giveAmount) +
    (d.startSideBusiness ? SIDE_BUSINESS.setup : 0);
  const etfMonthly = has("etfMonthly") ? amountOrZero(d.etfMonthly) : 0;
  const standing = etfMonthly + (d.giveMonthly ? giveAmount : 0);
  const available = cash + withdraw + breakAmount + saleEstimate;
  const remaining = available - outflow - standing;
  const over = available - outflow < 0;

  // --- validation ---
  const problems: string[] = [];
  const badNumber = (raw: string) => raw.trim() !== "" && (parseAmount(raw) === null || (parseAmount(raw) ?? 0) < 0);
  const fields: (keyof Draft)[] = ["demand", "withdrawDemand", "timeDeposit", "housingFund", "etfBroad", "etfDividend", "etfMonthly", "cardRepay", "give"];
  if (fields.some((k) => badNumber(d[k] as string))) problems.push("金額請填 0 以上的整數。");
  if (has("etfMonthly") && etfMonthly > 0 && etfMonthly < view.constants.etfMonthlyMin) {
    problems.push(`定期定額每月最少 ${nt(view.constants.etfMonthlyMin)}，或填 0 停止。`);
  }
  if (amountOrZero(d.cardRepay) > view.card.due) problems.push(`這期卡費只剩 ${nt(view.card.due)} 要繳。`);
  if (amountOrZero(d.withdrawDemand) > state.accounts.demand) problems.push(`活存只有 ${nt(state.accounts.demand)}。`);
  if (over) problems.push("分配的錢超過手上的現金了。");

  const buildMoves = (confirmReadiness: boolean): ActionsPayload => {
    const m: ActionsPayload = {};
    const put = (k: "demand" | "withdrawDemand" | "timeDeposit" | "housingFund" | "etfBroad" | "etfDividend" | "cardRepay", raw: string) => {
      const n = amountOrZero(raw);
      if (n > 0) m[k] = n;
    };
    put("demand", d.demand);
    if (has("demand")) put("withdrawDemand", d.withdrawDemand);
    if (has("timeDeposit")) {
      put("timeDeposit", d.timeDeposit);
      if (breakIdx !== null) m.breakDeposit = breakIdx;
    }
    if (has("housingFund")) put("housingFund", d.housingFund);
    if (has("etfBroad")) put("etfBroad", d.etfBroad);
    if (has("etfDividend")) put("etfDividend", d.etfDividend);
    if (has("etfSell")) {
      if (d.sellBroad !== "none" && holdsBroad) m.sellBroadUnits = state.holdings.etfBroad.units * SELL_SHARE[d.sellBroad];
      if (d.sellDividend !== "none" && holdsDividend) m.sellDividendUnits = state.holdings.etfDividend.units * SELL_SHARE[d.sellDividend];
    }
    if (has("cardRepay")) put("cardRepay", d.cardRepay);
    const plan: NonNullable<ActionsPayload["plan"]> = {};
    if (has("etfMonthly") && etfMonthly !== state.plan.etfMonthly) plan.etfMonthly = etfMonthly;
    if (d.giveMonthly) {
      if (giveAmount !== state.plan.givingMonthly) plan.givingMonthly = giveAmount;
    } else {
      if (state.plan.givingMonthly > 0) plan.givingMonthly = 0;
      if (giveAmount > 0) m.give = giveAmount;
    }
    if (Object.keys(plan).length) m.plan = plan;
    if (has("insurance")) {
      const cur = state.insuranceNext ?? state.insurance;
      const changed = (["medical", "accident", "life"] as const).some((k) => cur[k] !== d.insurance[k]);
      if (changed) m.insurance = { ...d.insurance };
    }
    if (has("skill") && d.startSkill && !skillRunning) m.startSkill = true;
    if (has("sideBusiness") && d.startSideBusiness && !state.sideBusiness?.active) m.startSideBusiness = true;
    if (has("moveOut") && d.moveOut) m.moveOut = d.moveOut;
    if (has("editBills")) {
      const bills: NonNullable<ActionsPayload["bills"]> = {};
      if (d.food !== state.bills.food) bills.food = d.food;
      if (d.daily !== state.bills.daily) bills.daily = d.daily;
      if (d.transport !== state.bills.transport) bills.transport = d.transport;
      if (Object.keys(bills).length) m.bills = bills;
    }
    if (confirmReadiness) m.confirmReadiness = true;
    return m;
  };

  const submit = async (confirmReadiness: boolean) => {
    const err = await onSubmit(buildMoves(confirmReadiness));
    if (err?.needsConfirm?.kind === "readiness") {
      setReadiness(err.needsConfirm.reason);
      focusStepHeading();
    }
  };

  if (readiness) {
    return (
      <div className={s.stepBody}>
        <div className={s.readiness}>
          <p className={s.readinessIcon} aria-hidden="true">
            <PlayIcon name="alert" size={28} />
          </p>
          <h2 className="g-question" tabIndex={-1} data-step-heading>
            先管好錢，再讓錢長大
          </h2>
          <p className="g-body">
            <strong>{readiness}。</strong>
          </p>
          <p className="g-body">投資像冰山的尖端，下面要先有預算、存款，而且沒有高利率的債。</p>
          <p className="g-question">還是要買嗎？</p>
        </div>
        <ErrorLine message={error} />
        <Actions>
          <PrimaryButton onClick={guard(busy, () => submit(true))} aria-disabled={busy || undefined} aria-busy={busy}>
            還是要買
          </PrimaryButton>
          <SecondaryButton
            onClick={() => {
              setReadiness(null);
              setD((prev) => ({ ...prev, etfBroad: "", etfDividend: "", etfMonthly: String(state.plan.etfMonthly) }));
              focusStepHeading();
            }}
            disabled={busy}
          >
            先不買
          </SecondaryButton>
        </Actions>
      </div>
    );
  }

  const unlockedCards = CARD_MOVES.filter((m) => has(m));
  const lockedCards = view.moves.filter((m) => CARD_MOVES.includes(m.id) && !m.unlocked);

  return (
    <div className={s.stepBody}>
      <h2 className="g-question" tabIndex={-1} data-step-heading>
        剩下的錢，要怎麼用？
      </h2>
      <p className="g-body">帳單繳完了。每張卡是一個你可以做的選擇，不做也可以。</p>

      <div className={s.moveGrid}>
        {unlockedCards.includes("demand") ? (
          <MoveCard
            name="存活存"
            does="把現金存進活存，隨時可以領出來。"
            cost={`年利率 ${pct(DEMAND_RATE)}（臺灣銀行活期儲蓄）`}
            risk="利率低，錢長得慢。"
            status={`活存現在有 ${nt(state.accounts.demand)}`}
          >
            <MoneyField label="存進活存" value={d.demand} onChange={(v) => set("demand", v)} />
            <SecondaryButton
              className={s.smallBtn}
              onClick={() => set("demand", String(Math.max(remaining + amountOrZero(d.demand), 0)))}
            >
              剩下的都存
            </SecondaryButton>
            {state.accounts.demand > 0 ? (
              <MoneyField label="從活存領出" value={d.withdrawDemand} onChange={(v) => set("withdrawDemand", v)} />
            ) : null}
          </MoveCard>
        ) : null}

        {unlockedCards.includes("timeDeposit") ? (
          <MoveCard
            name="存定存"
            does="存一年期定存，利率比活存高，每月領利息。"
            cost={`年利率 ${pct(TIME_DEPOSIT_RATE)}（臺灣銀行一年期定存）`}
            risk={
              <>
                提前解約，利息改用活存利率算 <SampleTag />（實際是原利率的八成）
              </>
            }
            status={
              state.accounts.timeDeposits.length
                ? `有 ${state.accounts.timeDeposits.length} 筆定存，共 ${nt(state.accounts.timeDeposits.reduce((a, t) => a + t.amount, 0))}`
                : "還沒有定存"
            }
          >
            <MoneyField label="新存一筆定存" value={d.timeDeposit} onChange={(v) => set("timeDeposit", v)} />
            {state.accounts.timeDeposits.length ? (
              <SelectField
                label="提前解約一筆"
                value={d.breakDeposit}
                onChange={(v) => set("breakDeposit", v)}
                options={[
                  { value: "", label: "不解約" },
                  ...state.accounts.timeDeposits.map((t, i) => ({
                    value: String(i),
                    label: `${nt(t.amount)}（第 ${t.startTurn + 1} 個月存的）`,
                  })),
                ]}
              />
            ) : null}
          </MoveCard>
        ) : null}

        {unlockedCards.includes("housingFund") ? (
          <MoveCard
            name="房屋基金"
            does="為以後租屋或買房專門存的錢。"
            cost={
              <>
                利率同定存 <SampleTag />
              </>
            }
            risk="專款專用，急用時不方便動。"
            status={`房屋基金現在有 ${nt(state.accounts.housingFund)}`}
          >
            <MoneyField label="存進房屋基金" value={d.housingFund} onChange={(v) => set("housingFund", v)} />
          </MoveCard>
        ) : null}

        {unlockedCards.includes("etfBroad") ? (
          <MoveCard
            name="市值型 ETF"
            does="一次買進台灣市值最大的一籃子公司。"
            cost={`手續費 ${pct(BUY_FEE_RATE, 4)}，最低 ${nt(MIN_BROKER_FEE)}`}
            risk="價格會漲也會跌，跌的時候別急著賣。"
            status={`這個月價格 NT$${view.prices.etfBroad.toFixed(2)}，你持有 ${nt(view.etf.broadValue)}`}
          >
            <MoneyField label="買進金額" value={d.etfBroad} onChange={(v) => set("etfBroad", v)} />
            <p className="g-caption">價格是真實的月收盤（{view.dataMonth}）。</p>
          </MoveCard>
        ) : null}

        {unlockedCards.includes("etfDividend") ? (
          <MoveCard
            name="高股息 ETF"
            does="買進配息比較多的一籃子公司。"
            cost={`手續費 ${pct(BUY_FEE_RATE, 4)}，最低 ${nt(MIN_BROKER_FEE)}`}
            risk="配息多，不代表總報酬比較高。"
            status={`這個月價格 NT$${view.prices.etfDividend.toFixed(2)}，你持有 ${nt(view.etf.dividendValue)}`}
          >
            <MoneyField label="買進金額" value={d.etfDividend} onChange={(v) => set("etfDividend", v)} />
          </MoveCard>
        ) : null}

        {unlockedCards.includes("etfMonthly") ? (
          <MoveCard
            name="定期定額"
            does="每個月自動買市值型 ETF，不用自己挑時間。"
            cost={`每月最少 ${nt(view.constants.etfMonthlyMin)}，填 0 就是停止`}
            risk="現金不夠的月份會扣不到款。"
            status={state.plan.etfMonthly > 0 ? `現在每月扣 ${nt(state.plan.etfMonthly)}` : "還沒設定"}
          >
            <MoneyField label="每月金額（這個月開始）" value={d.etfMonthly} onChange={(v) => set("etfMonthly", v)} />
          </MoveCard>
        ) : null}

        {unlockedCards.includes("etfSell") ? (
          <MoveCard
            name="賣出 ETF"
            does="用這個月的價格賣掉持有的 ETF。"
            cost={`手續費 ${pct(BUY_FEE_RATE, 4)}，加證交稅 ${pct(SELL_TAX_RATE)}`}
            risk="跌的時候賣，帳面虧損就變成真的虧損。"
            status={holdsBroad || holdsDividend ? `持有市值 ${nt(view.etf.broadValue + view.etf.dividendValue)}` : "目前沒有 ETF 可以賣"}
          >
            {holdsBroad ? (
              <SellChoice label="市值型 ETF" value={d.sellBroad} onChange={(v) => set("sellBroad", v)} />
            ) : null}
            {holdsDividend ? (
              <SellChoice label="高股息 ETF" value={d.sellDividend} onChange={(v) => set("sellDividend", v)} />
            ) : null}
            {saleEstimate > 0 ? <p className="g-caption">大約可以拿回 {nt(saleEstimate)}，以成交為準。</p> : null}
          </MoveCard>
        ) : null}

        {unlockedCards.includes("cardRepay") ? (
          <MoveCard
            name="還卡債"
            does="比最低應繳多還一點，少付利息。"
            cost={view.card.due > 0 ? `這期還沒繳 ${nt(view.card.due)}` : "這期卡費已經繳清"}
            risk="只繳最低，剩下的會一直生利息。"
            status={`信用卡欠款 ${nt(view.card.balance)}`}
          >
            {view.card.due > 0 ? (
              <>
                <MoneyField label="多還的金額" value={d.cardRepay} onChange={(v) => set("cardRepay", v)} />
                <SecondaryButton className={s.smallBtn} onClick={() => set("cardRepay", String(Math.min(view.card.due, cash)))}>
                  全部繳清
                </SecondaryButton>
              </>
            ) : null}
          </MoveCard>
        ) : null}

        {unlockedCards.includes("insurance") ? (
          <MoveCard
            name="保險"
            does="用小小的保費，換大筆意外開銷的保障。"
            cost={
              <>
                每月保費，下個月開始保障 <SampleTag />
              </>
            }
            risk="小又常見的損失，保險不會賠。"
          >
            <fieldset className={s.fieldset}>
              <legend className="sr-only">選擇保單</legend>
              <Toggle
                label={`醫療險（實支實付）每月 ${nt(view.constants.insurance.medical.premium)}`}
                hint={`住院費用理賠 ${Math.round(view.constants.insurance.medical.share * 100)}%，每次最多 ${nt(view.constants.insurance.medical.capPerEvent)}`}
                checked={d.insurance.medical}
                onChange={(v) => set("insurance", { ...d.insurance, medical: v })}
              />
              <Toggle
                label={`意外險 每月 ${nt(view.constants.insurance.accident.premium)}`}
                hint="意外醫藥費全賠"
                checked={d.insurance.accident}
                onChange={(v) => set("insurance", { ...d.insurance, accident: v })}
              />
              <Toggle
                label={`壽險 每月 ${nt(view.constants.insurance.life.premium)}`}
                hint="沒有人靠你的收入生活時，用處不大"
                checked={d.insurance.life}
                onChange={(v) => set("insurance", { ...d.insurance, life: v })}
              />
            </fieldset>
            <p className="g-caption">下個月開始保障，保費從下個月的帳單扣。</p>
          </MoveCard>
        ) : null}

        {unlockedCards.includes("skill") ? (
          <MoveCard
            name="學技能"
            does="上課學一項技能，學完加薪的機會變大。"
            cost={
              <>
                每月 {nt(SKILL.monthly)}，共 {SKILL.months} 個月 <SampleTag />
              </>
            }
            risk="要花錢也要花時間，加薪不是保證。"
            status={skillRunning ? `學習中，還有 ${skillRunning.monthsLeft} 個月` : undefined}
          >
            {!skillRunning ? (
              <Toggle label="開始學（從下個月的帳單扣學費）" checked={d.startSkill} onChange={(v) => set("startSkill", v)} />
            ) : null}
          </MoveCard>
        ) : null}

        {unlockedCards.includes("give") ? (
          <MoveCard
            name="助人"
            does="把錢給需要的人或團體。錢不會回來，但心情會好一點。"
            cost="金額自己決定"
            risk="量力而為，先顧好自己的帳單。"
            status={state.givingTotal > 0 ? `你已經幫助別人 ${nt(state.givingTotal)}` : undefined}
          >
            <MoneyField label="這次給" value={d.give} onChange={(v) => set("give", v)} />
            <Toggle label="以後每個月都給這麼多" checked={d.giveMonthly} onChange={(v) => set("giveMonthly", v)} />
          </MoveCard>
        ) : null}

        {unlockedCards.includes("sideBusiness") ? (
          <MoveCard
            name="副業"
            does="花一筆開辦費，開始經營副業。"
            cost={
              <>
                開辦費 {nt(SIDE_BUSINESS.setup)} <SampleTag />
              </>
            }
            risk="每月收入不固定，也可能虧錢。"
            status={state.sideBusiness?.active ? "副業經營中" : undefined}
          >
            {!state.sideBusiness?.active ? (
              <Toggle label="開始經營副業" checked={d.startSideBusiness} onChange={(v) => set("startSideBusiness", v)} />
            ) : null}
          </MoveCard>
        ) : null}

        {unlockedCards.includes("moveOut") ? (
          <MoveCard
            name="搬出去住"
            does="自己租房子，下個月搬。"
            cost={
              <>
                雅房 {nt(BILLS.rentShared)}，套房 {nt(BILLS.rentStudio)}，另加水電 {nt(BILLS.utilitiesRenting)} <SampleTag />
              </>
            }
            risk="房租是最大的帳單，搬了就很難降下來。"
            status={
              state.moveOutNext
                ? `下個月搬進${state.moveOutNext === "shared" ? "雅房" : "套房"}`
                : `現在住${state.housing === "family" ? "家裡" : state.housing === "shared" ? "雅房" : "套房"}`
            }
          >
            <RadioGroup
              label="要搬嗎？"
              value={d.moveOut}
              onChange={(v) => set("moveOut", v as Draft["moveOut"])}
              options={[
                { value: "", label: "先不搬" },
                ...(state.housing !== "shared" ? [{ value: "shared", label: "搬進雅房" }] : []),
                ...(state.housing !== "studio" ? [{ value: "studio", label: "搬進套房" }] : []),
              ]}
            />
          </MoveCard>
        ) : null}

        {unlockedCards.includes("editBills") ? (
          <MoveCard
            name="調整開銷"
            does="調整餐費、日用品和交通方式，從下個月的帳單開始。"
            cost={
              <>
                範圍有上下限 <SampleTag />
              </>
            }
            risk="省太兇很難撐久，訂一個做得到的數字。"
          >
            <RangeField
              label="餐費"
              value={d.food}
              min={FLEX_BOUNDS.food.min}
              max={FLEX_BOUNDS.food.max}
              step={FLEX_BOUNDS.food.step}
              onChange={(v) => set("food", v)}
            />
            <RangeField
              label="日用品"
              value={d.daily}
              min={FLEX_BOUNDS.daily.min}
              max={FLEX_BOUNDS.daily.max}
              step={FLEX_BOUNDS.daily.step}
              onChange={(v) => set("daily", v)}
            />
            <RadioGroup
              label="交通"
              value={d.transport}
              onChange={(v) => set("transport", v as Draft["transport"])}
              options={[
                { value: "tpass", label: `TPASS 月票 ${nt(TRANSPORT.tpass)}` },
                { value: "bike", label: `騎腳踏車 ${nt(TRANSPORT.bike)}（示意）` },
              ]}
            />
          </MoveCard>
        ) : null}
      </div>

      {lockedCards.length ? (
        <section aria-label="還沒解鎖的行動" className={s.lockedWrap}>
          <h3 className="g-label">還沒解鎖</h3>
          <ul className={s.lockedGrid}>
            {lockedCards.map((m) => (
              <li key={m.id} className={s.lockedCard}>
                <Icon name="lock" size={16} />
                <span className={s.lockedName}>{m.label}</span>
                <span className="g-caption">{m.lockedHint}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className={s.allocBar} aria-live="polite">
        <div>
          <span className="g-caption">手上現金 {nt(cash)}</span>
          {standing > 0 ? <span className="g-caption">，固定計畫 {nt(standing)}</span> : null}
        </div>
        <p className={`${s.allocLeft} ${remaining < 0 ? s.tone_bad : ""}`}>
          還沒分配 <strong className="g-num">{nt(remaining)}</strong>
        </p>
        {!over && remaining < 0 ? <p className="g-caption">現金不夠時，這個月的固定計畫會先暫停。</p> : null}
      </div>

      {problems.length ? (
        <Notice tone="warn">
          {problems.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Notice>
      ) : null}
      <ErrorLine message={error} />
      <Actions>
        <PrimaryButton onClick={guard(busy || problems.length > 0, () => submit(false))} aria-disabled={(busy || problems.length > 0) || undefined} aria-busy={busy}>
          確定
        </PrimaryButton>
      </Actions>
    </div>
  );
}

// --- pieces ------------------------------------------------------------------

function MoveCard({
  name,
  does,
  cost,
  risk,
  status,
  children,
}: {
  name: string;
  does: string;
  cost: ReactNode;
  risk: ReactNode;
  status?: string;
  children?: ReactNode;
}) {
  const id = useId();
  return (
    <section className={s.moveCard} aria-labelledby={id}>
      <h3 id={id} className={s.moveName}>
        {name}
      </h3>
      <p className={s.moveDoes}>{does}</p>
      <p className={s.moveCost}>
        <PlayIcon name="coin" size={16} />
        <span>{cost}</span>
      </p>
      <p className={s.moveRisk}>
        <PlayIcon name="alert" size={16} />
        <span>
          <span className="sr-only">風險：</span>
          {risk}
        </span>
      </p>
      {status ? <p className={s.moveStatus}>{status}</p> : null}
      {children ? <div className={s.moveControls}>{children}</div> : null}
    </section>
  );
}

function MoneyField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  const bad = value.trim() !== "" && (parseAmount(value) === null || (parseAmount(value) ?? 0) < 0);
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.fieldLabel}>
        {label}
      </label>
      <div className={s.moneyInput}>
        <span aria-hidden="true">NT$</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={bad || undefined}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.fieldLabel}>
        {label}
      </label>
      <select id={id} className={s.select} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={s.check}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        {label}
        {hint ? <span className={`g-caption ${s.block}`}>{hint}</span> : null}
      </span>
    </label>
  );
}

function RadioGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const name = useId();
  return (
    <fieldset className={s.fieldset}>
      <legend className={s.fieldLabel}>{label}</legend>
      <div className={s.radios}>
        {options.map((o) => (
          <label key={o.value} className={s.radio}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SellChoice({ label, value, onChange }: { label: string; value: SellPart; onChange: (v: SellPart) => void }) {
  return (
    <RadioGroup
      label={label}
      value={value}
      onChange={(v) => onChange(v as SellPart)}
      options={[
        { value: "none", label: "不賣" },
        { value: "half", label: "賣一半" },
        { value: "all", label: "全部賣" },
      ]}
    />
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className={s.field}>
      <div className={s.rangeHead}>
        <label htmlFor={id} className={s.fieldLabel}>
          {label}
        </label>
        <span className="g-num">{nt(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        className={s.range}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={nt(value)}
      />
    </div>
  );
}

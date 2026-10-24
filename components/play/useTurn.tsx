"use client";

import { useEffect, useRef, useState } from "react";
import { FAST_FORWARD_TURNS } from "@/lib/lifeGame/constants";
import type { Action, ActionsPayload, BillSource, EventResolution, LedgerCells, LifestyleLevel, TurnRecord } from "@/lib/lifeGame/types";
import { SOLO_ENDPOINTS, fetchGame, postAction, type ApiError, type ApiResult, type PlayEndpoints } from "./api";
import { ActionsStep } from "./ActionsStep";
import { BillsStep } from "./BillsStep";
import { EventResults, EventsStep, type EventChoice } from "./EventsStep";
import { LedgerStep } from "./LedgerStep";
import { FastForwardSummary, MonthSummary, type LedgerResult } from "./MonthSummary";
import { PaydayStep } from "./PaydayStep";
import { LifestyleStep } from "./LifestyleStep";
import { SaveFirstStep } from "./SaveFirstStep";
import { PHASE_STEP, STEPS, errorText, type GamePayload } from "./playModel";
import { focusStepHeading } from "./ui";

/** What the screen shows between server steps: results the student reads before moving on. */
export type Review =
  | { kind: "events"; resolutions: EventResolution[]; record: TurnRecord | null }
  | { kind: "summary"; record: TurnRecord; ledger?: LedgerResult }
  | { kind: "fastForward"; records: TurnRecord[] };

/**
 * The life-game turn's state and actions, shared by the older turn screen
 * (PlayScreen) and the Part E one (TurnFlow). Holds the server payload and
 * builds the current step's card body. Every number shown comes from the
 * latest server payload; the client only previews what the student types.
 */
export function useTurn({
  initial,
  name,
  endpoints = SOLO_ENDPOINTS,
  ride,
  onFinish,
}: {
  initial: GamePayload;
  name: string;
  endpoints?: PlayEndpoints;
  /** After the month: ride on (when the turn came from a station). */
  ride?: { onRide: () => void; nextLabel: string | null };
  /** After the month, without a ride: leave the game (the Part E turn). */
  onFinish?: () => void;
}) {
  const [payload, setPayload] = useState<GamePayload>(initial);
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inFlight = useRef(false);
  const { state, view } = payload;

  const stepKey = `${state.turn}-${state.phase}-${review?.kind ?? "step"}`;
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    focusStepHeading();
  }, [stepKey]);

  /**
   * Send one action. Refetches on a stale turn (409); returns the result to
   * the caller. `pick` chooses what to show next from the new payload, set in
   * the same render as the payload so the next step never flashes first.
   */
  async function send(action: Action, pick?: (p: GamePayload) => Review | null | undefined): Promise<ApiResult | null> {
    if (inFlight.current) return null;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);
    const res = await postAction({ turn: state.turn, phase: state.phase }, action, endpoints);
    if (res.ok) {
      const next = pick?.(res.payload);
      setPayload(res.payload);
      if (next !== undefined) setReview(next);
    } else if (res.err.status === 409 || res.err.error === "wrong_phase") {
      const fresh = await fetchGame(endpoints);
      if (fresh.ok) {
        setPayload(fresh.payload);
        setReview(null);
        setNotice("遊戲在別的分頁前進了，已經更新到最新進度。");
      } else {
        setError(errorText(fresh.err.error));
      }
    } else if (!res.err.needsConfirm) {
      setError(errorText(res.err.error));
    }
    inFlight.current = false;
    setBusy(false);
    return res;
  }

  const onCollect = () => void send({ type: "collectPay" });
  const onSave = (amount: number, remember: boolean) => void send({ type: "saveFirst", amount, remember });
  const onPay = (cover: BillSource[]) => void send({ type: "payBills", cover });
  const onLifestyle = (level: LifestyleLevel) => void send({ type: "lifestyle", level });

  const onActions = async (moves: ActionsPayload): Promise<ApiError | null> => {
    const res = await send({ type: "actions", moves });
    return res && !res.ok ? res.err : null;
  };

  const onEvents = (choices: Record<string, EventChoice>) => {
    const turn = state.turn;
    void send({ type: "events", choices }, (p) => {
      const next = p.state;
      if (next.turn === turn && next.phase === "ledger") {
        const resolutions = next.pending.resolved;
        return resolutions.length ? { kind: "events", resolutions, record: null } : null;
      }
      const record = next.history.at(-1);
      if (!record) return null;
      return record.events.length ? { kind: "events", resolutions: record.events, record } : { kind: "summary", record };
    });
  };

  const onLedger = (cells: Partial<LedgerCells>, hints: Record<string, string>) => {
    const turn = state.turn;
    void send({ type: "ledger", cells }, (p) => {
      if (p.state.turn === turn) return undefined; // a wrong first try: the step shows the hints
      const record = p.state.history.at(-1);
      return record ? { kind: "summary", record, ledger: { submitted: cells, hints } } : null;
    });
  };

  const onFastForward = () => {
    const from = state.turn;
    void send({ type: "fastForward" }, (p) => ({
      kind: "fastForward",
      records: p.state.history.filter((h) => h.autopilot && h.turn >= from),
    }));
  };

  const afterEvents = () => {
    if (review?.kind === "events" && review.record) setReview({ kind: "summary", record: review.record });
    else setReview(null);
  };

  // Which step is current, and which month the screen is about.
  const current =
    review?.kind === "fastForward"
      ? STEPS.length
      : review?.kind === "events"
        ? PHASE_STEP.event
        : review?.kind === "summary"
          ? PHASE_STEP.ledger
          : PHASE_STEP[state.phase];
  const shownTurn =
    review?.kind === "summary" ? review.record.turn : review?.kind === "events" && review.record ? review.record.turn : state.turn;
  const ledgerTurn = (shownTurn + 1) % 3 === 0;
  const wide = !review && state.phase === "actions";
  const stepTitle =
    review?.kind === "fastForward" ? "快轉一年" : current === PHASE_STEP.ledger && !ledgerTurn ? "月底" : STEPS[Math.min(current, PHASE_STEP.ledger)];

  let body: React.ReactNode;
  if (review?.kind === "events") {
    body = <EventResults resolutions={review.resolutions} onNext={afterEvents} />;
  } else if (review?.kind === "summary") {
    body = <MonthSummary record={review.record} ledger={review.ledger} onNext={() => setReview(null)} ride={ride} onFinish={onFinish} />;
  } else if (review?.kind === "fastForward") {
    body = <FastForwardSummary records={review.records} wanted={FAST_FORWARD_TURNS} onNext={() => setReview(null)} />;
  } else {
    const common = { state, busy, error };
    switch (state.phase) {
      case "payday":
        body = <PaydayStep {...common} view={view} onCollect={onCollect} onFastForward={onFastForward} />;
        break;
      case "saveFirst":
        body = <SaveFirstStep {...common} view={view} onSave={onSave} />;
        break;
      case "bills":
        body = <BillsStep {...common} view={view} onPay={onPay} />;
        break;
      case "lifestyle":
        body = <LifestyleStep {...common} onChoose={onLifestyle} />;
        break;
      case "actions":
        body = <ActionsStep {...common} view={view} onSubmit={onActions} />;
        break;
      case "event":
        body = <EventsStep {...common} view={view} name={name} onSubmit={onEvents} />;
        break;
      case "ledger":
        body = <LedgerStep {...common} onSubmit={onLedger} />;
        break;
    }
  }

  return { state, view, review, busy, notice, body, stepKey, current, shownTurn, ledgerTurn, wide, stepTitle };
}

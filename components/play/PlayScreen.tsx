"use client";

import { useState } from "react";
import { FloatCard } from "@/components/game/FloatCard";
import type { Avatar } from "@/lib/avatar";
import { SOLO_ENDPOINTS, type PlayEndpoints } from "./api";
import { PlayCharacter } from "./PlayCharacter";
import { PlayRide } from "./PlayRide";
import { PlayTopBar } from "./PlayTopBar";
import { StepStrip } from "./StepStrip";
import type { RideTarget } from "./rideModel";
import { keyNumbers, playStatusLine, type GamePayload } from "./playModel";
import { Notice } from "./ui";
import { useTurn } from "./useTurn";
import s from "./play.module.css";

/**
 * The life-game turn screen (01 §6.4), older look: the class-mode team page
 * and /play. The Part E turn is components/game/TurnFlow; both share useTurn.
 *
 * Step changes are plain state + CSS (no requestAnimationFrame), so a hidden
 * tab still finishes them (02 §9 test 13). Focus moves to each new step's
 * heading by a timeout, so the whole turn is playable by keyboard.
 */
export function PlayScreen({
  initial,
  name,
  avatar,
  endpoints = SOLO_ENDPOINTS,
  title = "人生遊戲",
  ride = null,
  seenFullRides = 0,
}: {
  initial: GamePayload;
  name: string;
  avatar: Avatar | null;
  /** Where to load and advance the game. Default: the student's solo save. */
  endpoints?: PlayEndpoints;
  /** 人生遊戲 (solo) by default; class rooms pass 人生賽局 (05 A8.1). */
  title?: string;
  /** Came from a station (/play?return=…): after the month, ride on to the next station. */
  ride?: RideTarget | null;
  /** Full train rides already watched (profile.seenFullRides). */
  seenFullRides?: number;
}) {
  const [riding, setRiding] = useState(false);
  const { state, view, notice, body, stepKey, current, shownTurn, ledgerTurn, wide, stepTitle } = useTurn({
    initial,
    name,
    endpoints,
    ride: ride ? { onRide: () => setRiding(true), nextLabel: ride.nextLabel } : undefined,
  });

  const numbers = keyNumbers(state, view);

  return (
    <div className={s.screen}>
      <h1 className="sr-only">{title}</h1>
      <PlayTopBar month={shownTurn + 1} numbers={numbers} freedomPct={state.stats.freedomPct} />
      {/* One concise line per step change instead of five live pills. */}
      <p className="sr-only" role="status">
        {playStatusLine(shownTurn + 1, stepTitle, numbers)}
      </p>
      <StepStrip current={current} ledgerTurn={ledgerTurn} />
      {notice ? (
        <div className={s.noticeWrap}>
          <Notice tone="info" live>
            {notice}
          </Notice>
        </div>
      ) : null}
      <div className={s.stage}>
        <FloatCard
          key={stepKey}
          strong
          title={stepTitle}
          titleAs="p"
          className={[s.stepCard, wide && s.stepCardWide].filter(Boolean).join(" ")}
        >
          {body}
        </FloatCard>
      </div>
      <PlayCharacter avatar={avatar} name={name} level={view.stress.level} mood={view.stress.mood} />
      {riding && ride ? <PlayRide ride={ride} avatar={avatar} seenFullRides={seenFullRides} month={shownTurn + 1} /> : null}
    </div>
  );
}

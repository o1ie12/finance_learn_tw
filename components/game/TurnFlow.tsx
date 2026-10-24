"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LessonBar } from "@/components/flow/LessonBar";
import { SOLO_ENDPOINTS, type PlayEndpoints } from "@/components/play/api";
import { STEPS, keyNumbers, playStatusLine, type GamePayload } from "@/components/play/playModel";
import type { RideTarget } from "@/components/play/rideModel";
import { Notice } from "@/components/play/ui";
import { MetroRide } from "@/components/transition/MetroRide";
import { useTurn } from "@/components/play/useTurn";
import { MoneyStrip } from "./MoneyStrip";
import s from "./turn.module.css";

/**
 * The life-game turn (06 E8.6, 2026-10-24 redesign): the glass bar
 * 「第 N 個月」 with the seven-step rail, a 40px money strip (現金 and
 * 緊急預備金 only), then one step card. Same engine, API and step logic as
 * the older screen (useTurn); only the frame and the look differ. From a
 * station, the MRT car carries the student on to the next one.
 */
export function TurnFlow({
  initial,
  name,
  exitHref,
  endpoints = SOLO_ENDPOINTS,
  ride = null,
}: {
  initial: GamePayload;
  name: string;
  exitHref: string;
  endpoints?: PlayEndpoints;
  /** Came from a station: after the month, ride on to the next one (E11). */
  ride?: RideTarget | null;
}) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [riding, setRiding] = useState(false);
  const goRide = () => {
    if (ride) setRiding(true);
  };
  const t = useTurn({
    initial,
    name,
    endpoints,
    ride: ride ? { onRide: goRide, nextLabel: ride.nextLabel } : undefined,
    onFinish: () => {
      setLeaving(true);
      router.push(exitHref);
    },
  });
  const { state, view } = t;
  const numbers = keyNumbers(state, view);
  const stepNo = Math.min(t.current + 1, STEPS.length);

  return (
    <div className={s.turn} data-design="e" aria-busy={leaving || undefined}>
      <LessonBar
        title={`第 ${t.shownTurn + 1} 個月`}
        subtitle={`人生模擬 · ${t.stepTitle}`}
        close={{ href: exitHref }}
        step={stepNo}
        total={STEPS.length}
      />
      <p className="sr-only" role="status">
        {playStatusLine(t.shownTurn + 1, t.stepTitle, numbers)}
      </p>
      <MoneyStrip cash={numbers.cash} efMonths={view.efMonths} />
      {t.notice ? (
        <div className={s.notice}>
          <Notice tone="info" live>
            {t.notice}
          </Notice>
        </div>
      ) : null}
      <div className={s.region}>
        <section key={t.stepKey} className={`${s.card} ${t.wide ? s.cardWide : ""}`} aria-label={t.stepTitle}>
          {t.body}
        </section>
      </div>
      {riding && ride ? (
        <MetroRide
          gate={false}
          color={ride.to.lineColor}
          lineName={ride.to.lineName}
          enName={ride.sign.lineEnName.toUpperCase()}
          station={ride.to.stationName}
          code={ride.sign.stationCode}
          onDone={() => router.push(ride.returnTo)}
        />
      ) : null}
    </div>
  );
}

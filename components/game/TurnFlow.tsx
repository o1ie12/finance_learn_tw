"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Character } from "@/components/art/Character";
import type { Look } from "@/components/art/look";
import { Scene, type SceneKind } from "@/components/art/scenes";
import { Rail } from "@/components/ui/Rail";
import { TopBar } from "@/components/ui/TopBar";
import { SOLO_ENDPOINTS, type PlayEndpoints } from "@/components/play/api";
import { STEPS, keyNumbers, playStatusLine, type GamePayload } from "@/components/play/playModel";
import type { RideTarget } from "@/components/play/rideModel";
import { Notice } from "@/components/play/ui";
import { Train } from "@/components/transition/Train";
import { useTurn } from "@/components/play/useTurn";
import { MoneyStrip } from "./MoneyStrip";
import { turnMood } from "./turnMood";
import s from "./turn.module.css";

/**
 * The life-game turn on the Part E frame (06 E8.6): flat bar 「第 N 個月」,
 * a seven-step rail, a 40px money strip (現金 and 緊急預備金 only), a 160px
 * world band with the character, then one step card. The world band hides
 * under 740px of height. Same engine, API and step logic as the older screen
 * (useTurn); only the frame and the look differ.
 */
export function TurnFlow({
  initial,
  look,
  world,
  exitHref,
  endpoints = SOLO_ENDPOINTS,
  ride = null,
  seenFullRides = 0,
}: {
  initial: GamePayload;
  look: Look;
  world: SceneKind;
  exitHref: string;
  endpoints?: PlayEndpoints;
  /** Came from a station: after the month, ride on to the next one (E11). */
  ride?: RideTarget | null;
  /** Full rides already watched (profile.seenFullRides): after three, rides are short. */
  seenFullRides?: number;
}) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [riding, setRiding] = useState(false);
  const goRide = () => {
    if (ride) setRiding(true);
  };
  const t = useTurn({
    initial,
    name: look.name,
    endpoints,
    ride: ride ? { onRide: goRide, nextLabel: ride.nextLabel } : undefined,
    onFinish: () => {
      setLeaving(true);
      router.push(exitHref);
    },
  });
  const { state, view, review } = t;
  const numbers = keyNumbers(state, view);
  const stepNo = Math.min(t.current + 1, STEPS.length);
  const mood = turnMood(state, view, review?.kind === "events" ? review.resolutions : null);

  return (
    <div className={s.turn} data-design="e" aria-busy={leaving || undefined}>
      <TopBar
        title={`第 ${t.shownTurn + 1} 個月`}
        subtitle={`${t.stepTitle} · 第 ${stepNo} 步，共 ${STEPS.length} 步`}
        flat
        close={{ href: exitHref }}
      />
      <Rail step={stepNo} total={STEPS.length} />
      <p className="sr-only" role="status">
        {playStatusLine(t.shownTurn + 1, t.stepTitle, numbers)}
      </p>
      <MoneyStrip cash={numbers.cash} efMonths={view.efMonths} />
      <div className={s.band} aria-hidden="true">
        <Scene kind={world} className={s.bandScene} />
        <div className={s.bandFigure}>
          <Character look={look} mood={mood} width={108} rim={world === "platform"} />
        </div>
      </div>
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
        <Train
          look={look}
          to={{ ...ride.to, signCode: [ride.sign.lineEnName, ride.sign.stationCode].filter(Boolean).join(" · ") }}
          seenFullRides={seenFullRides}
          onFullRideComplete={() => {
            // The server adds one; the browser sends nothing (app/api/rides).
            void fetch("/api/rides", { method: "POST", keepalive: true }).catch(() => {});
          }}
          onDone={() => router.push(ride.returnTo)}
        />
      ) : null}
    </div>
  );
}

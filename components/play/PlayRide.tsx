"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar/Avatar";
import TrainTransition from "@/components/transition/TrainTransition";
import type { Avatar as AvatarData } from "@/lib/avatar";
import type { RideTarget } from "./rideModel";
import s from "./play.module.css";

/**
 * After a station's life-game month: the train ride to the next station
 * (01 §7.3), then back to the station flow. The character is drawn from
 * behind; without a built avatar, a plain back-view figure stands in.
 */
export function PlayRide({
  ride,
  avatar,
  seenFullRides,
  month,
}: {
  ride: RideTarget;
  avatar: AvatarData | null;
  seenFullRides: number;
  month: number;
}) {
  const router = useRouter();
  return (
    <TrainTransition
      from={{ lineColor: "var(--station-mullion)", stationName: "人生賽局", lineEnName: "LIFE", stationCode: `M${month}` }}
      to={ride.to}
      character={avatar ? <Avatar avatar={avatar} view="back" size={120} /> : <BackPlaceholder />}
      seenFullRides={seenFullRides}
      onFullRideComplete={() => {
        // The server adds one; the browser sends nothing (app/api/rides).
        void fetch("/api/rides", { method: "POST", keepalive: true }).catch(() => {});
      }}
      onDone={() => router.push(ride.returnTo)}
    />
  );
}

function BackPlaceholder() {
  return (
    <svg viewBox="0 0 120 175" aria-hidden="true" focusable="false" className={s.placeholder}>
      <rect x="30" y="8" width="60" height="62" rx="18" className={s.phHair} />
      <rect x="22" y="76" width="76" height="62" rx="16" className={s.phBody} />
      <rect x="34" y="138" width="20" height="32" rx="6" className={s.phLeg} />
      <rect x="66" y="138" width="20" height="32" rx="6" className={s.phLeg} />
    </svg>
  );
}

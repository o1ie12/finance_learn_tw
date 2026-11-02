"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LessonBar } from "@/components/flow/LessonBar";
import { Icon } from "@/components/ui/icons";
import { SOLO_ENDPOINTS, type PlayEndpoints } from "@/components/play/api";
import { STEPS, keyNumbers, nt, playStatusLine, type GamePayload } from "@/components/play/playModel";
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
/** One line per step: what it is for (2026-11-02: instructions on the page). */
const STEP_HELP = [
  "薪水入帳，薪資單告訴你扣完勞健保實拿多少。",
  "錢一進來先存一筆，剩下的才拿來花。",
  "繳房租、伙食、交通這些每月固定的錢。",
  "決定這個月過得省、普通還是享受。",
  "用剩下的錢做決定：存、投資、還債或進修。",
  "生活裡的意外和機會，看你準備得夠不夠。",
  "對一次帳，看這個月的錢去哪了。",
];

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
      <div className={s.stripPhone}>
        <MoneyStrip cash={numbers.cash} efMonths={view.efMonths} />
      </div>
      {t.notice ? (
        <div className={s.notice}>
          <Notice tone="info" live>
            {t.notice}
          </Notice>
        </div>
      ) : null}
      {/* 2026-11-02: the month on one page. The flow and what each step is for
          on the left, always visible; the step to do now on the right. */}
      <div className={s.desk}>
        <aside className={s.flowPanel} aria-label="本月流程">
          <p className={s.flowTitle}>本月流程 · 第 {t.shownTurn + 1} 個月</p>
          <ol className={s.flowList}>
            {STEPS.map((label, i) => (
              <li key={label} data-state={i < t.current ? "done" : i === t.current ? "on" : undefined} aria-current={i === t.current ? "step" : undefined}>
                <span className={s.flowDot} aria-hidden="true">{i < t.current ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}</span>
                <span>
                  <b>{label}</b>
                  <small>{STEP_HELP[i]}</small>
                </span>
              </li>
            ))}
          </ol>
          <dl className={s.flowNums}>
            <div><dt>現金</dt><dd>{nt(numbers.cash)}</dd></div>
            <div><dt>存款</dt><dd>{nt(numbers.savings)}</dd></div>
            <div><dt>投資</dt><dd>{nt(numbers.invest)}</dd></div>
            <div><dt>負債</dt><dd>{nt(numbers.debt)}</dd></div>
          </dl>
          <p className={s.flowNote}>每個月都是這七步。做完這個月，錢和壓力會帶到下個月；路線上的任務做完，會解鎖更多行動。</p>
        </aside>
        <div className={s.region}>
          <section key={t.stepKey} className={`${s.card} ${t.wide ? s.cardWide : ""}`} aria-label={t.stepTitle}>
            <p className={s.stepKicker}>第 {stepNo} 步，共 {STEPS.length} 步 · {t.stepTitle}</p>
            <p className={s.stepHelp}>{STEP_HELP[Math.min(t.current, STEP_HELP.length - 1)]}</p>
            {t.body}
          </section>
        </div>
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

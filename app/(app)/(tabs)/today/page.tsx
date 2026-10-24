import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Character } from "@/components/art/Character";
import { lookFromAvatar, moodFromStress } from "@/components/art/look";
import { Scene } from "@/components/art/scenes";
import { Bubble, Card, NamePlate, Sign, Voice } from "@/components/ui/Bits";
import { Button } from "@/components/ui/Button";
import { PillBar } from "@/components/ui/TopBar";
import { lineCode } from "./sign";
import { lineVars } from "@/lib/design/lineVars";
import { SHORTS } from "@/content/shorts";
import { getTaskResults } from "@/lib/db";
import { loadGameHome } from "@/lib/gameHome";
import { getLine } from "@/lib/lines";
import { needsOnboarding } from "@/lib/onboarding";
import { getCurrentStudent } from "@/lib/session";
import s from "./today.module.css";

export const metadata: Metadata = { title: "今天" };

/**
 * 今天 (06 E8.1): you wait on the platform for today's train; the sign names
 * where it goes; 上車 rides there. Only 上車 and the tabs act: the character
 * is not a button.
 */
export default async function TodayPage() {
  const student = await getCurrentStudent().catch(() => null);
  if (!student) redirect("/dashboard");
  if (needsOnboarding(student)) redirect("/creator");

  const [data, results] = await Promise.all([loadGameHome(student), getTaskResults(student.id).catch(() => [])]);
  // 06 F3.10: today's Short, the first one not done yet; once all are done,
  // the next in turn (moves on with every task the student submits).
  const done = new Set(results.map((r) => r.task_set_id));
  const short = SHORTS.find((x) => !done.has(x.id)) ?? SHORTS[results.length % SHORTS.length];
  const view = data.game?.view;
  const level = view?.stress.level ?? "mid";
  const moodText = view?.stress.mood ?? "有點緊張：還沒有緊急預備金";
  const stop = data.stop;
  const stopLine = stop.lineSlug ? getLine(stop.lineSlug) : null;
  const signLine = data.standingAt ? getLine(data.standingAt.lineSlug) : stopLine;
  const look = lookFromAvatar(data.avatar, data.name);
  const month = (data.game?.state.turn ?? 0) + 1;

  return (
    <div className={s.today} style={stopLine ? lineVars(stopLine) : undefined}>
      <div className={s.panel}>
      <Scene kind="platform" className={s.scene} />
      <div className={s.column}>
          <PillBar month={month} streak={data.streak} />
          <div className={s.sign} style={signLine ? lineVars(signLine) : undefined}>
            {signLine && data.standingAt ? (
              <Sign name={data.standingAt.stationName} code={lineCode(signLine, data.standingAt.stationNumber)} />
            ) : (
              <Sign name="起點站" code="FINLINE · START" />
            )}
          </div>
          <div className={s.region}>
            <div className={s.bubble}>
              <Bubble tone={level === "low" ? "good" : level === "mid" ? "warn" : "bad"}>{moodText}</Bubble>
            </div>
            <div className={s.figure}>
              <Character look={look} mood={moodFromStress(level)} width={182} rim className={s.character} />
            </div>
          </div>
          <div className={s.plate}>
            <NamePlate name={look.name} sub={`${data.ageYears} 歲 · ${data.lifeStage}`} />
          </div>
      </div>
      </div>
      <div className={s.cardWrap}>
        <Card raised line={!!stopLine} label={`今日一站 · 約 ${stop.minutes} 分鐘`}>
          <Voice>{stop.question}</Voice>
          <div className={s.go}>
            {/* Stations open on the Part E flow; everything else keeps its page. */}
            <Button href={stop.kind === "turn" ? "/turn" : stop.href.replace(/^\/line\/([^/]+)\/course\//, "/line/$1/station/")}>{stop.kind === "turn" ? "繼續" : "上車"}</Button>
          </div>
          <div className={s.short}>
            <Button variant="secondary" href={`/short/${short.id}`}>
              3 分鐘版
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

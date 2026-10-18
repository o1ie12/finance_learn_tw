import "./home.css";
import Link from "next/link";
import { formatNT } from "@/components/Money";
import { Avatar } from "@/components/avatar/Avatar";
import { Chip } from "@/components/game/Chip";
import { FloatCard } from "@/components/game/FloatCard";
import { MoneyStat } from "@/components/game/MoneyStat";
import { MoodBubble, type MoodLevel } from "@/components/game/MoodBubble";
import { NamePlate } from "@/components/game/NamePlate";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { StatBar } from "@/components/game/StatBar";
import { StationSign } from "@/components/game/StationSign";
import TourAutoStart from "@/components/tour/TourAutoStart";
import { DEFAULT_AVATAR, moodFromStressLevel } from "@/lib/avatar";
import type { GameHomeData } from "@/lib/gameHome";
import { getLine, LINES } from "@/lib/lines";
import { HomeTabs } from "./HomeTabs";
import { RoutePanel } from "./RoutePanel";

const STRESS_WORD = { low: "低", mid: "中", high: "高" } as const;
const MOOD_LEVEL: Record<"low" | "mid" | "high", MoodLevel> = { low: "calm", mid: "tense", high: "stressed" };

/**
 * The character's home screen (01 §6.1): stat cards left, the character on
 * the platform in the middle with today's stop, the route map right. On
 * phones one screen at a time: the character and today's stop, with 狀態,
 * 路線圖 and 行動 behind tabs at the bottom (05 Part C, HomeTabs).
 */
export function GameHome({ data, tutorialSeenVersion }: { data: GameHomeData; tutorialSeenVersion?: number }) {
  const view = data.game?.view;
  const stressLevel = view?.stress.level ?? "mid";
  const moodText = view?.stress.mood ?? "有點緊張：還沒有緊急預備金";
  const moodReason = moodText.includes("：") ? moodText.split("：")[1] : moodText;
  const ef = data.money.efMonths;
  const stop = data.stop;
  const stopLine = stop.lineSlug ? getLine(stop.lineSlug) ?? null : null;
  const signLine = data.standingAt ? getLine(data.standingAt.lineSlug) : null;
  const avatar = data.avatar ?? { ...DEFAULT_AVATAR, name: data.name.slice(0, 8) || DEFAULT_AVATAR.name };
  const mood = moodFromStressLevel(stressLevel);
  const freedom = data.money.freedomPct;

  return (
    <HomeTabs>
    <div className="gh-grid">
      <div className="gh-center">
        {signLine && data.standingAt ? (
          <StationSign line={signLine} station={data.standingAt.stationName} stationNumber={data.standingAt.stationNumber} />
        ) : (
          <StationSign line={{ color: "var(--station-edge)", enName: "Finline" }} station="起點站" code="FINLINE · START" />
        )}
        <div className="gh-character" data-tour-id="character">
          <MoodBubble level={MOOD_LEVEL[stressLevel]} reason={moodReason} />
          <span className="gh-avatar-lg">
            <Avatar avatar={avatar} mood={mood} size={210} title={`${data.name}的角色`} />
          </span>
          <span className="gh-avatar-sm">
            <Avatar avatar={avatar} mood={mood} size={130} title={`${data.name}的角色`} />
          </span>
          <NamePlate name={data.name} subtitle={`${data.ageYears} 歲 · ${data.lifeStage}`} />
        </div>
        <FloatCard strong index={1} as="section" className="gh-stop-card">
          {/* The tour's cut-out includes 上車, so it stays tappable (05 A8.6). */}
          <div className="gh-stop" data-tour-id="next-card">
          <div className="gh-stop-text">
            <span className="gh-stop-label" style={{ color: stop.colorInk ?? "var(--ink-muted)" }}>
              今日一站 · 約 {stop.minutes} 分鐘
            </span>
            <h2 className="gh-stop-question">{stop.question}</h2>
            <span className="gh-stop-do">{stop.doLine}</span>
          </div>
          <PrimaryButton href={stop.href} line={stopLine ?? undefined}>
            {stop.kind === "turn" ? "開始這個月" : "上車"}
          </PrimaryButton>
          </div>
        </FloatCard>
      </div>

      <div className="gh-left">
        <FloatCard title="角色狀態" index={0} className="gh-pane-status">
          <StatBar
            label="壓力"
            value={STRESS_WORD[stressLevel]}
            percent={view?.stress.score ?? 45}
            tone={stressLevel === "low" ? "good" : stressLevel === "mid" ? "warn" : "bad"}
            caption={view?.stress.status}
          />
          <StatBar label="緊急預備金" value={`${ef.toFixed(1)} / 3 個月`} percent={Math.min((ef / 3) * 100, 100)} tone="info" />
          {data.money.fund ? (
            <details className="gh-fund">
              <summary>怎麼算的？</summary>
              <p className="gh-muted">
                活存 {formatNT(data.money.fund.demand)} ＋ 定存 {formatNT(data.money.fund.deposits)} ＋ 現金超過 NT$5,000 的部分{" "}
                {formatNT(data.money.fund.cashOver)}，除以每月基本開銷 {formatNT(data.money.fund.essentials)}。
              </p>
            </details>
          ) : null}
        </FloatCard>
        <FloatCard title="我的錢" index={1} className="gh-pane-status">
          <div className="gh-money-grid">
            <MoneyStat caption="月收入" value={data.money.income.amount} sourceLine={data.money.income.source} standIn={data.money.income.standIn} />
            <MoneyStat caption="存款" value={data.money.saved.amount} sourceLine={data.money.saved.source} standIn={false} />
          </div>
          <div className="gh-divider">
            <StatBar
              label="財務自由進度"
              value={`${freedom.toFixed(1)}%`}
              percent={Math.min(freedom, 100)}
              tone="money"
              caption="被動收入 ÷ 月薪。到 100% 就是財務自由。"
            />
          </div>
        </FloatCard>
        <FloatCard title="已解鎖的行動" index={2} className="gh-pane-moves">
          <div className="g-chips">
            {data.moves
              .filter((m) => m.unlocked)
              .map((m) => (
                <Chip key={m.id}>{m.label}</Chip>
              ))}
          </div>
          {data.moves.some((m) => !m.unlocked) ? (
            <details className="gh-fund">
              <summary>還沒解鎖的 ({data.moves.filter((m) => !m.unlocked).length})</summary>
              <div className="g-chips">
                {data.moves
                  .filter((m) => !m.unlocked)
                  .map((m) => (
                    <Chip key={m.id} locked>
                      {m.label}
                    </Chip>
                  ))}
              </div>
            </details>
          ) : null}
          <div className="gh-foot gh-divider" style={{ flexDirection: "row" }}>
            <span>
              已完成 {data.linesDone} / {LINES.length} 條線
            </span>
            <span>證書進度 {data.certificatePct}%</span>
          </div>
          <div className="gh-links">
            <Link href="/play">玩一個月</Link>
            <Link href="/passport">我的護照</Link>
          </div>
        </FloatCard>
      </div>

      <div className="gh-right">
        <RoutePanel
          lines={data.lines}
          initial={stop.lineSlug}
          current={data.standingAt ? { line: data.standingAt.lineSlug, station: data.standingAt.stationNumber } : null}
        />
      </div>
      <TourAutoStart seenVersion={tutorialSeenVersion} />
    </div>
    </HomeTabs>
  );
}

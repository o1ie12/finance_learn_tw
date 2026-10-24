import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "@/app/(game)/game.css";
import { getLine, LINES } from "@/lib/lines";
import { Chip } from "@/components/game/Chip";
import { FloatCard } from "@/components/game/FloatCard";
import { GameTopBar } from "@/components/game/GameTopBar";
import { Icon, type IconName } from "@/components/game/icons";
import { MoneyStat } from "@/components/game/MoneyStat";
import { MoodBubble } from "@/components/game/MoodBubble";
import { NamePlate } from "@/components/game/NamePlate";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { StatBar } from "@/components/game/StatBar";
import { StationScene } from "@/components/game/StationScene";
import { StationSign } from "@/components/game/StationSign";
import { PreviewNumbers, PreviewRouteCards } from "@/components/game/preview/PreviewDemo";

/*
  Dev-only gallery of the game-shell primitives (01-DESIGN-SYSTEM §5) on the
  StationScene, laid out like Main.dc.html. Every number here is sample data
  (示意). 404 in production.
*/

export const metadata: Metadata = {
  title: "Design preview",
  robots: { index: false, follow: false },
};

const ICONS: IconName[] = ["flame", "gear", "lock", "check", "arrow", "close", "train", "info"];

const columns: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--column-gap)",
  alignItems: "flex-start",
};
const side = (max: number): CSSProperties => ({
  flex: "1 1 280px",
  maxWidth: max,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: "var(--card-gap)",
});

export default function DesignPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const xinyong = getLine("xinyong") ?? LINES[0];

  return (
    <div className="game-shell">
      <StationScene />
      <div
        style={{
          position: "relative",
          boxSizing: "border-box",
          padding: "20px var(--space-7) 28px",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-7)",
          maxWidth: 1440,
          margin: "0 auto",
        }}
      >
        <GameTopBar homeHref="/dashboard" streakDays={6} note="範例資料">
          <Link href="/passport">護照</Link>
          <button type="button">音效：開</button>
          <Link href="/">回到網站</Link>
        </GameTopBar>

        <div style={columns}>
          {/* Left column */}
          <div style={side(330)}>
            <FloatCard title="角色狀態" index={0}>
              <StatBar label="壓力" value="低" valueTone="good" percent={22} tone="good" caption="有存款，沒有卡債" />
              <StatBar label="緊急預備金" value="1.2 / 3 個月" percent={40} tone="info" />
            </FloatCard>

            <FloatCard title="財務狀況" index={1}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--space-4)" }}>
                <MoneyStat caption="月收入" value={32000} sourceLine="職涯線" />
                <MoneyStat caption="已存下" value={18500} sourceLine="存錢線" standIn />
              </div>
              <hr className="g-divider" />
              <StatBar
                label="財務自由進度"
                value="4%"
                percent={4}
                tone="money"
                caption="被動收入 ÷ 月薪。到 100% 就是財務自由。"
              />
            </FloatCard>

            <FloatCard title="已解鎖的行動" index={2}>
              <div className="g-chips">
                <Chip>存款</Chip>
                <Chip>預算表</Chip>
                <Chip>信用卡</Chip>
                <Chip locked>ETF</Chip>
                <Chip locked>保險</Chip>
              </div>
              <hr className="g-divider" />
              <div className="g-caption" style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}>
                <span>已完成 3 / 12 條線</span>
                <span>證書進度 25%</span>
              </div>
            </FloatCard>
          </div>

          {/* Center column */}
          <div
            style={{
              flex: "999 1 420px",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-8)",
            }}
          >
            <StationSign line={xinyong} station={xinyong.sim.station} stationNumber={3} as="h1" />
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "var(--space-3)" }}>
              <MoodBubble level="calm" reason="有緊急預備金" />
              <MoodBubble level="tense" reason="卡費還沒繳清" />
              <MoodBubble level="stressed" reason="欠款在變多" />
            </div>
            {/* Avatar placeholder: the real avatar is Stage G's components/avatar. */}
            <div
              aria-hidden="true"
              style={{
                width: "min(210px, 50vw)",
                aspectRatio: "210 / 306",
                borderRadius: 999,
                border: "2px dashed var(--ink-muted)",
                display: "grid",
                placeItems: "center",
                color: "var(--ink-muted)",
                fontSize: 12,
              }}
            >
              角色
            </div>
            <NamePlate name="小宇" subtitle="22 歲 · 第一份工作" />

            <FloatCard strong index={3} as="div" style={{ width: "100%", maxWidth: 640 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--space-6)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: "1 1 260px" }}>
                  <span className="g-label" style={{ color: xinyong.colorInk, fontSize: 12 }}>
                    今日一站 · 約 15 分鐘
                  </span>
                  <span className="g-question">朋友要跟你借 NT$5,000，你借嗎？</span>
                  <span className="g-caption" style={{ fontSize: 13 }}>
                    讀懂你的第一張信用卡帳單，再決定怎麼回他。
                  </span>
                </div>
                <PrimaryButton line={xinyong}>上車</PrimaryButton>
              </div>
            </FloatCard>

            <FloatCard title="PrimaryButton：12 條線的顏色" index={4} style={{ width: "100%", maxWidth: 640 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
                <PrimaryButton>預設</PrimaryButton>
                {LINES.map((line) => (
                  <PrimaryButton key={line.slug} line={line} href={`/line/${line.slug}`}>
                    {line.name}
                  </PrimaryButton>
                ))}
                <PrimaryButton disabled>停用</PrimaryButton>
              </div>
            </FloatCard>

            <FloatCard title="圖示" index={5} style={{ width: "100%", maxWidth: 640 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-6)" }}>
                {ICONS.map((name) => (
                  <span key={name} style={{ display: "inline-flex", alignItems: "center", gap: 6 }} className="g-caption">
                    <Icon name={name} size={24} style={{ color: "var(--ink)" }} />
                    {name}
                  </span>
                ))}
              </div>
            </FloatCard>

            <PreviewNumbers index={6} />
          </div>

          {/* Right column */}
          <div style={side(370)}>
            <PreviewRouteCards index={0} />
          </div>
        </div>
      </div>
    </div>
  );
}

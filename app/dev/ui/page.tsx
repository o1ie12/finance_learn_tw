"use client";

/**
 * Dev-only gallery of every 06 E7 component and state (E15). 404 in
 * production. Light and dark follow the system; screenshots use the
 * browser's color-scheme emulation.
 */
import { useState } from "react";
import { notFound } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Actions, Button } from "@/components/ui/Button";
import { Body, Bubble, Card, Chip, Label, NamePlate, Sign, Toast, Voice } from "@/components/ui/Bits";
import { Icon, type IconName } from "@/components/ui/icons";
import { OptionGroup, RatingRow, Segmented } from "@/components/ui/Options";
import { Rail } from "@/components/ui/Rail";
import { Sheet } from "@/components/ui/Sheet";
import { TabBar } from "@/components/ui/TabBar";
import { PillBar, TopBar } from "@/components/ui/TopBar";
import { Doc, DocGrid } from "@/components/doc/Doc";
import { lineVars } from "@/lib/design/lineVars";
import { getLine } from "@/lib/lines";

const ICONS: IconName[] = ["back", "close", "flame", "check", "today", "me", "map", "bolt", "lock", "chevron", "plus", "minus", "info", "up", "down"];

export default function UiGallery() {
  if (process.env.NODE_ENV === "production") notFound();
  const xinyong = getLine("xinyong")!;
  const [opt, setOpt] = useState<string | null>("b");
  const [rate, setRate] = useState<1 | 2 | 3 | null>(2);
  const [seg, setSeg] = useState<"doc" | "q">("doc");
  const [sheet, setSheet] = useState(false);
  const [alert, setAlert] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="game-shell" style={{ ...lineVars(xinyong), background: "var(--paper)", color: "var(--ink)", minHeight: "100dvh", fontFamily: "var(--font-ui)" }}>
      <PillBar month={3} streak={5} />
      <TopBar title="你是銀行" subtitle="第 3 位，共 6 位" back={{ onClick: () => {} }} close={{ onClick: () => {} }} />
      <TopBar title="狀態" flat />
      <Rail step={2} total={5} />
      <main style={{ display: "grid", gap: 24, padding: 16, maxWidth: 1120, margin: "0 auto" }}>
        <section style={{ display: "grid", gap: 8 }}>
          <Label>圖示</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {ICONS.map((n) => (
              <span key={n} title={n} style={{ display: "inline-flex", gap: 4 }}>
                <Icon name={n} />
                <Icon name={n} filled />
              </span>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gap: 12 }}>
          <Label>按鈕</Label>
          <Button>上車</Button>
          <Button variant="secondary">存到工具箱</Button>
          <Button variant="destructive">重新開始</Button>
          <Actions helper="選一個答案">
            <Button disabled>確定</Button>
          </Actions>
          <Button busy={busy} onClick={() => setBusy((b) => !b)} icon="check">
            確定
          </Button>
        </section>

        <section style={{ display: "grid", gap: 12 }}>
          <Label>選項</Label>
          <OptionGroup
            label="想一想"
            options={[
              { id: "a", label: "繳最低應繳就好" },
              { id: "b", label: "全部繳清" },
              { id: "c", label: "先繳一半" },
            ]}
            value={opt}
            onChange={setOpt}
          />
          <RatingRow value={rate} onChange={setRate} />
          <Segmented label="檢視" items={[{ id: "doc", label: "文件" }, { id: "q", label: "問題" }]} value={seg} onChange={setSeg} />
        </section>

        <section style={{ display: "grid", gap: 12 }}>
          <Label>文件</Label>
          <Chip>星河銀行 · 放款專員</Chip>
          <Doc title="陳小明" subtitle="個人信用報告" badge="信用報告">
            <DocGrid
              rows={[
                { label: "月收入", value: "NT$38,000" },
                { label: "信用卡張數", value: "2 張" },
                { label: "近 12 月遲繳", value: "0 次" },
                { label: "無擔保負債", value: "NT$120,000" },
              ]}
            />
          </Doc>
        </section>

        <section style={{ display: "grid", gap: 16, justifyItems: "center" }}>
          <Label>月台元件</Label>
          <Sign name="信用站" code="Credit Line · C04" />
          <Bubble tone="warn">緊張：下個月帳單要到了</Bubble>
          <Bubble tone="good">安心：有緊急預備金</Bubble>
          <Bubble>先想一下，沒有標準答案。</Bubble>
          <NamePlate name="小宇" sub="19 歲 · 剛出社會" />
        </section>

        <section style={{ display: "grid", gap: 12 }}>
          <Label>卡片</Label>
          <Card label="今日一站 · 約 8 分鐘" raised line>
            <Voice>銀行要怎麼決定借不借你錢？</Voice>
            <div style={{ marginTop: 16 }}>
              <Button>上車</Button>
            </div>
          </Card>
          <Card>
            <Body>每月只繳最低應繳，沒繳的部分每天照年利率計算利息。</Body>
          </Card>
          <Button variant="secondary" onClick={() => setSheet(true)}>
            開啟底部面板
          </Button>
          <Button variant="secondary" onClick={() => setAlert(true)}>
            開啟對話框
          </Button>
        </section>
      </main>
      <TabBar />
      {sheet ? (
        <Sheet label="想一想" onClose={() => setSheet(false)}>
          <div style={{ display: "grid", gap: 16, paddingTop: 16 }}>
            <Label>想一想</Label>
            <Voice size={2}>帳單來了，你會先繳多少？</Voice>
            <OptionGroup label="想一想" options={[{ id: "x", label: "最低應繳" }, { id: "y", label: "全部繳清" }]} value={null} onChange={() => setSheet(false)} />
          </div>
        </Sheet>
      ) : null}
      {alert ? (
        <Alert
          title="要重新開始遊戲嗎？"
          body="目前的進度和存款會清除，無法復原。"
          action="重新開始"
          onAction={() => setAlert(false)}
          onCancel={() => setAlert(false)}
        />
      ) : null}
      {busy ? <Toast>已存起來</Toast> : null}
    </div>
  );
}

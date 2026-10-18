"use client";

/**
 * Interactive parts of /design-preview (dev only): the 路線圖 card with
 * LineChips driving the MiniMap, and AnimatedNumber controls.
 * Sample data only (示意).
 */

import { useState, type CSSProperties } from "react";
import { LINES, type LineSlug } from "@/lib/lines";
import { AnimatedNumber } from "../AnimatedNumber";
import { FloatCard } from "../FloatCard";
import { LineChip } from "../LineChip";
import { MiniMap, type MapLineStatus } from "../MiniMap";
import { PrimaryButton } from "../PrimaryButton";

const SAMPLE_STATUS: Record<LineSlug, { kind: MapLineStatus; text: string }> = {
  zhiya: { kind: "done", text: "已完成" },
  qixin: { kind: "done", text: "已完成" },
  cunqian: { kind: "done", text: "已完成" },
  xinyong: { kind: "active", text: "1 / 3 站" },
  touzi: { kind: "locked", text: "未開通" },
  zhapian: { kind: "open", text: "可開始" },
  xuedai: { kind: "open", text: "可開始" },
  baoshui: { kind: "locked", text: "未開通" },
  zuwu: { kind: "locked", text: "未開通" },
  baoxian: { kind: "locked", text: "未開通" },
  chuangye: { kind: "locked", text: "未開通" },
  caiwujuece: { kind: "locked", text: "終點站" },
};

const statuses = Object.fromEntries(
  Object.entries(SAMPLE_STATUS).map(([slug, s]) => [slug, s.kind]),
) as Record<LineSlug, MapLineStatus>;

export function PreviewRouteCards({ index = 0 }: { index?: number }) {
  const [picked, setPicked] = useState<LineSlug>("xinyong");
  const sel = LINES.find((l) => l.slug === picked) ?? LINES[0];
  return (
    <>
      <FloatCard title="路線圖" aside="點一條線看詳情" index={index}>
        <MiniMap selected={picked} current={{ line: "xinyong", station: 2 }} statuses={statuses} />
        <div className="g-linechips">
          {LINES.map((line) => (
            <LineChip
              key={line.slug}
              line={line}
              status={SAMPLE_STATUS[line.slug].text}
              selected={line.slug === picked}
              onClick={() => setPicked(line.slug)}
            />
          ))}
        </div>
      </FloatCard>
      <FloatCard as="div" index={index + 1}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span
            aria-hidden="true"
            style={{ width: 12, height: 12, borderRadius: "var(--radius-pill)", background: sel.color, flex: "none" }}
          />
          <span style={{ fontSize: 17, fontWeight: 700 }}>{sel.name}</span>
          <span className="g-caption" style={{ marginLeft: "auto" }}>
            {SAMPLE_STATUS[sel.slug].text}
          </span>
        </div>
        <div style={{ fontSize: 14 }}>終點：{sel.sim.station}</div>
        <div className="g-caption">{sel.short}</div>
        <PrimaryButton href={`/line/${sel.slug}`} line={sel}>
          看全部站點
        </PrimaryButton>
      </FloatCard>
    </>
  );
}

export function PreviewNumbers({ index = 0 }: { index?: number }) {
  const [money, setMoney] = useState(18500);
  const [pct, setPct] = useState(4);
  const row: CSSProperties = { display: "flex", flexWrap: "wrap", gap: "var(--space-3)" };
  return (
    <FloatCard title="AnimatedNumber（示意）" index={index}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-9)", alignItems: "baseline" }}>
        <span className="g-hero-number">
          <AnimatedNumber value={money} />
        </span>
        <span className="g-card-number">
          <AnimatedNumber value={pct} format="percent" />
        </span>
      </div>
      <div style={row}>
        <PrimaryButton onClick={() => setMoney((m) => m + 3200)}>存入 NT$3,200</PrimaryButton>
        <PrimaryButton line={LINES.find((l) => l.slug === "xinyong")} onClick={() => setMoney((m) => m - 5000)}>
          借出 NT$5,000
        </PrimaryButton>
        <PrimaryButton line={LINES.find((l) => l.slug === "cunqian")} onClick={() => setPct((p) => Math.min(100, p + 7))}>
          自由進度 +7%
        </PrimaryButton>
      </div>
    </FloatCard>
  );
}

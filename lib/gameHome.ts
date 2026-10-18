import "server-only";

/**
 * Everything the game home (/dashboard and /simulate) shows, gathered on the
 * server in one place (01 §6.1 data sources): completion from lineStatus
 * (mode-aware) plus sticky line_completions, money from financialSnapshot
 * and the life-game save, today's stop from 02 §7.2, the streak from
 * daily_activity.
 */

import {
  getDailyActivity,
  getLatestSimulationRunsByLine,
  getLineCompletions,
  getProgress,
} from "@/lib/db";
import { LINES, type LineMeta, type LineSlug } from "@/lib/lines";
import { effectiveMode, requiredStations } from "@/lib/modeModel";
import { getModule } from "@/lib/modules";
import { allLineStatuses, type LineStatus } from "@/lib/progressModel";
import { financialSnapshot, readProfile } from "@/lib/studentProfile";
import { readAvatar, type Avatar } from "@/lib/avatar";
import { streakFrom, taipeiDay } from "@/lib/streak";
import { todayStop, DEFAULT_STOP_MINUTES, type TodayStop } from "@/lib/todayStop";
import { lineContent, lessonForStation } from "@/lib/tasks/registry";
import type { Student } from "@/lib/types";
import { loadOrCreateSolo } from "@/lib/lifeGame/server";
import { turnView, type TurnView } from "@/lib/lifeGame/view";
import { LINE_UNLOCKS, MOVE_LABEL } from "@/lib/lifeGame/unlocks";
import { MOVE_IDS, type MoveId, type PublicLifeState } from "@/lib/lifeGame/types";
import { publicState } from "@/lib/lifeGame/engine";

export interface LineCard {
  slug: LineSlug;
  name: string;
  color: string;
  colorInk: string;
  status: "done" | "inProgress" | "open";
  statusLabel: string; // 已完成 / 1 / 2 站 / 可開始
  next: string; // 下一站：…
  unlocks: string;
  href: string;
}

export interface StopCard {
  kind: TodayStop["kind"];
  href: string;
  lineSlug: LineSlug | null;
  lineName: string | null;
  color: string | null;
  colorInk: string | null;
  stationName: string | null;
  stationNumber: number | null;
  enName: string | null;
  question: string;
  doLine: string;
  minutes: number;
}

export interface GameHomeData {
  name: string;
  avatar: Avatar | null;
  ageYears: number;
  lifeStage: string;
  streak: number;
  game: { state: PublicLifeState; view: TurnView } | null;
  money: {
    income: { amount: number; source: string; standIn: boolean };
    saved: { amount: number; source: string };
    freedomPct: number;
    efMonths: number;
  };
  moves: { id: MoveId; label: string; unlocked: boolean }[];
  linesDone: number;
  certificatePct: number;
  stop: StopCard;
  lines: LineCard[];
  /** Where the character stands: the station of today's stop, else the line's sim. */
  standingAt: { lineSlug: LineSlug; stationName: string; stationNumber: number } | null;
}

/** 1-based station number on the line; the terminal sim comes after the stations. */
function stationNumber(line: LineMeta, moduleNumber: number | null): number {
  return moduleNumber ? line.stationModules.indexOf(moduleNumber) + 1 : line.stationModules.length + 1;
}

function lineCardFor(s: LineStatus, mode: ReturnType<typeof effectiveMode>): LineCard {
  const line = s.line;
  const req = requiredStations(line, mode).length;
  const status: LineCard["status"] = s.complete ? "done" : s.started ? "inProgress" : "open";
  const statusLabel = s.complete ? "已完成" : s.started ? `${s.stationsDone} / ${req} 站` : "可開始";
  const nextName = s.next?.moduleNumber ? getModule(s.next.moduleNumber)?.station : s.next ? line.sim.station : null;
  const unlockText = lineContent(line.slug)?.unlocks ?? LINE_UNLOCKS[line.slug].map((m) => MOVE_LABEL[m]).join("、");
  return {
    slug: line.slug,
    name: line.name,
    color: line.color,
    colorInk: line.colorInk,
    status,
    statusLabel,
    next: s.complete ? "這條線已經走完了，可以回去複習。" : nextName ? `下一站：${nextName}。` : line.short,
    unlocks: `解鎖：${unlockText}`,
    href: `/line/${line.slug}`,
  };
}

function stopCard(stop: TodayStop): StopCard {
  if (stop.kind === "turn") {
    return {
      kind: "turn",
      href: "/play",
      lineSlug: null,
      lineName: null,
      color: null,
      colorInk: null,
      stationName: null,
      stationNumber: null,
      enName: null,
      question: "這個月，你要怎麼安排你的錢？",
      doLine: "玩一個月的人生遊戲：領薪水、先存錢、繳帳單。",
      minutes: 5,
    };
  }
  const line = stop.line;
  const mod = stop.moduleNumber ? getModule(stop.moduleNumber) : null;
  const lesson = stop.moduleNumber ? lessonForStation(line.slug, stop.moduleNumber) : null;
  const content = lineContent(line.slug);
  const question = lesson?.hook.question ?? content?.hook.question ?? mod?.subtitle ?? line.short;
  return {
    kind: stop.kind,
    href: stop.href,
    lineSlug: line.slug,
    lineName: line.name,
    color: line.color,
    colorInk: line.colorInk,
    stationName: mod?.station ?? line.sim.station,
    stationNumber: stationNumber(line, stop.moduleNumber),
    enName: line.enName,
    question,
    doLine: lesson?.doLine ?? mod?.title ?? line.sim.title,
    minutes: lesson?.minutes ?? mod?.minutes ?? DEFAULT_STOP_MINUTES,
  };
}

export async function loadGameHome(student: Student): Promise<GameHomeData> {
  const mode = effectiveMode(student.mode);
  const [progress, runsByLine, sticky] = await Promise.all([
    getProgress(student.id),
    getLatestSimulationRunsByLine(student.id),
    getLineCompletions(student.id),
  ]);
  const statuses = allLineStatuses(progress, runsByLine, mode, sticky);
  const profile = readProfile(student.profile);
  const snap = financialSnapshot(profile);

  const loaded = await loadOrCreateSolo(student);
  const game = "error" in loaded ? null : { state: publicState(loaded.state), view: turnView(loaded.state, loaded.ctx) };

  const today = taipeiDay(new Date());
  const since = new Date(Date.now() - 400 * 86400_000);
  const activity = await getDailyActivity(student.id, taipeiDay(since));
  const streak = streakFrom(activity.filter((a) => a.actions > 0).map((a) => a.day), today);

  const linesDone = statuses.filter((s) => s.complete).length;
  const stop = stopCard(todayStop(statuses));

  const s = game?.state;
  const income = s
    ? s.job.source === "careerLine"
      ? { amount: s.job.grossMonthly, source: "職涯線", standIn: false }
      : { amount: s.job.grossMonthly, source: "職涯線", standIn: true }
    : { amount: snap.income.amount, source: "職涯線", standIn: !snap.income.known };
  const savedAmount = s ? s.accounts.demand + timeDepositTotalPublic(s) + s.accounts.housingFund : snap.savings.amount;

  const unlocked = new Set(s?.unlocked ?? []);
  const moves = MOVE_IDS.map((id) => ({ id, label: MOVE_LABEL[id], unlocked: unlocked.has(id) || id === "demand" || id === "give" }))
    .sort((a, b) => Number(b.unlocked) - Number(a.unlocked));

  const ageMonths = s?.ageMonths ?? 22 * 12;
  return {
    name: readAvatar(student.avatar)?.name ?? student.name,
    avatar: readAvatar(student.avatar),
    ageYears: Math.floor(ageMonths / 12),
    lifeStage: s && s.turn >= 36 ? "工作幾年了" : "第一份工作",
    streak,
    game,
    money: {
      income,
      saved: { amount: savedAmount, source: "人生遊戲" },
      freedomPct: s?.stats.freedomPct ?? 0,
      efMonths: s?.stats.efMonths ?? 0,
    },
    moves,
    linesDone,
    certificatePct: Math.round((linesDone / LINES.length) * 100),
    stop,
    lines: statuses.map((st) => lineCardFor(st, mode)),
    standingAt:
      stop.lineSlug && stop.stationName && stop.stationNumber
        ? { lineSlug: stop.lineSlug, stationName: stop.stationName, stationNumber: stop.stationNumber }
        : null,
  };
}

function timeDepositTotalPublic(s: PublicLifeState): number {
  return s.accounts.timeDeposits.reduce((sum, d) => sum + d.amount, 0);
}


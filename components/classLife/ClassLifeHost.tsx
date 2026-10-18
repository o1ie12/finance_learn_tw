"use client";

import { useEffect, useState } from "react";
import { FloatCard } from "@/components/game/FloatCard";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { percent1 } from "@/components/play/playModel";
import { Notice, SecondaryButton } from "@/components/play/ui";
import { STRESS_LABEL } from "@/lib/lifeGame/stats";
import type { ClassRoomStatus } from "@/lib/types";
import { classErrorText, createRoom, fetchLeaderboard, setRoomStatus, type HostRoom, type Leaderboard } from "./api";
import s from "./classLife.module.css";

const STORAGE_KEY = "fs_class_life_host";
const POLL_MS = 3000;

function readStored(): HostRoom | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<HostRoom>;
    return typeof v.room_id === "string" && typeof v.code === "string" && typeof v.host_token === "string"
      ? { room_id: v.room_id, code: v.code, host_token: v.host_token, status: v.status ?? "waiting" }
      : null;
  } catch {
    return null;
  }
}

function writeStored(v: HostRoom | null): void {
  try {
    if (v) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode: a reload loses the room, as the quiz host does */
  }
}

const STATUS_TEXT: Record<ClassRoomStatus, string> = {
  waiting: "等待中：學生可以先加入隊伍，按「開始」後大家同時開始玩。",
  active: "進行中：各隊正在過日子。排行榜每 3 秒更新。",
  finished: "已結束：各隊不能再前進，排行榜停在最後的結果。",
};

/**
 * The teacher's screen for a class 人生賽局 (02 §8): open a room, project
 * the code, start and finish the round, and watch the leaderboard. The
 * leaderboard ranks by 財務健康分, which the server computes from each
 * team's saved state; net worth is not on the board.
 */
export function ClassLifeHost() {
  const [room, setRoom] = useState<HostRoom | null>(null);
  const [board, setBoard] = useState<Leaderboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = readStored();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of sessionStorage after hydration
    if (stored) setRoom(stored);
  }, []);

  useEffect(() => {
    if (!room) return;
    let alive = true;
    async function poll() {
      const next = await fetchLeaderboard(room!.room_id);
      if (alive && next) setBoard(next);
    }
    void poll();
    const id = window.setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [room]);

  async function open() {
    setBusy(true);
    setError(null);
    const res = await createRoom();
    setBusy(false);
    if (!res.ok) {
      setError(res.error === "network" ? classErrorText("network") : "建立房間時發生問題，請再試一次。");
      return;
    }
    writeStored(res.room);
    setBoard(null);
    setRoom(res.room);
  }

  async function changeStatus(status: "active" | "finished") {
    if (!room) return;
    setBusy(true);
    setError(null);
    const ok = await setRoomStatus(room, status);
    setBusy(false);
    if (!ok) {
      setError("沒有更新成功，請再按一次。");
      return;
    }
    const next = { ...room, status };
    writeStored(next);
    setRoom(next);
  }

  function closeRoom() {
    writeStored(null);
    setRoom(null);
    setBoard(null);
  }

  if (!room) {
    return (
      <div className={s.narrow}>
        <FloatCard strong title="課堂模式 · 老師" titleAs="p">
          <div className={s.stack}>
            <h1 className="g-title">開一場人生賽局</h1>
            <p className="g-body">
              學生分隊，每隊共用一份存檔。全班同一個開局、同樣的月份和事件，比的是誰的財務最健康，不是誰最敢賭。
            </p>
            <p className="g-body">
              開好房間後，請學生登入，再到 <strong>/class/life/play</strong> 輸入房間代碼、選隊伍。
            </p>
            {error ? (
              <Notice tone="bad" live>
                {error}
              </Notice>
            ) : null}
            <div>
              <PrimaryButton type="button" block onClick={open} disabled={busy}>
                {busy ? "建立中…" : "建立房間"}
              </PrimaryButton>
            </div>
          </div>
        </FloatCard>
      </div>
    );
  }

  const status = board?.status ?? room.status;

  return (
    <div className={s.wide}>
      <h1 className="sr-only">人生賽局 課堂模式 老師畫面</h1>
      <div className={s.codeBoard}>
        <p className={s.codeLabel}>房間代碼</p>
        <p className={s.code} aria-label={`房間代碼 ${room.code.split("").join(" ")}`}>
          {room.code}
        </p>
        <p className={s.codeHint}>
          先登入，再到 <strong>/class/life/play</strong> 輸入代碼、選隊伍
        </p>
      </div>

      <div className={s.controls}>
        {status === "waiting" ? (
          <PrimaryButton type="button" onClick={() => changeStatus("active")} disabled={busy}>
            開始
          </PrimaryButton>
        ) : null}
        {status === "active" ? (
          <PrimaryButton type="button" onClick={() => changeStatus("finished")} disabled={busy}>
            結束這場
          </PrimaryButton>
        ) : null}
        {status === "finished" ? <SecondaryButton onClick={closeRoom}>開新的一場</SecondaryButton> : null}
        <span className={s.status} role="status">
          {STATUS_TEXT[status]}
        </span>
      </div>
      {error ? (
        <Notice tone="bad" live>
          {error}
        </Notice>
      ) : null}

      <FloatCard strong title={`排行榜 · ${board?.players ?? 0} 人加入`}>
        <div className={s.stack}>
          {!board || (board.standings.length === 0 && board.waitingTeams.length === 0) ? (
            <p className={`g-body ${s.muted}`}>還沒有隊伍加入。</p>
          ) : null}
          {board && board.standings.length > 0 ? (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <caption>依財務健康分排名。分數由伺服器從各隊的存檔算出。</caption>
                <thead>
                  <tr>
                    <th scope="col">名次</th>
                    <th scope="col">隊伍</th>
                    <th scope="col">財務健康分</th>
                    <th scope="col">緊急預備金</th>
                    <th scope="col">財務自由</th>
                    <th scope="col">壓力</th>
                  </tr>
                </thead>
                <tbody>
                  {board.standings.map((r) => (
                    <tr key={r.team}>
                      <td className={s.rank}>{r.rank}</td>
                      <th scope="row" className={s.teamCell}>
                        {r.team}
                        {r.cardDebt ? <span className={s.flag}>卡債</span> : null}
                        {r.overdue ? <span className={s.flag}>欠款</span> : null}
                        <span className={s.teamMeta}>
                          {r.members} 人 · 走了 {r.turn} 個月
                        </span>
                      </th>
                      <td className={s.score}>{r.health}</td>
                      <td>{r.efMonths.toFixed(1)} 個月</td>
                      <td>{percent1(r.freedomPct)}</td>
                      <td className={s[`stress_${r.stressLevel}`]}>{STRESS_LABEL[r.stressLevel]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {board && board.waitingTeams.length > 0 ? (
            <div className={s.stack}>
              <p className="g-label">已加入、還沒開始的隊伍</p>
              <ul className={s.waitingList}>
                {board.waitingTeams.map((t) => (
                  <li key={t.team}>
                    {t.team} · {t.members} 人
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className={s.formula}>
            財務健康分（滿分 100）：緊急預備金滿 6 個月得 40 分，財務自由滿 10% 得 40 分，壓力越低最多得 20 分；有卡債循環扣 15 分，有逾期欠款扣 15 分。
          </p>
        </div>
      </FloatCard>
    </div>
  );
}

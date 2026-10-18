"use client";

import { useEffect, useRef, useState } from "react";
import { FloatCard } from "@/components/game/FloatCard";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { percent1 } from "@/components/play/playModel";
import { Notice, SecondaryButton } from "@/components/play/ui";
import type { Avatar } from "@/lib/avatar";
import { CLASS_TEAMS, DISPLAY_NAME_MAX, TEAM_NAME_MAX } from "@/lib/lifeGame/class";
import { STRESS_LABEL } from "@/lib/lifeGame/stats";
import type { ClassRoomStatus } from "@/lib/types";
import { classErrorText, fetchLeaderboard, fetchTeam, joinRoom, type TeamPayload } from "./api";
import { PlayScreen } from "@/components/play/PlayScreen";
import s from "./classLife.module.css";

const STORAGE_KEY = "fs_class_life";
const POLL_MS = 3000;
const CUSTOM = "__custom";

interface Joined {
  roomId: string;
  team: string;
}

function readStored(): Joined | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<Joined>;
    return typeof v.roomId === "string" && typeof v.team === "string" ? { roomId: v.roomId, team: v.team } : null;
  } catch {
    return null;
  }
}

function writeStored(v: Joined | null): void {
  try {
    if (v) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode: a reload just asks to join again */
  }
}

/**
 * The student's side of a class 人生賽局: join a room as a team member,
 * wait for the teacher's start, then play the team's months. The team's
 * game lives on the server; this page only keeps which room it joined (in
 * sessionStorage, so a reload resumes).
 */
export function ClassLifePlay({ studentName, avatar }: { studentName: string; avatar: Avatar | null }) {
  const [joined, setJoined] = useState<Joined | null>(null);
  const [payload, setPayload] = useState<TeamPayload | null>(null);
  const [status, setStatus] = useState<ClassRoomStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState(true);

  // Resume a room joined earlier in this tab.
  useEffect(() => {
    const stored = readStored();
    if (!stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of sessionStorage after hydration
      setResuming(false);
      return;
    }
    void fetchTeam(stored.roomId).then((res) => {
      if (res.ok) {
        setJoined(stored);
        setPayload(res.payload);
        setStatus(res.payload.room.status);
      } else {
        writeStored(null);
      }
      setResuming(false);
    });
  }, []);

  // While waiting for the teacher, check the room every few seconds.
  useEffect(() => {
    if (!joined || status !== "waiting") return;
    const id = window.setInterval(() => {
      void fetchTeam(joined.roomId).then((res) => {
        if (res.ok) {
          setPayload(res.payload);
          setStatus(res.payload.room.status);
        }
      });
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [joined, status]);

  // While playing, watch for the teacher's finish (the action route also
  // refuses moves once the room is finished).
  useEffect(() => {
    if (!joined || status !== "active") return;
    const id = window.setInterval(() => {
      void fetchLeaderboard(joined.roomId).then((board) => {
        if (board && board.status !== "active") {
          void fetchTeam(joined.roomId).then((res) => {
            if (res.ok) setPayload(res.payload);
            setStatus(board.status);
          });
        }
      });
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [joined, status]);

  async function onJoined(j: Joined) {
    const res = await fetchTeam(j.roomId);
    if (!res.ok) {
      setError(classErrorText(res.err.error));
      return;
    }
    writeStored(j);
    setJoined(j);
    setPayload(res.payload);
    setStatus(res.payload.room.status);
  }

  function leave() {
    writeStored(null);
    setJoined(null);
    setPayload(null);
    setStatus(null);
  }

  if (resuming) {
    return (
      <div className={s.narrow}>
        <FloatCard strong>
          <p className="g-body" role="status" style={{ margin: 0 }}>
            讀取中…
          </p>
        </FloatCard>
      </div>
    );
  }

  if (!joined || !payload) {
    return <JoinForm studentName={studentName} initialError={error} onJoined={onJoined} />;
  }

  if (status === "waiting") {
    return (
      <div className={s.narrow}>
        <FloatCard strong title="人生賽局 課堂模式" titleAs="p">
          <div className={s.stack}>
            <h1 className="g-title">你在 {joined.team}</h1>
            <p className="g-body" role="status">
              等老師按下開始。開始後，全班每一隊都從同一個開局出發，遇到同樣的月份和事件。
            </p>
            <p className="g-caption">這個頁面每 3 秒會自動檢查一次。</p>
            <div>
              <SecondaryButton onClick={leave}>換房間或隊伍</SecondaryButton>
            </div>
          </div>
        </FloatCard>
      </div>
    );
  }

  if (status === "finished") {
    const st = payload.state.stats;
    return (
      <div className={s.narrow}>
        <FloatCard strong title="人生賽局 課堂模式" titleAs="p">
          <div className={s.stack}>
            <h1 className="g-title">這場結束了</h1>
            <p className="g-body">
              {joined.team} 一共走了 {payload.state.turn} 個月。排名看的是財務健康分，老師的螢幕上有全班的排行榜。
            </p>
            <dl className={s.stack} style={{ margin: 0 }}>
              <div>
                <dt className="g-label">緊急預備金</dt>
                <dd className="g-card-number" style={{ margin: 0 }}>
                  {st.efMonths.toFixed(1)} 個月
                </dd>
              </div>
              <div>
                <dt className="g-label">財務自由</dt>
                <dd className="g-card-number" style={{ margin: 0 }}>
                  {percent1(st.freedomPct)}
                </dd>
              </div>
              <div>
                <dt className="g-label">壓力</dt>
                <dd className="g-card-number" style={{ margin: 0 }}>
                  {STRESS_LABEL[payload.view.stress.level]}
                </dd>
              </div>
            </dl>
            <div>
              <PrimaryButton type="button" onClick={leave}>
                加入下一場
              </PrimaryButton>
            </div>
          </div>
        </FloatCard>
      </div>
    );
  }

  const q = `room_id=${encodeURIComponent(joined.roomId)}`;
  return (
    <>
      <p className={s.teamBanner}>
        <span className={s.teamName}>{joined.team}</span>
        <span>全班同一個開局、同樣的事件。隊友輪流操作，同一隊共用一份存檔。</span>
      </p>
      <PlayScreen
        title="人生賽局"
        key={joined.roomId + joined.team}
        initial={payload}
        name={avatar?.name ?? studentName}
        avatar={avatar}
        endpoints={{ state: `/api/class/life/state?${q}`, action: `/api/class/life/action?${q}` }}
      />
    </>
  );
}

function JoinForm({
  studentName,
  initialError,
  onJoined,
}: {
  studentName: string;
  initialError: string | null;
  onJoined: (j: Joined) => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState(studentName.slice(0, DISPLAY_NAME_MAX));
  const [pick, setPick] = useState<string>(CLASS_TEAMS[0]);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [busy, setBusy] = useState(false);
  const customRef = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const team = pick === CUSTOM ? custom.trim() : pick;
    if (!team) {
      setError(classErrorText("invalid_team"));
      customRef.current?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    const res = await joinRoom(code, name, team);
    if (!res.ok) {
      setError(classErrorText(res.error));
      setBusy(false);
      return;
    }
    await onJoined({ roomId: res.roomId, team: res.team });
    setBusy(false);
  }

  return (
    <div className={s.narrow}>
      <FloatCard strong title="人生賽局 課堂模式" titleAs="p">
        <form className={s.stack} onSubmit={submit} noValidate>
          <h1 className="g-title">加入老師的房間</h1>
          <p className="g-body">每一隊共用一份存檔。全班同一個開局，遇到同樣的事件，看哪一隊的財務最健康。</p>

          <div className={s.field}>
            <label htmlFor="class-life-code" className={s.fieldLabel}>
              房間代碼
            </label>
            <input
              id="class-life-code"
              className={`${s.input} ${s.codeInput}`}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="ABC123"
              required
            />
          </div>

          <div className={s.field}>
            <label htmlFor="class-life-name" className={s.fieldLabel}>
              你的名字
            </label>
            <input
              id="class-life-name"
              className={s.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={DISPLAY_NAME_MAX}
              placeholder="讓老師認得出你就好"
            />
          </div>

          <fieldset className={s.teams}>
            <legend className={s.fieldLabel}>選你的隊伍</legend>
            <div className={s.teamGrid}>
              {CLASS_TEAMS.map((t) => (
                <label key={t} className={s.teamOption}>
                  <input type="radio" name="team" value={t} checked={pick === t} onChange={() => setPick(t)} />
                  {t}
                </label>
              ))}
            </div>
            <label className={s.teamOption}>
              <input
                type="radio"
                name="team"
                value={CUSTOM}
                checked={pick === CUSTOM}
                onChange={() => {
                  setPick(CUSTOM);
                  window.setTimeout(() => customRef.current?.focus(), 0);
                }}
              />
              自己取隊名
            </label>
            {pick === CUSTOM ? (
              <div className={s.customTeam}>
                <label htmlFor="class-life-team" className={s.fieldLabel}>
                  隊名（{TEAM_NAME_MAX} 個字以內，隊友要輸入一模一樣的名字）
                </label>
                <input
                  id="class-life-team"
                  ref={customRef}
                  className={s.input}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  maxLength={TEAM_NAME_MAX}
                />
              </div>
            ) : null}
          </fieldset>

          {error ? (
            <Notice tone="bad" live>
              {error}
            </Notice>
          ) : null}

          <div>
            <PrimaryButton type="submit" block disabled={busy || !code.trim()}>
              {busy ? "加入中…" : "加入"}
            </PrimaryButton>
          </div>
        </form>
      </FloatCard>
    </div>
  );
}

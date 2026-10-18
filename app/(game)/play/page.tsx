import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FloatCard } from "@/components/game/FloatCard";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { PlayScreen } from "@/components/play/PlayScreen";
import { parseRide } from "@/components/play/rideModel";
import { readAvatar } from "@/lib/avatar";
import { isNotConfigured } from "@/lib/db";
import { loadOrCreateSolo } from "@/lib/lifeGame/server";
import { gamePayload, type GamePayload } from "@/lib/lifeGame/view";
import { getCurrentStudent } from "@/lib/session";
import { readProfile } from "@/lib/studentProfile";
import type { Student } from "@/lib/types";

export const metadata: Metadata = {
  title: "人生賽局",
  description: "一個月一回合：領薪水、先存錢、繳帳單、做選擇，面對人生事件。",
};

/**
 * The life-game turn screen (01 §6.4). The server loads (or creates) the
 * student's solo save and renders the first payload; PlayScreen takes over
 * from there through /api/life-game.
 */
export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ride = parseRide(await searchParams);
  let student: Student | null = null;
  let notConfigured = false;
  let payload: GamePayload | null = null;
  let unreadable = false;

  try {
    student = await getCurrentStudent();
    if (student) {
      const loaded = await loadOrCreateSolo(student);
      if ("error" in loaded) unreadable = true;
      else payload = gamePayload(loaded.state, loaded.ctx);
    }
  } catch (e) {
    if (isNotConfigured(e)) notConfigured = true;
    else throw e;
  }

  if (notConfigured) {
    return (
      <Shell>
        <MessageCard title="人生賽局">系統的資料庫還沒設定好，暫時不能玩。</MessageCard>
      </Shell>
    );
  }

  if (!student) {
    return (
      <Shell>
        <MessageCard title="人生賽局" action={<PrimaryButton href="/signup">建立帳號，開始玩</PrimaryButton>}>
          一個月一回合：領薪水、先存錢、繳帳單，再面對人生事件。先登入或建立帳號，才能保存你的人生。
        </MessageCard>
      </Shell>
    );
  }

  if (unreadable || !payload) {
    return (
      <Shell>
        <MessageCard title="人生賽局">你的存檔暫時讀不到。請稍後再試，或告訴老師。</MessageCard>
      </Shell>
    );
  }

  const avatar = readAvatar(student.avatar);
  const name = avatar?.name ?? student.name;

  return (
    <Shell>
      <PlayScreen
        initial={payload}
        name={name}
        avatar={avatar}
        ride={ride}
        seenFullRides={readProfile(student.profile).seenFullRides ?? 0}
      />
    </Shell>
  );
}

/** The (game) layout already renders .game-shell and the StationScene around this. */
function Shell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function MessageCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "64px 16px" }}>
      <FloatCard strong style={{ maxWidth: 480, width: "100%" }}>
        <h1 className="g-title" style={{ margin: 0 }}>
          {title}
        </h1>
        <p className="g-body" style={{ margin: 0 }}>
          {children}
        </p>
        {action ? <div>{action}</div> : null}
      </FloatCard>
    </div>
  );
}

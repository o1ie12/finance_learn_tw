import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TurnFlow } from "@/components/game/TurnFlow";
import { parseRide } from "@/components/play/rideModel";
import { Body, Card } from "@/components/ui/Bits";
import { TopBar } from "@/components/ui/TopBar";
import { lineVars } from "@/lib/design/lineVars";
import { isNotConfigured } from "@/lib/db";
import { loadOrCreateSolo } from "@/lib/lifeGame/server";
import { gamePayload } from "@/lib/lifeGame/view";
import { getLine, isLineSlug } from "@/lib/lines";
import { getCurrentStudent } from "@/lib/session";

export const metadata: Metadata = { title: "人生遊戲" };

/**
 * The life-game turn on the Part E design (06 E8.6). Same save, engine and
 * API as /play (which keeps the older look for now). From a station it
 * carries the ride query (/turn?return=…) and rides on after the month.
 */
export default async function TurnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ride = parseRide(await searchParams);
  let student;
  try {
    student = await getCurrentStudent();
  } catch (e) {
    if (isNotConfigured(e)) return <Message>系統的資料庫還沒設定好，暫時不能玩。</Message>;
    throw e;
  }
  if (!student) redirect("/signup");

  const loaded = await loadOrCreateSolo(student);
  if ("error" in loaded) return <Message>存檔暫時讀不到。請稍後再試，或告訴老師。</Message>;

  // The turn wears the color of the line it came from.
  const slug = ride?.returnTo.match(/^\/line\/([^/]+)\//)?.[1];
  const line = isLineSlug(slug) ? getLine(slug) : null;

  return (
    <div style={{ ...(line ? lineVars(line) : {}), display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <TurnFlow
        initial={gamePayload(loaded.state, loaded.ctx)}
        name={student.name}
        exitHref="/today"
        ride={ride}
      />
    </div>
  );
}

function Message({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar title="人生遊戲" flat close={{ href: "/today" }} />
      <div style={{ padding: "var(--s-4) var(--gutter)" }}>
        <Card>
          <Body>{children}</Body>
        </Card>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { FloatCard } from "@/components/game/FloatCard";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { getCurrentStudent } from "@/lib/session";
import { homeFor } from "@/lib/modeModel";
import { readProfile } from "@/lib/studentProfile";
import { allLineContent } from "@/lib/tasks/registry";
import type { Takeaway } from "@/lib/tasks/types";

export const metadata: Metadata = { title: "工具箱" };

/** 工具箱: the takeaway frameworks a student saved from station reveals (01 §6.5). */
export default async function ToolsPage() {
  const student = await getCurrentStudent().catch(() => null);
  const saved = new Set(readProfile(student?.profile).savedTools ?? []);
  const byName = new Map<string, { takeaway: Takeaway; line: string }>();
  for (const line of allLineContent()) {
    for (const t of [line.takeaway, ...line.lessons.map((l) => l.takeaway)]) {
      if (saved.has(t.name) && !byName.has(t.name)) byName.set(t.name, { takeaway: t, line: line.slug });
    }
  }
  const tools = [...byName.values()];
  return (
    <div className="g-station-page" style={{ maxWidth: 760 }}>
      <FloatCard strong title="工具箱" as="section">
        {tools.length === 0 ? (
          <p style={{ margin: 0 }}>還沒有存任何工具。完成一站後，在最後的工具卡按「存到工具箱」。</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            {tools.map(({ takeaway }) => (
              <li key={takeaway.name}>
                <strong>{takeaway.name}</strong>
                {takeaway.lines.length ? (
                  <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
                    {takeaway.lines.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <PrimaryButton href={homeFor(student?.mode ?? null)}>回到首頁</PrimaryButton>
      </FloatCard>
    </div>
  );
}

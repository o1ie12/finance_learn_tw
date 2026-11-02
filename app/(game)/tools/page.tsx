import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { PageHeader, pageStyles as s } from "@/components/page/Page";
import { lineVars } from "@/lib/design/lineVars";
import { getLine } from "@/lib/lines";
import { getCurrentStudent } from "@/lib/session";
import { readProfile } from "@/lib/studentProfile";
import { allLineContent } from "@/lib/tasks/registry";
import type { Takeaway } from "@/lib/tasks/types";

export const metadata: Metadata = { title: "工具箱" };

/**
 * 工具箱 (2026-11-02): every tool the lines teach, the saved ones first; the
 * rest show where to earn them, so the page explains itself and is never an
 * empty box.
 */
export default async function ToolsPage() {
  const student = await getCurrentStudent().catch(() => null);
  const saved = new Set(readProfile(student?.profile).savedTools ?? []);
  const all = new Map<string, { takeaway: Takeaway; slug: string; station: string | null }>();
  for (const line of allLineContent()) {
    for (const l of line.lessons) {
      if (!all.has(l.takeaway.name)) all.set(l.takeaway.name, { takeaway: l.takeaway, slug: line.slug, station: l.stationId ? `/line/${line.slug}/station/${l.stationId}` : `/line/${line.slug}` });
    }
  }
  const tools = [...all.values()].sort((a, b) => Number(saved.has(b.takeaway.name)) - Number(saved.has(a.takeaway.name)));
  const have = tools.filter((t) => saved.has(t.takeaway.name)).length;
  return (
    <>
      <PageHeader
        kicker="工具箱"
        title={`你的理財工具 · ${have} / ${tools.length}`}
        intro="每一站最後都有一張「這一站帶走的」工具卡，按「存到工具箱」就會收在這裡。還沒拿到的工具，下面寫了在哪一站。"
        actions={
          <Link href="/today" className={s.primary}>
            回到今天
          </Link>
        }
      />
      <div className={s.grid}>
        {tools.map(({ takeaway, slug, station }) => {
          const line = getLine(slug)!;
          const got = saved.has(takeaway.name);
          return (
            <article key={takeaway.name} className={s.tool} data-locked={got ? undefined : ""} style={lineVars(line) as CSSProperties}>
              <p className={s.toolWhere}>{line.name}</p>
              <h2 className={s.toolName}>{takeaway.name}</h2>
              {got ? (
                <ul className={s.toolLines}>
                  {takeaway.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              ) : (
                <p className={s.toolWhere}>
                  還沒拿到 · <Link href={station ?? `/line/${slug}`}>去{line.name}拿</Link>
                </p>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}

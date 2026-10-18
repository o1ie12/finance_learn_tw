import "server-only";

/**
 * Prepare a lesson on the server before it goes to the browser: price
 * charts filled from the real series, the crash month's numbers written into
 * 投資線 Task C (04 §7: the data picks the month; never hard-coded), and its
 * after-answer note on what the next six real months did, said plainly when
 * they did not recover.
 */

import { biggestFallWindow, prepareMaterials } from "@/components/documents/priceSeries";
import { formatNT } from "@/components/Money";
import type { StationLesson } from "./types";
import { publicLesson } from "./publicLesson";

const STAKE = 50_000; // 04 §7 Task C: 「已經投入 NT$50,000」

export function prepareLesson(lesson: StationLesson): StationLesson {
  const usesCrash = lesson.task.materials.some((m) => m.kind === "priceChart" && m.data.source?.window === "biggestFall12");
  const materials = prepareMaterials(lesson.task.materials);
  if (!usesCrash) return { ...lesson, task: { ...lesson.task, materials } };

  const w = biggestFallWindow("0050", 12, 6);
  const pct = Math.round(-w.change * 1000) / 10;
  const dropClose = w.series[w.series.length - 1].close;
  const before = w.series[w.series.length - 2]?.close ?? dropClose;
  const lastAfter = w.after[w.after.length - 1];
  const afterDrop = Math.round(STAKE * (dropClose / before));
  const held = Math.round(afterDrop * (lastAfter.close / dropClose));
  const recovered = lastAfter.close >= before;
  const filled = materials.map((m) =>
    m.kind === "newsCard"
      ? { ...m, data: { ...m.data, headline: m.data.headline.replace("{pct}", String(pct)), dateLabel: `${w.markMonth.replace("-", " 年 ")} 月` } }
      : m,
  );
  const note =
    `這是 0050 在 ${w.markMonth.replace("-", " 年 ")} 月的真實跌幅：${pct}%。你的 ${formatNT(STAKE)} 跌到約 ${formatNT(afterDrop)}。` +
    `如果全部賣掉，就停在約 ${formatNT(afterDrop)}。如果繼續持有，六個月後（${lastAfter.month.replace("-", " 年 ")} 月）約 ${formatNT(held)}。` +
    (recovered ? "這一次，價格在六個月內回到了大跌前。" : "這一次，六個月後還沒有回到大跌前。回升從來不是保證。") +
    "（真實收盤價，不含之後每月新投入的錢。）";
  return { ...lesson, task: { ...lesson.task, materials: filled, afterTip: note } };
}

/**
 * The lesson a page hands to the browser (05 A2): prepared, then stripped of
 * every answer and shuffled for this student's attempt (lib/tasks/publicLesson.ts).
 */
export function lessonForPage(lesson: StationLesson, studentId: string, attempt: number): StationLesson {
  return publicLesson(prepareLesson(lesson), { taskSetId: lesson.task.id, studentId, attempt });
}

/**
 * 「回報錯誤」 on every model-answer screen: a plain mailto: with the line,
 * station, task and step filled in, so a report names exactly what is wrong.
 * Nothing about the student goes in it.
 */

// TODO-ADDRESS: the address reports go to (asked 2026-10-24, not answered yet).
// Until it is set, the link shows in development only, never in production.
export const REPORT_ADDRESS: string | null = null;

export interface ReportWhere {
  /** The line and station as the lesson bar shows them, e.g. 信用線 · CR01. */
  where: string;
  taskId: string;
  stepId: string;
}

export function reportHref({ where, taskId, stepId }: ReportWhere, address = REPORT_ADDRESS ?? "TODO-ADDRESS"): string {
  const subject = `回報錯誤：${where} · ${taskId} · ${stepId}`;
  const body = [
    `位置：${where}`,
    `任務：${taskId}`,
    `題目：${stepId}`,
    "",
    "哪裡有錯？（請寫下你看到的內容和你認為正確的說法）",
    "",
  ].join("\n");
  return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Show the link: always once the address is set; before that, in development only. */
export const showReport = (): boolean => REPORT_ADDRESS !== null || process.env.NODE_ENV !== "production";

/**
 * Station, 加碼任務 and after-simulation task kinds (03 §4). These results
 * live in task_results, not simulation_runs (a run would mark the line's
 * simulation as done), so they are registered here rather than in
 * SIM_KINDS. Append-only: a kind, once stored, keeps its meaning.
 * scripts/check-sim-contract.ts fails if content declares a kind that is
 * registered nowhere, or a registered kind disappears from content.
 */
export const STATION_TASK_KINDS = [
  "zhiya_interest_map_v1",
  "zhiya_compare_jobs_v1",
  "qixin_first_month_v1",
  "cunqian_smart_goal_v1",
  "xinyong_statement_v1",
  "xinyong_bank_v1",
  "xinyong_friend_loan_v1",
  "touzi_ready_v1",
  "touzi_etfcode_v1",
  "xuedai_monthly_v1",
  "baoshui_refund_v1",
  "baoxian_matrix_v1",
  "chuangye_sunk_cost_v1",
] as const;
export type StationTaskKind = (typeof STATION_TASK_KINDS)[number];

export function isStationTaskKind(v: unknown): v is StationTaskKind {
  return typeof v === "string" && (STATION_TASK_KINDS as readonly string[]).includes(v);
}

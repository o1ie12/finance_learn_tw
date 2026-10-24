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
  // 05 A4: moved from a line's simulation page to a topic-matched station.
  // They stay in TERMINAL_TASK_KINDS too (append-only; older runs keep reading).
  "qixin_need_want_v1",
  "cunqian_savings_rate_v1",
  "touzi_crash_v1",
  "baoxian_fourrisks_v1",
  // 05 A1: stations that keep their quiz, wrapped in the station flow
  // (lib/tasks/wrapped.ts, content/stations.ts).
  "touzi_m42_v1",
  "zhapian_m10_v1",
  "zhapian_m13_v1",
  "xuedai_m14_v1",
  "xuedai_m16_v1",
  "xuedai_m17_v1",
  "xuedai_m18_v1",
  "baoshui_m19_v1",
  "baoshui_m20_v1",
  "baoshui_m21_v1",
  "baoshui_m22_v1",
  "baoshui_m23_v1",
  "zuwu_m24_v1",
  "zuwu_m25_v1",
  "zuwu_m26_v1",
  "zuwu_m27_v1",
  "zuwu_m28_v1",
  "baoxian_m30_v1",
  "baoxian_m32_v1",
  "baoxian_m33_v1",
  "chuangye_m34_v1",
  "chuangye_m35_v1",
  "chuangye_m36_v1",
  "chuangye_m37_v1",
  "chuangye_m38_v1",
  "caiwujuece_m41_v1",
  // 06 P1 tasks.
  "qixin_budget_gap_v1",
  "qixin_scooter_cost_v1",
  "cunqian_compound_v1",
  "xinyong_payoff_v1",
  "baoxian_scooter_v1",
  // 06 P2 tasks.
  "touzi_risk_v1",
  "touzi_pitch_v1",
  "xinyong_borrow_v1",
] as const;
export type StationTaskKind = (typeof STATION_TASK_KINDS)[number];

export function isStationTaskKind(v: unknown): v is StationTaskKind {
  return typeof v === "string" && (STATION_TASK_KINDS as readonly string[]).includes(v);
}

import type { ModuleProgress, SimulationRun } from "@/lib/types";

/**
 * Hardcoded sample progress for the dashboard design-preview page
 * (app/dashboard-preview). No real account, no database — just enough mixed
 * completion state (one line fully done, one partway, two untouched) for the
 * two layouts to be worth comparing. See components/DashboardABTest.tsx.
 */
const FIXTURE_TIME = "2026-01-01T00:00:00.000Z";

export const PREVIEW_PROGRESS: ModuleProgress[] = [
  // 起薪線 — both stations done (module 1, 2)
  {
    id: "preview-progress-1",
    student_id: "preview",
    module_number: 1,
    completed_at: FIXTURE_TIME,
    quiz_score: 3,
    quiz_total: 3,
  },
  {
    id: "preview-progress-2",
    student_id: "preview",
    module_number: 2,
    completed_at: FIXTURE_TIME,
    quiz_score: 3,
    quiz_total: 3,
  },
  // 存錢線 — its one station done (module 3), sim not attempted yet
  {
    id: "preview-progress-3",
    student_id: "preview",
    module_number: 3,
    completed_at: FIXTURE_TIME,
    quiz_score: 2,
    quiz_total: 3,
  },
  // 信用線 (module 4) and 投資線 (module 5) intentionally left undone.
];

export const PREVIEW_RUNS_BY_LINE: Record<string, SimulationRun> = {
  qixin: {
    id: "preview-run-qixin",
    student_id: "preview",
    line_slug: "qixin",
    rent_choice: "roommates",
    savings_rate: 20,
    spending_choices: {},
    outcome_summary: {},
    created_at: FIXTURE_TIME,
  },
};

export interface Student {
  id: string;
  name: string;
  school: string;
  grade: string;
  // Two independent, optional auth methods on one account — a student can
  // have either, or both. At least one is always present.
  access_code: string | null;
  google_uid: string | null; // Supabase Auth's stable id for the linked Google identity
  google_email: string | null;
  points_total: number; // 起點護照 progress points — a completion counter, not a currency
  created_at: string;
}

export interface ModuleProgress {
  id: string;
  student_id: string;
  module_number: number; // 1–5
  completed_at: string | null;
  quiz_score: number;
  quiz_total: number;
}

export interface SimulationRun {
  id: string;
  student_id: string;
  line_slug: string; // which line's terminal simulation this run belongs to
  // rent_choice / savings_rate are specific to the First Salary sim (qixin);
  // other lines store their inputs in spending_choices and leave these null.
  rent_choice: string | null;
  savings_rate: number | null;
  spending_choices: Record<string, unknown>; // generic per-sim inputs
  outcome_summary: Record<string, unknown>; // generic per-sim computed outcome
  created_at: string;
}

export interface LineTest {
  id: string;
  student_id: string;
  line_slug: string;
  phase: "pre" | "post"; // 前測 vs 後測 — the same 10-question bank, taken twice
  score: number;
  total: number;
  created_at: string;
}

export interface CoachMessage {
  id: string;
  simulation_run_id: string;
  message: string;
  created_at: string;
}

export interface DashboardData {
  student: Pick<Student, "name" | "school" | "grade" | "access_code">;
  progress: ModuleProgress[];
  latestRun: SimulationRun | null;
  coachMessage: CoachMessage | null;
}

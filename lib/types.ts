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
  points_total: number; // 錢途護照 progress points — a completion counter, not a currency
  // How this student works through a line. Null means they have not chosen
  // yet, which is what triggers the one-time picker — deliberately not
  // defaulted, so nobody is silently opted into a mode they did not pick.
  mode: StudentMode | null;
  // Cross-line facts (interest, resolved income). Free-form on purpose so
  // adding one is not a migration; read and written only through
  // lib/studentProfile.ts, which validates the shape.
  profile: Record<string, unknown>;
  created_at: string;
}

/**
 * sim_first — go straight to the simulation; core stations appear as inline
 *             tips inside it and reading is optional.
 * full       — every station in order, then the simulation.
 *
 * A view over one content base, not a second set of content.
 */
export type StudentMode = "sim_first" | "full";

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
  line_slug: string; // DEPRECATED — superseded by line_id, kept as safety net
  line_id: number | null; // stable line identity; null only on pre-migration rows
  // Names the shape of outcome_summary. Null on rows written before the
  // contract existed, and on any kind this build does not recognise — both
  // render a neutral state rather than being guessed at. See lib/sims/types.ts.
  kind: string | null;
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
  line_slug: string; // DEPRECATED — superseded by line_id
  line_id: number | null;
  phase: "pre" | "post"; // 前測 vs 後測 — the same 10-question bank, taken twice
  score: number;
  total: number;
  created_at: string;
}

export type ClassRoomStatus = "waiting" | "active" | "finished";

export interface ClassRoom {
  id: string;
  code: string;
  host_token: string; // returned only to the creator, required to start/end the round
  line_slug: string; // DEPRECATED — superseded by line_id
  line_id: number | null;
  status: ClassRoomStatus;
  started_at: string | null;
  created_at: string;
}

export interface ClassParticipant {
  id: string;
  room_id: string;
  display_name: string;
  score: number;
  total_ms: number | null; // total time to answer all questions, once submitted
  submitted_at: string | null;
  joined_at: string;
}

export interface HistoricalPrice {
  ticker: string;
  date: string; // YYYY-MM-DD
  closing_price: number;
}

export interface SimPortfolio {
  student_id: string;
  sim_start_date: string; // real historical date — never shown pre-reveal
  sim_current_date: string;
  holdings: Record<string, number>; // ticker -> units, fractional allowed
  cash_balance: number;
  last_advanced_at: string;
  revealed: boolean;
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

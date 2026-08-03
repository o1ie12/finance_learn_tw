import type { RentChoiceId } from "@/lib/simulation";

export interface Student {
  id: string;
  name: string;
  school: string;
  grade: string;
  access_code: string;
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
  rent_choice: RentChoiceId | string;
  savings_rate: number;
  spending_choices: Record<string, unknown>;
  outcome_summary: Record<string, unknown>;
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

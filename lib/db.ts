import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { generateAccessCode } from "@/lib/accessCode";
import type {
  Student,
  ModuleProgress,
  SimulationRun,
  CoachMessage,
} from "@/lib/types";

/**
 * Persistence lives entirely on the server. Production uses Supabase
 * (Postgres). For local development without credentials, an opt-in
 * file-backed store (USE_DEV_STORE=1, dev only) lets the full flow be
 * exercised end to end. With neither configured, calls throw
 * BackendNotConfiguredError and the API routes return a clean 503.
 */

export class BackendNotConfiguredError extends Error {
  constructor() {
    super("Backend not configured");
    this.name = "BackendNotConfiguredError";
  }
}

export function isNotConfigured(e: unknown): e is BackendNotConfiguredError {
  return e instanceof BackendNotConfiguredError;
}

type Backend = "supabase" | "dev" | "none";

function backend(): Backend {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return "supabase";
  }
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.USE_DEV_STORE === "1"
  ) {
    return "dev";
  }
  return "none";
}

export function isBackendConfigured(): boolean {
  return backend() !== "none";
}

// --- Supabase client (lazy singleton) ---
let _supabase: SupabaseClient | null = null;
function supabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return _supabase;
}

export interface CreateStudentInput {
  name: string;
  school: string;
  grade: string;
}

export interface CreateRunInput {
  student_id: string;
  rent_choice: string;
  savings_rate: number;
  spending_choices: Record<string, unknown>;
  outcome_summary: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Dev file store
// ---------------------------------------------------------------------------
interface DevData {
  students: Student[];
  module_progress: ModuleProgress[];
  simulation_runs: SimulationRun[];
  coach_messages: CoachMessage[];
}

const DEV_FILE = path.join(process.cwd(), ".devstore.json");
let devWriteChain: Promise<unknown> = Promise.resolve();

async function devRead(): Promise<DevData> {
  try {
    const raw = await fs.readFile(DEV_FILE, "utf8");
    return JSON.parse(raw) as DevData;
  } catch {
    return {
      students: [],
      module_progress: [],
      simulation_runs: [],
      coach_messages: [],
    };
  }
}

// Serialize read-modify-write so concurrent requests don't clobber the file.
function devMutate<T>(fn: (data: DevData) => Promise<T> | T): Promise<T> {
  const run = devWriteChain.then(async () => {
    const data = await devRead();
    const result = await fn(data);
    await fs.writeFile(DEV_FILE, JSON.stringify(data, null, 2), "utf8");
    return result;
  });
  devWriteChain = run.catch(() => undefined);
  return run;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function createStudent(
  input: CreateStudentInput,
): Promise<Student> {
  const b = backend();
  if (b === "none") throw new BackendNotConfiguredError();

  if (b === "dev") {
    return devMutate((data) => {
      let code = generateAccessCode();
      while (data.students.some((s) => s.access_code === code)) {
        code = generateAccessCode();
      }
      const student: Student = {
        id: randomUUID(),
        name: input.name,
        school: input.school,
        grade: input.grade,
        access_code: code,
        created_at: new Date().toISOString(),
      };
      data.students.push(student);
      return student;
    });
  }

  // Supabase — retry a few times on the (very unlikely) access_code collision.
  const db = supabase();
  for (let attempt = 0; attempt < 6; attempt++) {
    const access_code = generateAccessCode();
    const { data, error } = await db
      .from("students")
      .insert({
        name: input.name,
        school: input.school,
        grade: input.grade,
        access_code,
      })
      .select()
      .single();
    if (!error && data) return data as Student;
    // 23505 = unique_violation → regenerate code and retry
    if (error && error.code !== "23505") {
      throw new Error(`createStudent failed: ${error.message}`);
    }
  }
  throw new Error("createStudent failed: could not generate a unique code");
}

export async function getStudentByCode(
  code: string,
): Promise<Student | null> {
  const b = backend();
  if (b === "none") throw new BackendNotConfiguredError();

  if (b === "dev") {
    const data = await devRead();
    return data.students.find((s) => s.access_code === code) ?? null;
  }

  const { data, error } = await supabase()
    .from("students")
    .select()
    .eq("access_code", code)
    .maybeSingle();
  if (error) throw new Error(`getStudentByCode failed: ${error.message}`);
  return (data as Student) ?? null;
}

export async function upsertModuleProgress(
  studentId: string,
  moduleNumber: number,
  quizScore: number,
  quizTotal: number,
): Promise<ModuleProgress> {
  const b = backend();
  if (b === "none") throw new BackendNotConfiguredError();

  if (b === "dev") {
    return devMutate((data) => {
      const now = new Date().toISOString();
      const existing = data.module_progress.find(
        (p) => p.student_id === studentId && p.module_number === moduleNumber,
      );
      if (existing) {
        existing.completed_at = now;
        existing.quiz_score = quizScore;
        existing.quiz_total = quizTotal;
        return existing;
      }
      const row: ModuleProgress = {
        id: randomUUID(),
        student_id: studentId,
        module_number: moduleNumber,
        completed_at: now,
        quiz_score: quizScore,
        quiz_total: quizTotal,
      };
      data.module_progress.push(row);
      return row;
    });
  }

  const { data, error } = await supabase()
    .from("module_progress")
    .upsert(
      {
        student_id: studentId,
        module_number: moduleNumber,
        quiz_score: quizScore,
        quiz_total: quizTotal,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "student_id,module_number" },
    )
    .select()
    .single();
  if (error) throw new Error(`upsertModuleProgress failed: ${error.message}`);
  return data as ModuleProgress;
}

export async function getProgress(
  studentId: string,
): Promise<ModuleProgress[]> {
  const b = backend();
  if (b === "none") throw new BackendNotConfiguredError();

  if (b === "dev") {
    const data = await devRead();
    return data.module_progress
      .filter((p) => p.student_id === studentId)
      .sort((a, b) => a.module_number - b.module_number);
  }

  const { data, error } = await supabase()
    .from("module_progress")
    .select()
    .eq("student_id", studentId)
    .order("module_number", { ascending: true });
  if (error) throw new Error(`getProgress failed: ${error.message}`);
  return (data as ModuleProgress[]) ?? [];
}

export async function createSimulationRun(
  input: CreateRunInput,
): Promise<SimulationRun> {
  const b = backend();
  if (b === "none") throw new BackendNotConfiguredError();

  if (b === "dev") {
    return devMutate((data) => {
      const row: SimulationRun = {
        id: randomUUID(),
        student_id: input.student_id,
        rent_choice: input.rent_choice,
        savings_rate: input.savings_rate,
        spending_choices: input.spending_choices,
        outcome_summary: input.outcome_summary,
        created_at: new Date().toISOString(),
      };
      data.simulation_runs.push(row);
      return row;
    });
  }

  const { data, error } = await supabase()
    .from("simulation_runs")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(`createSimulationRun failed: ${error.message}`);
  return data as SimulationRun;
}

export async function getSimulationRun(
  runId: string,
): Promise<SimulationRun | null> {
  const b = backend();
  if (b === "none") throw new BackendNotConfiguredError();

  if (b === "dev") {
    const data = await devRead();
    return data.simulation_runs.find((r) => r.id === runId) ?? null;
  }

  const { data, error } = await supabase()
    .from("simulation_runs")
    .select()
    .eq("id", runId)
    .maybeSingle();
  if (error) throw new Error(`getSimulationRun failed: ${error.message}`);
  return (data as SimulationRun) ?? null;
}

export async function getLatestSimulationRun(
  studentId: string,
): Promise<SimulationRun | null> {
  const b = backend();
  if (b === "none") throw new BackendNotConfiguredError();

  if (b === "dev") {
    const data = await devRead();
    const runs = data.simulation_runs
      .filter((r) => r.student_id === studentId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return runs[0] ?? null;
  }

  const { data, error } = await supabase()
    .from("simulation_runs")
    .select()
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getLatestSimulationRun failed: ${error.message}`);
  return (data as SimulationRun) ?? null;
}

export async function addCoachMessage(
  runId: string,
  message: string,
): Promise<CoachMessage> {
  const b = backend();
  if (b === "none") throw new BackendNotConfiguredError();

  if (b === "dev") {
    return devMutate((data) => {
      const row: CoachMessage = {
        id: randomUUID(),
        simulation_run_id: runId,
        message,
        created_at: new Date().toISOString(),
      };
      data.coach_messages.push(row);
      return row;
    });
  }

  const { data, error } = await supabase()
    .from("coach_messages")
    .insert({ simulation_run_id: runId, message })
    .select()
    .single();
  if (error) throw new Error(`addCoachMessage failed: ${error.message}`);
  return data as CoachMessage;
}

export async function getLatestCoachMessage(
  runId: string,
): Promise<CoachMessage | null> {
  const b = backend();
  if (b === "none") throw new BackendNotConfiguredError();

  if (b === "dev") {
    const data = await devRead();
    const msgs = data.coach_messages
      .filter((m) => m.simulation_run_id === runId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return msgs[0] ?? null;
  }

  const { data, error } = await supabase()
    .from("coach_messages")
    .select()
    .eq("simulation_run_id", runId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getLatestCoachMessage failed: ${error.message}`);
  return (data as CoachMessage) ?? null;
}

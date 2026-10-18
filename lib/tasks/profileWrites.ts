/**
 * Profile fields a station task writes (the threaded financial state).
 *
 * 信用線 (04 §4): `creditRecord` comes from the statement task's payment
 * choice, using the existing rules from lib/sims/creditCard.ts
 * computeCreditCard: a missed payment → poor; anything left revolving → fair;
 * paid in full → good. Paying the minimum or NT$3,000 of NT$6,390 leaves a
 * balance revolving, so both are fair.
 *
 * Every lookup is an own-property check against fixed maps, so an answer
 * such as "toString" or "__proto__" yields nothing rather than a value the
 * profile schema would reject.
 */

import type { StudentProfile } from "@/lib/studentProfile";
import type { TaskSet } from "./types";

const STATEMENT_RECORD = new Map<string, NonNullable<StudentProfile["creditRecord"]>>([
  ["full", "good"],
  ["min", "fair"],
  ["partial", "fair"],
  ["none", "poor"],
]);

/** Reflection answers saved to the profile (03 §2): the option id, never free text. */
const PROFILE_KEYS = new Set(["careerPriority"]);

export function profilePatchForTask(kind: string, answers: Record<string, unknown>, task?: TaskSet): StudentProfile {
  const patch: StudentProfile = {};
  if (kind === "xinyong_statement_v1") {
    const a = answers["s3"] as { option?: unknown } | undefined;
    const record = typeof a?.option === "string" ? STATEMENT_RECORD.get(a.option) : undefined;
    if (record) patch.creditRecord = record;
  }
  for (const step of task?.steps ?? []) {
    if (!step.profileKey || !PROFILE_KEYS.has(step.profileKey) || step.type !== "choice") continue;
    const a = answers[step.id] as { option?: unknown } | undefined;
    const option = typeof a?.option === "string" ? step.options.find((o) => o.id === a.option) : undefined;
    if (option) (patch as Record<string, unknown>)[step.profileKey] = option.id;
  }
  return patch;
}

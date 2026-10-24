import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Creator } from "@/components/creator/Creator";
import { readAvatar } from "@/lib/avatar";
import { needsOnboarding, skipAvatar } from "@/lib/onboarding";
import { getCurrentStudent } from "@/lib/session";

export const metadata: Metadata = { title: "做出你的角色" };

/**
 * The character creator on the Part E design (06 E8.8). First time: 出發
 * goes on to the goal step; later (from 設定) it goes back to 今天.
 */
export default async function CreatorPage() {
  const student = await getCurrentStudent().catch(() => null);
  if (!student) redirect("/signup");
  const onboarding = needsOnboarding(student);
  return (
    <Creator
      initial={readAvatar(student.avatar) ?? skipAvatar(student.name)}
      next={onboarding ? "/onboarding/goal" : "/today"}
      onboarding={onboarding}
    />
  );
}

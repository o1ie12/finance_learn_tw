import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HomePage, feedbackFrom } from "@/components/home/HomePage";
import { getCurrentStudent } from "@/lib/session";

export const metadata: Metadata = {
  title: "我的首頁",
  description: "你的角色、今天的一站和所有路線的進度。",
};

/**
 * 學習 mode's home. /dashboard and /simulate render the same game
 * home (01 §6.1); homeFor() still routes each mode to its own URL.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string; linked_error?: string }>;
}) {
  // 2026-11-02: one home. Signed in, HomePage sends the student to 今天 (or
  // 設定 with a link result); signed out, the code form lives on /signup.
  const student = await getCurrentStudent().catch(() => null);
  if (!student) redirect("/signup#login");
  return <HomePage googleFeedback={feedbackFrom(await searchParams)} />;
}

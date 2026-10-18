import type { Metadata } from "next";
import { HomePage, feedbackFrom } from "@/components/home/HomePage";

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
  return <HomePage googleFeedback={feedbackFrom(await searchParams)} />;
}

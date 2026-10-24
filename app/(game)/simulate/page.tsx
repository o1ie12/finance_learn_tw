import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { HomePage, feedbackFrom } from "@/components/home/HomePage";
import { FLOW_V2 } from "@/lib/flags";

export const metadata: Metadata = {
  title: "我的首頁（模擬）",
  description: "你的角色、今天的一站和所有路線的模擬。",
};

/**
 * 模擬 mode's home. /dashboard and /simulate render the same game
 * home (01 §6.1); homeFor() still routes each mode to its own URL.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string; linked_error?: string }>;
}) {
  // 06 G0: no 模擬 home; one mode, one home.
  if (FLOW_V2) permanentRedirect("/today");
  return <HomePage googleFeedback={feedbackFrom(await searchParams)} />;
}

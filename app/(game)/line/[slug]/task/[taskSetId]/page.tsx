import { permanentRedirect } from "next/navigation";

/** The older 加碼任務 route (2026-11-02): it runs in the station workspace now. */
export default async function LibraryTaskPage({ params }: { params: Promise<{ slug: string; taskSetId: string }> }) {
  const { slug, taskSetId } = await params;
  permanentRedirect(`/line/${slug}/bonus/${encodeURIComponent(taskSetId)}`);
}

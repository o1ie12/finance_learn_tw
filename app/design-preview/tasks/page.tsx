import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/app/(game)/game.css";
import { StationScene } from "@/components/game/StationScene";
import { StationFlowDemo } from "@/components/tasks/preview/StationFlowDemo";

/*
  Dev-only preview of the task engine UI (03 §2-3, 01 §6.5): StationFlow with
  a hard-coded lesson that has one step of every type. All data is 示意.
  404 in production.
*/

export const metadata: Metadata = {
  title: "Task engine preview",
  robots: { index: false, follow: false },
};

export default function TaskPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="game-shell">
      <StationScene />
      <div
        style={{
          position: "relative",
          boxSizing: "border-box",
          padding: "20px var(--space-7) 48px",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-7)",
        }}
      >
        <StationFlowDemo />
      </div>
    </div>
  );
}

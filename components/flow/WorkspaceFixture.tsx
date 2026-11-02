"use client";

/** A compare screen drawn from a fixture result (10 compare-e, dev only). */
import type { SubmitResult } from "@/components/tasks/StationFlow";
import type { StationLesson } from "@/lib/tasks/types";
import { StationWorkspace } from "./StationWorkspace";

export function WorkspaceFixture(props: {
  lesson: StationLesson;
  stationName: string;
  mode: "station" | "terminal" | "library";
  result: SubmitResult;
  answers: Record<string, unknown>;
  foldExpert: boolean;
}) {
  return (
    <StationWorkspace
      lesson={props.lesson}
      stationName={props.stationName}
      goal={null}
      mode={props.mode}
      exitHref="/today"
      onSubmit={async () => props.result}
      onSaveTool={async () => {}}
      onContinue={() => {}}
      onRedo={props.mode === "terminal" ? undefined : () => {}}
      initialResult={{ result: props.result, answers: props.answers }}
      foldExpert={props.foldExpert}
    />
  );
}

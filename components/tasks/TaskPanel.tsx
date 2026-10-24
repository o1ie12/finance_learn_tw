"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { materialTitle, renderMaterial } from "@/components/documents";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { drawRateItems } from "@/lib/tasks/draw";
import type { TaskSet, TaskStep } from "@/lib/tasks/types";
import {
  draftProblem,
  draftToAnswer,
  emptyDraft,
  type ChoiceDraft,
  type Draft,
  type FindDraft,
  type NumberDraft,
  type OrderDraft,
  type RateDraft,
  type SortDraft,
  type WriteDraft,
} from "./answers";
import { MaterialModal } from "./MaterialModal";
import { ChoiceStepView } from "./steps/ChoiceStepView";
import { FindStepView, toggleFind } from "./steps/FindStepView";
import { NumberStepView } from "./steps/NumberStepView";
import { OrderStepView } from "./steps/OrderStepView";
import { RateStepView } from "./steps/RateStepView";
import { SortStepView } from "./steps/SortStepView";
import { WriteStepView } from "./steps/WriteStepView";
import s from "./tasks.module.css";

export interface TaskPanelLine {
  color: string;
  colorInk: string;
}

export interface TaskPanelProps {
  task: TaskSet;
  line: TaskPanelLine;
  studentId: string;
  attempt: number;
  /** Sends every step's answer; resolves when the server has scored them. */
  onSubmitAll(answers: Record<string, unknown>): Promise<void>;
}

/** Materials only a RateStep points at are shown inside that step, not in the column. */
function rateOnlyMaterials(task: TaskSet): Set<number> {
  const rate = new Set<number>();
  const other = new Set<number>();
  for (const step of task.steps) {
    if (step.type === "rate") step.items.forEach((i) => rate.add(i.materialIndex));
    if (step.type === "find") other.add(step.materialIndex);
  }
  for (const i of other) rate.delete(i);
  return rate;
}

/**
 * Panel 3 (03 §3): the brief on top, materials on the left (top on phones),
 * one step at a time on the right. Each step is committed with 「送出」
 * before the next appears; after the last step every answer is submitted.
 */
export function TaskPanel({ task, line, studentId, attempt, onSubmitAll }: TaskPanelProps) {
  const uid = useId();
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [committed, setCommitted] = useState<Record<string, unknown>>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  const promptRef = useRef<HTMLHeadingElement>(null);
  const focusedIndex = useRef(0);

  const step: TaskStep = task.steps[index];
  const draft = drafts[step.id] ?? emptyDraft(step);
  const locked = committed[step.id] !== undefined;
  const promptId = `${uid}-prompt-${index}`;

  const rateItems = useMemo(
    () => (step.type === "rate" ? drawRateItems(step, { taskSetId: task.id, studentId, attempt }) : []),
    [step, task.id, studentId, attempt],
  );

  const rateOnly = useMemo(() => rateOnlyMaterials(task), [task]);
  const findIndex = step.type === "find" ? step.materialIndex : -1;
  const column = task.materials
    .map((m, i) => ({ m, i }))
    .filter(({ i }) => !rateOnly.has(i) && i !== findIndex);

  // A new step: move focus to its prompt (not on the panel's first render;
  // the flow focuses the panel heading then).
  useEffect(() => {
    if (focusedIndex.current === index) return;
    focusedIndex.current = index;
    promptRef.current?.focus();
  }, [index]);

  function setDraft(next: Draft) {
    setDrafts((d) => ({ ...d, [step.id]: next }));
    setProblem(null);
  }

  async function send(answers: Record<string, unknown>) {
    setSending(true);
    setSendFailed(false);
    try {
      await onSubmitAll(answers);
    } catch {
      setSendFailed(true);
      setSending(false);
    }
  }

  function commit(next?: Draft) {
    if (locked || sending) return;
    const d = next ?? draft;
    const why = draftProblem(step, d, rateItems.map((i) => i.id));
    if (why) {
      setProblem(why);
      return;
    }
    const answers = { ...committed, [step.id]: draftToAnswer(step, d) };
    setCommitted(answers);
    setProblem(null);
    if (index + 1 < task.steps.length) setIndex(index + 1);
    else void send(answers);
  }

  // The large viewer shows the find document in find mode, sharing the draft.
  const viewerMaterial = viewer !== null ? task.materials[viewer] : undefined;
  const viewerFind =
    viewer !== null && step.type === "find" && step.materialIndex === viewer
      ? {
          selected: new Set((draft as FindDraft).selected),
          onToggle: (id: string) => setDraft(toggleFind(draft as FindDraft, id)),
          disabled: locked,
        }
      : undefined;

  const common = { onConfirm: commit, disabled: locked || sending, promptId };
  let view;
  switch (step.type) {
    case "choice":
      view = <ChoiceStepView step={step} value={draft as ChoiceDraft} onChange={setDraft} {...common} />;
      break;
    case "rate":
      view = (
        <RateStepView
          step={step}
          items={rateItems}
          materials={task.materials}
          value={draft as RateDraft}
          onChange={setDraft}
          onExpand={setViewer}
          {...common}
        />
      );
      break;
    case "find":
      view = (
        <FindStepView
          step={step}
          material={task.materials[step.materialIndex]}
          value={draft as FindDraft}
          onChange={setDraft}
          onExpand={setViewer}
          {...common}
        />
      );
      break;
    case "number":
      view = <NumberStepView step={step} value={draft as NumberDraft} onChange={setDraft} {...common} />;
      break;
    case "sort":
      view = <SortStepView step={step} value={draft as SortDraft} onChange={setDraft} {...common} />;
      break;
    case "order":
      view = <OrderStepView step={step} value={draft as OrderDraft} onChange={setDraft} {...common} />;
      break;
    case "write":
      view = <WriteStepView step={step} value={draft as WriteDraft} onChange={setDraft} {...common} />;
      break;
  }

  return (
    <div className={s.taskPanel}>
      <section
        className={`g-card g-card--strong ${s.brief}`}
        style={{ "--line-color": line.color } as CSSProperties}
        aria-labelledby={`${uid}-brief`}
      >
        <h2 id={`${uid}-brief`} className={s.briefTitle} data-panel-heading tabIndex={-1}>
          <span className="g-label">任務</span>
          <span>{task.title}</span>
        </h2>
        <dl className={s.briefRows}>
          <div>
            <dt className="g-label">
              {task.brief.from.name}（{task.brief.from.org} · {task.brief.from.role}）
            </dt>
            <dd>{task.brief.message}</dd>
          </div>
          <div>
            <dt className="g-label">你會學到</dt>
            <dd>{task.brief.learn}</dd>
          </div>
          <div>
            <dt className="g-label">你要做的</dt>
            <dd>{task.brief.do}</dd>
          </div>
        </dl>
      </section>

      <div className={s.taskGrid} data-has-column={column.length > 0 || undefined}>
        {column.length > 0 ? (
          <section className={s.materials} aria-label="資料">
            {column.map(({ m, i }) => (
              <div key={i} className={s.materialItem}>
                <div className={s.materialBar}>
                  <button
                    type="button"
                    className={s.ghostBtn}
                    aria-label={`放大「${materialTitle(m)}」`}
                    onClick={() => setViewer(i)}
                  >
                    放大
                  </button>
                </div>
                {renderMaterial(m, { headingLevel: 3 })}
              </div>
            ))}
          </section>
        ) : null}

        <section className={`g-card g-card--strong ${s.stepCard}`} aria-labelledby={promptId}>
          <p className="g-label" aria-hidden="true">
            第 {index + 1} 題，共 {task.steps.length} 題
          </p>
          <h3 id={promptId} ref={promptRef} tabIndex={-1} className={`g-question ${s.prompt}`}>
            <span className="sr-only">
              第 {index + 1} 題，共 {task.steps.length} 題：
            </span>
            {step.prompt}
          </h3>
          {view}
          <p className={s.problem} role="status" aria-live="polite">
            {problem ?? (sendFailed ? "沒有送出成功。檢查網路後再試一次。" : "")}
          </p>
          <div className={s.actions}>
            {sendFailed ? (
              <PrimaryButton line={line} onClick={() => void send(committed)}>
                再送一次
              </PrimaryButton>
            ) : (
              <PrimaryButton
                line={line}
                onClick={() => commit()}
                aria-disabled={sending || locked || undefined}
              >
                {sending ? "送出中…" : "送出"}
              </PrimaryButton>
            )}
          </div>
        </section>
      </div>

      {viewerMaterial ? (
        <MaterialModal title={materialTitle(viewerMaterial)} onClose={() => setViewer(null)}>
          {renderMaterial(viewerMaterial, { headingLevel: 3, find: viewerFind })}
        </MaterialModal>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FloatCard } from "@/components/game/FloatCard";
import { Icon } from "@/components/game/icons";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { StationSign } from "@/components/game/StationSign";
import type { Goal } from "@/lib/tasks/compute";
import { drawRateItems } from "@/lib/tasks/draw";
import type { StepScore } from "@/lib/tasks/scoring";
import type { StationLesson } from "@/lib/tasks/types";
import { formatScore } from "./answers";
import { LessonCardView } from "./LessonCardView";
import { ModelAnswer, Verdict } from "./ModelAnswer";
import { RevealCard } from "./RevealCard";
import { TakeawayCard } from "./TakeawayCard";
import { TaskPanel } from "./TaskPanel";
import s from "./tasks.module.css";

export interface FlowLine {
  slug: string;
  name: string;
  color: string;
  colorInk: string;
  enName: string;
}

export interface SubmitPayload {
  taskSetId: string;
  answers: Record<string, unknown>;
  hookAnswer: string | null;
}

/** What the server returns for a submitted task (lib/tasks/submit.ts). */
export interface SubmitResult {
  score: number;
  total: number;
  passed: boolean;
  /** Per step, same order as task.steps. */
  details: StepScore[];
  stationDone: boolean;
  /** The bias reveal text the server picked. */
  reveal: string;
  attempt: number;
}

export interface StationFlowProps {
  lesson: StationLesson;
  line: FlowLine;
  station: { name: string; code: string } | null;
  studentId: string;
  /** 1 for a first try; the parent re-mounts with attempt + 1 on 「再試一次」. */
  attempt: number;
  goal: Goal | null;
  /** 「看完整課文」 on panel 2. */
  fullLessonHref?: string;
  onSubmit(payload: SubmitPayload): Promise<SubmitResult>;
  onSaveTool?(name: string): Promise<void>;
  /** Panel 5's button: run one life-game turn. */
  onContinue(): void;
  continueLabel?: string;
  /** Offered when a first attempt does not pass. */
  onRetry?(): void;
  /**
   * Open straight on the task panel (a retry: the hook and lesson were
   * already seen). Pass the earlier hook answer with it.
   */
  startAtTask?: boolean;
  initialHookAnswer?: string | null;
}

const PANELS = ["提問", "觀念", "任務", "解答", "回到人生"] as const;

/**
 * The station page (01 §6.5, 03 §3): five panels, one at a time.
 * 1 hook, 2 lesson cards, 3 task, 4 model answer + bias reveal + takeaway,
 * 5 the life-game turn button.
 *
 * Panel changes are plain state; the arrival animation is CSS only (no rAF,
 * no transitionend), so content is readable even if it never runs.
 */
export function StationFlow({
  lesson,
  line,
  station,
  studentId,
  attempt,
  goal,
  fullLessonHref,
  onSubmit,
  onSaveTool,
  onContinue,
  continueLabel = "回到你的人生",
  onRetry,
  startAtTask = false,
  initialHookAnswer = null,
}: StationFlowProps) {
  const [panel, setPanel] = useState(startAtTask ? 2 : 0);
  const [hookAnswer, setHookAnswer] = useState<string | null>(initialHookAnswer);
  const [outcome, setOutcome] = useState<{ answers: Record<string, unknown>; result: SubmitResult } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // Starts at 0 so a retry that opens on the task panel focuses its heading.
  const shownPanel = useRef(0);
  const task = lesson.task;

  // On a panel change, bring its heading into view and focus it, so screen
  // readers and keyboard users start at the top of the new panel.
  useEffect(() => {
    if (shownPanel.current === panel) return;
    shownPanel.current = panel;
    const heading = rootRef.current?.querySelector<HTMLElement>("[data-panel-heading]");
    rootRef.current?.scrollIntoView({ block: "start" });
    heading?.focus({ preventScroll: true });
  }, [panel]);

  async function submitAll(answers: Record<string, unknown>) {
    const result = await onSubmit({ taskSetId: task.id, answers, hookAnswer });
    setOutcome({ answers, result });
    setPanel(3);
  }

  const signName = station?.name ?? task.title;
  const signCode = station?.code ?? line.enName.toUpperCase();

  return (
    <div ref={rootRef} className={s.flow}>
      <div className={s.progress}>
        <ol className={s.dots} aria-label="這一站的進度">
          {PANELS.map((name, i) => (
            <li
              key={name}
              className={s.dotItem}
              data-state={i < panel ? "done" : i === panel ? "current" : "todo"}
              aria-current={i === panel ? "step" : undefined}
            >
              <span className={s.dot} aria-hidden="true" />
              <span className="sr-only">
                {name}
                {i < panel ? "（完成）" : ""}
              </span>
            </li>
          ))}
        </ol>
        <p className={s.progressText}>
          第 {panel + 1} 步，共 {PANELS.length} 步 · {PANELS[panel]}
        </p>
      </div>

      <div key={panel} className={`ga-card-in ${s.panel}`}>
        {panel === 0 ? (
          <div className={s.hookPanel}>
            <StationSign line={line} station={signName} code={signCode} as="p" />
            <FloatCard strong as="div" arrive={false} className={s.hookCard}>
              <p className="g-label">
                今日一站 · 約 {lesson.minutes} 分鐘
              </p>
              <h2 className={`g-question ${s.hookQuestion}`} data-panel-heading tabIndex={-1}>
                {lesson.hook.question}
              </h2>
              <p className="g-caption">先憑直覺選一個，沒有對錯。</p>
              <div className={s.hookOptions}>
                {lesson.hook.options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={s.hookOption}
                    onClick={() => {
                      setHookAnswer(o.id);
                      setPanel(1);
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </FloatCard>
          </div>
        ) : null}

        {panel === 1 ? (
          <div className={s.lessonPanel}>
            <h2 className={`g-title ${s.panelTitle}`} data-panel-heading tabIndex={-1}>
              先懂一件事
            </h2>
            <div className={s.lessonCards}>
              {lesson.lessonCards.map((card, i) => (
                <LessonCardView key={i} card={card} index={i} />
              ))}
            </div>
            <div className={s.actions}>
              {fullLessonHref ? (
                <Link href={fullLessonHref} className={s.textLink}>
                  看完整課文
                </Link>
              ) : null}
              <PrimaryButton line={line} onClick={() => setPanel(2)}>
                下一步
              </PrimaryButton>
            </div>
          </div>
        ) : null}

        {panel === 2 ? (
          <TaskPanel task={task} line={line} studentId={studentId} attempt={attempt} onSubmitAll={submitAll} />
        ) : null}

        {panel === 3 && outcome ? (
          <AnswerPanel
            lesson={lesson}
            line={line}
            studentId={studentId}
            goal={goal}
            answers={outcome.answers}
            result={outcome.result}
            onSaveTool={onSaveTool}
            onRetry={onRetry}
            onNext={() => setPanel(4)}
          />
        ) : null}

        {panel === 4 ? (
          <FloatCard strong as="section" arrive={false} className={s.endCard}>
            <h2 className={`g-title ${s.panelTitle}`} data-panel-heading tabIndex={-1}>
              這一站結束了
            </h2>
            <p className={s.bodyText}>
              {lesson.lifeGameTurn ? "回到你的人生，過一個月，用上剛學到的。" : "回到月台，準備下一站。"}
            </p>
            <div className={s.actions}>
              <PrimaryButton line={line} onClick={onContinue}>
                {continueLabel}
                <Icon name="arrow" size={20} />
              </PrimaryButton>
            </div>
          </FloatCard>
        ) : null}
      </div>
    </div>
  );
}

function AnswerPanel({
  lesson,
  line,
  studentId,
  goal,
  answers,
  result,
  onSaveTool,
  onRetry,
  onNext,
}: {
  lesson: StationLesson;
  line: FlowLine;
  studentId: string;
  goal: Goal | null;
  answers: Record<string, unknown>;
  result: SubmitResult;
  onSaveTool?(name: string): Promise<void>;
  onRetry?(): void;
  onNext(): void;
}) {
  const task = lesson.task;
  const canRetry = !result.passed && result.attempt === 1 && !!onRetry;
  const scored = result.total > 0;

  let status: string;
  if (!scored) status = "這一站沒有計分，你的想法已經存下來。";
  else if (result.passed) status = "過關了，這一站完成。";
  else if (result.stationDone) status = "這次還沒過關，但這一站算完成了。之後可以回來再練。";
  else status = "還差一點。再試一次，不論分數都算完成這一站。";

  return (
    <div className={s.answerPanel}>
      <FloatCard strong as="section" arrive={false} className={s.scoreCard}>
        <h2 className={`g-title ${s.panelTitle}`} data-panel-heading tabIndex={-1}>
          看看示範答案
        </h2>
        {scored ? (
          <div className={s.scoreRow}>
            <p className={s.score}>
              <span className="g-label">得分</span>
              <span className="g-hero-number">
                {formatScore(result.score)}
                <span className={s.scoreTotal}> / {result.total}</span>
              </span>
            </p>
            <Verdict v={result.passed ? "right" : "part"} text={result.passed ? "過關" : "還沒過關"} />
          </div>
        ) : null}
        <p className={s.bodyText}>{status}</p>
        {canRetry ? (
          <div className={s.actions}>
            <button type="button" className={s.secondaryBtn} onClick={onRetry}>
              再試一次
            </button>
          </div>
        ) : null}
      </FloatCard>

      <section className={s.answers} aria-label="每一題的示範答案">
        {task.steps.map((step, i) => (
          <ModelAnswer
            key={step.id}
            step={step}
            index={i}
            answer={answers[step.id]}
            detail={result.details[i]}
            materials={task.materials}
            goal={goal}
            rateItems={
              step.type === "rate" && !result.details[i]?.perItem
                ? drawRateItems(step, { taskSetId: task.id, studentId, attempt: result.attempt })
                : undefined
            }
            arriveIndex={i}
          />
        ))}
      </section>

      {task.afterTip ? (
        <FloatCard as="aside" arrive={false} className={s.tipCard}>
          <p className="g-label">小提醒</p>
          <p className={s.bodyText}>{task.afterTip}</p>
        </FloatCard>
      ) : null}

      <RevealCard bias={lesson.reveal.bias} text={result.reveal} />
      <TakeawayCard takeaway={lesson.takeaway} onSave={onSaveTool} index={1} />

      <div className={s.actions}>
        {canRetry ? (
          <button type="button" className={s.secondaryBtn} onClick={onRetry}>
            再試一次
          </button>
        ) : null}
        <PrimaryButton line={line} onClick={onNext}>
          下一步
        </PrimaryButton>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { materialTitle, renderMaterial } from "@/components/documents";
import { Icon } from "@/components/game/icons";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { StationSign } from "@/components/game/StationSign";
import type { Goal } from "@/lib/tasks/compute";
import type { AnswerKey } from "@/lib/tasks/publicLesson";
import type { StepScore } from "@/lib/tasks/scoring";
import type { Material, StationLesson, TaskStep } from "@/lib/tasks/types";
import {
  draftProblem,
  draftToAnswer,
  emptyDraft,
  formatScore,
  scoreStatus,
  type ChoiceDraft,
  type Draft,
  type FindDraft,
  type NumberDraft,
  type OrderDraft,
  type RateDraft,
  type SortDraft,
} from "./answers";
import { LessonCardView } from "./LessonCardView";
import { MaterialModal } from "./MaterialModal";
import { ModelAnswer, Verdict } from "./ModelAnswer";
import { RevealCard } from "./RevealCard";
import { TakeawayCard } from "./TakeawayCard";
import { ChoiceStepView } from "./steps/ChoiceStepView";
import { FindStepView, toggleFind } from "./steps/FindStepView";
import { NumberStepView } from "./steps/NumberStepView";
import { OrderStepView } from "./steps/OrderStepView";
import { SortStepView } from "./steps/SortStepView";
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
  /** The answers, sent only now (05 A2). */
  answerKey: AnswerKey;
}

export interface StationFlowProps {
  /** The public lesson: no answers in it (lib/tasks/publicLesson.ts). */
  lesson: StationLesson;
  line: FlowLine;
  station: { name: string; code: string } | null;
  /** Kept for callers; the public lesson is already drawn for this student and attempt. */
  studentId: string;
  attempt: number;
  goal: Goal | null;
  /** What a submit means: a station (done on pass or second try), the line's terminal, or a bonus task. */
  mode?: "station" | "terminal" | "library";
  /** 「看完整課文」 on the lesson cards. */
  fullLessonHref?: string;
  /** The link's label when it goes elsewhere (a terminal's classic simulation). */
  fullLessonLabel?: string;
  onSubmit(payload: SubmitPayload): Promise<SubmitResult>;
  onSaveTool?(name: string): Promise<void>;
  onContinue(): void;
  continueLabel?: string;
  onRetry?(): void;
  /** Open on the brief (a retry: hook and lesson were already seen). */
  startAtTask?: boolean;
  initialHookAnswer?: string | null;
}

type Screen =
  | { k: "hook" }
  | { k: "card"; i: number }
  | { k: "brief" }
  | { k: "q"; i: number }
  | { k: "score" }
  | { k: "answer"; i: number; sub: number }
  | { k: "tip" }
  | { k: "reveal" }
  | { k: "takeaway" }
  | { k: "end" };

const PHASES = ["提問", "觀念", "任務", "解答", "回到人生"] as const;

function phaseOf(sc: Screen): number {
  switch (sc.k) {
    case "hook":
      return 0;
    case "card":
      return 1;
    case "brief":
    case "q":
      return 2;
    case "end":
      return 4;
    default:
      return 3;
  }
}

/** Materials only a rate step points at are shown with that step's applicant. */
function columnMaterials(steps: TaskStep[], materials: Material[]): number[] {
  const rateOnly = new Set<number>();
  const other = new Set<number>();
  for (const step of steps) {
    if (step.type === "rate") step.items.forEach((i) => rateOnly.add(i.materialIndex));
    if (step.type === "find") other.add(step.materialIndex);
  }
  return materials.map((_, i) => i).filter((i) => !rateOnly.has(i) || other.has(i));
}

/** The key's full step, laid out in the order the student saw (05 A7). */
function inShownOrder(pub: TaskStep, key: TaskStep | undefined): TaskStep {
  if (!key) return pub;
  const byId = <T extends { id: string }>(list: T[] | undefined, order: { id: string }[] | undefined): T[] | undefined =>
    list && order ? order.map((o) => list.find((x) => x.id === o.id)).filter((x): x is T => !!x) : list;
  if (key.type === "choice" && pub.type === "choice") {
    return { ...key, options: byId(key.options, pub.options) ?? key.options, reasons: byId(key.reasons, pub.reasons) };
  }
  if (key.type === "rate" && pub.type === "rate") return { ...key, items: byId(key.items, pub.items) ?? key.items, drawCount: undefined };
  if (key.type === "sort" && pub.type === "sort") return { ...key, items: byId(key.items, pub.items) ?? key.items };
  if (key.type === "order" && pub.type === "order") return { ...key, items: byId(key.items, pub.items) ?? key.items };
  return key;
}

/** Points as earned (05 A8.4): a rating step counts each file. */
function displayScore(steps: TaskStep[], details: StepScore[]): { score: number; total: number } {
  let score = 0;
  let total = 0;
  steps.forEach((step, i) => {
    const d = details[i];
    if (!d || !d.scored) return;
    if (step.type === "rate" && d.perItem?.length) {
      score += d.perItem.reduce((a, p) => a + p.credit, 0);
      total += d.perItem.length;
    } else {
      score += d.credit;
      total += 1;
    }
  });
  return { score, total };
}

/**
 * The station page (01 §6.5, 03 §3; 05 Part C): one thing per screen.
 * Hook → each lesson card → the brief → each question (你是銀行: each
 * applicant) → score → each model answer → after-tip → reveal → takeaway →
 * back to your life. Screens change by state; the 200ms slide is CSS only
 * (no rAF, no transitionend) and readable if it never runs.
 */
export function StationFlow({
  lesson,
  line,
  station,
  goal,
  mode = "station",
  fullLessonHref,
  fullLessonLabel = "看完整課文",
  onSubmit,
  onSaveTool,
  onContinue,
  continueLabel = "回到你的人生",
  onRetry,
  startAtTask = false,
  initialHookAnswer = null,
}: StationFlowProps) {
  const task = lesson.task;
  // A hook answered before the page's script loaded arrives as ?hook= (05
  // A8.6), so the flow opens past the hook.
  const [screen, setScreen] = useState<Screen>(
    startAtTask
      ? { k: "brief" }
      : initialHookAnswer
        ? lesson.lessonCards.length
          ? { k: "card", i: 0 }
          : { k: "brief" }
        : { k: "hook" },
  );
  const [back, setBack] = useState(false);
  const [hookAnswer, setHookAnswer] = useState<string | null>(initialHookAnswer);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [committed, setCommitted] = useState<Record<string, unknown>>({});
  const [applicant, setApplicant] = useState(0);
  const [problem, setProblem] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [viewer, setViewer] = useState<number[] | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const column = useMemo(() => columnMaterials(task.steps, task.materials), [task]);
  const keyed = useMemo(
    () => (result ? task.steps.map((st) => inShownOrder(st, result.answerKey.steps.find((k) => k.id === st.id))) : task.steps),
    [result, task.steps],
  );

  // Focus the new screen's heading so keyboard and screen-reader users start there.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      if (!startAtTask) return;
    }
    rootRef.current?.querySelector<HTMLElement>("[data-screen-heading]")?.focus({ preventScroll: true });
  }, [screen, applicant, startAtTask]);

  function go(next: Screen, isBack = false) {
    setBack(isBack);
    setProblem(null);
    setScreen(next);
  }

  // --- the sequence -------------------------------------------------------------------------

  const answerScreens: { i: number; sub: number }[] = keyed.flatMap((st, i) =>
    st.type === "rate" ? st.items.map((_, sub) => ({ i, sub })) : [{ i, sub: 0 }],
  );

  function nextAfterAnswers(): Screen {
    return result?.answerKey.afterTip ? { k: "tip" } : { k: "reveal" };
  }

  function forward() {
    switch (screen.k) {
      case "card":
        return go(screen.i + 1 < lesson.lessonCards.length ? { k: "card", i: screen.i + 1 } : { k: "brief" });
      case "brief":
        return go({ k: "q", i: 0 });
      case "score":
        return go(answerScreens.length ? { k: "answer", ...answerScreens[0] } : nextAfterAnswers());
      case "answer": {
        const at = answerScreens.findIndex((a) => a.i === screen.i && a.sub === screen.sub);
        return go(at + 1 < answerScreens.length ? { k: "answer", ...answerScreens[at + 1] } : nextAfterAnswers());
      }
      case "tip":
        return go({ k: "reveal" });
      case "reveal":
        return go({ k: "takeaway" });
      case "takeaway":
        return go({ k: "end" });
      default:
        return;
    }
  }

  function backward() {
    if (screen.k === "card" && screen.i > 0) return go({ k: "card", i: screen.i - 1 }, true);
    if (screen.k === "answer") {
      const at = answerScreens.findIndex((a) => a.i === screen.i && a.sub === screen.sub);
      if (at > 0) return go({ k: "answer", ...answerScreens[at - 1] }, true);
      return go({ k: "score" }, true);
    }
  }

  /** Enter or → goes forward on screens with nothing to answer; ← goes back where allowed. */
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const passive = ["card", "brief", "score", "answer", "tip", "reveal", "takeaway"].includes(screen.k);
    if (!passive || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target as HTMLElement;
    if (t.closest("a, button, input, textarea, select, summary, [role=dialog]")) return;
    if (e.key === "ArrowRight" || e.key === "Enter") {
      e.preventDefault();
      forward();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      backward();
    }
  }

  // --- answering ----------------------------------------------------------------------------

  async function send(answers: Record<string, unknown>) {
    setSending(true);
    setSendFailed(false);
    try {
      const r = await onSubmit({ taskSetId: task.id, answers, hookAnswer });
      setResult(r);
      setSending(false);
      go({ k: "score" });
    } catch {
      setSendFailed(true);
      setSending(false);
    }
  }

  function commitStep(step: TaskStep, d: Draft, i: number) {
    const ids = step.type === "rate" ? step.items.map((it) => it.id) : [];
    const why = draftProblem(step, d, ids);
    if (why) {
      setProblem(why);
      return;
    }
    const answers = { ...committed, [step.id]: draftToAnswer(step, d) };
    setCommitted(answers);
    setApplicant(0);
    if (i + 1 < task.steps.length) go({ k: "q", i: i + 1 });
    else void send(answers);
  }

  // --- views --------------------------------------------------------------------------------

  const phase = phaseOf(screen);
  const signName = station?.name ?? task.title;
  const signCode = station?.code ?? line.enName.toUpperCase();

  function docsButton(indices: number[], label = "看文件") {
    if (!indices.length) return null;
    return (
      <button type="button" className={`${s.ghostBtn} ${s.docsBtn}`} onClick={() => setViewer(indices)}>
        <Icon name="info" size={18} />
        {label}
      </button>
    );
  }

  function questionScreen(i: number) {
    const step = task.steps[i];
    const draft = drafts[step.id] ?? emptyDraft(step);
    const setDraft = (next: Draft) => {
      setDrafts((d) => ({ ...d, [step.id]: next }));
      setProblem(null);
    };
    const promptId = `q-${step.id}`;
    const common = { onConfirm: (next?: Draft) => commitStep(step, next ?? draft, i), disabled: sending, promptId };
    const counter = (
      <p className="g-label" aria-hidden="true">
        第 {i + 1} 題，共 {task.steps.length} 題
      </p>
    );

    if (step.type === "rate") {
      const item = step.items[applicant];
      const value = draft as RateDraft;
      const material = task.materials[item.materialIndex];
      const rate = (r: 1 | 2 | 3) => {
        const next: RateDraft = { ratings: { ...value.ratings, [item.id]: r } };
        setDraft(next);
        if (applicant + 1 < step.items.length) {
          setBack(false);
          setApplicant(applicant + 1);
        } else commitStep(step, next, i);
      };
      return (
        <div className={s.qScreen} data-layout="split">
          <section className={s.qDoc} aria-label={`${item.label}的資料`}>
            {material ? renderMaterial(material, { headingLevel: 3 }) : null}
          </section>
          <section className={`g-card g-card--strong ${s.qCard}`} aria-labelledby={promptId}>
            {counter}
            <ol className={s.applicantDots} aria-label="申請人">
              {step.items.map((it, n) => (
                <li key={it.id} data-state={n < applicant ? "done" : n === applicant ? "current" : "todo"} aria-current={n === applicant ? "step" : undefined}>
                  <span className="sr-only">
                    第 {n + 1} 位{n < applicant ? "（已給分）" : ""}
                  </span>
                </li>
              ))}
            </ol>
            <h2 id={promptId} className={`g-question ${s.prompt}`} data-screen-heading tabIndex={-1}>
              <span className="sr-only">第 {applicant + 1} 位，共 {step.items.length} 位：</span>
              {item.label}
            </h2>
            <p className={s.bodyText}>{step.prompt}</p>
            {/* Phones: the report is the task, so it sits in the card (it
                scrolls inside itself); desktop shows it beside the card. */}
            {material ? <div className={s.rateDocPhone}>{renderMaterial(material, { headingLevel: 3 })}</div> : null}
            <div
              className={s.bigRate}
              role="group"
              aria-label={`給「${item.label}」幾分（可按 1、2、3）`}
              onKeyDown={(e) => {
                const r = ({ "1": 1, "2": 2, "3": 3 } as const)[e.key as "1" | "2" | "3"];
                if (r && !sending) {
                  e.preventDefault();
                  rate(r);
                }
              }}
            >
              {step.scale.map((sc) => (
                <button
                  key={sc.value}
                  type="button"
                  className={s.bigRateBtn}
                  aria-pressed={value.ratings[item.id] === sc.value}
                  disabled={sending}
                  onClick={() => rate(sc.value)}
                >
                  <span className={s.bigRateNum}>{sc.value}</span>
                  <span className={s.bigRateLabel}>{sc.label}</span>
                </button>
              ))}
            </div>
            {applicant > 0 ? (
              <button type="button" className={s.textBtn} onClick={() => setApplicant(applicant - 1)}>
                上一位
              </button>
            ) : null}
            <p className={s.problem} role="status" aria-live="polite">
              {problem ?? (sendFailed ? "沒有送出成功。檢查網路後再試一次。" : sending ? "送出中…" : "")}
            </p>
            {sendFailed ? (
              <PrimaryButton line={line} onClick={() => void send(committed)}>
                再送一次
              </PrimaryButton>
            ) : null}
          </section>
        </div>
      );
    }

    let view;
    let docIndices = column;
    switch (step.type) {
      case "choice":
        view = <ChoiceStepView step={step} value={draft as ChoiceDraft} onChange={setDraft} {...common} />;
        break;
      case "find":
        docIndices = [];
        view = (
          <FindStepView
            step={step}
            material={task.materials[step.materialIndex]}
            value={draft as FindDraft}
            onChange={setDraft}
            onExpand={(m) => setViewer([m])}
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
    }
    const split = docIndices.length > 0;
    return (
      <div className={s.qScreen} data-layout={split ? "split" : "single"}>
        {split ? (
          <section className={s.qDoc} aria-label="資料">
            {docIndices.map((m) => (
              <div key={m} className={s.materialItem}>
                {renderMaterial(task.materials[m], { headingLevel: 3 })}
              </div>
            ))}
          </section>
        ) : null}
        <section className={`g-card g-card--strong ${s.qCard}`} aria-labelledby={promptId}>
          {counter}
          <h2 id={promptId} className={`g-question ${s.prompt}`} data-screen-heading tabIndex={-1}>
            <span className="sr-only">第 {i + 1} 題，共 {task.steps.length} 題：</span>
            {step.prompt}
          </h2>
          {split ? <div className={s.docsOnPhone}>{docsButton(docIndices)}</div> : null}
          <div className={s.qBody}>{view}</div>
          <p className={s.problem} role="status" aria-live="polite">
            {problem ?? (sendFailed ? "沒有送出成功。檢查網路後再試一次。" : "")}
          </p>
          <div className={s.actions}>
            {sendFailed ? (
              <PrimaryButton line={line} onClick={() => void send(committed)}>
                再送一次
              </PrimaryButton>
            ) : (
              <PrimaryButton line={line} onClick={() => common.onConfirm()} aria-disabled={sending || undefined}>
                {sending ? "送出中…" : i + 1 < task.steps.length ? "送出，下一題" : "送出"}
              </PrimaryButton>
            )}
          </div>
        </section>
      </div>
    );
  }

  function scoreScreen(r: SubmitResult) {
    const shown = displayScore(task.steps, r.details);
    const canRetry = mode !== "terminal" && !r.passed && !!onRetry && (mode === "library" || r.attempt === 1);
    // 05 A6: done on a pass, or on the second attempt (03 §4).
    const status = scoreStatus(mode, r);
    return (
      <section className={`g-card g-card--strong ${s.centerCard}`}>
        <h2 className={`g-title ${s.panelTitle}`} data-screen-heading tabIndex={-1}>
          看看示範答案
        </h2>
        {r.total > 0 ? (
          <div className={s.scoreRow}>
            <p className={s.score}>
              <span className="g-label">得分</span>
              <span className="g-hero-number">
                {formatScore(shown.score)}
                <span className={s.scoreTotal}> / {shown.total}</span>
              </span>
            </p>
            <Verdict v={r.passed ? "right" : "part"} text={r.passed ? "過關" : "還沒過關"} />
          </div>
        ) : null}
        <p className={s.bodyText}>{status}</p>
        <div className={s.actions}>
          {canRetry ? (
            <button type="button" className={s.secondaryBtn} onClick={onRetry}>
              再試一次
            </button>
          ) : null}
          <PrimaryButton line={line} onClick={forward}>
            看第一題
            <Icon name="arrow" size={20} />
          </PrimaryButton>
        </div>
      </section>
    );
  }

  function answerScreen(i: number, sub: number, r: SubmitResult) {
    const step = keyed[i];
    const items = step.type === "rate" ? [step.items[sub]] : undefined;
    const isLast = answerScreens.findIndex((a) => a.i === i && a.sub === sub) === answerScreens.length - 1;
    return (
      <div className={s.answerScreen}>
        <div data-screen-heading tabIndex={-1} className={s.screenAnchor} aria-label={`第 ${i + 1} 題的示範答案`} />
        <ModelAnswer
          step={step}
          index={i}
          answer={committed[step.id]}
          detail={r.details[i]}
          materials={task.materials}
          goal={goal}
          rateItems={items}
          arriveIndex={0}
        />
        <div className={s.actions}>
          <button type="button" className={s.textBtn} onClick={backward}>
            上一題
          </button>
          <PrimaryButton line={line} onClick={forward}>
            {isLast ? "繼續" : step.type === "rate" && sub + 1 < (step.items.length ?? 0) ? "下一位" : "下一題"}
            <Icon name="arrow" size={20} />
          </PrimaryButton>
        </div>
      </div>
    );
  }

  let body;
  switch (screen.k) {
    case "hook":
      body = (
        <div className={s.hookPanel}>
          <StationSign line={line} station={signName} code={signCode} as="p" />
          <section className={`g-card g-card--strong ${s.hookCard}`}>
            <p className="g-label">今日一站 · 約 {lesson.minutes} 分鐘</p>
            <h2 className={`g-question ${s.hookQuestion}`} data-screen-heading tabIndex={-1}>
              {lesson.hook.question}
            </h2>
            <p className="g-caption">先憑直覺選一個，沒有對錯。</p>
            {/* A plain GET form: a tap that lands before the script has
                loaded still answers the hook (05 A8.6). */}
            <form method="get" className={s.hookOptions}>
              {lesson.hook.options.map((o) => (
                <button
                  key={o.id}
                  type="submit"
                  name="hook"
                  value={o.id}
                  className={s.hookOption}
                  onClick={(e) => {
                    e.preventDefault();
                    setHookAnswer(o.id);
                    go(lesson.lessonCards.length ? { k: "card", i: 0 } : { k: "brief" });
                  }}
                >
                  {o.label}
                </button>
              ))}
            </form>
          </section>
        </div>
      );
      break;
    case "card": {
      const last = screen.i + 1 >= lesson.lessonCards.length;
      body = (
        <div className={s.cardScreen}>
          <p className="g-label" data-screen-heading tabIndex={-1}>
            先懂一件事 · {screen.i + 1} / {lesson.lessonCards.length}
          </p>
          <LessonCardView card={lesson.lessonCards[screen.i]} index={0} />
          <div className={s.actions}>
            {screen.i > 0 ? (
              <button type="button" className={s.textBtn} onClick={backward}>
                上一張
              </button>
            ) : fullLessonHref ? (
              <Link href={fullLessonHref} className={s.textLink}>
                {fullLessonLabel}
              </Link>
            ) : null}
            <PrimaryButton line={line} onClick={forward}>
              {last ? "開始任務" : "下一張"}
              <Icon name="arrow" size={20} />
            </PrimaryButton>
          </div>
        </div>
      );
      break;
    }
    case "brief":
      body = (
        <section className={`g-card g-card--strong ${s.centerCard} ${s.brief}`} style={{ ["--line-color" as string]: line.color }}>
          <h2 className={s.briefTitle} data-screen-heading tabIndex={-1}>
            <span className="g-label">任務</span>
            <span>{task.title}</span>
          </h2>
          <dl className={s.briefRows}>
            <div>
              <dt className="g-label">你的角色</dt>
              <dd>{task.brief.role}</dd>
            </div>
            <div>
              <dt className="g-label">情況</dt>
              <dd>{task.brief.situation}</dd>
            </div>
          </dl>
          <p className="g-caption">共 {task.steps.length} 題，一題一題作答。</p>
          <div className={s.actions}>
            <PrimaryButton line={line} onClick={forward}>
              開始
              <Icon name="arrow" size={20} />
            </PrimaryButton>
          </div>
        </section>
      );
      break;
    case "q":
      body = questionScreen(screen.i);
      break;
    case "score":
      body = result ? scoreScreen(result) : null;
      break;
    case "answer":
      body = result ? answerScreen(screen.i, screen.sub, result) : null;
      break;
    case "tip":
      body = (
        <section className={`g-card g-card--strong ${s.centerCard}`}>
          <h2 className="g-label" data-screen-heading tabIndex={-1}>
            真實的後來
          </h2>
          <p className={s.bodyText}>{result?.answerKey.afterTip}</p>
          <div className={s.actions}>
            <PrimaryButton line={line} onClick={forward}>
              繼續
              <Icon name="arrow" size={20} />
            </PrimaryButton>
          </div>
        </section>
      );
      break;
    case "reveal":
      body = (
        <div className={s.centerStack}>
          <div data-screen-heading tabIndex={-1} className={s.screenAnchor} aria-label="你剛剛的選擇" />
          <RevealCard bias={lesson.reveal.bias} text={result?.reveal ?? ""} />
          <div className={s.actions}>
            <PrimaryButton line={line} onClick={forward}>
              繼續
              <Icon name="arrow" size={20} />
            </PrimaryButton>
          </div>
        </div>
      );
      break;
    case "takeaway":
      body = (
        <div className={s.centerStack}>
          <div data-screen-heading tabIndex={-1} className={s.screenAnchor} aria-label="這一站的工具" />
          <TakeawayCard takeaway={lesson.takeaway} onSave={onSaveTool} index={0} />
          <div className={s.actions}>
            <PrimaryButton line={line} onClick={forward}>
              繼續
              <Icon name="arrow" size={20} />
            </PrimaryButton>
          </div>
        </div>
      );
      break;
    case "end":
      body = (
        <section className={`g-card g-card--strong ${s.centerCard}`}>
          <h2 className={`g-title ${s.panelTitle}`} data-screen-heading tabIndex={-1}>
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
        </section>
      );
      break;
  }

  const screenKey = `${screen.k}-${"i" in screen ? screen.i : ""}-${"sub" in screen ? screen.sub : ""}-${screen.k === "q" ? applicant : ""}`;

  return (
    <div ref={rootRef} className={s.flow} onKeyDown={onKey}>
      <div className={s.progress}>
        <ol className={s.dots} aria-label="這一站的進度">
          {PHASES.map((name, i) => (
            <li
              key={name}
              className={s.dotItem}
              data-state={i < phase ? "done" : i === phase ? "current" : "todo"}
              aria-current={i === phase ? "step" : undefined}
            >
              <span className={s.dot} aria-hidden="true" />
              <span className="sr-only">
                {name}
                {i < phase ? "（完成）" : ""}
              </span>
            </li>
          ))}
        </ol>
        <p className={s.progressText}>
          第 {phase + 1} 步，共 {PHASES.length} 步 · {PHASES[phase]}
        </p>
      </div>

      <div key={screenKey} className={s.screen} data-dir={back ? "back" : "forward"}>
        {body}
      </div>

      {viewer ? (
        <MaterialModal title={viewer.length === 1 ? materialTitle(task.materials[viewer[0]]) : "文件"} onClose={() => setViewer(null)}>
          {viewer.map((m) => {
            const step = screen.k === "q" ? task.steps[screen.i] : null;
            const find =
              step?.type === "find" && step.materialIndex === m
                ? {
                    selected: new Set(((drafts[step.id] as FindDraft | undefined) ?? (emptyDraft(step) as FindDraft)).selected),
                    onToggle: (id: string) =>
                      setDrafts((d) => ({ ...d, [step.id]: toggleFind((d[step.id] as FindDraft) ?? (emptyDraft(step) as FindDraft), id) })),
                  }
                : undefined;
            return <div key={m}>{renderMaterial(task.materials[m], { headingLevel: 3, find })}</div>;
          })}
        </MaterialModal>
      ) : null}
    </div>
  );
}

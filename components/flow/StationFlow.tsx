"use client";

/**
 * The station flow on the Part E design (06 E8.2 to E8.5). The sequence and
 * the answer handling are the same as components/tasks/StationFlow.tsx (05:
 * answers stay on the server until submit, shuffled order, the A6 pass
 * rule, retry); only the screens are new:
 *
 *   hook (a glass card) → each lesson card → the brief →
 *   each question (你是銀行: each applicant, with its own six-step rail) →
 *   score → each model answer → after-tip → reveal with the takeaway →
 *   back to the life game.
 *
 * Find, sort and order still use the older step views inside the new frame;
 * they are rebuilt with the rest of E8.4.
 */
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { renderMaterial } from "@/components/documents";
import { Actions, Button } from "@/components/ui/Button";
import { Card, Chip, Label } from "@/components/ui/Bits";
import { MessageCard } from "@/components/ui/MessageCard";
import { Icon } from "@/components/ui/icons";
import { OptionGroup, RatingRow, Segmented } from "@/components/ui/Options";
import ui from "@/components/ui/ui.module.css";
import { reportHref, showReport } from "@/lib/reportMistake";
import type { Goal } from "@/lib/tasks/compute";
import type { StationLesson, TaskStep } from "@/lib/tasks/types";
import {
  draftProblem,
  draftToAnswer,
  emptyDraft,
  formatScore,
  scoreStatus,
  showsReasons,
  type ChoiceDraft,
  type Draft,
  type FindDraft,
  type NumberDraft,
  type OrderDraft,
  type RateDraft,
  type SortDraft,
  type WriteDraft,
} from "@/components/tasks/answers";
import { LessonCardView } from "@/components/tasks/LessonCardView";
import type { SubmitPayload, SubmitResult } from "@/components/tasks/StationFlow";
import { FindStepView } from "@/components/tasks/steps/FindStepView";
import { OrderStepView } from "@/components/tasks/steps/OrderStepView";
import { SortStepView } from "@/components/tasks/steps/SortStepView";
import { WriteStepView } from "@/components/tasks/steps/WriteStepView";
import { LessonBar } from "./LessonBar";
import { ModelAnswerE } from "./ModelAnswerE";
import s from "./flow.module.css";

type Screen =
  | { k: "hook" }
  | { k: "card"; i: number }
  | { k: "brief" }
  | { k: "q"; i: number }
  | { k: "score" }
  | { k: "answer"; i: number; sub: number }
  | { k: "tip" }
  | { k: "reveal" };

const STEPS = 5; // hook, lesson, task, answers and reveal, the life-game turn (E7.2)

/** The key's full step in the order the student saw (05 A7). */
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
function displayScore(steps: TaskStep[], details: SubmitResult["details"]): { score: number; total: number } {
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

export interface StationFlowEProps {
  lesson: StationLesson;
  stationName: string;
  /** The line and station code over each screen's title, e.g. 信用線 · CR02. */
  kicker?: string;
  goal: Goal | null;
  mode?: "station" | "terminal" | "library";
  exitHref: string;
  onSubmit(payload: SubmitPayload): Promise<SubmitResult>;
  onSaveTool?(name: string): Promise<void>;
  onContinue(): void;
  onRetry?(): void;
  startAtTask?: boolean;
  initialHookAnswer?: string | null;
  /**
   * 06 F3.10, a Short: one step, no hook, cards, brief or reveal. The
   * question, then its model answer, then 完成.
   */
  short?: boolean;
}

export function StationFlowE({
  lesson,
  stationName,
  kicker,
  goal,
  mode = "station",
  exitHref,
  onSubmit,
  onSaveTool,
  onContinue,
  onRetry,
  startAtTask = false,
  initialHookAnswer = null,
  short = false,
}: StationFlowEProps) {
  const task = lesson.task;
  const total = short ? 2 : STEPS;
  const [screen, setScreen] = useState<Screen>(
    short
      ? { k: "q", i: 0 }
      : startAtTask
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
  const [view, setView] = useState<"doc" | "q">("q");
  const [saved, setSaved] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const keyed = useMemo(
    () => (result ? task.steps.map((st) => inShownOrder(st, result.answerKey.steps.find((k) => k.id === st.id))) : task.steps),
    [result, task.steps],
  );
  const answerScreens = keyed.flatMap((st, i) => (st.type === "rate" ? st.items.map((_, sub) => ({ i, sub })) : [{ i, sub: 0 }]));

  // Focus the new screen's title (E14.5); not on the first render of a fresh station.
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
    setView("q");
    setScreen(next);
  }
  const afterAnswers = (): Screen => (result?.answerKey.afterTip ? { k: "tip" } : { k: "reveal" });
  const lastAnswer = () => screen.k === "answer" && answerScreens.findIndex((a) => a.i === screen.i && a.sub === screen.sub) === answerScreens.length - 1;

  function forward() {
    switch (screen.k) {
      case "card":
        return go(screen.i + 1 < lesson.lessonCards.length ? { k: "card", i: screen.i + 1 } : { k: "brief" });
      case "brief":
        return go({ k: "q", i: 0 });
      case "score":
        return go(answerScreens.length ? { k: "answer", ...answerScreens[0] } : afterAnswers());
      case "answer": {
        if (short && lastAnswer()) return onContinue();
        const at = answerScreens.findIndex((a) => a.i === screen.i && a.sub === screen.sub);
        return go(at + 1 < answerScreens.length ? { k: "answer", ...answerScreens[at + 1] } : afterAnswers());
      }
      case "tip":
        return go({ k: "reveal" });
      case "reveal":
        return onContinue();
    }
  }
  function backward() {
    if (screen.k === "card" && screen.i > 0) return go({ k: "card", i: screen.i - 1 }, true);
    if (screen.k === "answer") {
      const at = answerScreens.findIndex((a) => a.i === screen.i && a.sub === screen.sub);
      if (at > 0) return go({ k: "answer", ...answerScreens[at - 1] }, true);
      if (!short) return go({ k: "score" }, true);
    }
  }
  /** Enter or → forward on screens with nothing to answer; ← back where allowed (E14.5). */
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const passive = ["card", "brief", "score", "answer", "tip", "reveal"].includes(screen.k);
    if (!passive || e.altKey || e.ctrlKey || e.metaKey) return;
    if ((e.target as HTMLElement).closest("a, button, input, textarea, select, summary, [role=dialog]")) return;
    if (e.key === "ArrowRight" || e.key === "Enter") {
      e.preventDefault();
      forward();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      backward();
    }
  }

  async function send(answers: Record<string, unknown>) {
    setSending(true);
    setSendFailed(false);
    try {
      const r = await onSubmit({ taskSetId: task.id, answers, hookAnswer });
      setResult(r);
      setSending(false);
      // A Short goes straight to its one model answer (no score screen).
      go(short ? { k: "answer", i: 0, sub: 0 } : { k: "score" });
    } catch {
      setSendFailed(true);
      setSending(false);
    }
  }
  function commitStep(step: TaskStep, d: Draft, i: number) {
    const why = draftProblem(step, d, step.type === "rate" ? step.items.map((it) => it.id) : []);
    if (why) return setProblem(why);
    const answers = { ...committed, [step.id]: draftToAnswer(step, d) };
    setCommitted(answers);
    setApplicant(0);
    if (i + 1 < task.steps.length) go({ k: "q", i: i + 1 });
    else void send(answers);
  }

  // --- the rail ---------------------------------------------------------------------------
  const railStep = (() => {
    switch (screen.k) {
      case "hook":
        return 1;
      case "card":
        return 1 + (screen.i + 1) / Math.max(lesson.lessonCards.length, 1);
      case "brief":
        return 2;
      case "q":
        return 2 + (screen.i + 1) / task.steps.length;
      case "score":
        return 3;
      case "answer": {
        const at = answerScreens.findIndex((a) => a.i === screen.i && a.sub === screen.sub);
        return 3 + ((at + 1) / Math.max(answerScreens.length, 1)) * 0.9;
      }
      default:
        return 4;
    }
  })();
  const shortStep = screen.k === "q" ? 1 : 2;
  const stepNo = short ? shortStep : Math.min(Math.ceil(railStep), STEPS);
  const subtitle = short ? `3 分鐘版 · 第 ${stepNo} 步，共 2 步` : `第 ${stepNo} 步，共 ${STEPS} 步`;
  const railAt = short ? shortStep : railStep;
  const exit = { href: exitHref };
  const head = kicker ?? stationName;
  const sendLine = problem ?? (sendFailed ? "沒有送出。檢查網路後再按一次確定。" : "");

  // --- screens ----------------------------------------------------------------------------
  let body: React.ReactNode;

  if (screen.k === "hook") {
    const pick = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!hookAnswer) return;
      go(lesson.lessonCards.length ? { k: "card", i: 0 } : { k: "brief" });
    };
    body = (
      <>
        <LessonBar title={stationName} subtitle={head} close={exit} step={1} total={STEPS} />
        <div className={s.hookBody}>
        {/* A plain GET form with native radios: a tap before the script loads
            still answers (05 A8.6; ?hook= reopens past the hook). */}
        <form method="get" className={s.hookSheet} onSubmit={pick} aria-label="想一想">
          {/* Large text (E3): the question and options scroll; 確定 stays put. */}
          <div className={s.sheetScroll}>
          <Label>想一想 · 先想一下，沒有標準答案</Label>
          <h2 className={s.prompt} data-screen-heading tabIndex={-1}>
            {lesson.hook.question}
          </h2>
          <fieldset className={s.nativeOpts}>
            <legend className="sr-only">{lesson.hook.question}</legend>
            {lesson.hook.options.map((o) => (
              <label key={o.id} className={`${s.nativeOpt} squircle`}>
                <input type="radio" name="hook" value={o.id} checked={hookAnswer === o.id} onChange={() => setHookAnswer(o.id)} />
                <span className={s.nativeRadio} aria-hidden="true">
                  <Icon name="check" size={18} strokeWidth={3} />
                </span>
                <span>{o.label}</span>
              </label>
            ))}
          </fieldset>
          </div>
          <div style={{ display: "grid", gap: "var(--s-2)", paddingTop: "var(--s-2)" }}>
            {!hookAnswer ? <p className={ui.helper}>選一個答案</p> : null}
            <Button type="submit" disabled={!hookAnswer}>
              確定
            </Button>
          </div>
        </form>
        </div>
      </>
    );
  } else if (screen.k === "card") {
    body = (
      <>
        <LessonBar title={stationName} subtitle={head} back={screen.i > 0 ? { onClick: backward } : exit} close={exit} step={railAt} total={total} />
        <div className={`${s.body} ${s.bodyCenter}`}>
          <div className={s.inner}>
            <p className={ui.label} data-screen-heading tabIndex={-1} style={{ marginBottom: "var(--s-3)" }}>
              先懂一件事 · {screen.i + 1} / {lesson.lessonCards.length}
            </p>
            <Card line>
              <LessonCardView card={lesson.lessonCards[screen.i]} index={0} />
            </Card>
          </div>
        </div>
        <Actions className={s.actions}>
          <Button onClick={forward}>繼續</Button>
        </Actions>
      </>
    );
  } else if (screen.k === "brief") {
    body = (
      <>
        <LessonBar title={task.title} subtitle={head} back={exit} close={exit} step={railAt} total={total} />
        <div className={`${s.body} ${s.bodyCenter}`}>
          <div className={`${s.inner} ${s.ticket}`}>
            {/* the task ticket's stub: the line's stripe and the station code */}
            <div className={s.ticketStub}>
              <span className={s.ticketStripe} aria-hidden="true" />
              <span className={s.ticketKicker}>任務單 TASK</span>
              <span className={s.ticketWhere}>{head}</span>
            </div>
            <MessageCard brief={task.brief} />
          </div>
        </div>
        <Actions className={s.actions}>
          <Button onClick={forward}>開始任務</Button>
        </Actions>
      </>
    );
  } else if (screen.k === "q") {
    body = questionScreen(screen.i);
  } else if (screen.k === "score" && result) {
    const shown = displayScore(task.steps, result.details);
    const canRetry = mode !== "terminal" && !result.passed && !!onRetry && (mode === "library" || result.attempt === 1);
    body = (
      <>
        <LessonBar title="結果" subtitle={head} close={exit} step={railAt} total={total} />
        <div className={`${s.body} ${s.bodyCenter}`}>
          <div className={s.inner}>
            <Card>
              <h2 className={ui.label} data-screen-heading tabIndex={-1}>
                得分
              </h2>
              {result.total > 0 ? (
                <>
                  <p className={s.scoreNum}>
                    {formatScore(shown.score)}
                    <span className={s.scoreTotal}> / {shown.total}</span>
                  </p>
                  <p className={`${s.verdict} ${result.passed ? s.verdictGood : s.verdictPart}`}>
                    <Icon name={result.passed ? "check" : "info"} size={18} />
                    {result.passed ? "過關" : "還沒過關"}
                  </p>
                </>
              ) : null}
              <p className={ui.body} style={{ marginTop: "var(--s-3)" }}>
                {scoreStatus(mode, result)}
              </p>
            </Card>
          </div>
        </div>
        <Actions className={s.actions}>
          {canRetry ? (
            <Button variant="secondary" onClick={onRetry}>
              再試一次
            </Button>
          ) : null}
          <Button onClick={forward}>繼續</Button>
        </Actions>
      </>
    );
  } else if (screen.k === "answer" && result) {
    const step = keyed[screen.i];
    const items = step.type === "rate" ? [step.items[screen.sub]] : undefined;
    const at = answerScreens.findIndex((a) => a.i === screen.i && a.sub === screen.sub);
    body = (
      <>
        <LessonBar title="建議答案" subtitle={short ? head : `${head} · ${at + 1} / ${answerScreens.length}`} back={short ? undefined : { onClick: backward }} close={exit} step={railAt} total={total} />
        <div className={s.body}>
          <div className={`${s.scrollRegion} ${s.inner}`}>
            <div data-screen-heading tabIndex={-1} aria-label={`第 ${at + 1} 個建議答案`} />
            <ModelAnswerE
              step={step}
              index={screen.i}
              answer={committed[step.id]}
              detail={result.details[screen.i]}
              materials={task.materials}
              goal={goal}
              rateItem={items?.[0]}
              verifiedOn={task.verifiedOn}
            />
            {showReport() ? (
              <a className={s.report} href={reportHref({ where: head, taskId: task.id, stepId: step.id })}>
                這題有錯？回報給我們
              </a>
            ) : null}
          </div>
        </div>
        <Actions className={s.actions}>
          <Button onClick={forward}>{short && at === answerScreens.length - 1 ? "完成" : "繼續"}</Button>
          {/* F3.2: resubmit any time after the last model answer; a new attempt,
              the first one is kept. */}
          {at === answerScreens.length - 1 && onRetry && mode !== "terminal" ? (
            <Button variant="secondary" onClick={onRetry}>
              再做一次
            </Button>
          ) : null}
        </Actions>
      </>
    );
  } else if (screen.k === "tip") {
    body = (
      <>
        <LessonBar title="真實的後來" subtitle={head} close={exit} step={railAt} total={total} />
        <div className={`${s.body} ${s.bodyCenter}`}>
          <div className={s.inner}>
            <Card>
              <p className={ui.body} data-screen-heading tabIndex={-1}>
                {result?.answerKey.afterTip}
              </p>
            </Card>
          </div>
        </div>
        <Actions className={s.actions}>
          <Button onClick={forward}>繼續</Button>
        </Actions>
      </>
    );
  } else if (screen.k === "reveal") {
    const t = lesson.takeaway;
    body = (
      <>
        <LessonBar title={stationName} subtitle={head} close={exit} step={4} total={STEPS} />
        <div className={`${s.body} ${s.bodyCenter}`}>
          <div className={`${s.inner} ${s.revealStage}`}>
            <p className={ui.label}>你剛剛的選擇，背後是</p>
            <h2 className={s.revealBias} data-screen-heading tabIndex={-1}>
              {lesson.reveal.bias}
            </h2>
            <p className={s.revealText}>{result?.reveal}</p>
            <Card className={s.tool}>
              <div className={s.tool}>
                <span className={s.toolBadge} aria-hidden="true">
                  {t.lines.length}
                </span>
                <div>
                  <p className={ui.label}>工具箱</p>
                  <p className={s.toolName}>{t.name}</p>
                  <p className={s.toolSummary}>{t.lines.join(" · ")}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <Actions className={s.actions}>
          <Button onClick={forward}>繼續</Button>
          {onSaveTool ? (
            <Button
              variant="secondary"
              disabled={saved}
              onClick={() => {
                void onSaveTool(t.name).then(() => setSaved(true));
              }}
            >
              {saved ? "已存到工具箱" : "存到工具箱"}
            </Button>
          ) : null}
        </Actions>
      </>
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

    // 你是銀行: one applicant per screen, its own six-step rail (E7.2, E7.5).
    if (step.type === "rate") {
      const item = step.items[applicant];
      const value = draft as RateDraft;
      const chosen = value.ratings[item.id] ?? null;
      const material = task.materials[item.materialIndex];
      const confirm = () => {
        if (!chosen || sending) return;
        if (applicant + 1 < step.items.length) {
          setBack(false);
          setApplicant(applicant + 1);
        } else commitStep(step, value, i);
      };
      const set = (r: 1 | 2 | 3) => setDraft({ ratings: { ...value.ratings, [item.id]: r } });
      return (
        <div
          className={s.screen}
          key={`rate-${applicant}`}
          data-dir={back ? "back" : "forward"}
          onKeyDown={(e) => {
            const r = ({ "1": 1, "2": 2, "3": 3 } as const)[e.key as "1" | "2" | "3"];
            if (r) {
              e.preventDefault();
              set(r);
            } else if (e.key === "Enter" && chosen && !(e.target as HTMLElement).closest("button, a")) {
              e.preventDefault();
              confirm();
            }
          }}
        >
          <LessonBar
            title={task.title}
            subtitle={`${head} · 第 ${applicant + 1} 位，共 ${step.items.length} 位`}
            back={applicant > 0 ? { onClick: () => setApplicant(applicant - 1) } : exit}
            close={exit}
            step={applicant + 1}
            total={step.items.length}
            label={`第 ${applicant + 1} 位，共 ${step.items.length} 位`}
          />
          {/* Phone: the report scrolls in its own region above the rating, which
              stays fixed with 確定 (E8.4); Regular: report left, question right. */}
          <div className={s.body}>
            <div className={s.split}>
              <div className={s.docPane} aria-label={`${item.label}的資料`} role="region">
                <div className={s.counter}>
                  <Chip>{task.brief.from.org}</Chip>
                  <p className={s.legend}>1 不核准 · 2 小額 · 3 核准</p>
                </div>
                <div className={s.scrollRegion}>{material ? renderMaterial(material, { headingLevel: 3 }) : null}</div>
              </div>
              <div className={s.qPane}>
                <h2 id={promptId} className={s.prompt} data-screen-heading tabIndex={-1}>
                  <span className="sr-only">第 {applicant + 1} 位，共 {step.items.length} 位：</span>
                  {item.label}
                </h2>
                <p className={`${ui.body} ${s.regularOnly}`}>{step.prompt}</p>
                <Label>你的決定</Label>
                <RatingRow value={chosen} onChange={set} />
                <p className={`${s.legend} ${s.regularOnly}`}>按 1、2、3 選擇，Enter 確定</p>
              </div>
            </div>
          </div>
          <Actions className={s.splitActions} helper={sendLine || (chosen ? null : "選一個分數")}>
            {sendFailed ? (
              <Button onClick={() => void send(committed)}>再試一次</Button>
            ) : (
              <Button onClick={confirm} disabled={!chosen} busy={sending}>
                確定
              </Button>
            )}
          </Actions>
        </div>
      );
    }

    let control: React.ReactNode;
    switch (step.type) {
      case "choice": {
        const d = draft as ChoiceDraft;
        control = (
          <>
            <OptionGroup label={step.prompt} options={step.options} value={d.option ?? null} onChange={(id) => setDraft({ ...d, option: id })} />
            {showsReasons(step) && step.reasons ? (
              <>
                <Label>理由</Label>
                <OptionGroup label="理由" options={step.reasons} value={d.reason ?? null} onChange={(id) => setDraft({ ...d, reason: id })} />
              </>
            ) : null}
          </>
        );
        break;
      }
      case "number": {
        const d = draft as NumberDraft;
        control = (
          <label style={{ display: "flex", alignItems: "center", gap: "var(--s-2)", minWidth: 0 }}>
            <span className="sr-only">{step.prompt}</span>
            {step.unit === "NT$" ? <span className={ui.body}>NT$</span> : null}
            <input
              inputMode="decimal"
              value={d.raw}
              onChange={(e) => setDraft({ raw: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") common.onConfirm();
              }}
              style={{
                flex: 1,
                minWidth: 0,
                width: "100%",
                minHeight: 56,
                padding: "0 var(--s-4)",
                border: 0,
                borderRadius: "var(--r-md)",
                background: "var(--surface-2)",
                boxShadow: "inset 0 0 0 1px var(--hairline-strong)",
                color: "var(--ink)",
                font: "700 1.75rem/2rem var(--font-ui)",
                fontVariantNumeric: "tabular-nums",
              }}
            />
            {step.unit && step.unit !== "NT$" ? <span className={ui.body}>{step.unit}</span> : null}
          </label>
        );
        break;
      }
      case "find":
        control = <FindStepView step={step} material={task.materials[step.materialIndex]} value={draft as FindDraft} onChange={setDraft} onExpand={() => setView("doc")} {...common} />;
        break;
      case "sort":
        control = <SortStepView step={step} value={draft as SortDraft} onChange={setDraft} {...common} />;
        break;
      case "order":
        control = <OrderStepView step={step} value={draft as OrderDraft} onChange={setDraft} {...common} />;
        break;
      case "write":
        control = <WriteStepView step={step} value={draft as WriteDraft} onChange={setDraft} {...common} />;
        break;
    }
    // The documents this question reads, beside it (Regular) or behind 文件 (phone).
    // A find step draws its own document with the tappable fields; a write
    // step stands on its own.
    const docs = step.type === "find" || step.type === "write" ? [] : task.materials.map((_, m) => m);
    const hasDocs = docs.length > 0;
    return (
      <>
        <LessonBar title={task.title} subtitle={short ? head : `${head} · 第 ${i + 1} 題，共 ${task.steps.length} 題`} back={exit} close={exit} step={railAt} total={total} />
        <div className={s.body}>
          <div className={s.split}>
            {hasDocs ? (
              <div className={`${s.docPane} ${view === "doc" ? "" : s.regularOnly}`} role="region" aria-label="文件">
                <div className={s.scrollRegion}>
                  {docs.map((m) => (
                    <div key={m} style={{ marginBottom: "var(--s-3)" }}>
                      {renderMaterial(task.materials[m], { headingLevel: 3 })}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className={`${s.qPane} ${hasDocs && view === "doc" ? s.regularOnly : ""}`} style={{ flex: 1, minHeight: 0 }}>
              <h2 id={promptId} className={s.prompt} data-screen-heading tabIndex={-1}>
                <span className="sr-only">第 {i + 1} 題，共 {task.steps.length} 題：</span>
                {step.prompt}
              </h2>
              <div className={s.scrollRegion}>{control}</div>
            </div>
          </div>
        </div>
        {hasDocs ? (
          <div className={s.phoneOnly} style={{ padding: "var(--s-2) var(--gutter) 0" }}>
            <Segmented label="檢視" items={[{ id: "q", label: "問題" }, { id: "doc", label: "文件" }]} value={view} onChange={setView} />
          </div>
        ) : null}
        <Actions className={hasDocs ? s.splitActions : s.actions} helper={sendLine || null}>
          {sendFailed ? (
            <Button onClick={() => void send(committed)}>再試一次</Button>
          ) : (
            <Button onClick={() => common.onConfirm()} busy={sending}>
              確定
            </Button>
          )}
        </Actions>
      </>
    );
  }

  const screenKey = `${screen.k}-${"i" in screen ? screen.i : ""}-${"sub" in screen ? screen.sub : ""}`;
  const isRate = screen.k === "q" && task.steps[screen.i].type === "rate";
  return (
    <div ref={rootRef} className={s.flow} onKeyDown={onKey}>
      {isRate ? (
        body
      ) : (
        <div key={screenKey} className={s.screen} data-dir={back ? "back" : "forward"}>
          {body}
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {subtitle}
      </p>
    </div>
  );
}

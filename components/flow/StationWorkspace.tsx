"use client";

/**
 * A station as one page (2026-11-02): the mission and how to do it, the
 * gut-feeling question, the documents beside every question, one 送出; then
 * the results on the same page (your answers against the suggested ones,
 * what the expert thinks, what the job really does) and the next step.
 *
 * Same contracts as the screen-by-screen flow (StationFlowE): answers stay
 * on the server until submit, the order shown is the order scored, the A6
 * pass rule, and 再做一次 asks only the missed steps (StationRunner draws the
 * next attempt and passes `redo`). Drafts are kept on the device, so leaving
 * and coming back loses nothing.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderMaterial } from "@/components/documents";
import { LessonCardView } from "@/components/tasks/LessonCardView";
import type { SubmitPayload, SubmitResult } from "@/components/tasks/StationFlow";
import {
  draftProblem,
  draftToAnswer,
  emptyDraft,
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
import { FindStepView } from "@/components/tasks/steps/FindStepView";
import { OrderStepView } from "@/components/tasks/steps/OrderStepView";
import { SortStepView } from "@/components/tasks/steps/SortStepView";
import { WriteStepView } from "@/components/tasks/steps/WriteStepView";
import { Icon } from "@/components/ui/icons";
import { OptionGroup, RatingRow } from "@/components/ui/Options";
import { reportHref, showReport } from "@/lib/reportMistake";
import type { Goal } from "@/lib/tasks/compute";
import type { StationLesson, TaskStep } from "@/lib/tasks/types";
import { inShownOrder } from "./results";
import { ExpertSections, ResultsHead, ResultsList, resultUnits } from "./WorkspaceResults";
import w from "./workspace.module.css";

export interface StationWorkspaceProps {
  lesson: StationLesson;
  stationName: string;
  /** e.g. 信用線 · CR02 */
  kicker?: string;
  goal: Goal | null;
  mode?: "station" | "terminal" | "library";
  exitHref: string;
  onSubmit(payload: SubmitPayload): Promise<SubmitResult>;
  onSaveTool?(name: string): Promise<void>;
  onContinue(): void;
  initialHookAnswer?: string | null;
  redo?: { steps: string[]; carry: Record<string, unknown> } | null;
  onRedo?(steps: string[], carry: Record<string, unknown>): void;
  studentId?: string;
  attempt?: number;
  /** The station's optional reading (the older article), shown as 延伸閱讀. */
  readingHref?: string | null;
  /** 10 CMP-1: fold 專家怎麼想 (after a line's first station). */
  foldExpert?: boolean;
  /** Fixtures only (/dev/compare): start on the compare screen. */
  initialResult?: { result: SubmitResult; answers: Record<string, unknown> };
}

const STOPS = ["想一想", "任務", "對答案", "人生"] as const;

export function StationWorkspace({
  lesson,
  stationName,
  kicker,
  goal,
  mode = "station",
  exitHref,
  onSubmit,
  onSaveTool,
  onContinue,
  initialHookAnswer = null,
  redo = null,
  onRedo,
  studentId,
  attempt,
  readingHref,
  foldExpert = false,
  initialResult,
}: StationWorkspaceProps) {
  const task = lesson.task;
  const head = kicker ?? stationName;
  const draftKey = studentId && attempt ? `finline:draft:${studentId}:${task.id}:${attempt}` : null;

  const [hook, setHook] = useState<string | null>(initialHookAnswer ?? (redo || initialResult ? "redo" : null));
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [problems, setProblems] = useState<Record<string, string>>({});
  const [hint, setHint] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  // 10 PERF-1: past 2 s, say so once.
  const [slow, setSlow] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(initialResult?.result ?? null);
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialResult?.answers ?? redo?.carry ?? {});
  const [saved, setSaved] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);

  // Drafts survive leaving the page (06 E6.2): restored once, saved on change.
  const restored = useRef(false);
  useEffect(() => {
    if (!draftKey || restored.current) return;
    restored.current = true;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw) as { drafts?: Record<string, Draft>; hook?: string | null };
      if (d.drafts) setDrafts(d.drafts);
      if (d.hook && !initialHookAnswer) setHook(d.hook);
    } catch {
      /* storage blocked or junk: start clean */
    }
  }, [draftKey, initialHookAnswer]);
  useEffect(() => {
    if (!draftKey || result) return;
    try {
      window.localStorage.setItem(draftKey, JSON.stringify({ drafts, hook }));
    } catch {
      /* nothing to restore later; nothing breaks */
    }
  }, [draftKey, drafts, hook, result]);

  // On a redo only the missed steps are asked; the rest show as carried.
  const asked = useMemo(() => (redo ? task.steps.filter((s) => redo.steps.includes(s.id)) : task.steps), [redo, task.steps]);
  const answeredCount = asked.filter((st) => !draftProblem(st, drafts[st.id] ?? emptyDraft(st), rateIds(st))).length;
  const keyed = useMemo(
    () => (result ? task.steps.map((st) => inShownOrder(st, result.answerKey.steps.find((k) => k.id === st.id))) : task.steps),
    [result, task.steps],
  );

  // Documents read by more than one step sit in the column beside the
  // questions; a find step and a rate step's files are drawn inside their card.
  const ownDocs = new Set<number>();
  task.steps.forEach((st) => {
    if (st.type === "find") ownDocs.add(st.materialIndex);
    if (st.type === "rate") st.items.forEach((it) => ownDocs.add(it.materialIndex));
  });
  const sideDocs = task.materials.map((m, i) => ({ m, i })).filter(({ i }) => !ownDocs.has(i));

  function setDraft(step: TaskStep, next: Draft) {
    setDrafts((d) => ({ ...d, [step.id]: next }));
    setProblems((p) => {
      const { [step.id]: _gone, ...rest } = p;
      void _gone;
      return rest;
    });
  }

  async function submit() {
    if (sending) return;
    const found: Record<string, string> = {};
    for (const st of asked) {
      const why = draftProblem(st, drafts[st.id] ?? emptyDraft(st), rateIds(st));
      if (why) found[st.id] = why;
    }
    if (Object.keys(found).length) {
      setProblems(found);
      document.getElementById(`q-${Object.keys(found)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const all = { ...(redo?.carry ?? {}) };
    for (const st of asked) all[st.id] = draftToAnswer(st, drafts[st.id] ?? emptyDraft(st));
    setAnswers(all);
    setSending(true);
    setSendFailed(false);
    const slowTimer = window.setTimeout(() => setSlow(true), 2000);
    try {
      const r = await onSubmit({ taskSetId: task.id, answers: all, hookAnswer: hook === "redo" ? null : hook, carried: redo ? Object.keys(redo.carry) : undefined });
      setResult(r);
      try {
        if (draftKey) window.localStorage.removeItem(draftKey);
      } catch {
        /* fine */
      }
      // 10 A11Y-1: focus moves to the result heading (the live line reads the count).
      requestAnimationFrame(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        resultRef.current?.focus({ preventScroll: true });
      });
    } catch {
      setSendFailed(true);
    } finally {
      window.clearTimeout(slowTimer);
      setSlow(false);
      setSending(false);
    }
  }

  const stopAt = result ? 2 : hook ? 1 : 0;
  const missed = result ? keyed.flatMap((st, i) => (result.details[i]?.scored && result.details[i].credit < 1 ? [st.id] : [])) : [];
  const canRedo = !!result && missed.length > 0 && !!onRedo && mode !== "terminal";
  const units = result ? resultUnits(keyed, result) : [];
  const takeaway = lesson.takeaway;
  const redoNow = () => onRedo!(missed, Object.fromEntries(Object.entries(answers).filter(([id]) => !missed.includes(id))));

  return (
    <div className={w.page} ref={topRef}>
      <header className={w.bar}>
        <Link href={exitHref} className={w.close} aria-label="離開，進度會保留">
          <Icon name="close" size={20} />
        </Link>
        <div className={w.barTitle}>
          <p>{head}</p>
          <h1>{stationName}：{task.title}</h1>
        </div>
        <ol className={w.stops} aria-label="這一站的四步">
          {STOPS.map((label, i) => (
            <li key={label} data-state={i < stopAt ? "done" : i === stopAt ? "on" : undefined} aria-current={i === stopAt ? "step" : undefined}>
              <span className={w.stopDot} aria-hidden="true">{i < stopAt ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}</span>
              {label}
            </li>
          ))}
        </ol>
      </header>

      <div className={w.inner}>
        {result ? (
          <ResultsHead ref={resultRef} result={result} mode={mode} units={units} />        ) : (
          <section className={w.mission} aria-labelledby="mission-title">
            <div className={w.from}>
              <span className={w.avatar} aria-hidden="true">{[...task.brief.from.name][0]}</span>
              <div>
                <p className={w.fromName}>{task.brief.from.name}</p>
                <p className={w.fromRole}>{task.brief.from.org} · {task.brief.from.role}（名稱皆為虛構）</p>
              </div>
            </div>
            <h2 id="mission-title" className={w.message}>{task.brief.message}</h2>
            <dl className={w.facts}>
              <div><dt>你會學到</dt><dd>{task.brief.learn}</dd></div>
              <div><dt>你要做的</dt><dd>{task.brief.do}</dd></div>
              <div><dt>時間</dt><dd>約 {lesson.minutes} 分鐘 · {task.steps.length} 題</dd></div>
            </dl>
            <ol className={w.how} aria-label="怎麼做">
              <li><b>1</b>先回答下面的「想一想」，沒有標準答案。</li>
              <li><b>2</b>讀{sideDocs.length ? "左邊的文件" : "每題裡的資料"}，回答全部 {asked.length} 題。卡住了按「看提示」，不扣分。</li>
              <li><b>3</b>按「送出答案」，看你的答案和建議答案差在哪，再把結果帶進這個月。</li>
            </ol>
          </section>
        )}

        {!result && !redo ? (
          <section className={w.hook} aria-labelledby="hook-q" data-done={hook ? "" : undefined}>
            <p className={w.label}>想一想 · 沒有標準答案</p>
            <h2 id="hook-q" className={w.hookQ}>{lesson.hook.question}</h2>
            <div className={w.hookOpts} role="radiogroup" aria-labelledby="hook-q">
              {lesson.hook.options.map((o) => (
                <button key={o.id} type="button" role="radio" aria-checked={hook === o.id} className={w.hookOpt} onClick={() => setHook(o.id)}>
                  {o.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {result ? (
          <div className={w.work} data-results="">
            <ResultsList steps={keyed} result={result} answers={answers} lesson={lesson} goal={goal} head={head} units={units} prompt={(st) => promptFor(st, answers, drafts)} />
            <aside className={w.side} aria-label="專家怎麼想">
              <ExpertSections
                lesson={lesson}
                reveal={result.reveal}
                afterTip={result.answerKey.afterTip}
                saved={saved}
                onSave={
                  onSaveTool
                    ? async () => {
                        await onSaveTool(takeaway.name);
                        setSaved(true);
                      }
                    : undefined
                }
                readingHref={readingHref}
                foldExpert={foldExpert}
              />
              {showReport() ? (
                <a className={w.report} href={reportHref({ where: head, taskId: task.id, stepId: "all" })}>回報內容錯誤</a>
              ) : null}
            </aside>
          </div>
        ) : (
          <div className={w.work} data-locked={!hook || undefined} data-single={!sideDocs.length ? "" : undefined}>
            {!hook ? <p className={w.lockNote}>先選一個「想一想」的答案，任務就會打開。</p> : null}
            {sideDocs.length ? (
              <aside className={w.side} aria-label="文件">
                <p className={w.label}>文件</p>
                {sideDocs.map(({ m, i }) => (
                  <div key={i} className={w.doc}>
                    {renderMaterial(m, { headingLevel: 3 })}
                  </div>
                ))}
              </aside>
            ) : null}

            <div className={w.questions}>
              {task.steps.map((st, i) => {
                const isAsked = asked.some((a) => a.id === st.id);
                const covering = lesson.lessonCards.find((c) => c.covers?.includes(st.id)) ?? lesson.lessonCards[0];
                return (
                  <section key={st.id} id={`q-${st.id}`} className={w.q} aria-labelledby={`qh-${st.id}`} data-problem={problems[st.id] ? "" : undefined}>
                    <div className={w.qHead}>
                      <span className={w.qNo}>第 {i + 1} 題</span>
                      {isAsked && covering ? (
                        <button type="button" className={w.hintBtn} aria-expanded={!!hint[st.id]} onClick={() => setHint((h) => ({ ...h, [st.id]: !h[st.id] }))}>
                          <Icon name="info" size={16} />
                          {hint[st.id] ? "收起提示" : "看提示"}
                        </button>
                      ) : null}
                    </div>
                    <h3 id={`qh-${st.id}`} className={w.qPrompt}>{promptFor(st, answers, drafts)}</h3>
                    {hint[st.id] && covering ? (
                      <div className={w.hint}>
                        <LessonCardView card={covering} />
                        <p className={w.fine}>看提示不影響分數。</p>
                      </div>
                    ) : null}
                    {isAsked ? (
                      <Control step={st} draft={drafts[st.id] ?? emptyDraft(st)} onChange={(d) => setDraft(st, d)} lesson={lesson} disabled={sending || !hook} />
                    ) : (
                      <p className={w.carried}>
                        <Icon name="check" size={16} /> 上次已經答對，這次不用再做。
                      </p>
                    )}
                    {problems[st.id] ? <p className={w.problem} role="alert">{problems[st.id]}</p> : null}
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <footer className={w.foot}>
        {result ? (
          <>
            <p className={w.footText} aria-live="polite">
              {units.length ? `答對 ${units.filter((u) => u.right).length} / ${units.length}` : "這一站沒有計分"}
            </p>
            <div className={w.footActions}>
              {canRedo ? (
                <>
                  <button type="button" className={w.textBtn} onClick={onContinue}>
                    {mode === "library" ? "完成" : "進入這個月"}
                  </button>
                  <button type="button" className={w.primary} onClick={redoNow}>
                    再做一次（{missed.length} 題）
                  </button>
                </>
              ) : (
                <button type="button" className={w.primary} onClick={onContinue}>
                  {mode === "library" ? "完成" : "進入這個月"}
                  <Icon name="chevron" size={18} />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <p className={w.footText} aria-live="polite">
              {sendFailed
                ? "送出失敗，答案還在。再按一次。"
                : slow
                  ? "還在算，馬上好"
                  : !hook
                    ? "先回答「想一想」"
                    : `已回答 ${answeredCount} / ${asked.length} 題`}
            </p>
            <button type="button" className={w.primary} onClick={() => void submit()} disabled={!hook || sending} aria-busy={sending || undefined}>
              {sending ? <span className={w.spin} aria-hidden="true" /> : null}
              {sending ? "送出中…" : sendFailed ? "再按一次" : "送出答案"}
            </button>
          </>
        )}
      </footer>
    </div>
  );
}

// --- pieces ---------------------------------------------------------------------------------

function rateIds(step: TaskStep): string[] {
  return step.type === "rate" ? step.items.map((it) => it.id) : [];
}

/** 06 G9 item 7: a write step that leans on an earlier rating the student never gave. */
function promptFor(step: TaskStep, answers: Record<string, unknown>, drafts: Record<string, Draft>): string {
  if (step.type !== "write" || !step.ifNoRating) return step.prompt;
  const from = (answers[step.ifNoRating.step] ?? drafts[step.ifNoRating.step]) as { ratings?: Record<string, number> } | undefined;
  return Object.values(from?.ratings ?? {}).includes(step.ifNoRating.rating) ? step.prompt : step.ifNoRating.prompt;
}

function Control({
  step,
  draft,
  onChange,
  lesson,
  disabled,
}: {
  step: TaskStep;
  draft: Draft;
  onChange(d: Draft): void;
  lesson: StationLesson;
  disabled: boolean;
}) {
  const common = { onConfirm: () => {}, disabled, promptId: `qh-${step.id}` };
  switch (step.type) {
    case "choice": {
      const d = draft as ChoiceDraft;
      return (
        <>
          <OptionGroup label={step.prompt} options={step.options} value={d.option ?? null} onChange={(id) => onChange({ ...d, option: id })} />
          {showsReasons(step) && step.reasons ? (
            <>
              <p className={w.label}>為什麼？選一個理由</p>
              <OptionGroup label="理由" options={step.reasons} value={d.reason ?? null} onChange={(id) => onChange({ ...d, reason: id })} />
            </>
          ) : null}
        </>
      );
    }
    case "number": {
      const d = draft as NumberDraft;
      return (
        <label className={w.number}>
          <span className="sr-only">{step.prompt}</span>
          {step.unit === "NT$" ? <span>NT$</span> : null}
          <input inputMode="decimal" value={d.raw} onChange={(e) => onChange({ raw: e.target.value })} disabled={disabled} />
          {step.unit && step.unit !== "NT$" ? <span>{step.unit}</span> : null}
        </label>
      );
    }
    case "rate": {
      const d = draft as RateDraft;
      return (
        <div className={w.rateList}>
          <p className={w.legend}>每一份給分：1 不核准 · 2 小額或要更多資料 · 3 核准</p>
          {step.items.map((it, k) => (
            <div key={it.id} className={w.rateItem}>
              <div className={w.rateDoc}>{lesson.task.materials[it.materialIndex] ? renderMaterial(lesson.task.materials[it.materialIndex], { headingLevel: 4 }) : null}</div>
              <div className={w.rateAsk}>
                <p className={w.rateName}>
                  第 {k + 1} 位 · {it.label}
                </p>
                <RatingRow value={(d.ratings[it.id] as 1 | 2 | 3 | undefined) ?? null} onChange={(r) => onChange({ ratings: { ...d.ratings, [it.id]: r } })} />
              </div>
            </div>
          ))}
        </div>
      );
    }
    case "find":
      return <FindStepView step={step} material={lesson.task.materials[step.materialIndex]} value={draft as FindDraft} onChange={onChange} onExpand={() => {}} {...common} />;
    case "sort":
      return <SortStepView step={step} value={draft as SortDraft} onChange={onChange} {...common} />;
    case "order":
      return <OrderStepView step={step} value={draft as OrderDraft} onChange={onChange} {...common} />;
    case "write":
      return <WriteStepView step={step} value={draft as WriteDraft} onChange={onChange} {...common} />;
  }
}

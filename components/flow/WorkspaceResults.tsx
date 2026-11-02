"use client";

/**
 * The compare screen (對答案) of a one-page station, 10 CMP-1 to CMP-6, top
 * to bottom:
 *   1. the count (答對 6 / 8; unscored: one line) and one status sentence;
 *   2. 你做得好的 / 可以再想想, derived from the results;
 *   3. the questions: the ones with something to rethink open, the right
 *      ones folded into 看答對的…;
 *   4. 專家怎麼想 (folded after a line's first station), 這份工作實際怎麼做,
 *      這一站最常見的想法, 真實的後來, 這一站帶走 + 存到工具箱.
 * Each sentence once: a block that mostly repeats one already shown is left
 * out (lib/tasks/overlap.ts). The one button lives in the workspace's
 * bottom bar.
 */
import Link from "next/link";
import { forwardRef, type ReactNode } from "react";
import { LessonCardView } from "@/components/tasks/LessonCardView";
import type { SubmitResult } from "@/components/tasks/StationFlow";
import { scoreStatus } from "@/components/tasks/answers";
import { Icon } from "@/components/ui/icons";
import { reportHref, showReport } from "@/lib/reportMistake";
import type { Goal } from "@/lib/tasks/compute";
import { cardText, repeats } from "@/lib/tasks/overlap";
import type { SortStep, StationLesson, TaskStep } from "@/lib/tasks/types";
import { ModelAnswerE, isJudgmentStep } from "./ModelAnswerE";
import w from "./workspace.module.css";

type Mode = "station" | "terminal" | "library";

/** One thing the student got right or not: a sort or rate item, else a whole step. */
export interface Unit {
  stepIndex: number;
  label: string;
  right: boolean;
}

export function resultUnits(steps: TaskStep[], result: SubmitResult): Unit[] {
  return steps.flatMap((st, i) => {
    const d = result.details[i];
    if (!d?.scored || st.scored === false || d.unresolved) return [];
    if ((st.type === "sort" || st.type === "rate") && d.perItem?.length) {
      const items: { id: string; label: string }[] = st.items;
      return d.perItem.map((p) => ({ stepIndex: i, label: items.find((it) => it.id === p.id)?.label ?? `第 ${i + 1} 題`, right: p.credit >= 1 - 1e-9 }));
    }
    return [{ stepIndex: i, label: `第 ${i + 1} 題`, right: d.credit >= 1 - 1e-9 }];
  });
}

const names = (us: Unit[]) => {
  const labels = [...new Set(us.map((u) => u.label))];
  return labels.length > 3 ? `${labels.slice(0, 3).join("、")}等` : labels.join("、");
};

export const ResultsHead = forwardRef<HTMLHeadingElement, { result: SubmitResult; mode: Mode; units: Unit[] }>(function ResultsHead(
  { result, mode, units },
  ref,
) {
  const unscored = units.length === 0;
  const good = units.filter((u) => u.right);
  const think = units.filter((u) => !u.right);
  return (
    <section className={w.banner} aria-labelledby="result-title" data-passed={result.passed ? "" : undefined}>
      <p className={w.label}>對答案</p>
      <h2 id="result-title" ref={ref} tabIndex={-1} className={w.bannerTitle}>
        {unscored ? "這一站沒有計分，你的想法已經存下來。" : `答對 ${good.length} / ${units.length}`}
      </h2>
      {unscored ? null : <p className={w.bannerText}>{scoreStatus(mode, result)}</p>}
      {unscored ? null : (
        <ul className={w.derived}>
          {good.length ? (
            <li>
              <b>你做得好的：</b>答對了 {good.length} 項（{names(good)}）
            </li>
          ) : null}
          <li>
            <b>可以再想想：</b>
            {think.length ? `${think.length} 項（${names(think)}）` : "這次沒有需要再想的"}
          </li>
        </ul>
      )}
    </section>
  );
});

export function ResultsList({
  steps,
  result,
  answers,
  lesson,
  goal,
  head,
  units,
  prompt,
}: {
  steps: TaskStep[];
  result: SubmitResult;
  answers: Record<string, unknown>;
  lesson: StationLesson;
  goal: Goal | null;
  head: string;
  units: Unit[];
  prompt(step: TaskStep): string;
}) {
  // What the screen already says: every lesson card and the takeaway.
  const cards = [...lesson.lessonCards.map(cardText), ...lesson.takeaway.lines];
  const open = steps.map((_, i) => !units.length || units.some((u) => u.stepIndex === i && !u.right) || !units.some((u) => u.stepIndex === i));
  const card = (st: TaskStep, i: number, compact = false) => (
    <section key={st.id} id={`q-${st.id}`} className={w.q} aria-labelledby={`qh-${st.id}`} data-compact={compact || undefined}>
      <div className={w.qHead}>
        <span className={w.qNo}>第 {i + 1} 題</span>
      </div>
      {/* find and order answers carry their own heading */}
      {st.type === "find" || st.type === "order" ? null : (
        <h3 id={`qh-${st.id}`} className={w.qPrompt}>
          {prompt(st)}
        </h3>
      )}
      <StepResult step={st} index={i} result={result} answers={answers} lesson={lesson} goal={goal} cards={cards} />
      {showReport() && !compact ? (
        <a className={w.report} href={reportHref({ where: head, taskId: lesson.task.id, stepId: st.id })}>
          回報內容錯誤
        </a>
      ) : null}
    </section>
  );
  const rightSteps = steps.map((st, i) => ({ st, i })).filter(({ i }) => !open[i]);
  return (
    <div className={w.questions}>
      {steps.map((st, i) => (open[i] ? card(st, i) : null))}
      {rightSteps.length ? (
        <details className={w.fold}>
          <summary>看答對的 {rightSteps.length} 題</summary>
          {rightSteps.map(({ st, i }) => card(st, i, true))}
        </details>
      ) : null}
      {lesson.task.verifiedOn ? <p className={w.fine}>資料查證：{lesson.task.verifiedOn}</p> : null}
    </div>
  );
}

function StepResult({
  step,
  index,
  result,
  answers,
  lesson,
  goal,
  cards,
}: {
  step: TaskStep;
  index: number;
  result: SubmitResult;
  answers: Record<string, unknown>;
  lesson: StationLesson;
  goal: Goal | null;
  cards: string[];
}) {
  const detail = result.details[index];
  const scored = !!detail?.scored && step.scored !== false && !detail.unresolved;
  // The step's own explanation, unless a lesson card already says it.
  const explain = step.explanation && !repeats(step.explanation, cards) ? step.explanation : null;
  if (step.type === "sort") return <SortResult step={step} answer={answers[step.id]} detail={detail} scored={scored} explain={explain} />;
  if (step.type === "rate") {
    const right = step.items.filter((it) => (detail?.perItem?.find((p) => p.id === it.id)?.credit ?? 0) >= 1 - 1e-9);
    const differing = step.items.filter((it) => !right.includes(it));
    return (
      <div className={w.result}>
        {differing.map((item) => (
          <ModelAnswerE key={item.id} step={step} index={index} answer={answers[step.id]} detail={detail} materials={lesson.task.materials} goal={goal} rateItem={item} oneWayLine={false} bare />
        ))}
        {right.length ? (
          <details className={w.fold}>
            <summary>看答對的 {right.length} 位</summary>
            {right.map((item) => (
              <ModelAnswerE key={item.id} step={step} index={index} answer={answers[step.id]} detail={detail} materials={lesson.task.materials} goal={goal} rateItem={item} oneWayLine={false} bare />
            ))}
          </details>
        ) : null}
        <OneWay step={step} detail={detail} />
      </div>
    );
  }
  return (
    <div className={w.result}>
      <ModelAnswerE step={step} index={index} answer={answers[step.id]} detail={detail} materials={lesson.task.materials} goal={goal} oneWayLine={false} bare explainOverride={explain} />
      <OneWay step={step} detail={detail} />
    </div>
  );
}

/** 10 CMP-2: only on a judgment step the student answered differently. */
function OneWay({ step, detail }: { step: TaskStep; detail?: SubmitResult["details"][number] }) {
  if (!isJudgmentStep(step) || step.type === "write" || !detail?.scored || detail.credit >= 1 - 1e-9) return null;
  return <p className={w.fine}>這是一種做法，不是唯一的答案。</p>;
}

/** 10 CMP-4, CMP-5: the items to rethink open, the right ones folded; unscored: 你放 only. */
function SortResult({
  step,
  answer,
  detail,
  scored,
  explain,
}: {
  step: SortStep;
  answer: unknown;
  detail?: SubmitResult["details"][number];
  scored: boolean;
  explain: string | null;
}) {
  const placements = ((answer as { placements?: Record<string, string> } | undefined)?.placements ?? {}) as Record<string, string>;
  const box = (id?: string) => step.boxes.find((b) => b.id === id)?.label ?? "沒有分類";
  const credit = (id: string) => detail?.perItem?.find((p) => p.id === id)?.credit ?? 0;
  const also = (it: SortStep["items"][number]) =>
    (it.accept ?? [])
      .map((a) => (typeof a === "string" ? a : a.credit >= 1 ? a.option : null))
      .filter((x): x is string => !!x && x !== it.box)
      .map((x) => box(x));
  if (!scored) {
    return (
      <ul className={w.sortList}>
        {step.items.map((it) => (
          <li key={it.id}>
            <span className={w.sortItem}>{it.label}</span>
            <span>你放：{box(placements[it.id])}</span>
          </li>
        ))}
      </ul>
    );
  }
  const wrong = step.items.filter((it) => credit(it.id) < 1 - 1e-9);
  const right = step.items.filter((it) => credit(it.id) >= 1 - 1e-9);
  return (
    <div className={w.result}>
      {wrong.length ? (
        <ul className={w.sortList}>
          {wrong.map((it) => (
            <li key={it.id} data-wrong="">
              <span className={w.sortItem}>{it.label}</span>
              <span>
                你放：{box(placements[it.id])} · 建議：<b>{box(it.box)}</b>
                {also(it).length ? `（${also(it).join("、")} 也算對）` : ""}
              </span>
              {it.explain ? <span className={w.sortWhy}>{it.explain}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {right.length ? (
        <details className={w.fold} open={!wrong.length || undefined}>
          <summary>看答對的 {right.length} 項</summary>
          <ul className={w.sortList}>
            {right.map((it) => (
              <li key={it.id}>
                <span className={w.sortItem}>{it.label}</span>
                <span>你放：{box(placements[it.id])}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      {explain ? <p className={w.why}>{explain}</p> : null}
    </div>
  );
}

export function ExpertSections({
  lesson,
  reveal,
  afterTip,
  saved,
  onSave,
  readingHref,
  foldExpert,
}: {
  lesson: StationLesson;
  reveal: string;
  afterTip: string | null;
  saved: boolean;
  onSave?: () => Promise<void>;
  readingHref?: string | null;
  /** 10 CMP-1: after a line's first station the lesson cards start folded. */
  foldExpert: boolean;
}) {
  const t = lesson.takeaway;
  const cards = [...lesson.lessonCards.map(cardText), ...t.lines];
  const job = lesson.task.jobNote && !repeats(lesson.task.jobNote, cards) ? lesson.task.jobNote : null;
  const common = reveal && !repeats(reveal, [...cards, ...(job ? [job] : [])]) ? reveal : null;
  // A card that only restates the takeaway goes: the takeaway says it below.
  const shownCards = lesson.lessonCards.filter((c) => !repeats(cardText(c), t.lines));
  const expert: ReactNode = shownCards.map((c, i) => <LessonCardView key={i} card={c} index={i} />);
  return (
    <>
      {shownCards.length ? (
        foldExpert ? (
          <details className={`${w.panelBox} ${w.fold}`}>
            <summary>看專家怎麼想</summary>
            {expert}
          </details>
        ) : (
          <section className={w.expert} aria-label="專家怎麼想">
            <p className={w.label}>專家怎麼想</p>
            {expert}
          </section>
        )
      ) : null}
      {job ? (
        <div className={w.panelBox}>
          <p className={w.label}>這份工作實際怎麼做</p>
          <p>{job}</p>
        </div>
      ) : null}
      {common ? (
        <div className={w.panelBox}>
          {/* 10 HOOK-1: about this station, not a claim about the student's own choice. */}
          <p className={w.label}>這一站最常見的想法 · {lesson.reveal.bias}</p>
          <p>{common}</p>
        </div>
      ) : null}
      {afterTip ? (
        <div className={w.panelBox}>
          <p className={w.label}>真實的後來</p>
          <p>{afterTip}</p>
        </div>
      ) : null}
      <div className={`${w.panelBox} ${w.takeaway}`}>
        <p className={w.label}>這一站帶走 · {t.name}</p>
        <ul>
          {t.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        {onSave ? (
          <button type="button" className={w.secondary} onClick={() => void onSave()} disabled={saved}>
            {saved ? "已存到工具箱" : "存到工具箱"}
          </button>
        ) : null}
      </div>
      {readingHref ? (
        <Link href={readingHref} className={w.reading}>
          延伸閱讀：這一站的完整文章（選讀）
          <Icon name="chevron" size={16} />
        </Link>
      ) : null}
    </>
  );
}

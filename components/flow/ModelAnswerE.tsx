"use client";

/**
 * One model-answer screen (06 E8.5, with F3.2's wording). Compare language,
 * never "wrong": 你的答案 and 建議答案; a match is one card 「和建議答案一樣」
 * with a check; a difference is 「和建議答案不同」 on a neutral ground. Only
 * arithmetic (a number step) says 正確答案 and uses the bad tint, with words.
 * Every screen ends with 「這是一種做法，不是唯一的答案。」.
 *
 * Find, sort and order keep the older answer body inside this frame for now.
 */
import type { ReactNode } from "react";
import { renderMaterial } from "@/components/documents";
import { Label } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/icons";
import ui from "@/components/ui/ui.module.css";
import { formatUnitValue } from "@/components/tasks/answers";
import { ModelAnswer } from "@/components/tasks/ModelAnswer";
import { WriteAnswer } from "@/components/tasks/WriteAnswer";
import type { Goal } from "@/lib/tasks/compute";
import { resolveNumber } from "@/lib/tasks/compute";
import type { StepScore } from "@/lib/tasks/scoring";
import type { Material, RateStep, TaskStep } from "@/lib/tasks/types";
import s from "./answer.module.css";

const NO_ANSWER = "（沒有作答）";
const rec = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

function Yours({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "bad" }) {
  return (
    <div className={`${s.box} ${tone === "bad" ? s.bad : s.neutral}`}>
      <p className={s.boxLabel}>
        {tone === "bad" ? <Icon name="close" size={16} /> : <span className={s.ring} aria-hidden="true" />}
        你的答案
      </p>
      <div className={s.boxBody}>{children}</div>
    </div>
  );
}
function Model({ children, label = "建議答案" }: { children: ReactNode; label?: string }) {
  return (
    <div className={`${s.box} ${s.good}`}>
      <p className={s.boxLabel}>
        <Icon name="check" size={16} />
        {label}
      </p>
      <div className={s.boxBody}>{children}</div>
    </div>
  );
}
function Same({ children, label = "和建議答案一樣" }: { children: ReactNode; label?: string }) {
  return (
    <div className={`${s.box} ${s.good}`}>
      <p className={s.boxLabel}>
        <Icon name="check" size={16} />
        {label}
      </p>
      <div className={s.boxBody}>{children}</div>
    </div>
  );
}
function Differs() {
  return <p className={s.differs}>和建議答案不同</p>;
}

export function ModelAnswerE({
  step,
  index,
  answer,
  detail,
  materials,
  goal,
  rateItem,
  verifiedOn,
}: {
  step: TaskStep;
  index: number;
  answer: unknown;
  detail?: StepScore;
  materials: Material[];
  goal: Goal | null;
  rateItem?: RateStep["items"][number];
  verifiedOn?: string;
}) {
  const full = (detail?.credit ?? 0) >= 1 - 1e-9;
  const scored = step.scored !== false && !detail?.unresolved;
  let compare: ReactNode = null;
  let why: ReactNode = step.explanation ? <p className={ui.body}>{step.explanation}</p> : null;

  if (step.type === "choice") {
    const a = rec(answer);
    const picked = step.options.find((o) => o.id === a.option);
    const reason = step.reasons?.find((r) => r.id === a.reason);
    const correct = step.options.find((o) => o.id === step.correct);
    const correctReason = step.reasons?.find((r) => r.id === step.correctReason);
    const show = (o?: { label: string }, r?: { label: string }) => (
      <>
        <p className={s.answer}>{o?.label ?? NO_ANSWER}</p>
        {(step.reasons?.length ?? 0) >= 2 ? <p className={s.reason}>理由：{r?.label ?? NO_ANSWER}</p> : null}
      </>
    );
    if (!scored) compare = <Yours>{show(picked, reason)}</Yours>;
    else if (full) compare = <Same>{show(picked, reason)}</Same>;
    else
      compare = (
        <>
          <Differs />
          <Yours>{show(picked, reason)}</Yours>
          <Model>{show(correct, correctReason)}</Model>
        </>
      );
    why = (
      <>
        {why}
        {scored && picked && picked.id !== step.correct && picked.explain ? (
          <p className={ui.body}>
            「{picked.label}」：{picked.explain}
          </p>
        ) : null}
        {scored && correct?.explain ? (
          <p className={ui.body}>
            「{correct.label}」：{correct.explain}
          </p>
        ) : null}
      </>
    );
  } else if (step.type === "rate" && rateItem) {
    const given = rec(rec(answer).ratings)[rateItem.id];
    const label = (v: unknown) => {
      const sc = step.scale.find((x) => x.value === v);
      return sc ? `${sc.value}，${sc.label}` : NO_ANSWER;
    };
    const credit = detail?.perItem?.find((p) => p.id === rateItem.id)?.credit ?? 0;
    const also = rateItem.alsoFull?.filter((v) => v !== rateItem.answer) ?? [];
    compare =
      credit >= 1 - 1e-9 ? (
        <Same>
          <p className={s.answer}>{label(given)}</p>
        </Same>
      ) : (
        <>
          <Differs />
          <Yours>
            <p className={s.answer}>{label(given)}</p>
          </Yours>
          <Model>
            <p className={s.answer}>{label(rateItem.answer)}</p>
            {also.length ? <p className={s.reason}>給 {also.join("、")} 也可以</p> : null}
          </Model>
        </>
      );
    const material = materials[rateItem.materialIndex];
    why = (
      <>
        <p className={ui.body}>{rateItem.explain}</p>
        {material ? (
          <details className={s.doc}>
            <summary>看資料，標出關鍵的地方</summary>
            {renderMaterial(material, { highlight: rateItem.highlight, headingLevel: 3 })}
          </details>
        ) : null}
      </>
    );
  } else if (step.type === "number") {
    const raw = typeof answer === "number" ? answer : Number(rec(answer).value ?? answer);
    const right = resolveNumber(step.answer, { goal });
    const fmt = (n: number | null) => (n === null || !Number.isFinite(n) ? NO_ANSWER : formatUnitValue(n, step.unit));
    compare = full ? (
      <Same label="和正確答案一樣">
        <p className={s.answer}>{fmt(raw)}</p>
      </Same>
    ) : (
      <>
        <Yours tone="bad">
          <p className={s.answer}>{fmt(raw)}</p>
        </Yours>
        <Model label="正確答案">
          <p className={s.answer}>{fmt(right)}</p>
        </Model>
      </>
    );
  } else if (step.type === "write") {
    compare = <WriteAnswer step={step} answer={answer} />;
    why = step.explanation ? <p className={ui.body}>{step.explanation}</p> : null;
  } else {
    // find, sort, order: the older body, still in compare language.
    compare = (
      <ModelAnswer step={step} index={index} answer={answer} detail={detail} materials={materials} goal={goal} arriveIndex={0} />
    );
    why = null;
  }

  return (
    <div className={s.wrap}>
      <Label>第 {index + 1} 題</Label>
      <p className={s.prompt}>{rateItem ? rateItem.label : step.prompt}</p>
      {compare}
      {why ? (
        <>
          <Label>為什麼</Label>
          {why}
        </>
      ) : null}
      <p className={ui.fine}>這是一種做法，不是唯一的答案。</p>
      {verifiedOn ? <p className={ui.fine}>資料查證：{verifiedOn}</p> : null}
    </div>
  );
}

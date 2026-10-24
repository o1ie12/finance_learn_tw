import { WriteAnswer } from "./WriteAnswer";
import { useId, type CSSProperties, type ReactNode } from "react";
import { renderMaterial } from "@/components/documents";
import { Icon } from "@/components/game/icons";
import { resolveNumber, type Goal } from "@/lib/tasks/compute";
import type { StepScore } from "@/lib/tasks/scoring";
import type {
  ChoiceStep,
  FindStep,
  Material,
  NumberStep,
  OrderStep,
  RateStep,
  SortStep,
  TaskStep,
} from "@/lib/tasks/types";
import { formatUnitValue } from "./answers";
import s from "./tasks.module.css";

export interface ModelAnswerProps {
  step: TaskStep;
  /** 0-based position in the task. */
  index: number;
  /** The answer the student sent for this step (scoring.ts shapes). */
  answer: unknown;
  /** The server's score for this step. */
  detail?: StepScore;
  materials: Material[];
  goal?: Goal | null;
  /** RateStep only: the items the student saw. Defaults to the scored items. */
  rateItems?: RateStep["items"];
  /** Arrival stagger. */
  arriveIndex?: number;
}

// --- small pieces -------------------------------------------------------------------

function rec(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

type VerdictKind = "right" | "part" | "wrong" | "free";

function verdictOf(credit: number | undefined, scored: boolean): VerdictKind {
  if (!scored) return "free";
  if (credit === undefined) return "wrong";
  if (credit >= 1 - 1e-9) return "right";
  if (credit > 0) return "part";
  return "wrong";
}

const VERDICT_TEXT: Record<VerdictKind, string> = {
  // 06 F3.2: compare language, never "wrong".
  right: "和建議答案一樣",
  part: "和建議答案不同",
  wrong: "和建議答案不同",
  free: "不計分",
};

/** A word plus an icon: never color alone (01 §2.3). */
export function Verdict({ v, text }: { v: VerdictKind; text?: string }) {
  const icon = v === "right" ? "check" : v === "wrong" ? "close" : "info";
  return (
    <span className={s.verdict} data-v={v}>
      <Icon name={icon} size={14} />
      {text ?? VERDICT_TEXT[v]}
    </span>
  );
}

function Compare({ yours, model }: { yours: ReactNode; model: ReactNode }) {
  return (
    <div className={s.maCompare}>
      <div className={s.maCol}>
        <p className="g-label">你的答案</p>
        <div className={s.maValue}>{yours}</div>
      </div>
      <div className={s.maCol} data-model="true">
        <p className="g-label">建議答案</p>
        <div className={s.maValue}>{model}</div>
      </div>
    </div>
  );
}

function DocDetails({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className={s.maDetails}>
      <summary className={s.maSummary}>{summary}</summary>
      <div className={s.maDetailsBody}>{children}</div>
    </details>
  );
}

const NO_ANSWER = <span className={s.maMuted}>沒有作答</span>;

// --- per type ------------------------------------------------------------------------

function ChoiceBody({ step, answer, detail }: { step: ChoiceStep; answer: unknown; detail?: StepScore }) {
  const a = rec(answer);
  const picked = step.options.find((o) => o.id === a.option);
  const reason = step.reasons?.find((r) => r.id === a.reason);
  const correct = step.options.find((o) => o.id === step.correct);
  const correctReason = step.reasons?.find((r) => r.id === step.correctReason);
  const scored = step.scored !== false;
  const part = (id: string) => detail?.perItem?.find((p) => p.id === id)?.credit;
  const showReason = (step.reasons?.length ?? 0) >= 2;

  const yours = (
    <>
      <p className={s.maLine}>
        {picked ? picked.label : NO_ANSWER}
        {scored && showReason && step.correctReason ? <Verdict v={verdictOf(part("choice"), true)} /> : null}
      </p>
      {showReason ? (
        <p className={s.maLine}>
          <span className={s.maMuted}>理由：</span>
          {reason ? reason.label : NO_ANSWER}
          {scored && step.correctReason ? <Verdict v={verdictOf(part("reason"), true)} /> : null}
        </p>
      ) : null}
    </>
  );
  const model = scored ? (
    <>
      <p className={s.maLine}>{correct?.label ?? ""}</p>
      {correctReason ? (
        <p className={s.maLine}>
          <span className={s.maMuted}>理由：</span>
          {correctReason.label}
        </p>
      ) : null}
    </>
  ) : (
    <p className={s.maLine}>沒有標準答案</p>
  );

  const wrongPick = scored && picked && picked.id !== step.correct ? picked : null;
  return (
    <>
      <Compare yours={yours} model={model} />
      {wrongPick?.explain ? (
        <p className={s.bodyText}>
          <strong>你選的「{wrongPick.label}」：</strong>
          {wrongPick.explain}
        </p>
      ) : null}
      {scored && correct?.explain ? (
        <p className={s.bodyText}>
          <strong>「{correct.label}」：</strong>
          {correct.explain}
        </p>
      ) : null}
    </>
  );
}

function RateBody({
  step,
  answer,
  detail,
  items,
  materials,
}: {
  step: RateStep;
  answer: unknown;
  detail?: StepScore;
  items: RateStep["items"];
  materials: Material[];
}) {
  const ratings = rec(rec(answer).ratings);
  const scaleLabel = (v: unknown) => step.scale.find((sc) => sc.value === v)?.label ?? "";
  return (
    <ol className={s.maRateList}>
      {items.map((item) => {
        const given = ratings[item.id];
        const credit = detail?.perItem?.find((p) => p.id === item.id)?.credit;
        const material = materials[item.materialIndex];
        const also = item.alsoFull?.filter((v) => v !== item.answer) ?? [];
        return (
          <li key={item.id} className={s.maRateItem}>
            <div className={s.maRateHead}>
              <h4 className={s.maRateTitle}>{item.label}</h4>
              <Verdict v={verdictOf(credit, step.scored !== false)} />
            </div>
            <p className={s.maLine}>
              <span>
                你給 <strong className="g-num">{typeof given === "number" ? given : "-"}</strong>
                {typeof given === "number" ? `（${scaleLabel(given)}）` : ""}
              </span>
              <span>
                建議 <strong className="g-num">{item.answer}</strong>（{scaleLabel(item.answer)}）
                {also.length > 0 ? `，給 ${also.join("、")} 也算對` : ""}
              </span>
            </p>
            <p className={s.bodyText}>{item.explain}</p>
            {material ? (
              <DocDetails summary="看資料，標出關鍵的地方">
                {renderMaterial(material, { highlight: item.highlight, headingLevel: 4 })}
              </DocDetails>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function FindBody({ step, answer, materials }: { step: FindStep; answer: unknown; materials: Material[] }) {
  const selected = new Set(
    Array.isArray(rec(answer).selected) ? (rec(answer).selected as unknown[]).filter((x): x is string => typeof x === "string") : [],
  );
  const hits = step.targets.filter((t) => selected.has(t)).length;
  const extra = [...selected].filter((id) => !step.targets.includes(id)).length;
  const material = materials[step.materialIndex];
  return (
    <>
      <Compare
        yours={
          <p className={s.maLine}>
            <span>
              找到 <strong className="g-num">{hits}</strong> / {step.targets.length} 個
              {extra > 0 ? `，多點了 ${extra} 個` : ""}
            </span>
          </p>
        }
        model={<p className={s.maLine}>要找的 {step.targets.length} 個欄位，在文件上標成「關鍵」</p>}
      />
      <ul className={s.maTargets}>
        {step.targets.map((t) => (
          <li key={t}>
            <Verdict v={selected.has(t) ? "right" : "wrong"} text={selected.has(t) ? "找到了" : "沒找到"} />
            <span>{step.explainTargets[t] ?? ""}</span>
          </li>
        ))}
      </ul>
      {material ? (
        <DocDetails summary="看文件，標出要找的欄位">
          {renderMaterial(material, { highlight: step.targets, headingLevel: 4 })}
        </DocDetails>
      ) : null}
    </>
  );
}

function NumberBody({ step, answer, detail, goal }: { step: NumberStep; answer: unknown; detail?: StepScore; goal?: Goal | null }) {
  const raw = rec(answer).value;
  const value = typeof raw === "number" && Number.isFinite(raw) ? raw : null;
  const expected = resolveNumber(step.answer, { goal });
  const tol = typeof step.tolerance === "number" && step.tolerance > 0 ? step.tolerance : 0;
  return (
    <Compare
      yours={<p className={`${s.maLine} ${s.maNumber}`}>{value === null ? NO_ANSWER : formatUnitValue(value, step.unit)}</p>}
      model={
        detail?.unresolved || expected === null ? (
          <p className={s.maLine}>你還沒設定存錢目標，這題先不計分。</p>
        ) : step.scored === false ? (
          <p className={s.maLine}>沒有標準答案</p>
        ) : (
          <>
            <p className={`${s.maLine} ${s.maNumber}`}>{formatUnitValue(expected, step.unit)}</p>
            {tol > 0 ? <p className="g-caption">差 {formatUnitValue(tol, step.unit)} 以內都算對</p> : null}
          </>
        )
      }
    />
  );
}

function SortBody({ step, answer, detail }: { step: SortStep; answer: unknown; detail?: StepScore }) {
  const placements = rec(rec(answer).placements);
  const boxLabel = (id: unknown) => step.boxes.find((b) => b.id === id)?.label;
  const scored = step.scored !== false;
  return (
    <ul className={s.maSortList}>
      {step.items.map((item) => {
        const credit = detail?.perItem?.find((p) => p.id === item.id)?.credit;
        const full = (item.accept ?? [])
          .map((a) => (typeof a === "string" ? a : a.credit >= 1 ? a.option : null))
          .filter((x): x is string => !!x && x !== item.box)
          .map(boxLabel)
          .filter(Boolean);
        const hasAnswer = item.box !== undefined || (item.accept?.length ?? 0) > 0;
        return (
          <li key={item.id} className={s.maSortItem}>
            <div className={s.maRateHead}>
              <span className={s.maSortLabel}>{item.label}</span>
              {scored && hasAnswer ? <Verdict v={verdictOf(credit, true)} /> : null}
            </div>
            <p className={s.maLine}>
              <span>
                你放：<strong>{boxLabel(placements[item.id]) ?? "沒有分類"}</strong>
              </span>
              <span>
                建議：
                <strong>{scored && item.box ? boxLabel(item.box) : "沒有標準答案"}</strong>
                {full.length > 0 ? `（${full.join("、")} 也算對）` : ""}
              </span>
            </p>
            {item.explain ? <p className={s.bodyText}>{item.explain}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}

function OrderBody({ step, answer }: { step: OrderStep; answer: unknown }) {
  const raw = rec(answer).order;
  const order = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  const label = (id: string) => step.items.find((i) => i.id === id)?.label ?? id;
  const scored = step.scored !== false;
  return (
    <Compare
      yours={
        order.length ? (
          <ol className={s.maOrder}>
            {order.map((id, i) => (
              <li key={id} data-same={scored && step.answer[i] === id ? "true" : undefined}>
                {label(id)}
              </li>
            ))}
          </ol>
        ) : (
          NO_ANSWER
        )
      }
      model={
        scored ? (
          <ol className={s.maOrder}>
            {step.answer.map((id) => (
              <li key={id}>{label(id)}</li>
            ))}
          </ol>
        ) : (
          <p className={s.maLine}>沒有標準答案</p>
        )
      }
    />
  );
}

// --- public ---------------------------------------------------------------------------

/**
 * One step's model answer beside the student's answer, with the
 * explanation (03 §3 step 4). Reflection steps (scored: false) show
 * 「沒有標準答案」 in place of a model answer.
 */
export function ModelAnswer({ step, index, answer, detail, materials, goal, rateItems, arriveIndex = 0 }: ModelAnswerProps) {
  const titleId = useId();
  const scored = step.scored !== false && !detail?.unresolved;
  const v = verdictOf(detail?.credit, scored);

  let body: ReactNode;
  switch (step.type) {
    case "choice":
      body = <ChoiceBody step={step} answer={answer} detail={detail} />;
      break;
    case "rate": {
      const ids = detail?.perItem?.map((p) => p.id);
      const items = rateItems ?? (ids ? step.items.filter((i) => ids.includes(i.id)) : step.items);
      body = <RateBody step={step} answer={answer} detail={detail} items={items} materials={materials} />;
      break;
    }
    case "find":
      body = <FindBody step={step} answer={answer} materials={materials} />;
      break;
    case "number":
      body = <NumberBody step={step} answer={answer} detail={detail} goal={goal} />;
      break;
    case "sort":
      body = <SortBody step={step} answer={answer} detail={detail} />;
      break;
    case "order":
      body = <OrderBody step={step} answer={answer} />;
      break;
    case "write":
      body = <WriteAnswer step={step} answer={answer} />;
      break;
  }

  return (
    <article
      className={`g-card ga-card-in ${s.maCard}`}
      style={{ "--ga-i": arriveIndex } as CSSProperties}
      aria-labelledby={titleId}
    >
      <div className={s.maHead}>
        <p className="g-label">第 {index + 1} 題</p>
        <Verdict v={v} />
      </div>
      <h3 id={titleId} className={s.maPrompt}>
        {step.prompt}
      </h3>
      {body}
      {step.explanation ? (
        <div className={s.maExplain}>
          <p className="g-label">說明</p>
          <p className={s.bodyText}>{step.explanation}</p>
        </div>
      ) : null}
    </article>
  );
}

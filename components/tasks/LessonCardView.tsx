import type { CSSProperties } from "react";
import type { LessonCard } from "@/lib/tasks/types";
import s from "./tasks.module.css";

/**
 * One lesson card (03 §1 LessonCard), drawn as a visual: text, a comparison
 * of two people, a flow, a 2×2 matrix or a formula. Server-safe (no state).
 */
export function LessonCardView({ card, index = 0 }: { card: LessonCard; index?: number }) {
  return (
    <article className={`g-card g-card--strong ga-card-in ${s.lessonCard}`} style={{ "--ga-i": index } as CSSProperties}>
      <h3 className={`g-label ${s.lessonTitle}`}>{card.title}</h3>
      <LessonBody card={card} />
    </article>
  );
}

function LessonBody({ card }: { card: LessonCard }) {
  switch (card.kind) {
    case "text":
      return <p className={s.lessonText}>{card.body}</p>;

    case "compare":
      return (
        <>
          <div className={s.compare}>
            {[card.left, card.right].map((side, i) => (
              <section key={i} className={s.compareSide} aria-label={side.name}>
                <h4 className={s.compareName}>{side.name}</h4>
                <dl className={s.compareRows}>
                  {side.rows.map((r, j) => (
                    <div key={j} className={s.compareRow}>
                      <dt>{r.label}</dt>
                      <dd className="g-num">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
          {card.note ? <p className="g-caption">{card.note}</p> : null}
        </>
      );

    case "flow":
      return (
        <>
          <ol className={s.flowList}>
            {card.steps.map((step, i) => (
              <li key={i} className={s.flowStep}>
                <span className={s.flowDot} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={s.flowText}>{step}</span>
              </li>
            ))}
          </ol>
          {card.caption ? <p className="g-caption">{card.caption}</p> : null}
        </>
      );

    case "matrix": {
      // cells: [low-x low-y, high-x low-y, low-x high-y, high-x high-y]; high y on top.
      const [ll, hl, lh, hh] = card.cells;
      return (
        <div className={s.matrixWrap}>
          <table className={s.matrix}>
            <caption className="sr-only">
              {card.axisTitles ? `${card.axisTitles.y} 對 ${card.axisTitles.x}` : card.title}
            </caption>
            <thead>
              <tr>
                <td className={s.matrixCorner} />
                <th scope="col" className={s.matrixAxis}>
                  {card.xLabel[0]}
                </th>
                <th scope="col" className={s.matrixAxis}>
                  {card.xLabel[1]}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className={s.matrixAxis}>
                  {card.yLabel[1]}
                </th>
                <td className={s.matrixCell}>{lh}</td>
                <td className={s.matrixCell}>{hh}</td>
              </tr>
              <tr>
                <th scope="row" className={s.matrixAxis}>
                  {card.yLabel[0]}
                </th>
                <td className={s.matrixCell}>{ll}</td>
                <td className={s.matrixCell}>{hl}</td>
              </tr>
            </tbody>
          </table>
          {card.axisTitles ? (
            <p className="g-caption">
              橫的看{card.axisTitles.x}，直的看{card.axisTitles.y}。
            </p>
          ) : null}
        </div>
      );
    }

    case "formula":
      return (
        <>
          <p className={s.formula}>{card.formula}</p>
          <p className={s.formulaExample}>
            <span className="g-label">例</span> <span className="g-num">{card.example}</span>
          </p>
        </>
      );
  }
}

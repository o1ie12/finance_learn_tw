import { LEASE_CLAUSES } from "@/lib/sims/leaseContract";
import type { LeaseData } from "@/lib/tasks/types";
import DocumentFrame from "./DocumentFrame";
import { KeyTag, Mark, cx, isHl, isOn, type DocumentProps } from "./fields";
import s from "./documents.module.css";

/**
 * 租賃契約: renders the clause text from lib/sims/leaseContract.ts (the
 * 契約找碴 data), so the task and the simulation share one contract. Only the
 * text is shown; whether a clause is bad stays in the data for scoring.
 *
 * Field ids: clause:<id> (e.g. clause:c3)
 */
export default function LeaseDoc({
  data,
  find,
  highlight,
  headingLevel,
}: { data: LeaseData } & DocumentProps) {
  const ids = data.clauseIds;
  const clauses = ids && ids.length ? LEASE_CLAUSES.filter((c) => ids.includes(c.id)) : LEASE_CLAUSES;

  return (
    <DocumentFrame
      title="住宅租賃契約"
      subtitle="甲方：房東　乙方：房客"
      sample
      fictional={false}
      footnote="示意契約，不是正式的法律文件。"
      headingLevel={headingLevel}
    >
      <ol className={s.clauses}>
        {clauses.map((c) => {
          const id = `clause:${c.id}`;
          const hl = isHl(highlight, id);
          const text = (
            <>
              <span className={s.clauseNo}>第 {c.number} 條</span>
              <span>
                {c.text}
                {hl && <KeyTag />}
              </span>
            </>
          );
          return (
            <li key={c.id} data-field={id}>
              {find ? (
                <button
                  type="button"
                  aria-pressed={isOn(find, id)}
                  disabled={find.disabled}
                  onClick={() => find.onToggle(id)}
                  className={cx(s.pick, hl && s.hl)}
                >
                  <span className={cx(s.kvInner, s.kvStart)}>
                    {text}
                  </span>
                  <Mark />
                </button>
              ) : (
                <div className={cx(s.clause, hl && s.hl)}>{text}</div>
              )}
            </li>
          );
        })}
      </ol>
    </DocumentFrame>
  );
}

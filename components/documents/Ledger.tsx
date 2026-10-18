import { useId } from "react";
import { formatNT } from "@/components/Money";
import type { LedgerData } from "@/lib/tasks/types";
import DocumentFrame from "./DocumentFrame";
import { CellPick, CheckIcon, KeyTag, TableWrap, isHl, isOn, type DocumentProps } from "./fields";
import s from "./documents.module.css";

/**
 * 記帳表: an accounting sheet with blank cells (`value: null`). Blank cells
 * are controlled inputs when `onChange` is given; otherwise they show as an
 * empty line to fill on paper.
 *
 * Field ids: row:<i>
 */

export type CellState = "ok" | "wrong" | "neutral";

export interface LedgerInputs {
  /** Typed text per blank row index. */
  values?: Record<number, string>;
  onChange?(rowIndex: number, value: string): void;
  cellState?: Record<number, CellState>;
  /** Shown under a wrong cell; defaults to 「再算一次」. */
  hints?: Record<number, string>;
  /** Lock the inputs (after submit). */
  readOnly?: boolean;
}

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" focusable="false" className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export default function Ledger({
  data,
  find,
  highlight,
  headingLevel,
  inputs,
}: { data: LedgerData; inputs?: LedgerInputs } & DocumentProps) {
  const uid = useId();

  return (
    <DocumentFrame title="記帳表" subtitle="這個月的錢從哪裡來、到哪裡去" fictional={false} headingLevel={headingLevel}>
      <TableWrap label="記帳表">
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">項目</th>
              <th scope="col" className={s.num}>
                金額
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r, i) => {
              const id = `row:${i}`;
              const hl = isHl(highlight, id);
              const state = inputs?.cellState?.[i] ?? "neutral";
              const inputId = `${uid}-cell-${i}`;
              const hintId = `${uid}-hint-${i}`;
              const blank = r.value === null;
              return (
                <tr key={id} data-field={id} data-on={isOn(find, id) || undefined} data-hl={hl || undefined}>
                  <th scope="row">
                    {find ? (
                      <CellPick
                        id={id}
                        find={find}
                        kind="row"
                        label={`${r.label}，${blank ? "空白" : formatNT(r.value ?? 0)}`}
                      >
                        {r.label}
                      </CellPick>
                    ) : blank && inputs?.onChange ? (
                      <label htmlFor={inputId}>{r.label}</label>
                    ) : (
                      r.label
                    )}
                    {hl && <KeyTag />}
                  </th>
                  <td className={s.num}>
                    {!blank ? (
                      formatNT(r.value ?? 0)
                    ) : inputs?.onChange && !find ? (
                      <div className={state === "wrong" ? s.cellWrong : state === "ok" ? s.cellOk : undefined}>
                        <span className={s.cellWrap}>
                          <span aria-hidden="true">NT$</span>
                          <input
                            id={inputId}
                            className={s.cellInput}
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            value={inputs.values?.[i] ?? ""}
                            onChange={(e) => inputs.onChange?.(i, e.target.value)}
                            readOnly={inputs.readOnly}
                            aria-invalid={state === "wrong" || undefined}
                            aria-describedby={state === "wrong" ? hintId : undefined}
                          />
                          {state === "ok" && (
                            <>
                              <CheckIcon className={s.cellIcon} />
                              <span className="sr-only">正確</span>
                            </>
                          )}
                          {state === "wrong" && <CrossIcon className={s.cellIcon} />}
                        </span>
                        {state === "wrong" && (
                          <p id={hintId} className={s.hint}>
                            {inputs.hints?.[i] ?? "再算一次"}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <span className={s.blank} aria-hidden="true" />
                        <span className="sr-only">空白</span>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>
    </DocumentFrame>
  );
}

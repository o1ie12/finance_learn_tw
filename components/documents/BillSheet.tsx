import { formatNT } from "@/components/Money";
import type { BillSheetData } from "@/lib/tasks/types";
import DocumentFrame from "./DocumentFrame";
import { CellPick, KeyTag, TableWrap, isHl, isOn, type DocumentProps } from "./fields";
import s from "./documents.module.css";

/**
 * 帳單表: a household bill sheet. The total is the sum of the rows.
 *
 * Field ids: row:<i>, total
 */
export default function BillSheet({
  data,
  find,
  highlight,
  headingLevel,
}: { data: BillSheetData } & DocumentProps) {
  const total = data.rows.reduce((sum, r) => sum + r.amount, 0);
  const rowAttrs = (id: string) => ({
    "data-field": id,
    "data-on": isOn(find, id) || undefined,
    "data-hl": isHl(highlight, id) || undefined,
  });

  return (
    <DocumentFrame title={data.title} subtitle="每月帳單" fictional={false} headingLevel={headingLevel}>
      <TableWrap label={data.title}>
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">項目</th>
              <th scope="col" className={s.num}>
                金額
              </th>
              <th scope="col">繳費日</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r, i) => {
              const id = `row:${i}`;
              return (
                <tr key={id} {...rowAttrs(id)}>
                  <th scope="row">
                    {find ? (
                      <CellPick id={id} find={find} kind="row" label={`${r.item}，${formatNT(r.amount)}`}>
                        {r.item}
                      </CellPick>
                    ) : (
                      r.item
                    )}
                    {isHl(highlight, id) && <KeyTag />}
                  </th>
                  <td className={s.num}>{formatNT(r.amount)}</td>
                  <td>{r.day ?? <span className="sr-only">未填</span>}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr {...rowAttrs("total")}>
              <th scope="row">
                {find ? (
                  <CellPick id="total" find={find} kind="row" label={`合計，${formatNT(total)}`}>
                    合計
                  </CellPick>
                ) : (
                  "合計"
                )}
                {isHl(highlight, "total") && <KeyTag />}
              </th>
              <td className={s.num}>{formatNT(total)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </TableWrap>
    </DocumentFrame>
  );
}

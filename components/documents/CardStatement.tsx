import { formatNT } from "@/components/Money";
import { minimumPaymentFor } from "@/lib/sims/creditCard";
import type { CardStatementData } from "@/lib/tasks/types";
import DocumentFrame from "./DocumentFrame";
import { CellPick, KV, KVList, KeyTag, TableWrap, isHl, isOn, type DocumentProps } from "./fields";
import s from "./documents.module.css";

/**
 * 信用卡帳單. 最低應繳 comes from minimumPaymentFor (lib/sims/creditCard.ts,
 * the 信用線 engine's rule), never from content.
 *
 * Field ids: bank, month, closingDate, dueDate, totalDue, minimumDue,
 * interest, limit, col:date, col:postDate, col:desc, col:amount, tx:<i>
 */

const COLUMNS = [
  { id: "col:date", label: "消費日" },
  { id: "col:postDate", label: "入帳日" },
  { id: "col:desc", label: "說明" },
  { id: "col:amount", label: "金額" },
] as const;

export function statementTotal(data: CardStatementData): number {
  return data.totalDue ?? data.transactions.reduce((sum, t) => sum + t.amount, 0);
}

export default function CardStatement({
  data,
  find,
  highlight,
  headingLevel,
}: { data: CardStatementData } & DocumentProps) {
  const total = statementTotal(data);
  const minimum = minimumPaymentFor(total);
  const f = { find, highlight };
  // A column is "on" when selected in find mode; "hl" after answering.
  const colOn = (id: string) => isOn(find, id);
  const colHl = (id: string) => isHl(highlight, id);

  return (
    <DocumentFrame title="信用卡帳單" headingLevel={headingLevel}>
      <KVList find={find} label="帳單資料">
        <KV id="bank" label="銀行" value={data.bank} text {...f} />
        <KV id="month" label="帳單月份" value={data.month} {...f} />
      </KVList>

      <div className={s.dueBox}>
        <KVList find={find} label="本期繳款">
          <KV id="totalDue" label="本期應繳總額" value={formatNT(total)} {...f} />
          <KV id="minimumDue" label="最低應繳金額" value={formatNT(minimum)} {...f} />
          <KV id="dueDate" label="繳款截止日" value={data.dueDate} {...f} />
        </KVList>
      </div>

      <KVList find={find} label="帳戶資料">
        <KV id="closingDate" label="結帳日" value={data.closingDate} {...f} />
        <KV id="limit" label="信用額度" value={formatNT(data.limit)} {...f} />
        <KV id="interest" label="本期循環利息" value={formatNT(data.interest)} {...f} />
      </KVList>

      <div className={s.section}>
        <TableWrap label="交易明細">
          <table className={s.table}>
            <caption>交易明細</caption>
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th
                    key={c.id}
                    scope="col"
                    className={c.id === "col:amount" ? s.num : undefined}
                    data-on={colOn(c.id) || undefined}
                    data-hl={colHl(c.id) || undefined}
                  >
                    {find ? (
                      <CellPick id={c.id} find={find} kind="col" label={`${c.label}（整欄）`}>
                        {c.label}
                      </CellPick>
                    ) : (
                      c.label
                    )}
                    {colHl(c.id) && <KeyTag />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((t, i) => {
                const id = `tx:${i}`;
                const rowOn = isOn(find, id);
                const rowHl = isHl(highlight, id);
                const cell = (colId: string) => ({
                  "data-on": rowOn || colOn(colId) || undefined,
                  "data-hl": rowHl || colHl(colId) || undefined,
                });
                return (
                  <tr key={id} data-field={id}>
                    <td {...cell("col:date")}>{t.date}</td>
                    <td {...cell("col:postDate")}>{t.postDate}</td>
                    <th scope="row" {...cell("col:desc")}>
                      {find ? (
                        <CellPick
                          id={id}
                          find={find}
                          kind="row"
                          label={`${t.desc}，${formatNT(t.amount)}，消費日 ${t.date}，入帳日 ${t.postDate}`}
                        >
                          {t.desc}
                        </CellPick>
                      ) : (
                        t.desc
                      )}
                      {rowHl && <KeyTag />}
                    </th>
                    <td className={s.num} {...cell("col:amount")}>
                      {formatNT(t.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      </div>
    </DocumentFrame>
  );
}

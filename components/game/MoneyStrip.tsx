import { nt } from "@/components/play/playModel";
import s from "./turn.module.css";

/**
 * 06 E8.6: the 40px strip under the rail. Two numbers only, 現金 and
 * 緊急預備金 (months of expenses); the rest live in 狀態.
 */
export function MoneyStrip({ cash, efMonths }: { cash: number; efMonths: number }) {
  return (
    <dl className={s.strip}>
      <div>
        <dt>現金</dt>
        <dd>{nt(cash)}</dd>
      </div>
      <div>
        <dt>緊急預備金</dt>
        <dd>{(Math.floor(efMonths * 10) / 10).toFixed(1)} 個月</dd>
      </div>
    </dl>
  );
}

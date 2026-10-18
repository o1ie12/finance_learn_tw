import { Icon } from "@/components/game/icons";
import { STEPS } from "./playModel";
import s from "./play.module.css";

const NO_LEDGER = "這個月不用記帳";

/**
 * The 6-step strip (01 §6.4): 發薪日 → 先存錢 → 帳單 → 行動 → 人生事件 → 記帳.
 * Done steps carry a check and the word 已完成 for screen readers; the
 * current one has aria-current="step".
 *
 * Step 6 is always labelled 記帳 (01 §6.4). On the turns without a ledger,
 * a caption under the strip says 這個月不用記帳, so the step names never
 * change from month to month.
 */
export function StepStrip({ current, ledgerTurn }: { current: number; ledgerTurn: boolean }) {
  return (
    <nav aria-label="這個月的步驟" className={s.stripWrap}>
      <ol className={s.strip}>
        {STEPS.map((label, i) => {
          const done = i < current;
          const now = i === current;
          return (
            <li
              key={label}
              className={[s.stripItem, done && s.stripDone, now && s.stripNow].filter(Boolean).join(" ")}
              aria-current={now ? "step" : undefined}
            >
              <span className={s.stripDot} aria-hidden="true">
                {done ? <Icon name="check" size={14} /> : i + 1}
              </span>
              <span className={s.stripLabel}>{label}</span>
              {i === 5 && !ledgerTurn ? <span className="sr-only">（{NO_LEDGER}）</span> : null}
              {done ? <span className="sr-only">（已完成）</span> : null}
            </li>
          );
        })}
      </ol>
      {ledgerTurn ? null : (
        <p className={s.stripCaption} aria-hidden="true">
          <span>{NO_LEDGER}</span>
        </p>
      )}
    </nav>
  );
}

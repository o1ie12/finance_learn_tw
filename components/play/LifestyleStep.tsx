"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/game/PrimaryButton";
import { LIFESTYLE, LIFESTYLE_SAVE_STREAK } from "@/lib/lifeGame/constants";
import type { LifestyleLevel, PublicLifeState } from "@/lib/lifeGame/types";
import { nt } from "./playModel";
import { Actions, ErrorLine, Notice, guard } from "./ui";
import s from "./play.module.css";

const LEVELS: { id: LifestyleLevel; name: string; covers: string }[] = [
  { id: "save", name: "省", covers: "偶爾手搖、一次電影" },
  { id: "normal", name: "普通", covers: "每週聚餐一次、串流平台、偶爾買衣服" },
  { id: "enjoy", name: "享受", covers: "常常外食聚會、新衣服、遊戲課金" },
];

/**
 * Step 4 生活風格 (05 Part B): this month's 想要 spending, after the bills and
 * before 行動. Defaults to last month's choice (the first month: 普通). The
 * server spends it; the browser only sends the level.
 */
export function LifestyleStep({
  state,
  busy,
  error,
  onChoose,
}: {
  state: PublicLifeState;
  busy: boolean;
  error: string | null;
  onChoose: (level: LifestyleLevel) => void;
}) {
  const [level, setLevel] = useState<LifestyleLevel>(state.lifestyle.last);
  const cash = Math.max(state.accounts.cash, 0);
  const streakNext = level === "save" ? state.lifestyle.saveStreak + 1 : 0;

  return (
    <div className={s.stepBody}>
      <h2 className="g-question" tabIndex={-1} data-step-heading>
        這個月想怎麼過？
      </h2>
      <p className="g-body">帳單付完了，現金還有 {nt(cash)}。選一個生活風格，這筆想要的花費會像帳單一樣付掉。</p>

      <fieldset className={s.lifestyle}>
        <legend className="sr-only">生活風格</legend>
        {LEVELS.map((l) => (
          <label key={l.id} className={s.lifestyleOption}>
            <input
              type="radio"
              name="lifestyle"
              value={l.id}
              checked={level === l.id}
              onChange={() => setLevel(l.id)}
            />
            <span className={s.lifestyleName}>{l.name}</span>
            <span className={s.lifestyleAmount}>{nt(LIFESTYLE[l.id])}</span>
            <span className={s.lifestyleCovers}>{l.covers}</span>
          </label>
        ))}
      </fieldset>
      <p className="g-caption">金額為示意。</p>

      {streakNext >= LIFESTYLE_SAVE_STREAK ? (
        <Notice tone="warn">連續 {streakNext} 個月都省，壓力會變大：完全沒有娛樂的生活很難撐久。</Notice>
      ) : null}

      <ErrorLine message={error} />
      <Actions>
        <PrimaryButton onClick={guard(busy, () => onChoose(level))} aria-disabled={busy || undefined} aria-busy={busy}>
          就這樣過這個月
        </PrimaryButton>
      </Actions>
    </div>
  );
}

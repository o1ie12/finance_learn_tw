/**
 * 存錢線. Copy from 04-CONTENT §2 and §6, pasted verbatim.
 *
 * Placement (lead): Task A → station 3, Task B → terminal.
 *
 * Figures:
 * - 30,000 ÷ 12 = 2,500, the 阿哲 / 小琪 rates (15%, 25%) and the 52-week
 *   total 13,780 (10 + 20 + ... + 520) are 04's own arithmetic.
 * - 一年期定存 1.70%: lib/rates.ts TIME_DEPOSIT_1Y (臺灣銀行 牌告, verified in
 *   the repo, 04 §15). The interest itself is a ComputeRef.
 * - The student's own goal is a ComputeRef (goalMonthly).
 */

import { TIME_DEPOSIT_1Y, pct } from "@/lib/rates";
import type { LineContent } from "@/lib/tasks/types";

const lineHook = {
  question: "現在拿 NT$1,000，或一年後拿 NT$1,100，你選哪個？",
  options: [
    { id: "now", label: "現在拿 NT$1,000" },
    { id: "later", label: "一年後拿 NT$1,100" },
  ],
};

const saveFirst = {
  name: "月初先存",
  lines: ["收入 − 存錢 = 可以花的錢"],
};

export const content: LineContent = {
  slug: "cunqian",
  hook: lineHook,
  bias: "現在偏誤",
  takeaway: saveFirst,
  unlocks: "存定存、存錢目標追蹤",
  lessons: [
    // --- Task A: 讓目標變具體 (station 3) ----------------------------------------
    {
      stationId: 3,
      placement: "station",
      hook: lineHook,
      lessonCards: [
        {
          kind: "text",
          title: "SMART 目標",
          body: "具體、可衡量、做得到、相關、有期限。『我要存錢』不是目標，『12 個月存 NT$30,000 買筆電』才是。",
        },
      ],
      task: {
        id: "cunqian.goal.v1",
        kind: "cunqian_smart_goal_v1",
        title: "讓目標變具體",
        brief: {
          role: "想存錢買東西的你",
          situation: "想要的東西很多。先把一個目標寫清楚，再算每個月要存多少。",
        },
        materials: [],
        steps: [
          {
            id: "s1",
            type: "choice",
            prompt: "哪一個是好目標？",
            options: [
              { id: "a", label: "我要開始存錢" },
              { id: "b", label: "我要存很多錢" },
              { id: "c", label: "我要在 12 個月內存 NT$30,000 買筆電" },
              { id: "d", label: "我要跟同學一樣有新手機" },
            ],
            correct: "c",
            reasons: [
              { id: "r1", label: "有東西、有金額、有期限。" },
              { id: "r2", label: "越多越好比較有動力。" },
              { id: "r3", label: "跟同學一樣比較不會被比下去。" },
            ],
            correctReason: "r1",
            explanation: "有東西、有金額、有期限。",
          },
          {
            id: "s2",
            type: "number",
            prompt: "12 個月存 NT$30,000，每個月要存多少？",
            answer: 2500,
            unit: "NT$",
            explanation: "NT$30,000 ÷ 12 個月 = 每個月 NT$2,500。",
          },
          {
            id: "s3",
            type: "number",
            prompt: "你的目標每個月要存多少？",
            answer: { fn: "goalMonthly" },
            unit: "NT$",
            explanation: "目標金額 ÷ 月數，再進位到百元，就是每個月要先存的錢。",
          },
        ],
        passScore: 0.6,
      },
      reveal: {
        bias: "現在偏誤",
        byHookOption: {
          now: "大部分人都選現在拿。眼前的東西感覺比較大，這叫現在偏誤，也是存錢難的原因。",
        },
        default: "你願意等，這正是存錢需要的能力。",
      },
      takeaway: saveFirst,
      minutes: 11,
      lifeGameTurn: true,
      doLine: "把目標算成每月要存多少",
    },

    // --- Task B: 誰比較會存 (terminal) --------------------------------------------
    {
      stationId: null,
      placement: "terminal",
      hook: {
        question: "存比較多錢的人，就比較會存嗎？",
        options: [
          { id: "yes", label: "對" },
          { id: "no", label: "不一定" },
          { id: "unsure", label: "不知道" },
        ],
      },
      lessonCards: [
        {
          kind: "compare",
          title: "看比例，不看金額",
          left: {
            name: "阿哲",
            rows: [
              { label: "月薪", value: "40,000" },
              { label: "必要開銷", value: "30,000" },
              { label: "每月存", value: "6,000" },
            ],
          },
          right: {
            name: "小琪",
            rows: [
              { label: "月薪", value: "40,000" },
              { label: "必要開銷", value: "22,000" },
              { label: "每月存", value: "10,000" },
            ],
          },
          note: "儲蓄率 = 每月存下 ÷ 月薪",
        },
      ],
      task: {
        id: "cunqian.rate.v1",
        kind: "cunqian_savings_rate_v1",
        title: "誰比較會存",
        brief: {
          role: "你",
          situation: "阿哲和小琪月薪一樣，每月存下的錢不一樣。算算看誰比較會存。",
        },
        materials: [],
        steps: [
          {
            id: "s1",
            type: "number",
            prompt: "阿哲的儲蓄率是幾 %？",
            answer: 15,
            unit: "%",
            explanation: "6,000 ÷ 40,000 = 15%。",
          },
          {
            id: "s2",
            type: "number",
            prompt: "小琪的儲蓄率是幾 %？",
            answer: 25,
            unit: "%",
            explanation: "10,000 ÷ 40,000 = 25%。",
          },
          {
            id: "s3",
            type: "choice",
            prompt: "阿哲說：『我必要開銷比較高，所以我存不了那麼多。』他可以怎麼做？",
            options: [
              { id: "a", label: "想辦法降低固定開銷" },
              { id: "b", label: "等加薪再說" },
              { id: "c", label: "不用存了" },
            ],
            correct: "a",
            reasons: [
              { id: "r1", label: "固定開銷每個月都會發生，省一次就每個月都省。" },
              { id: "r2", label: "加薪了自然就會存了。" },
              { id: "r3", label: "開銷高就沒辦法。" },
            ],
            correctReason: "r1",
            explanation: "固定開銷每個月都會發生，省一次就每個月都省。",
          },
          {
            id: "s4",
            type: "choice",
            prompt: "哪個習慣比較容易存到錢？",
            options: [
              { id: "a", label: "月初就存" },
              { id: "b", label: "月底剩多少存多少" },
            ],
            correct: "a",
            // 04 gives only one reason, so the step has no reason part (03 §2);
            // the reason becomes the explanation.
            explanation: "月底才存，錢通常已經不見了。",
          },
          {
            // 04 marks this step deep/optional: it runs unscored, so it does
            // not count toward the pass. The explanation stays as the worked answer.
            id: "s5",
            type: "number",
            scored: false,
            // Rate from lib/rates.ts TIME_DEPOSIT_1Y (source and date cited there).
            prompt: `NT$50,000 放一年期定存，年利率 ${pct(TIME_DEPOSIT_1Y.rate)}，一年利息多少？`,
            answer: { fn: "depositInterest", principal: 50000 },
            unit: "NT$",
            explanation: "利息 = 本金 × 年利率。一年後拿回本金，再加上這筆利息。",
          },
        ],
        passScore: 0.6,
        afterTip: "52 週存錢法：第 1 週存 NT$10，第 2 週存 NT$20，每週多存 10 元，一年存到 NT$13,780。",
      },
      reveal: {
        bias: "看絕對金額",
        default: "存比較多錢的人不一定比較會存。要看存下的錢占收入的比例。",
      },
      takeaway: {
        name: "儲蓄率",
        lines: ["儲蓄率 = 每月存下 ÷ 月薪"],
      },
      minutes: 15,
      lifeGameTurn: true,
      doLine: "比比看誰比較會存",
    },
  ],
};

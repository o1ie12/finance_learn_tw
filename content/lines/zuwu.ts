/**
 * 租屋線 content (04-CONTENT §10). No new task set: the existing lease clause
 * hunt is the terminal, wrapped with the 簽約前三查 card and the reveal.
 *
 * Sources (docs/redesign/sources.md item 13):
 * - Deposit ≤ 2 months' rent: 租賃住宅市場發展及管理條例 §7
 *   「押金之金額，不得逾二個月之租金總額。」
 * - Model contract name 「住宅租賃契約書範本」: 內政部地政司.
 */

import type { LineContent } from "@/lib/tasks/types";

const STEPS = ["查房東是不是屋主", "對照內政部的住宅租賃契約書範本", "押金不超過兩個月租金"];

export const content: LineContent = {
  slug: "zuwu",
  hook: {
    question: "房東說『很多人在看，今天不簽就沒了』，你會簽嗎？",
    options: [
      { id: "sign_now", label: "先簽再說" },
      { id: "read_first", label: "回家看完合約再決定" },
      { id: "ask_deposit", label: "先問押金和規定" },
    ],
  },
  bias: "稀缺感",
  takeaway: { name: "簽約前三查", lines: STEPS },
  unlocks: "搬出去住、房屋基金、房東漲房租事件",
  lessons: [],
  terminal: {
    lessonCards: [{ kind: "flow", title: "簽約前三查", steps: STEPS }],
    reveal: {
      bias: "稀缺感",
      byHookOption: {
        sign_now:
          "『很多人在看』會讓我們怕錯過，判斷就變快變草率。好房東通常給你時間看合約。",
      },
      default: "時間壓力是最常見的推銷技巧，租屋也一樣。",
    },
  },
};

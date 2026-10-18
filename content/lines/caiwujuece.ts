/**
 * 財務決策線 content (04 §13, the finale). The buy-vs-rent sim stays the
 * terminal, with a 買房前三算 card before it and the ending text after it.
 */
import type { LineContent } from "@/lib/tasks/types";

export const content: LineContent = {
  slug: "caiwujuece",
  hook: {
    question: "大家都說要買房，租房就是在幫房東繳房貸？",
    options: [
      { id: "buy_early", label: "對，越早買越好" },
      { id: "calc_first", label: "不一定，要先算" },
      { id: "unsure", label: "我還不知道" },
    ],
  },
  bias: "從眾、現狀偏誤",
  takeaway: {
    name: "買房前三算",
    lines: ["頭期款", "月付比", "預備金"],
  },
  unlocks: "最後的決定：用人生遊戲裡的數字，決定買房或繼續租",
  lessons: [],
  terminal: {
    lessonCards: [
      {
        kind: "flow",
        title: "買房前三算",
        steps: ["頭期款存夠了嗎", "每月房貸占收入多少", "買完還有沒有緊急預備金"],
      },
    ],
    reveal: {
      bias: "從眾",
      byHookOption: {
        buy_early:
          "『大家都說』是最有力的推銷。買房可能是好決定，但要用你自己的數字算，不是用別人的。",
      },
      default: "買或租都可以是對的，答案在你自己的數字裡。",
    },
    endingText:
      "這條路線走完了，但你的人生遊戲還會繼續。每個月回來一次，看看{name}會變成什麼樣子。",
  },
};

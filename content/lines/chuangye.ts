/**
 * 創業線 content (04 §13). The bubble tea sim stays the terminal; a 損益兩平
 * card comes before it and one sunk-cost ChoiceStep after it
 * (chuangye_sunk_cost_v1).
 */
import type { LineContent } from "@/lib/tasks/types";

export const content: LineContent = {
  slug: "chuangye",
  hook: {
    question: "店已經虧了三個月，投進去的錢不能白費，要繼續嗎？",
    options: [
      { id: "continue", label: "繼續，不然之前都白花了" },
      { id: "depends", label: "看接下來能不能賺再決定" },
      { id: "stop", label: "馬上收" },
    ],
  },
  bias: "沉沒成本",
  takeaway: {
    name: "看未來，不看已經花掉的",
    lines: ["已經花掉的錢拿不回來，要看的是接下來會不會賺。"],
  },
  unlocks: "副業",
  lessons: [],
  terminal: {
    lessonCards: [
      {
        kind: "formula",
        title: "損益兩平",
        formula: "每月固定成本 ÷ 每杯賺的錢 = 每月要賣幾杯才不虧",
        // Scenario arithmetic: 60,000 ÷ 30 = 2,000.
        example: "房租加人事 NT$60,000，一杯賺 NT$30，每月要賣 2,000 杯。",
      },
    ],
    reveal: {
      bias: "沉沒成本",
      byHookOption: {
        continue:
          "已經花掉的錢叫沉沒成本。不管繼續或停止，它都拿不回來，所以不該影響決定。",
      },
      default: "做決定時，只看接下來會發生什麼。已經花掉的，不管怎麼選都回不來。",
    },
    afterSteps: [
      {
        id: "s1",
        type: "choice",
        prompt: "已經投入 NT$300,000。照現在的生意，接下來每月還會虧 NT$10,000。你會？",
        options: [
          { id: "a", label: "繼續撐" },
          { id: "b", label: "調整後再試三個月，沒改善就收" },
          { id: "c", label: "馬上收" },
        ],
        correct: "b",
        explanation: "已經花掉的錢拿不回來，要看的是接下來會不會賺。",
      },
    ],
    afterKind: "chuangye_sunk_cost_v1",
  },
};

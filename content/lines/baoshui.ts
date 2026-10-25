/**
 * 報稅線 content (04 §12). No station task: the existing payslip and
 * deduction sim (115年度 constants) is the terminal, followed by one
 * ChoiceStep stored as baoshui_refund_v1.
 */
import type { LineContent } from "@/lib/tasks/types";

export const content: LineContent = {
  slug: "baoshui",
  hook: {
    question: "五月收到退稅 NT$3,000，這是賺到的嗎？",
    options: [
      { id: "windfall", label: "是，意外之財" },
      { id: "mine", label: "不是，本來就是我的錢" },
      { id: "unknown", label: "不知道" },
    ],
  },
  bias: "心理帳戶",
  takeaway: {
    name: "退稅是你多繳的錢",
    lines: ["把它當成薪水的一部分來規劃。"],
  },
  unlocks: "人生遊戲裡每年五月的真實報稅通知",
  lessons: [],
  terminal: {
    reveal: {
      bias: "心理帳戶",
      byHookOption: {
        windfall:
          "人會把『退稅』放進『意外之財』的帳戶，花起來比較不心疼。但它其實是你自己多繳的錢。",
      },
      default: "同樣是一塊錢，放在不同心裡的帳戶，就會被花得不一樣。",
    },
    afterSteps: [
      {
        id: "s1",
        type: "choice",
        prompt: "退稅 NT$3,000，你會怎麼用？",
        options: [
          { id: "a", label: "當作獎勵全花掉" },
          { id: "b", label: "放進緊急預備金或目標" },
          { id: "c", label: "一半一半" },
        ],
        correct: "b",
        accept: [{ option: "c", credit: 0.5 }],
        explanation: "退稅是你之前每月多被扣的錢，把它當成薪水的一部分來規劃。",
      },
    ],
    afterKind: "baoshui_refund_v1",
  },
};

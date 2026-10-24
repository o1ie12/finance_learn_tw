/**
 * 保險線 content (04-CONTENT §8). Placement: Task A → station 29, Task B →
 * terminal. The existing policy-vs-定存 sim stays as a deep station.
 *
 * No figures in this file. The 健保 note on 感冒看醫生 is 04's wording.
 */

import { PERSONA } from "../personas";
import type { BiasReveal, LineContent, StationLesson } from "@/lib/tasks/types";

const revealFear: BiasReveal = {
  bias: "因為害怕而買",
  default: "保險推銷常常從『萬一』開始講，害怕時我們會想把每件事都保起來。但保費是每個月都要付的。",
};

const lineHook = {
  question: "保險買越多越安心嗎？",
  options: [
    { id: "yes", label: "是" },
    { id: "depends", label: "不一定" },
  ],
};

// --- Task A: 風險四格 ----------------------------------------------------------

const taskA: StationLesson = {
  stationId: 29,
  placement: "station",
  hook: lineHook,
  lessonCards: [
    {
      kind: "matrix",
      title: "處理風險的四種方法",
      xLabel: ["低", "高"],
      yLabel: ["低", "高"],
      axisTitles: { x: "發生機率", y: "損失金額" },
      // [low-x low-y, high-x low-y, low-x high-y, high-x high-y]
      cells: ["自己承擔", "想辦法降低", "轉給保險", "直接避開"],
    },
  ],
  task: {
    id: "baoxian.matrix.v1",
    kind: "baoxian_matrix_v1",
    title: "風險四格",
    brief: {
          from: PERSONA.baoxian,
          message: "生活裡到處都是風險。先把每件事放進最適合的處理方法。",
          learn: "風險可以避開、預防、轉移或自己承擔。",
          do: "把每個風險放進四格之一。",
          minutes: 6,
        },
    materials: [],
    steps: [
      {
        id: "s1",
        type: "sort",
        prompt: "每一件事，該用哪一種方法處理？",
        boxes: [
          { id: "retain", label: "自己承擔" },
          { id: "reduce", label: "想辦法降低" },
          { id: "transfer", label: "轉給保險" },
          { id: "avoid", label: "直接避開" },
        ],
        items: [
          {
            id: "phone",
            label: "手機螢幕摔破",
            box: "reduce",
            accept: ["retain"],
            explain: "買保護殼，摔到時比較不容易壞。自己承擔也可以。",
          },
          {
            id: "umbrella",
            label: "弄丟一把便宜的雨傘",
            box: "retain",
            explain: "損失很小，自己承擔就好，不用為它買保險。",
          },
          {
            id: "surgery",
            label: "住院開刀",
            box: "transfer",
            explain: "不常發生，但花費很大。這種最適合交給保險。",
          },
          {
            id: "helmet",
            label: "騎車不戴安全帽",
            box: "avoid",
            explain: "出事機率高，傷得又重。直接戴上安全帽，避開這個風險。",
          },
          {
            id: "liability",
            label: "撞傷別人要賠一大筆錢",
            box: "transfer",
            explain: "不常發生，但一賠就是一大筆。交給保險。",
          },
          {
            id: "drunk",
            label: "酒後騎車",
            box: "avoid",
            explain: "很容易出事，後果又重，還違法。唯一的方法是不要做。",
          },
          {
            id: "fire",
            label: "家裡失火",
            box: "transfer",
            explain: "很少發生，但損失很大。交給保險。",
          },
          {
            id: "cold",
            label: "感冒看醫生",
            box: "retain",
            accept: ["reduce"],
            explain: "健保已經幫你分擔很多了。",
          },
        ],
        explanation: "先看兩件事：損失大不大、發生機率高不高。大又少見的，才交給保險。",
      },
    ],
    passScore: 0.6,
  },
  reveal: revealFear,
  takeaway: {
    name: "大又少見才保險，小的自己扛",
    lines: [
      "損失小、少見：自己承擔",
      "損失小、常見：想辦法降低",
      "損失大、少見：轉給保險",
      "損失大、常見：直接避開",
    ],
  },
  minutes: 6,
  lifeGameTurn: true,
  doLine: "把生活裡的風險放進四格",
};

// --- Task B: 人身四大風險 (terminal) -------------------------------------------

const taskB: StationLesson = {
  stationId: 31,
  placement: "station",
  hook: {
    question: "你知道自己現在有哪些保險嗎？",
    options: [
      { id: "know", label: "知道" },
      { id: "parents", label: "爸媽有幫我買，但不清楚" },
      { id: "none", label: "好像沒有" },
    ],
  },
  lessonCards: [
    {
      kind: "compare",
      title: "四種人生風險",
      // Row i on the left pairs with row i on the right.
      left: {
        name: "人生風險",
        rows: [
          { label: "1", value: "走得太早" },
          { label: "2", value: "病得太重" },
          { label: "3", value: "傷殘需要照顧" },
          { label: "4", value: "活得太久錢不夠" },
        ],
      },
      right: {
        name: "對應的保險",
        rows: [
          { label: "1", value: "壽險" },
          { label: "2", value: "醫療險" },
          { label: "3", value: "失能險或長照險" },
          { label: "4", value: "年金險" },
        ],
      },
    },
  ],
  task: {
    id: "baoxian.fourrisks.v1",
    kind: "baoxian_fourrisks_v1",
    title: "人身四大風險",
    brief: {
          from: PERSONA.baoxian,
          message: "保險種類很多。先弄懂每一種在處理哪一種風險。",
          learn: "人身四大風險和對應的保險。",
          do: "把保險配對到風險，再回答一題。",
          minutes: 7,
        },
    materials: [],
    steps: [
      {
        id: "s1",
        type: "sort",
        prompt: "每個狀況，最對應哪一種保險？",
        boxes: [
          { id: "life", label: "壽險" },
          { id: "medical", label: "醫療險" },
          { id: "disability", label: "失能險或長照險" },
          { id: "annuity", label: "年金險" },
        ],
        items: [
          {
            id: "death",
            label: "家裡主要賺錢的人突然過世",
            box: "life",
            explain: "走得太早，家人少了收入。壽險留一筆錢給家人生活。",
          },
          {
            id: "surgery",
            label: "住院開刀花了很多錢",
            box: "medical",
            explain: "病得太重，醫療費用很高。這是醫療險在處理的風險。",
          },
          {
            id: "care",
            label: "車禍後不能工作，需要長期照顧",
            box: "disability",
            explain: "傷殘後沒辦法工作，還要人照顧。對應失能險或長照險。",
          },
          {
            id: "longevity",
            label: "退休後活到 95 歲，存款用完了",
            box: "annuity",
            explain: "活得比存款久。年金險會定期給你一筆錢。",
          },
        ],
        explanation: "一種保險對應一種風險：走得太早、病得太重、傷殘需要照顧、活得太久錢不夠。",
      },
      {
        id: "s2",
        type: "choice",
        prompt: "22 歲、單身、剛工作、沒有人靠你養，最先考慮哪種？",
        options: [
          { id: "a", label: "醫療險和意外險" },
          { id: "b", label: "壽險" },
          { id: "c", label: "年金險" },
          { id: "d", label: "全部都買" },
        ],
        correct: "a",
        reasons: [
          {
            id: "r1",
            label: "生病和意外是現在最可能遇到又最花錢的。沒有人靠你的收入生活，壽險可以晚點再說。",
          },
          { id: "r2", label: "壽險最重要，越早買越便宜。" },
          { id: "r3", label: "全部都買最安心。" },
        ],
        correctReason: "r1",
        explanation:
          "生病和意外是現在最可能遇到又最花錢的。沒有人靠你的收入生活，壽險可以晚點再說。",
      },
    ],
    passScore: 0.6,
  },
  reveal: revealFear,
  takeaway: {
    name: "先保會讓你破產的，再保會讓你不方便的",
    lines: [
      "走得太早：壽險",
      "病得太重：醫療險",
      "傷殘需要照顧：失能險或長照險",
      "活得太久錢不夠：年金險",
    ],
  },
  minutes: 7,
  lifeGameTurn: true,
  doLine: "把人生風險配對到保險",
};

export const content: LineContent = {
  slug: "baoxian",
  hook: lineHook,
  bias: "因為害怕而買",
  takeaway: { name: "風險四格", lines: ["大又少見才保險"] },
  unlocks: "醫療險、意外險、壽險",
  lessons: [taskA, taskB],
};

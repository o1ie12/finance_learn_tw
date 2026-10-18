/**
 * 消費線 (legacy slug 'qixin'). Copy from 04-CONTENT §2 and §5, pasted verbatim.
 *
 * Placement (lead): Task A → station 1, Task B → terminal.
 * 04 §1.2's money-cycle card lives on 職涯線 Task A instead (station 39 comes
 * first in the recommended order).
 *
 * Figures: salary and bills are 04 §5's own scenario (bills sum to 15,199).
 * 實發 is a ComputeRef (lib/lifeGame/payroll.ts). 60 × 22 = 1,320 and the
 * 1,990 / 990 sale are 04's own arithmetic. The company is fictional.
 */

import type { LineContent } from "@/lib/tasks/types";

const lineHook = {
  question: "早餐每天多加一杯 NT$60 的飲料，一個月是多少？",
  options: [
    { id: "no_calc", label: "不用算，小錢而已" },
    { id: "est", label: "大概一千多" },
    { id: "unknown", label: "不知道" },
  ],
};

const threeQuestions = {
  name: "花錢三問",
  lines: ["需要嗎？", "急嗎？", "付得起嗎？"],
};

export const content: LineContent = {
  slug: "qixin",
  hook: lineHook,
  bias: "錨定效應、跟別人比",
  takeaway: threeQuestions,
  unlocks: "調整帳單裡的彈性項目（餐費、日用品、交通）",
  lessons: [
    // --- Task A: 你的第一個月 (station 1) ----------------------------------------
    {
      stationId: 2,
      placement: "station",
      hook: lineHook,
      lessonCards: [
        {
          kind: "formula",
          title: "先存再花",
          formula: "收入 − 存錢 = 可以花的錢",
          example: "不是『收入 − 花掉的 = 剩下的才存』。月初就先存，剩下的才是你能花的。",
        },
        {
          kind: "compare",
          title: "兩種順序",
          left: { name: "脆弱的順序", rows: [{ label: "收入 → 花錢 → 剩下的才存", value: "" }] },
          right: { name: "穩的順序", rows: [{ label: "收入 → 先存 → 再花", value: "" }] },
        },
      ],
      task: {
        id: "qixin.firstmonth.v1",
        kind: "qixin_first_month_v1",
        title: "你的第一個月",
        brief: {
          role: "剛領到第一份薪水的你",
          situation: "月薪 NT$32,000。先存再花，看看這個月怎麼過。",
        },
        materials: [
          { kind: "payslip", data: { company: "晴天文具公司", month: "2026/08", gross: 32000 } },
          {
            kind: "billSheet",
            data: {
              title: "每月帳單（住家裡）",
              rows: [
                { item: "孝親費", amount: 3000 },
                { item: "餐費", amount: 9000 },
                { item: "交通", amount: 1200 },
                { item: "手機", amount: 499 },
                { item: "日用品", amount: 1500 },
              ],
            },
          },
        ],
        steps: [
          {
            id: "s1",
            type: "number",
            prompt: "實發多少？",
            answer: { fn: "netPay", gross: 32000 },
            unit: "NT$",
            explanation: "實發是月薪扣掉勞保和健保自付的部分，看薪資單最下面那一行。",
          },
          {
            id: "s2",
            type: "number",
            prompt: "繳完帳單，還剩多少？",
            answer: { fn: "netPayMinus", gross: 32000, minus: 15199 },
            unit: "NT$",
            explanation: "實發減掉帳單合計 NT$15,199。",
          },
          {
            id: "s3",
            type: "choice",
            prompt: "你打算月初先存多少？",
            options: [
              { id: "a", label: "0" },
              { id: "b", label: "收入的 10%" },
              { id: "c", label: "收入的 20%" },
              {
                id: "d",
                label: "收入的 50%",
                explain: "存很多很好，但要留夠生活費。存到月底不夠花，最後會用卡補，反而更糟。",
              },
            ],
            correct: "b",
            accept: ["c"],
            reasons: [
              { id: "r1", label: "先存一個固定比例，剩下的才花，比月底才存容易成功。" },
              { id: "r2", label: "月底剩多少再存多少就好。" },
              { id: "r3", label: "存越多越好，先存一半。" },
            ],
            correctReason: "r1",
            explanation: "先存一個固定比例，剩下的才花，比月底才存容易成功。",
          },
          {
            id: "s4",
            type: "choice",
            prompt: "早餐要不要每天加一杯 NT$60 的飲料？",
            options: [
              { id: "a", label: "加，才 60 而已" },
              { id: "b", label: "加，但先算一個月多少" },
              { id: "c", label: "不加" },
            ],
            correct: "b",
            reasons: [
              { id: "r1", label: "每天 60，一個月上班 22 天就是 NT$1,320。知道總數再決定。" },
              { id: "r2", label: "小錢不用算。" },
              { id: "r3", label: "花錢就是不好。" },
            ],
            correctReason: "r1",
            explanation: "每天 60，一個月上班 22 天就是 NT$1,320。知道總數再決定。",
          },
          {
            id: "s5",
            type: "choice",
            prompt: "同學約週末唱歌，一人 NT$800，你這週已經花超過預算。",
            options: [
              { id: "a", label: "去" },
              { id: "b", label: "不去" },
              { id: "c", label: "去，但下週少花 NT$800" },
            ],
            correct: "c",
            reasons: [
              { id: "r1", label: "社交也是生活的一部分，預算可以挪，但要從別的地方補回來。" },
              { id: "r2", label: "大家都去，不去很怪。" },
              { id: "r3", label: "存錢比朋友重要。" },
            ],
            correctReason: "r1",
            explanation: "社交也是生活的一部分，預算可以挪，但要從別的地方補回來。",
          },
        ],
        passScore: 0.6,
      },
      reveal: {
        bias: "跟別人比",
        byHookOption: {
          no_calc: "小錢最容易被忽略。單看一杯不貴，加起來就是一個月 NT$1,320。",
        },
        default: "我們很容易用『大家都這樣』來決定花不花。先知道自己的總數，再決定要不要跟。",
      },
      takeaway: threeQuestions,
      minutes: 10,
      lifeGameTurn: true,
      doLine: "用第一份薪水過一個月",
    },

    // --- Task B: 需要還是想要 (terminal) ------------------------------------------
    {
      stationId: 1,
      placement: "station",
      hook: {
        question: "原價 NT$1,990，特價 NT$990，你會買嗎？",
        options: [
          { id: "buy", label: "會，省了 1,000" },
          { id: "think", label: "先想需不需要" },
          { id: "skip", label: "不買" },
        ],
      },
      lessonCards: [
        {
          kind: "text",
          title: "特價的陷阱",
          body: "原價 NT$1,990，特價 NT$990，看起來省了 1,000。但如果本來就不需要，你其實是花了 990。",
        },
      ],
      task: {
        id: "qixin.needwant.v1",
        kind: "qixin_need_want_v1",
        title: "需要還是想要",
        brief: {
          role: "剛領到薪水的你",
          situation: "想買的東西很多，錢只有一份。先分清楚需要和想要。",
        },
        materials: [],
        steps: [
          {
            id: "s1",
            type: "sort",
            prompt: "把這些花費分成需要和想要。",
            boxes: [
              { id: "need", label: "需要" },
              { id: "want", label: "想要" },
            ],
            items: [
              { id: "i1", label: "房租或孝親費", box: "need", explain: "住的地方每個月都要付。" },
              {
                id: "i2",
                label: "每天的午餐",
                box: "need",
                accept: ["want"],
                explain: "吃飯是需要，吃多貴是想要。",
              },
              { id: "i3", label: "新出的手機殼", box: "want", explain: "舊的還能用，新的是想要。" },
              { id: "i4", label: "上班的交通費", box: "need", explain: "不付就到不了公司。" },
              { id: "i5", label: "第三雙球鞋", box: "want", explain: "已經有兩雙了。" },
              { id: "i6", label: "感冒看醫生", box: "need", explain: "健康不能省。" },
              { id: "i7", label: "串流平台第二個方案", box: "want", explain: "一個方案就夠看了。" },
              {
                id: "i8",
                label: "冬天的外套",
                box: "need",
                accept: ["want"],
                explain: "保暖是需要，買多貴的是想要。",
              },
            ],
            explanation: "需要是不付會影響生活的；想要是有了更開心，沒有也過得去。",
          },
          {
            id: "s2",
            type: "choice",
            prompt: "機車壞了要修 NT$3,000，這個月預算已經用完。",
            options: [
              { id: "a", label: "用緊急預備金" },
              { id: "b", label: "刷卡，下個月再說" },
              { id: "c", label: "跟家人借" },
            ],
            correct: "a",
            reasons: [
              { id: "r1", label: "緊急預備金就是為這種事存的。用完再慢慢補回來。" },
              { id: "r2", label: "刷卡比較方便。" },
              { id: "r3", label: "家人應該會幫忙。" },
            ],
            correctReason: "r1",
            explanation: "緊急預備金就是為這種事存的。用完再慢慢補回來。",
          },
        ],
        passScore: 0.6,
      },
      reveal: {
        bias: "錨定效應",
        default: "先看到原價，特價就顯得很便宜。這叫錨定：第一個數字變成你判斷的標準。",
      },
      takeaway: threeQuestions,
      minutes: 9,
      lifeGameTurn: true,
      doLine: "分清楚需要和想要",
    },
  ],
};

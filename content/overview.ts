/**
 * 04 §2 line overview for the dashboard's why-first layer. Duplicates each
 * line file's hook question and bias on purpose, so the dashboard does not
 * load every line's content.
 */
import type { LineSlug } from "@/lib/tasks/types";

export interface LineOverviewRow {
  slug: LineSlug;
  hook: string;
  bias: string;
  takeaway: string;
}

export const LINE_OVERVIEW: LineOverviewRow[] = [
  {
    slug: "zhiya",
    hook: "月薪多 NT$5,000 但要搬去台北，你會去嗎？",
    bias: "只看月薪",
    takeaway: "工作比較表：實拿、房租、通勤、成長",
  },
  {
    slug: "qixin",
    hook: "早餐每天多加一杯 NT$60 的飲料，一個月是多少？",
    bias: "錨定效應、跟別人比",
    takeaway: "花錢三問：需要嗎？急嗎？付得起嗎？",
  },
  {
    slug: "cunqian",
    hook: "現在拿 NT$1,000，或一年後拿 NT$1,100，你選哪個？",
    bias: "現在偏誤",
    takeaway: "月初先存：收入 − 存錢 = 可以花的錢",
  },
  {
    slug: "xinyong",
    hook: "卡費只繳最低應繳，算是有好好繳嗎？",
    bias: "最低應繳的錨定",
    takeaway: "借錢兩問：真的需要嗎？還得起嗎？",
  },
  {
    slug: "zhapian",
    hook: "接到電話說你涉及洗錢，要你保密配合，你會怎麼做？",
    bias: "急迫感、權威",
    takeaway: "不信、不理、不轉帳，打 165",
  },
  {
    slug: "touzi",
    hook: "股市一個月跌了 10%，你手上的 ETF 要賣嗎？",
    bias: "損失趨避、怕錯過、從眾",
    takeaway: "先管好錢，再讓錢長大",
  },
  {
    slug: "baoxian",
    hook: "保險買越多越安心嗎？",
    bias: "因為害怕而買",
    takeaway: "風險四格：大又少見才保險",
  },
  {
    slug: "zuwu",
    hook: "房東說『很多人在看，今天不簽就沒了』，你會簽嗎？",
    bias: "稀缺感",
    takeaway: "簽約前三查",
  },
  {
    slug: "xuedai",
    hook: "在學期間不用付利息，那借多一點也沒關係？",
    bias: "只看現在",
    takeaway: "先算畢業後每月要還多少",
  },
  {
    slug: "baoshui",
    hook: "五月收到退稅 NT$3,000，這是賺到的嗎？",
    bias: "心理帳戶",
    takeaway: "退稅是你多繳的錢",
  },
  {
    slug: "chuangye",
    hook: "店已經虧了三個月，投進去的錢不能白費，要繼續嗎？",
    bias: "沉沒成本",
    takeaway: "看未來，不看已經花掉的",
  },
  {
    slug: "caiwujuece",
    hook: "大家都說要買房，租房就是在幫房東繳房貸？",
    bias: "從眾、現狀偏誤",
    takeaway: "買房前三算：頭期款、月付比、預備金",
  },
];

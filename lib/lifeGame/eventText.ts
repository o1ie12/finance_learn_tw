/**
 * Life-game event cards, worded exactly as 04-CONTENT §14. `{name}` is the
 * character's name; other `{vars}` are filled from the event's numbers.
 * After every choice event, `teaches` is shown as the one-line lesson
 * (02 §6, the Teaches column).
 *
 * Two cards are not in §14 and were written for the build (report: decisions):
 * `guarantee_called` and `guarantee_released` (the guarantor follow-ups), and
 * `friend_repaid` / `friend_default` (the loan's due turn).
 */

export interface EventOptionText {
  id: string;
  label: string;
}

export interface EventText {
  title: string;
  text: string;
  options: EventOptionText[];
  teaches: string;
  /** Only shown when the matching line is done (詐騙線 highlights safe choices). */
  safeOptions?: string[];
}

export const EVENT_TEXT: Record<string, EventText> = {
  phone_break: {
    title: "手機螢幕摔破了",
    text: "{name} 下公車時手機掉在地上，螢幕裂了。修好要 NT$6,000。",
    options: [{ id: "pay", label: "付錢修" }],
    teaches: "小又常見的損失，自己付。這就是緊急預備金的用途。",
  },
  dental: {
    title: "牙齒要根管治療",
    text: "牙痛了一週，醫生說要做根管治療。健保給付後，自己還要付 NT$6,000。",
    options: [{ id: "pay", label: "付錢" }],
    teaches: "小又常見的損失，自己付。",
  },
  scooter_service: {
    title: "機車要保養了",
    text: "機油、輪胎、煞車皮一起換，NT$2,500。",
    options: [{ id: "pay", label: "付錢" }],
    teaches: "固定會來的開銷，應該排進預算。",
  },
  accident: {
    title: "騎車擦撞受傷",
    text: "下雨天路滑，{name} 擦撞受傷，醫藥費 NT$12,000。",
    options: [{ id: "pay", label: "處理" }],
    teaches: "意外是保險該處理的事。",
  },
  hospital: {
    title: "急性腸胃炎住院",
    text: "住院三天，費用 NT$30,000。",
    options: [{ id: "pay", label: "處理" }],
    teaches: "大又少見的損失，轉給保險。",
  },
  birthday: {
    title: "朋友生日聚餐",
    text: "好朋友生日，大家約吃燒肉，一人 NT$1,500。",
    options: [
      { id: "go", label: "去" },
      { id: "skip", label: "不去" },
    ],
    teaches: "社交花費是真的開銷，先排進計畫。",
  },
  concert: {
    title: "喜歡的歌手來台灣",
    text: "演唱會門票 NT$4,800，今晚開賣。",
    options: [
      { id: "buy", label: "買票" },
      { id: "skip", label: "不買" },
    ],
    teaches: "想要的東西，和你的目標比一比。",
  },
  japan_trip: {
    title: "同學都要去日本",
    text: "同學揪五天四夜去日本，一人約 NT$25,000。",
    options: [
      { id: "go", label: "跟" },
      { id: "skip", label: "不跟" },
      { id: "short", label: "只去三天（NT$15,000）" },
    ],
    teaches: "同學都去，我要不要跟？先看自己的數字。",
  },
  new_phone: {
    title: "新手機上市",
    text: "新手機 NT$32,000，可以分 12 期。",
    options: [
      { id: "cash", label: "現金買" },
      { id: "installment", label: "分 12 期" },
      { id: "wait", label: "先不買" },
    ],
    teaches: "分期還是在花錢，只是分成好幾個月付。",
  },
  scam_msg: {
    title: "一則奇怪的簡訊",
    text: "「您的包裹地址有誤，請點此更新：https://」",
    options: [
      { id: "click", label: "點連結" },
      { id: "ignore", label: "不理它" },
      { id: "call165", label: "打 165 查證" },
    ],
    teaches: "不信、不理、不轉帳。有懷疑就打 165。",
    safeOptions: ["ignore", "call165"],
  },
  friend_loan: {
    title: "朋友想借錢",
    text: "同學想跟你借 NT$5,000。你知道：{clue1}；{clue2}。",
    options: [
      { id: "lend", label: "借" },
      { id: "half", label: "借一半" },
      { id: "no", label: "不借" },
    ],
    teaches: "借錢兩問：真的需要嗎？他還得起嗎？拒絕也需要勇氣。",
  },
  guarantor: {
    title: "學長請你當保證人",
    text: "學長要貸款，請你當保證人：「只是簽個名而已。」",
    options: [
      { id: "yes", label: "答應" },
      { id: "no", label: "拒絕" },
    ],
    teaches: "當保證人，等於答應替別人背債。",
  },
  family_help: {
    title: "家人需要幫忙",
    text: "家裡這個月比較緊，媽媽問你能不能幫忙。",
    options: [
      { id: "give5000", label: "給 NT$5,000" },
      { id: "give2000", label: "給 NT$2,000" },
      { id: "no", label: "這次沒辦法" },
    ],
    teaches: "幫助家人也是錢的用途，量力而為。",
  },
  rent_up: {
    title: "房東要漲房租",
    text: "房東說下個月起每月漲 NT$1,000。",
    options: [
      { id: "accept", label: "接受" },
      { id: "move", label: "搬家（搬家費 NT$6,000）" },
    ],
    teaches: "房租是最大的帳單，漲一點，一年就差很多。",
  },
  invoice: {
    title: "中發票了",
    text: "對中了一張發票，NT$200。",
    options: [{ id: "take", label: "收下" }],
    teaches: "小確幸很好，但不會改變大局。",
  },
  course_sale: {
    title: "想學的課程特價",
    text: "一直想學的線上課程特價 NT$1,990。",
    options: [
      { id: "buy", label: "買" },
      { id: "skip", label: "不買" },
    ],
    teaches: "投資自己，也是一種投資。",
  },
  layoff: {
    title: "公司縮編",
    text: "公司裁員，{name} 被資遣了。接下來三個月沒有薪水，可以申請失業給付。",
    options: [{ id: "ok", label: "申請失業給付，開始找工作" }],
    teaches: "緊急預備金，就是為這種月份存的。",
  },
  market_drop: {
    title: "台股單月重挫",
    text: "新聞說台股這個月跌了 {pct}%。你的 ETF 現在值 NT${value}。",
    options: [
      { id: "sellAll", label: "全部賣出" },
      { id: "hold", label: "繼續持有" },
      { id: "add", label: "加碼" },
    ],
    teaches: "大跌時賣掉，帳面虧損就變成真的虧損。",
  },
  bonus: {
    title: "年終獎金",
    text: "年終發下來了：NT${amount}！",
    options: [
      { id: "save", label: "全部存起來" },
      { id: "invest", label: "拿去投資" },
      { id: "half", label: "花一半存一半" },
      { id: "spend", label: "全部花掉" },
    ],
    teaches: "意外的一筆錢，最能看出你的計畫穩不穩。",
  },
  raise: {
    title: "加薪了",
    text: "年度調薪，月薪變成 NT${salary}。",
    options: [{ id: "ok", label: "太好了" }],
    teaches: "能力變強，收入才會跟著長。",
  },
  tax_notice: {
    title: "五月報稅",
    text: "去年的所得稅算好了：{result}。",
    options: [{ id: "ok", label: "好" }],
    teaches: "稅是一年算一次的。",
  },
  guarantee_called: {
    title: "學長沒有還錢",
    text: "學長的貸款繳不出來，銀行要你這個保證人還 NT${amount}。之後每個月至少要還 NT$5,000。",
    options: [{ id: "ok", label: "面對它" }],
    teaches: "保證人等於替別人背債。",
  },
  guarantee_released: {
    title: "學長還清貸款了",
    text: "學長的貸款順利繳完，你的保證責任結束了。",
    options: [{ id: "ok", label: "鬆一口氣" }],
    teaches: "這次沒事，不代表下次也沒事。",
  },
  friend_repaid: {
    title: "朋友還錢了",
    text: "上次借出去的 NT${amount}，他準時還你了。",
    options: [{ id: "ok", label: "收下" }],
    teaches: "借之前先想清楚，他還得起嗎？",
  },
  friend_default: {
    title: "朋友沒有還錢",
    text: "說好這個月還的 NT${amount}，他一直說再等等。這筆錢大概要不回來了。",
    options: [{ id: "ok", label: "算了" }],
    teaches: "借出去的錢，要有收不回來的心理準備。",
  },
};

/** Friend-loan clues (04 §14). Repay chance: two good 80%, one good 50%, none 15%. */
export const FRIEND_CLUES = {
  good: ["他有固定打工", "上次跟你借的 500 隔天就還了", "這筆錢是要繳學費"],
  bad: ["他還欠別人錢沒還", "他說要買限量球鞋", "他上個月才換新手機"],
} as const;
export const FRIEND_REPAY_CHANCE = [0.15, 0.5, 0.8] as const;

/** Fill `{var}` placeholders. Unknown vars are left as written. */
export function fillText(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) =>
    k in vars ? (typeof vars[k] === "number" ? (vars[k] as number).toLocaleString("en-US") : String(vars[k])) : m,
  );
}

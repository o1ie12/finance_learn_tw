import type { MoveId } from "./types";

/**
 * One line of what each card move does and one line of its risk (01 §6.4),
 * shared by the turn's 行動 step and the 行動 tab (06 E8.7). Costs depend on
 * the engine's constants and the save, so each screen builds its own.
 */
export const MOVE_TEXT: Partial<Record<MoveId, { does: string; risk: string }>> = {
  demand: { does: "把現金存進活存，隨時可以領出來。", risk: "利率低，錢長得慢。" },
  timeDeposit: { does: "存一年期定存，利率比活存高，每月領利息。", risk: "提前解約，利息會變少。" },
  housingFund: { does: "為以後租屋或買房專門存的錢。", risk: "專款專用，急用時不方便動。" },
  etfBroad: { does: "一次買進台灣市值最大的一籃子公司。", risk: "價格會漲也會跌，跌的時候別急著賣。" },
  etfDividend: { does: "買進配息比較多的一籃子公司。", risk: "配息多，不代表總報酬比較高。" },
  etfMonthly: { does: "每個月自動買市值型 ETF，不用自己挑時間。", risk: "現金不夠的月份會扣不到款。" },
  etfSell: { does: "用這個月的價格賣掉持有的 ETF。", risk: "跌的時候賣，帳面虧損就變成真的虧損。" },
  cardRepay: { does: "比最低應繳多還一點，少付利息。", risk: "只繳最低，剩下的會一直生利息。" },
  insurance: { does: "用小小的保費，換大筆意外開銷的保障。", risk: "小又常見的損失，保險不會賠。" },
  skill: { does: "上課學一項技能，學完加薪的機會變大。", risk: "要花錢也要花時間，加薪不是保證。" },
  give: { does: "把錢給需要的人或團體。錢不會回來，但心情會好一點。", risk: "量力而為，先顧好自己的帳單。" },
  sideBusiness: { does: "花一筆開辦費，開始經營副業。", risk: "每月收入不固定，也可能虧錢。" },
  moveOut: { does: "自己租房子，下個月搬。", risk: "房租是最大的帳單，搬了就很難降下來。" },
  editBills: { does: "調整餐費、日用品和交通方式，從下個月的帳單開始。", risk: "省太兇很難撐久，訂一個做得到的數字。" },
};

/** The moves that are cards in the 行動 step, in the order shown. */
export const CARD_MOVES: MoveId[] = [
  "demand",
  "timeDeposit",
  "housingFund",
  "etfBroad",
  "etfDividend",
  "etfMonthly",
  "etfSell",
  "cardRepay",
  "insurance",
  "skill",
  "give",
  "sideBusiness",
  "moveOut",
  "editBills",
];

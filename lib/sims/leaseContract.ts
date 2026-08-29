/**
 * 契約找碴 (租屋線 terminal) — a timed find-the-bad-clause game over a
 * fictional rental contract, not a financial-math simulation. Bad clauses
 * are modeled on 內政部住宅租賃定型化契約應記載及不得記載事項 (illustrative,
 * not a legal document) — 8 of 14 clauses violate it or are unreasonably
 * one-sided; the other 6 are ordinary, legal terms included for contrast.
 */

export interface LeaseClause {
  id: string;
  number: number;
  text: string;
  isBad: boolean;
  explain: string;
}

export const LEASE_CLAUSES: LeaseClause[] = [
  {
    id: "c1",
    number: 1,
    text: "租賃期間為自民國 115 年 9 月 1 日起至 116 年 8 月 31 日止，共一年。",
    isBad: false,
    explain: "標準的租期條款，沒有問題。",
  },
  {
    id: "c2",
    number: 2,
    text: "每月租金為新臺幣 15,000 元整，於每月 5 日前以轉帳方式給付。",
    isBad: false,
    explain: "標準的租金給付條款，金額與方式都清楚，沒有問題。",
  },
  {
    id: "c3",
    number: 3,
    text: "押金為新臺幣 75,000 元整（即 5 個月租金），於簽約時一次付清。",
    isBad: true,
    explain: "依內政部定型化契約規定，押金不得超過 2 個月租金。這裡是 5 個月，明顯違法。",
  },
  {
    id: "c4",
    number: 4,
    text: "乙方（房客）如依法申報租金支出特別扣除額，甲方（房東）得於次期調漲租金作為補償。",
    isBad: true,
    explain: "租客依法有權利申報租金扣除額，房東不能用漲租金的方式變相禁止或報復。",
  },
  {
    id: "c5",
    number: 5,
    text: "乙方於租賃期間，無論任何情況，均不得終止租約，亦不得請求返還已繳付之押金。",
    isBad: true,
    explain: "這牴觸「不得記載事項」——房客不得預先拋棄終止租約的權利，這種條款即使簽名也不當然有效。",
  },
  {
    id: "c6",
    number: 6,
    text: "非因乙方使用不當所致之正常修繕（如老舊管線漏水），由甲方負責處理。",
    isBad: false,
    explain: "這是法律預設的合理分工：非人為因素的正常損壞，原則上由房東負責修繕。",
  },
  {
    id: "c7",
    number: 7,
    text: "房屋因自然使用產生之磨損（如油漆自然脫落），一律由乙方自行負擔修繕費用。",
    isBad: true,
    explain: "正常使用造成的自然磨損，責任通常在房東，把它全部轉嫁給房客是不合理的一方條款。",
  },
  {
    id: "c8",
    number: 8,
    text: "乙方遷出時應將房屋內部回復至簽約時嶄新狀態，否則押金不予退還，且不論實際損壞程度。",
    isBad: true,
    explain: "退租時只能就實際超出正常使用磨損範圍的損壞扣除費用，要求「恢復全新狀態」否則沒收全部押金並不合理。",
  },
  {
    id: "c9",
    number: 9,
    text: "乙方遷出時應結清水電、瓦斯等已使用之費用。",
    isBad: false,
    explain: "合理且常見的條款，遷出時結清自己已使用的水電瓦斯費用沒有問題。",
  },
  {
    id: "c10",
    number: 10,
    text: "乙方得於租期屆滿前 1 個月，以書面通知甲方是否續租。",
    isBad: false,
    explain: "標準的續租通知條款，給雙方合理的緩衝時間，沒有問題。",
  },
  {
    id: "c11",
    number: 11,
    text: "乙方若遲延給付租金超過 3 日，除應繳納原租金外，另按日加計 5% 違約金，金額不設上限。",
    isBad: true,
    explain: "違約金過高且不設上限，遠超過合理填補房東損失的範圍，屬於顯失公平的一方條款，法院通常會酌減。",
  },
  {
    id: "c12",
    number: 12,
    text: "甲方得不經任何通知，隨時進入租賃住宅檢查屋況。",
    isBad: true,
    explain: "房客有居住安寧的權利，房東進入應事先通知並約定時間，「不經通知隨時進入」是不合理的一方條款。",
  },
  {
    id: "c13",
    number: 13,
    text: "乙方非經甲方書面同意，不得於本租賃住宅辦理戶籍登記。",
    isBad: true,
    explain: "限制房客辦理戶籍登記，牴觸內政部定型化契約的「不得記載事項」，即使寫入合約也不當然有效。",
  },
  {
    id: "c14",
    number: 14,
    text: "本契約如有爭議，雙方得向房屋所在地之直轄市、縣（市）消費者保護官或調解委員會申請調解。",
    isBad: false,
    explain: "提供正常、雙方都能使用的爭議處理管道，是合理且常見的條款。",
  },
];

export interface LeaseOutcome {
  total: number;
  totalBad: number; // how many clauses are actually bad
  correctFlags: number; // bad clauses the student correctly flagged
  missed: LeaseClause[]; // bad clauses the student didn't flag
  falseFlags: LeaseClause[]; // good clauses the student wrongly flagged
}

/** flagged: set of clause ids the student marked as a problem. */
export function computeLease(flagged: string[]): LeaseOutcome {
  const flaggedSet = new Set(flagged);
  const bad = LEASE_CLAUSES.filter((c) => c.isBad);
  const missed = bad.filter((c) => !flaggedSet.has(c.id));
  const correctFlags = bad.length - missed.length;
  const falseFlags = LEASE_CLAUSES.filter((c) => !c.isBad && flaggedSet.has(c.id));

  return {
    total: LEASE_CLAUSES.length,
    totalBad: bad.length,
    correctFlags,
    missed,
    falseFlags,
  };
}

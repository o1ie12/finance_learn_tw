import type { InterestId } from "@/lib/studentProfile";

/**
 * Career paths per interest bucket, and the income shape each one produces.
 *
 * EVERY FIGURE HERE IS A PLACEHOLDER. Real time-to-first-income, income
 * ranges and training lengths need Taiwan labour-market or job-market data,
 * which is a sourcing task and is not blocked on SFI or FINLEA — SFI's
 * materials are securities education and do not cover careers at all.
 *
 * Two rules follow from that, and both are deliberate:
 *
 * Figures are round and obviously illustrative (約 NT$30,000), never
 * precise-looking (NT$38,200). Specific-looking precision is exactly what
 * makes a placeholder dangerous — it reads as verified to a student, a
 * teacher, or a partner in a demo.
 *
 * Every number lives in this one file, so replacing them later is a data swap
 * rather than a hunt through components. Anything qualitative — how long
 * preparation takes, how steep the growth is — is written as language rather
 * than invented numbers, because it does not need a number to make sense.
 *
 * Paths differ in SHAPE, not in worth. Nothing here should read as ranked:
 * one path trades a slow start for a steeper curve, another starts earning
 * immediately and climbs gently. That is the actual lesson.
 */

/** Shown wherever a placeholder figure is displayed. Never omit it. */
export const PLACEHOLDER_TAG = "範例數據，待確認";

export interface CareerPath {
  id: string;
  name: string;
  /** One line on what the work actually is. */
  blurb: string;
  /** Qualitative, not a number — no invented "4 years". */
  preparation: string;
  /** Months of little or no income while training or studying. */
  rampMonths: number;
  /** Monthly income once earning begins (NT$, illustrative). */
  startingIncome: number;
  /** Illustrative monthly income after roughly five years. */
  laterIncome: number;
  /** What this path trades away, stated plainly. */
  tradeoff: string;
}

export const CAREER_PATHS: Record<InterestId, CareerPath[]> = {
  art: [
    {
      id: "art-designer",
      name: "平面／UI 設計",
      blurb: "替品牌、產品或介面做視覺設計，多半從接案或小型工作室開始。",
      preparation: "需要一段時間累積作品集，學歷不是唯一門檻。",
      rampMonths: 6,
      startingIncome: 32000,
      laterIncome: 55000,
      tradeoff: "起步收入不高，但作品累積後議價空間大。",
    },
    {
      id: "art-teacher",
      name: "美術教育",
      blurb: "在學校或才藝班教學，收入穩定、時間規律。",
      preparation: "通常需要教育相關資格，準備期較長。",
      rampMonths: 18,
      startingIncome: 38000,
      laterIncome: 52000,
      tradeoff: "準備期長，但之後收入與工時都相對可預期。",
    },
  ],
  tech: [
    {
      id: "tech-dev",
      name: "軟體開發",
      blurb: "寫程式做網站、App 或系統，產業需求長期穩定。",
      preparation: "可以自學或透過學校養成，需要持續更新技能。",
      rampMonths: 12,
      startingIncome: 45000,
      laterIncome: 80000,
      tradeoff: "學習曲線陡，但收入成長幅度在這幾條路裡最明顯。",
    },
    {
      id: "tech-support",
      name: "資訊維運／技術支援",
      blurb: "維護公司的電腦、網路與系統，是很多人進入科技業的入口。",
      preparation: "入門門檻較低，可以邊做邊學。",
      rampMonths: 3,
      startingIncome: 33000,
      laterIncome: 50000,
      tradeoff: "很快就能開始賺錢，但要主動進修才會有大幅成長。",
    },
  ],
  business: [
    {
      id: "biz-marketing",
      name: "行銷企劃",
      blurb: "規劃品牌與產品怎麼被看見，從社群到通路都算。",
      preparation: "多半從助理做起，實務經驗比證照重要。",
      rampMonths: 6,
      startingIncome: 34000,
      laterIncome: 60000,
      tradeoff: "初期薪水普通，成果好壞很看能不能被量化。",
    },
    {
      id: "biz-sales",
      name: "業務",
      blurb: "直接面對客戶談成交易，收入通常由底薪加獎金組成。",
      preparation: "入門快，但需要抗壓與人際能力。",
      rampMonths: 2,
      startingIncome: 30000,
      laterIncome: 70000,
      tradeoff: "收入上下限都最大，穩定度最低。",
    },
    {
      id: "biz-accounting",
      name: "會計／財務",
      blurb: "處理公司的帳務、報稅與資金規劃。",
      preparation: "需要相關科系或證照，準備期明確。",
      rampMonths: 12,
      startingIncome: 36000,
      laterIncome: 58000,
      tradeoff: "路徑清楚、變動小，成長也相對平緩。",
    },
  ],
  service: [
    {
      id: "svc-hospitality",
      name: "餐旅服務",
      blurb: "餐廳、飯店或旅遊業的第一線工作。",
      preparation: "很快能上手，多數從基層做起。",
      rampMonths: 1,
      startingIncome: 30000,
      laterIncome: 45000,
      tradeoff: "馬上有收入，但工時不規律，成長靠升管理職。",
    },
    {
      id: "svc-care",
      name: "照顧服務",
      blurb: "長照、護理輔助等工作，需求隨高齡化持續上升。",
      preparation: "需要考取照服員等資格，準備期不長。",
      rampMonths: 4,
      startingIncome: 34000,
      laterIncome: 48000,
      tradeoff: "需求穩定，但體力與情緒負荷高。",
    },
  ],
  vocational: [
    {
      id: "voc-tech",
      name: "技術工（水電、機械等）",
      blurb: "實作導向的技術工作，缺工狀況下議價能力不差。",
      preparation: "以學徒或技職體系養成，邊做邊學。",
      rampMonths: 6,
      startingIncome: 35000,
      laterIncome: 65000,
      tradeoff: "累積年資與證照後收入不低，但對體力有要求。",
    },
    {
      id: "voc-own",
      name: "自己接案／開店",
      blurb: "技術成熟後自己承接工作或開業。",
      preparation: "要先有技術與客源，準備期最長。",
      rampMonths: 24,
      startingIncome: 28000,
      laterIncome: 75000,
      tradeoff: "前期最辛苦、收入最不穩，長期天花板也最高。",
    },
  ],
};

export function pathsForInterest(interest: InterestId): CareerPath[] {
  return CAREER_PATHS[interest] ?? [];
}

export function findPath(id: string): CareerPath | undefined {
  return Object.values(CAREER_PATHS)
    .flat()
    .find((p) => p.id === id);
}

export function isCareerPathId(v: unknown): v is string {
  return typeof v === "string" && findPath(v) !== undefined;
}

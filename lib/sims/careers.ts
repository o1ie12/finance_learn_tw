import type { InterestId } from "@/lib/studentProfile";

/**
 * Career paths per interest bucket, and the income shape each one produces.
 *
 * Figures are no longer uniformly invented, and that is exactly why sourcing
 * is now a field rather than one banner over the whole file. Three tiers, and
 * a student is told which one they are looking at:
 *
 *   official    — government statistics (勞動部). The only tier that earns
 *                 the right to drop the 待確認 caveat.
 *   jobboard    — 104 / 1111 / 比薪水 aggregates and industry reporting.
 *                 Real and current, but self-reported, so it keeps the
 *                 caveat until someone decides that bar is cleared. That is
 *                 a call about evidence quality, not a code change.
 *   placeholder — still invented. Round and obviously illustrative
 *                 (約 NT$30,000), never precise-looking (NT$38,200),
 *                 because specific-looking precision is what makes a
 *                 placeholder dangerous: it reads as verified to a student,
 *                 a teacher, or a partner in a demo.
 *
 * `partial` exists for the case that actually turned up: a path whose
 * STARTING figure is government-sourced while its five-year figure is still
 * an estimate. Marking that path simply "official" would launder the
 * estimate into a statistic, so it carries a narrowed caveat naming which
 * number is still unconfirmed.
 *
 * Paths differ in SHAPE, not in worth. Nothing here should read as ranked:
 * one path trades a slow start for a steeper curve, another starts earning
 * immediately and climbs gently. That is the actual lesson.
 */

/** Shown wherever a figure is not confirmed. Never omit it. */
export const PLACEHOLDER_TAG = "範例數據，待確認";

export type CareerSourcing =
  | { tier: "placeholder" }
  | {
      tier: "official" | "jobboard";
      /** Named publisher, shown to the student. */
      source: string;
      /** Set when a figure shown for this path is NOT from that source. */
      partial?: string;
    };

export interface CareerPath {
  id: string;
  name: string;
  /** One line on what the work actually is. */
  blurb: string;
  /** Qualitative, not a number — no invented "4 years". */
  preparation: string;
  /** Months of little or no income while training or studying. */
  rampMonths: number;
  /** Monthly income once earning begins (NT$). */
  startingIncome: number;
  /** Monthly income after roughly five years. */
  laterIncome: number;
  /** What this path trades away, stated plainly. */
  tradeoff: string;
  sourcing: CareerSourcing;
}

export const CAREER_PATHS: Record<InterestId, CareerPath[]> = {
  art: [
    // Split from a single 平面／UI 設計 path, because the two tracks produce
    // genuinely different outcomes — entry NT$30,000 against NT$49,000, and
    // a flat ceiling against a rising one. Collapsing them into one number
    // would hide the single most useful thing a student could learn here.
    {
      id: "art-designer",
      name: "平面設計",
      blurb: "替品牌、出版或通路做視覺設計，多半從助理或小型工作室開始。",
      preparation: "需要一段時間累積作品集，學歷不是唯一門檻。",
      rampMonths: 6,
      startingIncome: 30000,
      laterIncome: 39000,
      tradeoff:
        "入門門檻相對低，但天花板也低：傳統設計職做到十年，薪資成長幅度有限，全職平均約 NT$39,000。",
      sourcing: { tier: "jobboard", source: "比薪水資料庫（經理人整理）" },
    },
    {
      id: "art-ui",
      name: "UI／UX 設計",
      blurb: "設計 App 與網站的介面和使用流程，實際上屬於科技業的一環。",
      preparation: "一樣靠作品集，但要另外練工具與流程，可自學或轉職進入。",
      rampMonths: 9,
      startingIncome: 49000,
      laterIncome: 61000,
      tradeoff:
        "起薪就高於全台中位數（約 NT$38,400）；再往 UX 走，同樣年資約到 NT$71,000。代價是要一直跟著產品與工具更新。",
      sourcing: { tier: "jobboard", source: "104 人力銀行（RAR 設計攻略整理）" },
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
      sourcing: { tier: "placeholder" },
    },
  ],
  tech: [
    {
      id: "tech-dev",
      name: "軟體開發",
      blurb: "寫程式做網站、App 或系統，產業需求長期穩定。",
      preparation:
        "政府統計的這個起薪是「研究所學歷、資訊／通訊業」的新鮮人水準，準備期相應較長。",
      rampMonths: 12,
      startingIncome: 61000,
      laterIncome: 80000,
      tradeoff:
        "資訊／通訊業是政府調查裡初任薪資最高的一類。代價是學習曲線陡，而且要持續更新技能才跟得上。",
      sourcing: {
        tier: "official",
        source: "勞動部 114 年初任人員薪資統計",
        partial: "五年後的數字與準備期仍為推估",
      },
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
      sourcing: { tier: "placeholder" },
    },
  ],
  business: [
    {
      id: "biz-marketing",
      name: "行銷企劃",
      blurb: "規劃品牌與產品怎麼被看見，從社群到通路都算。",
      preparation: "多半從助理做起，實務經驗比證照重要。",
      rampMonths: 6,
      startingIncome: 35000,
      laterIncome: 75000,
      tradeoff:
        "保障的底薪不高，有時還低於一般新鮮人水準；但做到經理後，年終與績效獎金可能讓實拿再多出約五成。這條路的重點不是穩定成長，而是有多少收入是浮動的。",
      sourcing: {
        tier: "jobboard",
        source: "104／1111 職缺與產業薪資報告",
      },
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
      sourcing: { tier: "placeholder" },
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
      sourcing: { tier: "placeholder" },
    },
  ],
  service: [
    {
      id: "svc-hospitality",
      name: "餐旅服務",
      blurb: "餐廳、飯店或連鎖通路的第一線工作，也是管理職的入口。",
      preparation: "很快能上手，多數從基層做起，不需要特定學歷。",
      rampMonths: 1,
      startingIncome: 34000,
      laterIncome: 60000,
      tradeoff:
        "馬上有收入，升遷也快：儲備幹部起薪約 NT$40,000–46,000，做到店長後，頂尖連鎖的平均可到約 NT$90,000。代價是工時不規律，成長幾乎完全綁在升不升管理職。",
      sourcing: {
        tier: "jobboard",
        source: "全家、王品集團徵才公告與產業報導",
      },
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
      sourcing: { tier: "placeholder" },
    },
  ],
  vocational: [
    {
      id: "voc-tech",
      name: "技術工（水電、機械等）",
      blurb: "實作導向的技術工作，缺工狀況下議價能力不差。",
      preparation: "以學徒或技職體系養成，邊做邊學，不用先讀好幾年。",
      rampMonths: 3,
      startingIncome: 35000,
      laterIncome: 60000,
      tradeoff:
        "幾乎不用先花好幾年不賺錢：學徒約 NT$30,000–40,000，幾年後成為熟手約 NT$50,000–70,000。代價是對體力的要求，技能也只能在現場累積。",
      sourcing: {
        tier: "jobboard",
        source: "104／1111 職缺與技術產業報導",
      },
    },
    {
      id: "voc-own",
      name: "自己接案／開店",
      blurb: "技術成熟、拿到證照後自己承接工作或開業。",
      preparation: "要先有技術、證照與客源，準備期最長。",
      rampMonths: 24,
      startingIncome: 40000,
      laterIncome: 90000,
      tradeoff:
        "前期最辛苦、收入最不穩；但拿到證照、自己接案之後，月收入約 NT$80,000–100,000 以上。天花板最高，也最晚才看得到。",
      sourcing: {
        tier: "jobboard",
        source: "104／1111 職缺與技術產業報導",
      },
    },
  ],
};

/**
 * Short chip text, or null when every figure this path shows is from
 * official statistics. Kept as one function so the rule lives in one place
 * rather than being re-derived in each component.
 */
export function caveatFor(path: CareerPath): string | null {
  const s = path.sourcing;
  if (s.tier === "placeholder") return PLACEHOLDER_TAG;
  if (s.partial) return "部分數字待確認";
  if (s.tier === "jobboard") return PLACEHOLDER_TAG;
  return null;
}

/**
 * The full attribution sentence shown under the figures.
 *
 * Written here rather than assembled in the component, because each tier
 * needs a genuinely different sentence — "來自 104" and "來自勞動部" carry
 * different weight, and gluing a source name onto a generic caveat produces
 * the sort of two-fragment line that tells a student nothing about which
 * part is uncertain.
 */
export function sourceNote(path: CareerPath): string {
  const s = path.sourcing;
  if (s.tier === "placeholder") {
    return "這條路的薪資與準備期還沒有資料來源，是示意用的範例數據。";
  }
  if (s.tier === "official") {
    return s.partial
      ? `起薪來自${s.source}，屬於官方統計；${s.partial}。`
      : `數字來自${s.source}，屬於官方統計。`;
  }
  return `數字來自${s.source}，是求職網站彙整的自填薪資，不是官方統計，尚待查證。`;
}

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

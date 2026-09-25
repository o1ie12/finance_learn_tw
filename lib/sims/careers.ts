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
      /**
       * What KIND of official source. A published statistic and a binding
       * rule are both government-grade but are not the same claim, and
       * calling a legal minimum a "統計" would be quietly wrong. Only
       * meaningful for the official tier; defaults to a statistic.
       */
      basis?: "statistic" | "regulation";
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
      blurb: "在美術教室或才藝班教小朋友畫畫，收入穩定、時間規律。",
      preparation: "要有作品與帶班能力，不一定需要教師證。",
      rampMonths: 6,
      startingIncome: 43000,
      laterIncome: 48000,
      tradeoff:
        "起薪是底薪加上依招生人數計算的獎金，所以收入會隨著自己帶的學生變多而成長，約到 NT$46,000–50,000 以上。跟業務一樣是「跟著人脈長」的收入結構，差別在這條路有底薪當地板，不是純抽成。",
      sourcing: {
        tier: "jobboard",
        source: "518 人力銀行職缺（散步去美術教室，2025 年 4 月）",
      },
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
      preparation:
        "入門門檻比開發低，可以邊做邊學，之後往系統管理或 DevOps 發展。",
      rampMonths: 3,
      startingIncome: 40000,
      laterIncome: 70000,
      tradeoff:
        "這裡的數字要打個折扣看：NT$40,000 與 NT$70,000 是「初階／中高階軟體職缺」的薪資，不是維運與技術支援這個職稱本身的統計。支援與維運普遍被描述成比開發更好進入的入口，起薪通常低於上面這個數字，之後才隨著轉往系統或 DevOps 成長。這條路是所有路徑裡資料與職稱吻合度最低的一條。",
      sourcing: {
        tier: "jobboard",
        source: "104 人力銀行彙整資料（ALPHA Camp 產業分析）",
      },
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
      // Re-scoped from a generic 業務 to 房仲, because commission-based sales
      // and the salaried 行銷企劃 already in this bucket are different
      // animals, and only a concrete role has figures worth sourcing. The id
      // is unchanged: it is identity, and no stored careerPathId should be
      // orphaned by a change of example.
      id: "biz-sales",
      name: "房仲（不動產經紀）",
      blurb: "帶看、談價、成交，收入由底薪加上成交抽成組成。",
      preparation: "考營業員證照後就能開始跑，入門快。",
      rampMonths: 1,
      startingIncome: 25000,
      laterIncome: 85000,
      tradeoff:
        "前三個月幾乎只有底薪，大約 NT$20,000–30,000，而且一件都沒成交是正常的，不是失敗。第一件成交通常落在第四到第六個月，收入會跳到 NT$85,000 上下；做出回頭客與轉介名單後，好的月份可以到 NT$180,000 以上。但波動才是這條路真正的特徵：旺的月份一筆佣金就破 NT$300,000，淡的月份就只有底薪。這裡寫的是里程碑，不是每個月都拿得到的平均。",
      sourcing: {
        tier: "jobboard",
        source: "104 人力銀行與信義／永慶／住商徵才頁（職涯發展分析整理）",
      },
    },
    {
      id: "biz-accounting",
      name: "會計／財務",
      blurb: "處理公司的帳務、報稅與資金規劃。",
      preparation: "需要相關科系，真正的分水嶺是有沒有考到會計師執照。",
      rampMonths: 12,
      startingIncome: 30000,
      laterIncome: 75000,
      tradeoff:
        "這條路的關鍵不是年資，是執照。沒有執照的一般會計工作從 NT$30,000 起跳；進四大會計師事務所，新人中位數約 NT$40,000–45,000；考到會計師之後是 NT$48,000–100,000，中位數約 NT$75,000。在大型事務所走到管理職年薪約 NT$140 萬，合夥人平均約 NT$440 萬。其他路是熬年資慢慢往上，這條路是一張證照把天花板整個換掉。",
      sourcing: {
        tier: "jobboard",
        source: "比薪水 2026 四大分析、三民輔考會計師薪資、itrustcpas 四大薪酬整理",
      },
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
      blurb: "長照、居家照顧與護理輔助，需求隨高齡化持續上升。",
      preparation: "上完照服員訓練課程即可，滿 16 歲就能考，門檻是所有路裡最低的。",
      rampMonths: 3,
      // The floor is regulation, not an estimate: 衛福部 sets it. The upside
      // is job-board data. They are tagged separately below rather than
      // averaged into one number with one tag, because "the government
      // guarantees this" and "postings suggest this" are different kinds of
      // claim and a student should be able to tell which is which.
      startingIncome: 32000,
      laterIncome: 50000,
      tradeoff:
        "這條路有一個別條路沒有的東西：法定的收入地板。衛福部長照 2.0 規定全職居家照顧服務員月薪不得低於 NT$32,000，時薪制不得低於每小時 NT$200，而且客戶之間的交通時間也必須給薪，不得低於基本工資。地板以上則看投入程度——全職職缺常見 NT$32,000–40,000，時薪職缺依機構與津貼多在 NT$200–280，做到有穩定客戶、採拆帳制的資深照服員可以到 NT$45,000–60,000 以上。代價是體力與情緒負荷都高。",
      sourcing: {
        tier: "official",
        source: "衛福部長照 2.0 給薪規定",
        basis: "regulation",
        partial:
          "地板以上的範圍（全職 NT$32,000–40,000、時薪 NT$200–280、資深拆帳制 NT$45,000–60,000 以上）來自 104／1111 職缺與產業整理，屬於求職網站資料，尚待查證",
      },
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
    const regulation = s.basis === "regulation";
    const kind = regulation ? "政府規定" : "官方統計";
    // A regulation sets a floor; a statistic describes a typical starting
    // figure. Naming the right one keeps the sentence true for both.
    const what = regulation ? "下限" : "起薪";
    return s.partial
      ? `${what}來自${s.source}，屬於${kind}；${s.partial}。`
      : `數字來自${s.source}，屬於${kind}。`;
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

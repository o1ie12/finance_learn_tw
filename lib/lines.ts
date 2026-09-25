import { MODULES, type ModuleMeta } from "@/lib/modules";

/**
 * A "line" (課程/路線) pairs an ordered set of station modules with a terminal
 * simulation, mirroring an MRT line: several stations leading to a terminus.
 * Modules are still keyed globally by number; a line just references the
 * module numbers it owns, so adding a station never means renumbering
 * existing ones (see modules 6-8, appended rather than inserted in place).
 */

export type LineSlug =
  | "zhiya"
  | "qixin"
  | "cunqian"
  | "xinyong"
  | "touzi"
  | "zhapian"
  | "xuedai"
  | "baoshui"
  | "zuwu"
  | "baoxian"
  | "chuangye"
  | "caiwujuece";

export interface LineSim {
  station: string; // terminal station name, e.g. 起薪站
  title: string; // e.g. 第一份薪水模擬
  subtitle: string;
  covers: string; // one line: what the simulation covers (Forage-style)
  ready: boolean; // false → "coming soon"
}

export interface LineMeta {
  /**
   * Stable database identity (public.lines.id). Never changes, even if the
   * slug, title or order does — that is the whole point of it. This is the
   * value student history (simulation_runs, line_tests, class_rooms) points
   * at, so renaming a line is a one-row change rather than an orphaning
   * event. Presentation and ordering stay owned by this file; the database
   * holds identity only.
   */
  id: number;
  slug: LineSlug;
  name: string; // 消費線
  enName: string;
  short: string; // one-sentence description for cards
  color: string; // vivid MRT line color (track, dots, strips)
  colorInk: string; // AA-safe (>=4.5:1 on off-white) variant for text
  stationModules: number[]; // module numbers, in order
  sim: LineSim;
  flagship?: boolean;
}

export const LINES: LineMeta[] = [
  {
    id: 11,
    slug: "zhiya",
    name: "職涯線",
    enName: "Career & Income Line",
    short: "先弄清楚你想做什麼，再看那條路的收入長什麼形狀。",
    color: "#0F766E",
    colorInk: "#0c5f59",
    stationModules: [39, 40],
    sim: {
      station: "抉擇站",
      title: "職涯抉擇模擬",
      subtitle: "選一條路，看它五年內的收入會怎麼長——以及前面要撐多久。",
      covers: "從你的興趣出發，比較 2–3 條真實職涯路徑的準備期、起薪與成長幅度，結果會成為消費線的起始收入。",
      ready: true,
    },
  },
  {
    id: 2,
    slug: "cunqian",
    name: "存錢線",
    enName: "Savings Line",
    short: "為一個目標存錢，看時間與紀律怎麼放大結果。",
    color: "#1F8A4C",
    colorInk: "#1d7f46",
    stationModules: [3, 6],
    sim: {
      station: "目標站",
      title: "存錢目標模擬",
      subtitle: "設定一個目標，選擇怎麼存，再看看誘惑來的時候你守不守得住。",
      covers: "為一個目標設定金額與期限，比較「每次都心動」和「守住計畫」一年後的差別。",
      ready: true,
    },
  },
  {
    // Reframed from 起薪線, not replaced: same id, so every run, test and
    // classroom recorded against it stays attached. The slug is still
    // 'qixin' — renaming it is a separate data migration across three
    // tables (open question 7), and identity never depended on it.
    id: 1,
    slug: "qixin",
    name: "消費線",
    enName: "Spending Line",
    short: "分清楚需要和想要，再決定錢要怎麼分配。",
    color: "#0070bd",
    colorInk: "#005a99",
    stationModules: [1, 2],
    flagship: true,
    sim: {
      station: "分配站",
      title: "消費模擬",
      subtitle: "一個月的收入，你要怎麼分？月底出點意外，撐不撐得過去？",
      covers: "用你在職涯線選到的收入，自由分配住、吃、行與想要的東西，再面對一筆沒預料到的支出。",
      ready: true,
    },
  },
  {
    id: 3,
    slug: "xinyong",
    name: "信用線",
    enName: "Credit Line",
    short: "搞懂信用卡帳單、最低應繳與循環利息。",
    color: "#F4A300",
    colorInk: "#976500",
    stationModules: [4, 7],
    sim: {
      station: "帳單站",
      title: "信用卡帳單模擬",
      subtitle: "三個月的帳單，每次你都可以選擇全額繳清或只繳最低——看看結果差多少。",
      covers: "三期信用卡帳單，練習「全額繳清」vs「只繳最低」的選擇，看見循環利息如何累積。",
      ready: true,
    },
  },
  {
    id: 4,
    slug: "touzi",
    name: "投資線",
    enName: "Investing Line",
    short: "用台灣的規則（0050、抽籤、證交稅）踏出投資第一步。",
    color: "#8E44AD",
    colorInk: "#8E44AD",
    stationModules: [5, 8],
    sim: {
      station: "進場站",
      title: "第一次投資模擬",
      subtitle: "手上有一筆存款，該放著、買 ETF、還是花掉？認識風險與證交稅。",
      covers: "把一筆存款投入 0050／0056、定存或抽籤，看見報酬的「範圍」與每次賣出的 0.3% 證交稅。",
      ready: true,
    },
  },
  {
    id: 5,
    slug: "zhapian",
    name: "詐騙線",
    enName: "Fraud Line",
    short: "認出詐騙集團最常用的手法，在被騙之前先看穿它。",
    color: "#E8542A",
    colorInk: "#c34723",
    stationModules: [9, 10, 11, 12, 13],
    sim: {
      station: "165 判讀中心",
      title: "165 判讀中心",
      subtitle: "60 秒內，對一連串真實風格的訊息判斷「真」或「詐」。",
      covers: "限時判讀 20 則真實風格的訊息，答錯會顯示這類詐騙實際造成的後果。",
      ready: true,
    },
  },
  {
    id: 6,
    slug: "xuedai",
    name: "學貸線",
    enName: "Student Loans Line",
    short: "選校、選住宿方式，算出四年後真正要背的總帳。",
    color: "#6C5B7B",
    colorInk: "#6C5B7B",
    stationModules: [14, 15, 16, 17, 18],
    sim: {
      station: "選校站",
      title: "四年總帳模擬",
      subtitle: "選學校與住宿方式，看見四年總花費與畢業時的負債。",
      covers: "選公立或私立、住宿舍或租屋，算出四年總花費，並串接起薪估算還款負擔。",
      ready: true,
    },
  },
  {
    id: 7,
    slug: "baoshui",
    name: "報稅線",
    enName: "Tax Line",
    short: "看懂薪資單怎麼被扣，幫一位角色完成人生第一次報稅。",
    color: "#2C3E50",
    colorInk: "#2C3E50",
    stationModules: [19, 20, 21, 22, 23],
    sim: {
      station: "申報站",
      title: "報稅實作模擬",
      subtitle: "自己走一次申報流程：先猜實領多少，再決定怎麼扣、怎麼算。",
      covers: "三關各要做一個決定：月薪跟實領差在哪、哪些金額可以先扣掉、稅到底怎麼算。最後結算出退稅還是補稅，並看見自己的算法跟正確算法差多少。",
      ready: true,
    },
  },
  {
    id: 8,
    slug: "zuwu",
    name: "租屋線",
    enName: "Renting Line",
    short: "看懂租賃契約，在簽名前找出不利房客的條款。",
    color: "#C0392B",
    colorInk: "#C0392B",
    stationModules: [24, 25, 26, 27, 28],
    sim: {
      station: "找碴站",
      title: "契約找碴",
      subtitle: "限時在一份租賃合約中，找出所有違法或不利房客的條款。",
      covers: "14 條合約條款中，藏著 8 條問題條款——90 秒內找出所有問題，練習簽約前該有的細心。",
      ready: true,
    },
  },
  {
    id: 9,
    slug: "baoxian",
    name: "保險線",
    enName: "Insurance Line",
    short: "健保給你什麼、不給你什麼，聽業務員推銷前先搞懂保障是什麼。",
    color: "#16A085",
    colorInk: "#117d68",
    stationModules: [29, 30, 31, 32, 33],
    sim: {
      station: "推銷站",
      title: "業務員對話",
      subtitle: "三位業務員輪番推銷，每一次都自己決定買或不買。",
      covers: "面對儲蓄險、意外險、醫療實支實付三張保單的推銷話術，練習分辨推銷詞跟真實情況——「都不買」也是有效的結局。",
      ready: true,
    },
  },
  {
    id: 10,
    slug: "chuangye",
    name: "創業線",
    enName: "Entrepreneurship Line",
    short: "固定成本、毛利、損益兩平——經營一個手搖飲攤位撐過 30 天。",
    color: "#D68910",
    colorInk: "#9a630c",
    stationModules: [34, 35, 36, 37, 38],
    sim: {
      station: "攤位站",
      title: "手搖飲攤位",
      subtitle: "選定價與備料規模，經營 30 個模擬營業日。",
      covers: "面對颱風、原料漲價、競爭對手開幕等事件，管理成本與現金流，看看能不能撐到第 30 天。",
      ready: true,
    },
  },
  // Last on purpose. The capstone reads what every line before it wrote, so
  // it is the platform's finale rather than the core lines' — which is also
  // why it sits after 創業線 rather than beside the five core lines.
  {
    id: 12,
    slug: "caiwujuece",
    name: "財務決策線",
    enName: "Financial Decisions Line",
    short: "把收入、存款、信用與投資放在同一個決定上：買房還是租屋？",
    color: "#5B4B8A",
    colorInk: "#4a3d73",
    stationModules: [41],
    sim: {
      station: "決策站",
      title: "買房 vs 租屋抉擇模擬",
      subtitle: "用你自己的收入、存款和信用記錄，算一次這個決定。",
      covers:
        "這是把前面每條線的結果放在一起的地方：收入決定月付得起多少，存款決定頭期款夠不夠，信用記錄決定利率和銀行會不會放款，投資過的錢則讓「拿去付頭期」變成一個真正的取捨。",
      ready: true,
    },
  },
];

export const LINE_SLUGS = LINES.map((l) => l.slug);

/** The home page's preview set — an explicit list, not a `.slice(0, n)`, so
 * it stays correct even if LINES gets reordered later (UI/UX overhaul spec
 * section 4). */
// Earn, Save, Spend — the three core lines in curriculum order, plus Credit.
export const FEATURED_LINE_SLUGS: LineSlug[] = ["zhiya", "cunqian", "qixin", "xinyong"];

export function featuredLines(): LineMeta[] {
  return FEATURED_LINE_SLUGS.map((slug) => LINES.find((l) => l.slug === slug)).filter(
    (l): l is LineMeta => Boolean(l),
  );
}

export function getLine(slug: string): LineMeta | undefined {
  return LINES.find((l) => l.slug === slug);
}

export function isLineSlug(v: unknown): v is LineSlug {
  return typeof v === "string" && LINE_SLUGS.includes(v as LineSlug);
}

/**
 * Resolve a slug to the stable line id that student history points at.
 *
 * Throws rather than returning a fallback. A caller that cannot resolve its
 * line is about to write a row with no durable identity, and the whole reason
 * this id exists is that such rows go silently wrong later rather than loudly
 * wrong now. Callers only ever pass a validated LineSlug, so this should be
 * unreachable — if it ever fires, lib/lines.ts and public.lines have drifted.
 */
export function lineIdForSlug(slug: string): number {
  const line = LINES.find((l) => l.slug === slug);
  if (!line) {
    throw new Error(
      `lineIdForSlug: no line for slug "${slug}". lib/lines.ts and public.lines are out of sync.`,
    );
  }
  return line.id;
}

/** Which line owns a given station module number. */
export function getLineByModule(moduleNumber: number): LineMeta | undefined {
  return LINES.find((l) => l.stationModules.includes(moduleNumber));
}

export function lineModules(line: LineMeta): ModuleMeta[] {
  return line.stationModules
    .map((n) => MODULES.find((m) => m.number === n))
    .filter((m): m is ModuleMeta => Boolean(m));
}

/** Estimated total reading minutes for a line's stations. */
export function lineMinutes(line: LineMeta): number {
  return lineModules(line).reduce((sum, m) => sum + m.minutes, 0);
}

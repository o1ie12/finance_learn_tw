export interface QuizQuestion {
  id: string;
  q: string;
  options: string[];
  answer: number; // index into options
  explain: string;
}

export interface ModuleMeta {
  number: number; // 1–5
  station: string; // zh station name for the transit map
  title: string; // zh lesson title
  enTitle: string;
  subtitle: string; // zh one-line hook
  minutes: number; // estimated reading time
  color: string; // vivid Metro line color — strips, fills, large numerals
  colorInk: string; // AA-contrast text color on the off-white background
  quiz: QuizQuestion[];
}

export const MODULES: ModuleMeta[] = [
  {
    number: 1,
    station: "心理站",
    title: "為什麼我們會做出不好的理財決定",
    enTitle: "Why We Make Bad Money Decisions",
    subtitle: "在學任何工具之前，先看懂大腦怎麼騙你花錢。",
    minutes: 9,
    color: "#e3002c",
    colorInk: "#c20025",
    quiz: [
      {
        id: "m1q1",
        q: "「損失規避 (loss aversion)」指的是什麼？",
        options: [
          "我們對「失去」的痛苦，通常大於「得到」同樣東西的快樂",
          "我們總是喜歡把錢存起來、完全不花",
          "我們對風險完全無感",
        ],
        answer: 0,
        explain:
          "損失帶來的痛，心理上大約是同等獲得快樂的兩倍。這會讓我們死抱著賠錢的東西、或為了不想「虧到」而做出不理性的決定。",
      },
      {
        id: "m1q2",
        q: "收到一大包過年紅包後，哪一種反應最接近「即時滿足」的陷阱？",
        options: [
          "先想想這筆錢半年、一年後想拿來做什麼",
          "「難得有一大筆錢，今天先把想買的都買一買！」",
          "把紅包先分成「可以花」與「先存起來」兩份",
        ],
        answer: 1,
        explain:
          "即時滿足會讓我們高估「現在就爽」的價值、低估未來的自己，紅包因此很容易一次花光。",
      },
      {
        id: "m1q3",
        q: "同學都在買最新聯名手搖和名牌鞋，你也跟著買。這比較接近哪一種力量？",
        options: ["通貨膨脹", "社會消費壓力 (social spending pressure)", "複利"],
        answer: 1,
        explain:
          "想和群體一致的心理，會讓我們把「別人有」誤當成「我需要」，這是最花錢、也最難察覺的壓力之一。",
      },
    ],
  },
  {
    number: 2,
    station: "記帳站",
    title: "預算與消費追蹤",
    enTitle: "Budgeting and Tracking Spending",
    subtitle: "用你每天在用的行動支付，建立一套會持續的記帳習慣。",
    minutes: 10,
    color: "#0070bd",
    colorInk: "#005a99",
    quiz: [
      {
        id: "m2q1",
        q: "下列哪一項最接近「需要 (need)」而不是「想要 (want)」？",
        options: [
          "通學用的悠遊卡加值、MRT 車資",
          "限量聯名款手搖飲",
          "新遊戲的課金抽卡",
        ],
        answer: 0,
        explain:
          "需要是維持生活與上學所必需的；想要是可有可無、帶來享受的花費。分清楚兩者是所有預算的第一步。",
      },
      {
        id: "m2q2",
        q: "關於 2026 年台灣的行動支付，下列哪一個敘述正確？",
        options: [
          "台灣幾乎沒人用行動支付，大家都刷信用卡",
          "街口支付 (JKoPay) 是目前單一 App 用戶基礎最大的電子支付之一",
          "LINE Pay 仍然和一卡通綁在一起、無法獨立運作",
        ],
        answer: 1,
        explain:
          "街口用戶眾多；LINE Pay 已與一卡通拆夥、獨立經營且成長快速；台灣Pay 則是政府支持的選項。三個名字你都該認得。",
      },
      {
        id: "m2q3",
        q: "要接收綜所稅退稅入帳、或繳一筆政府規費，最常被用到的是哪一個？",
        options: ["台灣Pay", "街口支付", "現金紅包"],
        answer: 0,
        explain:
          "台灣Pay 是政府支持的支付，日常消費較少見，但退稅入帳與繳政府規費常會用到它。",
      },
    ],
  },
  {
    number: 3,
    station: "複利站",
    title: "儲蓄與複利的真實運作方式",
    enTitle: "Saving and How Compound Interest Actually Works",
    subtitle: "時間才是主角。看懂複利，你會後悔沒有更早開始。",
    minutes: 11,
    color: "#008659",
    colorInk: "#00734a",
    quiz: [
      {
        id: "m3q1",
        q: "讓複利威力最大的關鍵變數是什麼？",
        options: [
          "時間：越早開始、滾越久，差距越大",
          "一次投入一大筆錢",
          "每天盯著帳戶看",
        ],
        answer: 0,
        explain:
          "複利是「利滾利」，時間拉長後差距會被放大。早開始，往往比一次投入大錢更重要。",
      },
      {
        id: "m3q2",
        q: "關於台灣的勞工退休金（勞退），下列何者正確？",
        options: [
          "要自己上網申請、公司才會開始提撥",
          "只有大公司才需要提繳",
          "你上第一份工作後，雇主依法每月至少提繳月薪 6% 到你的個人退休金帳戶，不用你申請",
        ],
        answer: 2,
        explain:
          "台灣勞退是雇主的法定義務、自動提繳 6%，不需要你 opt-in。這和美國 401k 通常要員工主動加入、雇主配比因公司而異，很不一樣。",
      },
      {
        id: "m3q3",
        q: "同樣把錢放著，為什麼「越早開始」結果通常差最多？",
        options: [
          "因為早存的錢有更長時間參與複利滾動",
          "因為銀行給年輕人的利率特別高",
          "因為越早存、本金一定越大",
        ],
        answer: 0,
        explain:
          "差別主要來自「時間」，不是特別的利率、也不是本金一定比較大。時間是複利唯一買不到的原料。",
      },
    ],
  },
  {
    number: 4,
    station: "信用站",
    title: "台灣的銀行、信用與借貸",
    enTitle: "Banking, Credit, and Borrowing in Taiwan",
    subtitle: "這一站如果照抄美國會學到錯的東西，所以我們把它講清楚。",
    minutes: 10,
    color: "#f8b61c",
    colorInk: "#8a5a00",
    quiz: [
      {
        id: "m4q1",
        q: "關於台灣的個人信用，下列哪一個最正確？",
        options: [
          "每個台灣人都有一個像美國 FICO 的三位數分數，可以自己每月查詢",
          "台灣沒有由個人自己「養、查」的單一信用分數；信用紀錄主要由 JCIC（聯徵中心）保存，供銀行等機構借貸時評估",
          "台灣完全沒有任何信用紀錄制度",
        ],
        answer: 1,
        explain:
          "台灣主要由 JCIC（財團法人金融聯合徵信中心）保存信用紀錄，供機構審核借貸使用，而不是個人自己追蹤的單一 FICO 式分數。",
      },
      {
        id: "m4q2",
        q: "關於全民健保 (NHI)，下列敘述何者正確？",
        options: [
          "幾乎所有人都自動納保，保費由個人、雇主與政府三方共同分攤",
          "只有另外向私人公司購買，才會有健康保險",
          "健保只保障特定高收入族群",
        ],
        answer: 0,
        explain:
          "台灣健保是政府單一系統、自動納保、三方共同分攤保費，和美國多半綁定私人雇主方案、或自行購買很不同。",
      },
      {
        id: "m4q3",
        q: "家裡長輩說買了一張「會還本、有滿期金」的保單，這比較可能是哪一種？",
        options: [
          "純保障型（只有身故/意外理賠，不會還本）",
          "全民健保",
          "儲蓄型保單（保障加上存錢、還本的成分）",
        ],
        answer: 2,
        explain:
          "台灣投保率長期名列世界前茅，其中很多是「儲蓄型保單」，把保障和存錢混在一起，和只理賠、不還本的純保障型不同。",
      },
    ],
  },
  {
    number: 5,
    station: "投資站",
    title: "投資基礎與台灣股市",
    enTitle: "Investing Basics and the Taiwan Stock Market",
    subtitle: "從 0050、抽籤到證交稅——用台灣的規則認識投資。",
    minutes: 12,
    color: "#c48c31",
    colorInk: "#7f5a1e",
    quiz: [
      {
        id: "m5q1",
        q: "在台灣，未滿 18 歲要開證券戶，正確作法是？",
        options: [
          "自己上網點一點就能開好",
          "未成年完全不能碰任何證券帳戶",
          "由父母/法定代理人陪同、本人臨櫃辦理，並需要本人名下可交割的銀行帳戶",
        ],
        answer: 2,
        explain:
          "未成年開證券戶必須臨櫃、由法定代理人陪同，且要有本人名下的交割銀行帳戶，不能純線上開戶。",
      },
      {
        id: "m5q2",
        q: "關於在台灣「賣股票賺錢」要繳的稅，下列哪一個正確？",
        options: [
          "和美國一樣，賣股賺到的價差要繳資本利得稅",
          "個人買賣股票的價差目前不課所得稅；但每次「賣出」都自動課 0.3% 證交稅（當沖同檔當日買賣降為 0.15%），不論賺賠",
          "買股票的當下要先預繳一筆獲利稅",
        ],
        answer: 1,
        explain:
          "台灣個人證券交易所得目前停徵（不課），改在「賣出」時按成交金額課 0.3% 證交稅，當沖降為 0.15%，賺賠都要繳。這是全課程最「這裡不是美國」的一段。",
      },
      {
        id: "m5q3",
        q: "你賣出 NT$100,000 的 0050（非當沖），這一筆會自動被收多少證券交易稅？",
        options: [
          "NT$0，因為要有賺錢才收",
          "要看賺多少，賺越多收越多",
          "NT$300（= 100,000 × 0.3%），不論這筆是賺是賠",
        ],
        answer: 2,
        explain:
          "證交稅按「成交金額」課，100,000 × 0.3% = NT$300，和你這筆賺或賠完全無關。",
      },
    ],
  },
  // Added later: a second station per thin line (存錢線/信用線/投資線),
  // matching 起薪線's 2-station pattern. Numbered 6-8 rather than
  // renumbered in place so existing module_progress rows (keyed by
  // module_number) never shift under anyone.
  {
    number: 6,
    station: "習慣站",
    title: "記帳、緊急預備金與存錢習慣",
    enTitle: "Budgeting Habits and Your Emergency Fund",
    subtitle: "記帳的目的不是知道錢花去哪，是在花之前就知道自己還剩多少。",
    minutes: 9,
    color: "#008659",
    colorInk: "#00734a",
    quiz: [
      {
        id: "m6q1",
        q: "50/30/20 法則中，20% 代表什麼？",
        options: ["娛樂支出", "存款與還款", "稅金", "房租"],
        answer: 1,
        explain:
          "50% 必要支出、30% 想要支出、20% 存款與還款——20% 這一份，是先幫未來的自己留住的。",
      },
      {
        id: "m6q2",
        q: "「先存錢再花錢」比「花剩的再存」成功率高的原因是？",
        options: [
          "金額比較多",
          "剩下的錢通常會被花光，很難留住",
          "銀行規定要這樣做",
          "兩者沒有差別",
        ],
        answer: 1,
        explain:
          "領到錢當天就把要存的部分轉走，剩下的才是可以花的——把存錢變成不需要意志力的預設動作。",
      },
      {
        id: "m6q3",
        q: "緊急預備金比較適合放在哪裡？",
        options: [
          "投資帳戶，順便賺一點利息",
          "隨時可以領出來、跟日常花費分開的帳戶",
          "借給朋友周轉應急",
          "全部放家裡現金最安全",
        ],
        answer: 1,
        explain:
          "緊急預備金是專款專用，重點是「隨時領得出來」，跟會漲跌、動用不便的投資帳戶混在一起是常見誤區。",
      },
    ],
  },
  {
    number: 7,
    station: "卡片站",
    title: "信用卡運作與循環利息陷阱",
    enTitle: "How Credit Cards Work — and the Revolving-Interest Trap",
    subtitle: "信用卡不是免費的錢，是銀行先幫你付錢。",
    minutes: 9,
    color: "#f8b61c",
    colorInk: "#8a5a00",
    quiz: [
      {
        id: "m7q1",
        q: "信用卡只繳最低應繳金額，剩下的部分會發生什麼事？",
        options: [
          "自動延到下期，沒有額外費用",
          "從消費當天開始計算循環利息",
          "銀行會自動幫你補齊",
          "完全沒有影響",
        ],
        answer: 1,
        explain:
          "循環利息從消費當天就開始算，不是從繳款截止日之後才算，拖越久滾越多。",
      },
      {
        id: "m7q2",
        q: "分期付款跟循環利息的差別是？",
        options: [
          "完全一樣，只是名字不同",
          "分期通常利率較低且固定，循環利息浮動累積",
          "分期通常比較貴",
          "循環利息比較安全",
        ],
        answer: 1,
        explain:
          "分期是固定利率、固定期數；循環利息是浮動累積、沒繳清就一直算，兩者風險完全不同。",
      },
      {
        id: "m7q3",
        q: "高中生想開始建立好的用卡習慣，比較實際的做法是？",
        options: [
          "立刻辦正卡大量消費",
          "透過附卡在家長監督下練習，養成消費前先想好怎麼還的習慣",
          "完全不碰任何跟卡片有關的東西",
          "跟同學借錢練習分期",
        ],
        answer: 1,
        explain:
          "多數高中生還不能自己申辦正卡，附卡是在有監督的情況下練習用卡的實際起點。",
      },
    ],
  },
  {
    number: 8,
    station: "策略站",
    title: "定期定額 vs 一次投入",
    enTitle: "Dollar-Cost Averaging vs. Lump-Sum Investing",
    subtitle: "不用猜時機——把「什麼時候買」變成一個不用煩惱的問題。",
    minutes: 9,
    color: "#e3002c",
    colorInk: "#c20025",
    quiz: [
      {
        id: "m8q1",
        q: "定期定額的核心優勢是什麼？",
        options: [
          "保證獲利",
          "不用猜時機，長期下來買到的平均成本會被拉平",
          "一定比一次投入報酬高",
          "完全沒有風險",
        ],
        answer: 1,
        explain:
          "定期定額每個月固定投入，價格高低都買，長期下來把平均成本拉平，重點是不用猜進場時機。",
      },
      {
        id: "m8q2",
        q: "市場下跌時，定期定額投資人比較適合的做法是？",
        options: [
          "立刻停止扣款",
          "繼續扣款，用低點買到更多單位",
          "全部贖回",
          "改成一次投入剩下的錢",
        ],
        answer: 1,
        explain:
          "定期定額的核心邏輯就是在低點買到更多單位，中途停扣反而失去這個優勢。",
      },
      {
        id: "m8q3",
        q: "跟定期定額相比，一次投入（all at once）的主要差異是什麼？",
        options: [
          "報酬保證比較高",
          "理論上長期報酬可能更高，但短期波動帶來的心理壓力更大",
          "完全沒有風險",
          "不適合任何人使用",
        ],
        answer: 1,
        explain:
          "一次投入把一筆錢全部押在同一個時間點，長期看報酬可能較高，但一遇到下跌，心理壓力會比分批投入大得多。",
      },
    ],
  },
];

export const SIMULATION_STATION = {
  station: "起薪站",
  title: "第一份薪水模擬",
  subtitle: "終點站。把整條線學到的東西，用在一份真實的台北起薪上。",
};

export function getModule(n: number): ModuleMeta | undefined {
  return MODULES.find((m) => m.number === n);
}

export const MODULE_NUMBERS = MODULES.map((m) => m.number);

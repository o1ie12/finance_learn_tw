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
  // 詐騙線 (new line) — modules 9-13.
  {
    number: 9,
    station: "假投資站",
    title: "假投資群組",
    enTitle: "Fake Investment Groups",
    subtitle: "最常見的詐騙起點，就藏在一個看起來很正常的 LINE 群組裡。",
    minutes: 8,
    color: "#e8542a",
    colorInk: "#b8391a",
    quiz: [
      {
        id: "m9q1",
        q: "2025 年台灣全年詐騙財損金額大約是多少？",
        options: ["10 億元", "近 900 億元", "1000 萬元", "沒有統計"],
        answer: 1,
        explain: "來源：內政部警政署 165 打詐儀表板、2025 全民反詐騙大調查。",
      },
      {
        id: "m9q2",
        q: "財損金額最高的詐騙類型是？",
        options: ["網路購物詐騙", "假投資詐騙", "求職詐騙", "中獎詐騙"],
        answer: 1,
        explain: "假投資詐騙是財損金額最高的類型，手法通常從一個「老師」報明牌的群組開始。",
      },
      {
        id: "m9q3",
        q: "面對「保證獲利」的投資機會，正確的態度是？",
        options: ["立刻把握機會", "提高警覺，越是保證獲利越可疑", "先小額嘗試", "相信推薦的人"],
        answer: 1,
        explain: "投資不可能保證獲利。群組裡的「跟單都在賺錢」截圖，很可能是同夥安排的假帳號。",
      },
    ],
  },
  {
    number: 10,
    station: "人頭站",
    title: "人頭帳戶與車手",
    enTitle: "Mule Accounts and Money Runners",
    subtitle: "「借帳戶用一下」聽起來像輕鬆賺錢，代價可能是刑責與信用紀錄。",
    minutes: 8,
    color: "#e8542a",
    colorInk: "#b8391a",
    quiz: [
      {
        id: "m10q1",
        q: "什麼是「人頭帳戶」？",
        options: ["自己開的正常帳戶", "提供給他人用於接收詐騙贓款的帳戶", "銀行內部帳戶", "已經停用的帳戶"],
        answer: 1,
        explain: "把帳戶借給別人用一下，實際上就是提供帳戶接收詐騙贓款，自己就成了法律上的人頭帳戶。",
      },
      {
        id: "m10q2",
        q: "提供帳戶供他人犯罪使用，可能觸犯什麼法律？",
        options: ["沒有法律責任", "洗錢防制法", "民法", "著作權法"],
        answer: 1,
        explain: "依洗錢防制法規定，提供帳戶供他人犯罪使用可處刑責，細節建議請教專業法律意見後定稿。",
      },
      {
        id: "m10q3",
        q: "帳戶一旦被列為警示帳戶，會有什麼後果？",
        options: [
          "只有那個帳戶被停用，其他不受影響",
          "名下所有銀行帳戶都可能被凍結，且列入聯徵中心紀錄",
          "完全沒有影響，正常使用",
          "只需要打電話跟銀行解釋就沒事",
        ],
        answer: 1,
        explain: "警示帳戶會凍結名下所有帳戶，還會列入聯徵紀錄，直接影響未來申辦銀行帳戶、信用卡、甚至部分工作的資格審查。",
      },
    ],
  },
  {
    number: 11,
    station: "客服站",
    title: "假客服與解除分期",
    enTitle: "Fake Customer Service and \"Cancel Installment\" Scams",
    subtitle: "真正的客服，不會要求你去 ATM「解除」任何交易。",
    minutes: 7,
    color: "#e8542a",
    colorInk: "#b8391a",
    quiz: [
      {
        id: "m11q1",
        q: "「解除分期」詐騙通常要求受害者做什麼？",
        options: ["到警局報案", "到 ATM 或網銀操作一連串步驟", "掛號寄信", "打電話給家人"],
        answer: 1,
        explain: "這些操作步驟的真正目的是把帳戶裡的錢轉出去，不是解除任何分期交易。",
      },
      {
        id: "m11q2",
        q: "台灣詐騙受理案件數最多的類型是？",
        options: ["假投資詐騙", "網路購物詐騙", "假交友詐騙", "假冒公務員詐騙"],
        answer: 1,
        explain: "網路購物詐騙案件數最多，假客服解除分期是其中最常見的手法之一。",
      },
      {
        id: "m11q3",
        q: "對方講得出你的訂單細節、姓名、電話，代表他一定是真客服嗎？",
        options: ["對，講得出細節就一定是真的", "不一定，個資外流很普遍，知道訂單資訊不代表是真客服", "只要態度好就可信任", "無法判斷"],
        answer: 1,
        explain: "個資外流管道很多，對方知道你的訂單資訊，不代表他真的是該平台的客服。",
      },
    ],
  },
  {
    number: 12,
    station: "交友站",
    title: "殺豬盤與假交友",
    enTitle: "Romance Scams (\"Pig-Butchering\")",
    subtitle: "養、殺、盤——三階段鎖定的，正是渴望情感連結的年輕人。",
    minutes: 8,
    color: "#e8542a",
    colorInk: "#b8391a",
    quiz: [
      {
        id: "m12q1",
        q: "什麼是「殺豬盤」？",
        options: ["一種投資工具", "透過交友培養感情後誘導投資的詐騙手法", "一種保險商品", "銀行貸款方案"],
        answer: 1,
        explain: "「養」（培養感情）、「殺」（誘導投資）、「盤」（出金困難）三階段，是殺豬盤的固定套路。",
      },
      {
        id: "m12q2",
        q: "在交友軟體認識、聊了幾週後對方開始提到投資，比較恰當的反應是？",
        options: [
          "覺得認識這麼久了對方不可能騙我",
          "提到轉帳、投資就提高警覺，時間長不代表關係真實",
          "馬上答應一起投資",
          "直接封鎖但不告訴任何人",
        ],
        answer: 1,
        explain: "詐騙集團會刻意花時間培養信任。時間長不代表關係真實，一旦提到投資或轉帳，該提高警覺。",
      },
      {
        id: "m12q3",
        q: "殺豬盤詐騙最終目的通常是什麼？",
        options: ["單純交朋友", "誘導受害者投入資金到假投資平台，最後出金困難", "推銷保險", "介紹工作機會"],
        answer: 1,
        explain: "殺豬盤是假交友與假投資的結合，情感只是手段，最終目的是誘導投入資金。",
      },
    ],
  },
  {
    number: 13,
    station: "個資站",
    title: "個資怎麼外流的",
    enTitle: "How Your Personal Data Actually Leaks",
    subtitle: "知道你的姓名電話，不代表你被特別鎖定，而是個資外流管道很多。",
    minutes: 7,
    color: "#e8542a",
    colorInk: "#b8391a",
    quiz: [
      {
        id: "m13q1",
        q: "詐騙集團知道你的個人資料，最可能的原因是？",
        options: ["只有特別鎖定的人會被知道", "個資可能透過多種管道外流，不代表被特別鎖定", "一定是家人洩漏的", "不可能發生"],
        answer: 1,
        explain: "不明連結表單、來路不明的 App 權限、購物網站資料外洩，都可能是個資外流的管道。",
      },
      {
        id: "m13q2",
        q: "以下哪一個是常見的個資外流管道？",
        options: ["合法網站的資料外洩", "從不使用網路", "只用現金消費", "沒有社群帳號"],
        answer: 0,
        explain: "即使透過合法網站，資料外洩事件時有所聞，甚至朋友帳號被盜後傳來的訊息也可能是外流或詐騙的來源。",
      },
      {
        id: "m13q3",
        q: "只要不點奇怪的連結，就能完全避免個資外流嗎？",
        options: ["對，不點連結就百分之百安全", "不完全，App 權限、資料外洩等管道也可能造成外流", "個資外流只發生在國外", "個資外流跟詐騙無關"],
        answer: 1,
        explain: "不點可疑連結是好習慣，但個資外流的管道不只一種，App 過度索取的權限、平台資料外洩都可能是來源。",
      },
    ],
  },
  // 學貸線 (new line) — modules 14-18.
  {
    number: 14,
    station: "學費站",
    title: "公立 vs 私立四年真實總價",
    enTitle: "Public vs. Private: the Real Four-Year Price",
    subtitle: "大部分人只看單學期學費，沒有換算成四年總價。",
    minutes: 8,
    color: "#6c5b7b",
    colorInk: "#4f4159",
    quiz: [
      {
        id: "m14q1",
        q: "比較公立與私立大學的花費時，比較完整的方式是？",
        options: ["只看單學期學費", "換算四年總價再比較", "只看學校名氣", "不需要比較"],
        answer: 1,
        explain: "四年加總下來，私立大學的學費總額通常是公立的一倍以上，換算總價才看得出真正的差距。",
      },
      {
        id: "m14q2",
        q: "只比較「這學期要繳多少」，容易忽略什麼？",
        options: ["沒有忽略什麼", "四年總額、住宿、交通等隱性成本", "學校排名", "上課時間"],
        answer: 1,
        explain: "很多人只看單學期學費做決定，卻沒把四年總額、住宿、交通一起算進去。",
      },
    ],
  },
  {
    number: 15,
    station: "貸款站",
    title: "就學貸款怎麼運作",
    enTitle: "How Student Loans Actually Work",
    subtitle: "「現在不用還」不等於「不用管」，它是延後負擔，不是免費的錢。",
    minutes: 8,
    color: "#6c5b7b",
    colorInk: "#4f4159",
    quiz: [
      {
        id: "m15q1",
        q: "就學貸款在學期間的利息，通常由誰負擔？",
        options: ["學生自己", "政府補貼", "學校", "銀行全額吸收不用付"],
        answer: 1,
        explain: "就學貸款由政府提供利息補貼，在學期間的利息通常由政府負擔，畢業後才開始計算自己要負擔的部分。",
      },
      {
        id: "m15q2",
        q: "以下對就學貸款的敘述，何者正確？",
        options: [
          "完全不用還的錢",
          "延後負擔的真實債務，畢業後有緩衝期才開始攤還",
          "只有私立大學學生能申請",
          "畢業當天就要全額還清",
        ],
        answer: 1,
        explain: "就學貸款是真實的債務，只是延後負擔，並有一段緩衝期才開始分期攤還，不是「不用管」的免費資金。",
      },
    ],
  },
  {
    number: 16,
    station: "住宿站",
    title: "住宿 vs 租屋 vs 通勤的成本比較",
    enTitle: "Dorm vs. Renting vs. Commuting",
    subtitle: "三個選項沒有絕對對錯，是根據預算與生活型態的取捨。",
    minutes: 7,
    color: "#6c5b7b",
    colorInk: "#4f4159",
    quiz: [
      {
        id: "m16q1",
        q: "住宿舍、在外租屋、通勤三個選項，以下敘述何者正確？",
        options: ["通勤一定最便宜", "三者各有成本與取捨，需要整體比較", "租屋一定最划算", "宿舍沒有成本"],
        answer: 1,
        explain: "宿舍通常最便宜但名額有限、自由度較低；租屋成本高但彈性大；通勤省住宿費但要算進交通時間成本。",
      },
      {
        id: "m16q2",
        q: "只比較「每月租金」數字，容易漏掉什麼？",
        options: ["沒有漏掉什麼", "押金、水電、交通時間等隱性成本", "房間大小", "室友人數"],
        answer: 1,
        explain: "只看每月租金數字，沒把押金、水電、交通時間成本一起算進去，容易低估真實負擔。",
      },
    ],
  },
  {
    number: 17,
    station: "打工站",
    title: "打工的機會成本",
    enTitle: "The Opportunity Cost of a Part-Time Job",
    subtitle: "打工賺的每小時薪資，要跟「這段時間能拿去做什麼」做比較。",
    minutes: 7,
    color: "#6c5b7b",
    colorInk: "#4f4159",
    quiz: [
      {
        id: "m17q1",
        q: "評估打工是否划算時，「機會成本」指的是什麼？",
        options: ["打工賺到的錢", "用這些時間讀書、準備實習可能帶來的長期價值", "打工的交通費", "沒有機會成本這回事"],
        answer: 1,
        explain: "機會成本是「用這段時間做別的事」原本能得到的價值，不是打工本身的薪水。",
      },
      {
        id: "m17q2",
        q: "大一大二花太多時間打工，可能犧牲什麼？",
        options: ["沒有影響", "讀書或實習的時間，長期可能影響起薪", "只是少睡一點", "跟未來完全無關"],
        answer: 1,
        explain: "打好基礎的關鍵時期若被過多打工佔用，長期來看實習經驗跟成績對起薪的影響可能遠大於打工存下的金額。",
      },
    ],
  },
  {
    number: 18,
    station: "獎學金站",
    title: "獎助學金與校內資源",
    enTitle: "Scholarships and Financial Aid You Might Be Missing",
    subtitle: "很多學生因為不知道或覺得麻煩，白白放棄了免費的錢。",
    minutes: 6,
    color: "#6c5b7b",
    colorInk: "#4f4159",
    quiz: [
      {
        id: "m18q1",
        q: "獎助學金的申請資格，以下敘述何者正確？",
        options: ["只給成績最頂尖的人", "多種類型，也看家庭經濟狀況或特定條件申請", "只有清寒學生能申請", "需要教授推薦才能申請"],
        answer: 1,
        explain: "多數大學有多種獎助學金管道：入學獎學金、系所獎學金、清寒助學金、緊急紓困金，不是只有第一名才能拿。",
      },
      {
        id: "m18q2",
        q: "很多學生沒有申請獎助學金，最常見的原因是？",
        options: ["真的沒有資源可以申請", "不知道有這些管道，或覺得申請麻煩", "獎學金金額太少不值得", "學校規定不能申請"],
        answer: 1,
        explain: "很多學生因為不知道或覺得麻煩而沒有申請，等於白白放棄免費的錢——多留意校內資源中心公告很值得。",
      },
    ],
  },
  // 報稅線 (new line) — modules 19-23.
  {
    number: 19,
    station: "薪資單站",
    title: "你的薪水被扣了什麼",
    enTitle: "What Actually Gets Deducted from Your Paycheck",
    subtitle: "實領金額跟合約寫的不一樣，是因為先扣了幾項固定支出。",
    minutes: 7,
    color: "#34495e",
    colorInk: "#22303f",
    quiz: [
      {
        id: "m19q1",
        q: "薪資單上「勞退自提」欄位是什麼意思？",
        options: [
          "公司少給的錢",
          "員工自願額外提撥到自己退休金專戶的部分，最高 6%",
          "一定要繳的稅",
          "保險費",
        ],
        answer: 1,
        explain: "勞退自提是員工自願額外提撥，最高 6%，會存入自己的退休金專戶，不是被公司拿走的錢。",
      },
      {
        id: "m19q2",
        q: "只看實領金額，容易誤會什麼？",
        options: [
          "以為公司少給錢，不知道扣掉的其實是勞健保與自己的退休金提撥",
          "薪資單上沒有任何扣除項目",
          "所有公司的扣款方式都一樣",
          "沒有任何誤會的可能",
        ],
        answer: 0,
        explain: "扣掉的部分其實是勞保費、健保費跟自己的退休金提撥，不是公司「少給」，是先幫你處理該繳的項目。",
      },
    ],
  },
  {
    number: 20,
    station: "級距站",
    title: "免稅額、扣除額、級距",
    enTitle: "Exemptions, Deductions, and Tax Brackets",
    subtitle: "累進稅率不是「超過某個級距全部都用高稅率算」。",
    minutes: 8,
    color: "#34495e",
    colorInk: "#22303f",
    quiz: [
      {
        id: "m20q1",
        q: "綜合所得稅使用什麼稅率制度？",
        options: ["單一稅率", "累進稅率", "固定金額", "沒有稅率制度"],
        answer: 1,
        explain: "綜合所得稅用累進稅率計算，所得越高適用稅率越高，但是分段計算。",
      },
      {
        id: "m20q2",
        q: "累進稅率下，以下敘述何者正確？",
        options: [
          "全部所得都用最高稅率計算",
          "只有超過該級距的部分才適用較高稅率",
          "稅率不會隨所得變化",
          "所得越低稅率越高",
        ],
        answer: 1,
        explain: "很多人誤以為「超過某個級距，全部所得都用那個高稅率算」，但其實只有超過該級距的部分才適用較高稅率。",
      },
    ],
  },
  {
    number: 21,
    station: "憑單站",
    title: "打工學生的扣繳憑單",
    enTitle: "Withholding Statements for Student Workers",
    subtitle: "就算不用繳稅，扣繳憑單也該留著，很多申請文件會用到。",
    minutes: 6,
    color: "#34495e",
    colorInk: "#22303f",
    quiz: [
      {
        id: "m21q1",
        q: "扣繳憑單的用途是什麼？",
        options: ["只是收據不重要", "證明當年度所得，報稅與各種申請文件會用到", "只有失業才需要", "沒有實際用途"],
        answer: 1,
        explain: "扣繳憑單是當年度所得的正式證明，報稅、辦助學貸款、申請補助時都可能用到。",
      },
      {
        id: "m21q2",
        q: "打工所得不多、不用繳稅，扣繳憑單該怎麼處理？",
        options: ["直接丟掉，反正用不到", "留存下來，之後可能用得到", "交還給雇主", "沒有這份文件"],
        answer: 1,
        explain: "留存憑證是好習慣，即使當年不用繳稅，很多申請文件仍會要求提供扣繳憑單。",
      },
    ],
  },
  {
    number: 22,
    station: "扶養站",
    title: "扶養與家庭申報",
    enTitle: "Dependents and Household Filing",
    subtitle: "家庭成員之間，最好先溝通好由誰申報比較划算。",
    minutes: 6,
    color: "#34495e",
    colorInk: "#22303f",
    quiz: [
      {
        id: "m22q1",
        q: "受扶養親屬通常列在誰的報稅戶籍下？",
        options: ["自己單獨申報", "父母的報稅戶籍下一起申報", "學校代為申報", "不需要申報"],
        answer: 1,
        explain: "未滿一定年齡或仍在就學的子女，通常會列為父母的受扶養親屬，一起申報而不是自己單獨報稅。",
      },
      {
        id: "m22q2",
        q: "家庭成員各自申報、沒有先溝通，可能造成什麼問題？",
        options: [
          "完全不會有問題",
          "重複列報扶養親屬或漏報，影響申報結果",
          "退稅金額會自動變多",
          "只影響低收入戶",
        ],
        answer: 1,
        explain: "家庭成員各自申報卻沒溝通，容易重複列報扶養親屬或漏報，建議每年報稅前先討論由誰申報哪些項目。",
      },
    ],
  },
  {
    number: 23,
    station: "補充保費站",
    title: "二代健保補充保費",
    enTitle: "The Second-Generation NHI Supplementary Premium",
    subtitle: "現階段影響不大，但未來有兼職或投資收入時會用到。",
    minutes: 6,
    color: "#34495e",
    colorInk: "#22303f",
    quiz: [
      {
        id: "m23q1",
        q: "二代健保補充保費課徵的對象包含哪些？",
        options: ["一般薪資", "超過一定金額的獎金、租金、股利等額外所得", "完全不存在這個制度", "只針對外國人"],
        answer: 1,
        explain: "除了每月固定的健保費，某些額外所得（超過一定金額的獎金、租金收入、股利）會被額外扣二代健保補充保費。",
      },
      {
        id: "m23q2",
        q: "「一般健保費」跟「二代健保補充保費」是同一件事嗎？",
        options: ["是，完全一樣", "不是，兩者計算方式跟課徵對象不同", "補充保費比較便宜", "一般健保費已經取消"],
        answer: 1,
        explain: "兩者是不同的制度，計算方式跟課徵對象都不同，常被混淆為同一件事。",
      },
    ],
  },
  // 租屋線 (new line) — modules 24-28.
  {
    number: 24,
    station: "看房站",
    title: "看房檢查表與房仲費",
    enTitle: "The Viewing Checklist and Agent Fees",
    subtitle: "白天看一次不夠，晚上再去一次才看得出真實狀況。",
    minutes: 6,
    color: "#a0522d",
    colorInk: "#7a3d20",
    quiz: [
      {
        id: "m24q1",
        q: "透過房仲承租，房仲費行情通常是多少？",
        options: ["免費", "約半個月租金，由房東房客共同負擔", "一定要房客全額負擔", "一年租金"],
        answer: 1,
        explain: "房仲費通常由房東與房客共同負擔，行情約為半個月租金，實際比例可議價。",
      },
      {
        id: "m24q2",
        q: "看房時，比較完整的做法是？",
        options: [
          "只看照片跟白天看一次就決定",
          "白天晚上都去看一次，確認採光跟噪音",
          "只要房東說好就相信",
          "不需要實際測試水壓網路",
        ],
        answer: 1,
        explain: "只看照片跟白天看房容易漏掉晚上的噪音跟治安狀況，也該實際測試水壓跟網路訊號。",
      },
    ],
  },
  {
    number: 25,
    station: "契約站",
    title: "內政部定型化契約，哪些條款無效",
    enTitle: "Which Contract Clauses Are Legally Void",
    subtitle: "就算合約上寫了，牴觸法定規定的條款不當然有效。",
    minutes: 8,
    color: "#a0522d",
    colorInk: "#7a3d20",
    quiz: [
      {
        id: "m25q1",
        q: "內政部定型化契約規定，押金上限通常不得超過多少？",
        options: ["半個月租金", "2 個月租金", "6 個月租金", "沒有上限"],
        answer: 1,
        explain: "押金上限依內政部定型化契約規定，不得超過 2 個月租金。",
      },
      {
        id: "m25q2",
        q: "合約上寫了牴觸法定應記載事項的條款，是否有效？",
        options: ["簽名了就一定有效", "牴觸法定規定的部分不當然有效", "完全無法判斷", "只要房東同意就有效"],
        answer: 1,
        explain: "牴觸內政部應記載及不得記載事項的條款，即使雙方簽名，也不當然有效，可以主張依法認定。",
      },
    ],
  },
  {
    number: 26,
    station: "報稅爭議站",
    title: "房東說「報稅就漲租金」怎麼辦",
    enTitle: "\"If You Claim the Deduction, Rent Goes Up\"",
    subtitle: "申報租金扣除額，是房客自己合法的節稅權益，不是房東能片面禁止的。",
    minutes: 6,
    color: "#a0522d",
    colorInk: "#7a3d20",
    quiz: [
      {
        id: "m26q1",
        q: "房東要求房客不能申報租金扣除額，否則要漲租金，這個要求合法嗎？",
        options: ["合法，房東可以自由要求", "不合法，租客依法有權利申報租金扣除額", "只要口頭說好就有效", "要看地區規定"],
        answer: 1,
        explain: "租客依法有權利申報租金支出特別扣除額，這是租客自己的稅務權益，不是房東可以片面禁止的。",
      },
      {
        id: "m26q2",
        q: "房屋租金支出特別扣除額目前屬於哪一種扣除額？",
        options: ["列舉扣除額", "特別扣除額", "不能扣除", "只有房東能扣除"],
        answer: 1,
        explain: "房屋租金支出已從列舉扣除額改為特別扣除額，上限金額由財政部公告。",
      },
    ],
  },
  {
    number: 27,
    station: "修繕站",
    title: "修繕責任歸屬",
    enTitle: "Who's Responsible for Repairs",
    subtitle: "正常損壞通常房東負責；使用不當造成的損壞則是房客的事。",
    minutes: 6,
    color: "#a0522d",
    colorInk: "#7a3d20",
    quiz: [
      {
        id: "m27q1",
        q: "非人為因素的正常損壞（如老舊管線漏水），修繕責任通常由誰負責？",
        options: ["房客", "房東", "政府", "沒有人負責"],
        answer: 1,
        explain: "依民法出租人原則上負有修繕義務，非人為因素的正常損壞通常由房東負責。",
      },
      {
        id: "m27q2",
        q: "東西壞了不敢跟房東反應，自己默默花錢修，可能有什麼問題？",
        options: ["完全沒有問題", "可能是房東本該負責的項目，白白多花了錢", "房東一定會發現", "會影響信用紀錄"],
        answer: 1,
        explain: "很多損壞其實屬於房東該負責的正常修繕範圍，不敢反應、自己花錢修，等於白白吃虧。",
      },
    ],
  },
  {
    number: 28,
    station: "退租站",
    title: "退租與押金爭議",
    enTitle: "Move-Out and Deposit Disputes",
    subtitle: "入住與退租都拍照存證，是保護自己最簡單的方法。",
    minutes: 6,
    color: "#a0522d",
    colorInk: "#7a3d20",
    quiz: [
      {
        id: "m28q1",
        q: "退租時發生押金爭議，以下哪個做法有幫助？",
        options: ["什麼都不用準備", "入住與退租時都拍照存證", "只靠口頭約定", "不需要任何證據"],
        answer: 1,
        explain: "入住與退租時都拍照存證，發生押金爭議時可以作為屋況變化的證據。",
      },
      {
        id: "m28q2",
        q: "房東能不能無故扣留房客的押金？",
        options: [
          "可以，押金本來就是房東的",
          "不行，只能就實際超出正常使用磨損範圍的損壞扣除費用",
          "可以，只要房東覺得有需要",
          "押金一定全額退還，不能扣任何費用",
        ],
        answer: 1,
        explain: "房東不能無故扣留押金，只能就實際損壞（超出正常使用磨損範圍）扣除修復費用。",
      },
    ],
  },
  // 保險線 (new line) — modules 29-33.
  {
    number: 29,
    station: "健保站",
    title: "健保給你什麼，不給你什麼",
    enTitle: "What National Health Insurance Covers — and Doesn't",
    subtitle: "健保是基礎保障，不是全額給付。",
    minutes: 6,
    color: "#16a085",
    colorInk: "#0e6b56",
    quiz: [
      {
        id: "m29q1",
        q: "全民健保通常不給付以下哪一項？",
        options: ["門診", "住院手術", "病房差額與美容醫療等自費項目", "基本醫療需求"],
        answer: 2,
        explain: "健保給付大部分基本醫療需求，但病房差額、特殊自費藥物器材、健檢、美容醫療等屬於自費項目。",
      },
      {
        id: "m29q2",
        q: "「有健保就什麼都不用擔心」這個想法，問題在哪裡？",
        options: [
          "健保根本不能用",
          "健保是基礎保障，不是全額給付，自費項目在重大疾病時可能是不小負擔",
          "健保只有老人能用",
          "沒有問題，這是對的",
        ],
        answer: 1,
        explain: "健保給付範圍有限，認識給付範圍才知道自己實際的保障缺口在哪裡。",
      },
    ],
  },
  {
    number: 30,
    station: "職災站",
    title: "勞保、勞退、職災的差別",
    enTitle: "Labor Insurance, Pension, and Occupational Injury Insurance",
    subtitle: "勞退才是退休金專戶，勞保是保險性質。",
    minutes: 6,
    color: "#16a085",
    colorInk: "#0e6b56",
    quiz: [
      {
        id: "m30q1",
        q: "勞保跟勞退的差別是什麼？",
        options: [
          "完全一樣",
          "勞保是社會保險性質，勞退是雇主提撥、屬於個人所有的退休金專戶",
          "勞退才是保險",
          "勞保是退休金",
        ],
        answer: 1,
        explain: "勞保包含生育、傷病、失能、老年、死亡等給付；勞退是雇主每月提撥的退休金專戶，屬於個人所有。",
      },
      {
        id: "m30q2",
        q: "職業災害保險自哪一年起與勞保整合施行？",
        options: ["100 年", "111 年", "120 年", "尚未整合"],
        answer: 1,
        explain: "勞工職業災害保險自 111 年 5 月起與勞保整合施行，雇主應為所有員工投保。",
      },
    ],
  },
  {
    number: 31,
    station: "商保站",
    title: "四種商業保險",
    enTitle: "Four Types of Commercial Insurance",
    subtitle: "意外險賠意外，醫療險賠住院，兩者理賠情況不同。",
    minutes: 7,
    color: "#16a085",
    colorInk: "#0e6b56",
    quiz: [
      {
        id: "m31q1",
        q: "意外險理賠的情況通常是？",
        options: ["生病住院", "意外事故導致的傷殘或身故", "定期健檢", "牙齒保健"],
        answer: 1,
        explain: "意外險保障意外事故導致的傷殘或身故，跟醫療險理賠生病住院的情況不同。",
      },
      {
        id: "m31q2",
        q: "「實支實付」保險的理賠方式是根據什麼？",
        options: ["固定金額，不論實際花費", "依實際自費醫療支出理賠", "只賠一次", "不用單據就能領"],
        answer: 1,
        explain: "實支實付依實際自費醫療支出理賠，補上健保給付範圍外的缺口。",
      },
    ],
  },
  {
    number: 32,
    station: "儲蓄險站",
    title: "儲蓄險為什麼一直被推銷",
    enTitle: "Why Savings Insurance Gets Pushed So Hard",
    subtitle: "儲蓄險不是更好的定存，提前解約經常會虧本。",
    minutes: 6,
    color: "#16a085",
    colorInk: "#0e6b56",
    quiz: [
      {
        id: "m32q1",
        q: "儲蓄險最常被誤解成什麼？",
        options: ["意外險", "更好的定存", "醫療險", "健保"],
        answer: 1,
        explain: "儲蓄險有保單期間限制，提前解約通常會虧損本金，流動性遠不如定存。",
      },
      {
        id: "m32q2",
        q: "業務員推銷儲蓄險特別積極，原因之一是？",
        options: ["儲蓄險對客戶最有利", "儲蓄險佣金通常較高", "政府規定必須推銷", "沒有特別原因"],
        answer: 1,
        explain: "儲蓄險常被包裝成「存錢又有保障」，但保障部分通常很低，業務員的佣金通常較高。",
      },
    ],
  },
  {
    number: 33,
    station: "團保站",
    title: "學生團保",
    enTitle: "Student Group Insurance",
    subtitle: "多數人不知道自己有團保，意外發生時忘了申請理賠。",
    minutes: 5,
    color: "#16a085",
    colorInk: "#0e6b56",
    quiz: [
      {
        id: "m33q1",
        q: "學生團保通常保障範圍是？",
        options: ["完整的重大疾病保障", "多為意外傷害醫療，保額通常不高", "涵蓋所有醫療需求", "不存在這個制度"],
        answer: 1,
        explain: "學校通常統一投保學生團體保險，保費相對便宜，但保障範圍多為意外傷害醫療，保額通常不高。",
      },
      {
        id: "m33q2",
        q: "以下哪個是常見的學生團保誤區？",
        options: [
          "了解自己團保的保障範圍",
          "完全不知道自己有學生團保，發生意外時沒去申請理賠",
          "評估是否需要額外個人保障",
          "詢問學校總務處確認保單內容",
        ],
        answer: 1,
        explain: "很多學生完全不知道自己有學生團保，白白放棄了已經繳過保費的保障。",
      },
    ],
  },
  // 創業線 (new line) — modules 34-38.
  {
    number: 34,
    station: "成本站",
    title: "固定成本 vs 變動成本",
    enTitle: "Fixed Costs vs. Variable Costs",
    subtitle: "搞懂這兩種成本，才知道賣多少才會開始賺錢。",
    minutes: 6,
    color: "#d68910",
    colorInk: "#8a5906",
    quiz: [
      {
        id: "m34q1",
        q: "以下哪一項屬於「固定成本」？",
        options: ["原料", "包材", "店租", "以上皆是變動成本"],
        answer: 2,
        explain: "固定成本不隨銷售量變化，像店租、基本人事費；原料、包材屬於變動成本，隨銷售量增減。",
      },
      {
        id: "m34q2",
        q: "不區分固定成本跟變動成本，最容易導致什麼問題？",
        options: [
          "定價太高",
          "賣越多賠越多卻沒發現",
          "完全不會有問題",
          "只影響報稅",
        ],
        answer: 1,
        explain: "把所有支出混在一起算，容易忽略成本結構，導致「賣越多賠越多」都沒發現。",
      },
    ],
  },
  {
    number: 35,
    station: "定價站",
    title: "定價與毛利",
    enTitle: "Pricing and Gross Margin",
    subtitle: "毛利率是判斷一個商品好不好賺的關鍵指標。",
    minutes: 6,
    color: "#d68910",
    colorInk: "#8a5906",
    quiz: [
      {
        id: "m35q1",
        q: "毛利率的計算方式是？",
        options: ["售價除以成本", "毛利除以售價", "固定成本除以變動成本", "跟定價無關"],
        answer: 1,
        explain: "毛利率 = 毛利 ÷ 售價，是判斷一個商品好不好賺的關鍵指標。",
      },
      {
        id: "m35q2",
        q: "定價時，比較恰當的做法是？",
        options: [
          "別人賣多少我也賣多少，不管自己成本",
          "先算清楚自己的成本結構再定價",
          "越便宜越好",
          "越貴越好",
        ],
        answer: 1,
        explain: "定價要考慮市場能接受的價格、競爭對手定價，但前提是先算清楚自己的成本結構。",
      },
    ],
  },
  {
    number: 36,
    station: "兩平站",
    title: "損益兩平點",
    enTitle: "The Break-Even Point",
    subtitle: "算出這個數字，才知道一個生意構想是否實際可行。",
    minutes: 7,
    color: "#d68910",
    colorInk: "#8a5906",
    quiz: [
      {
        id: "m36q1",
        q: "損益兩平點指的是什麼？",
        options: ["開始虧損的數量", "收入剛好等於總成本的銷售數量", "最大獲利點", "跟成本無關的固定數字"],
        answer: 1,
        explain: "損益兩平點是「賣多少數量，收入剛好等於總成本」的那個點，超過這個數量才開始真正賺錢。",
      },
      {
        id: "m36q2",
        q: "只憑感覺覺得「應該會賺錢」，沒實際算過損益兩平點，可能發生什麼事？",
        options: [
          "一定會賺錢",
          "開始做了才發現要賣的數量遠超過現實能達到的規模",
          "完全沒有風險",
          "跟現金流無關",
        ],
        answer: 1,
        explain: "沒算過損益兩平點，很容易高估自己能賺錢的把握，開始做了才發現數量不現實。",
      },
    ],
  },
  {
    number: 37,
    station: "現金流站",
    title: "現金流 vs 獲利",
    enTitle: "Cash Flow vs. Profit",
    subtitle: "很多小生意不是死於不賺錢，是死於現金流斷裂。",
    minutes: 6,
    color: "#d68910",
    colorInk: "#8a5906",
    quiz: [
      {
        id: "m37q1",
        q: "帳面上有獲利，是否代表手上一定有現金可以用？",
        options: ["是，獲利就等於現金", "不一定，客戶可能還沒付款、庫存還沒賣掉", "只要有獲利就不會倒閉", "獲利跟現金完全無關"],
        answer: 1,
        explain: "帳面上有獲利不代表手上有現金可以用，例如客戶還沒付款、庫存還沒賣掉。",
      },
      {
        id: "m37q2",
        q: "很多小生意倒閉的真正原因是？",
        options: ["完全不賺錢", "現金流斷裂，手上沒有現金支付當下該付的錢", "商品太便宜", "員工太多"],
        answer: 1,
        explain: "很多小生意不是死於「不賺錢」，是死於「手上沒有現金支付當下該付的錢」，也就是現金流斷裂。",
      },
    ],
  },
  {
    number: 38,
    station: "登記站",
    title: "商業登記與發票",
    enTitle: "Business Registration and Invoicing",
    subtitle: "規模擴大後補辦登記，比提早了解規則麻煩得多。",
    minutes: 5,
    color: "#d68910",
    colorInk: "#8a5906",
    quiz: [
      {
        id: "m38q1",
        q: "在台灣營利達到一定規模，依規定需要辦理什麼？",
        options: ["不需要任何登記", "商業登記，並依規定開立發票或收據", "只需要口頭告知政府", "只有上市公司需要"],
        answer: 1,
        explain: "在台灣營利達到一定規模，需要辦理商業登記，並依規定開立統一發票或收據，是合法經營的基本義務。",
      },
      {
        id: "m38q2",
        q: "「學生小規模擺攤不用管商業登記」這個想法，問題在哪裡？",
        options: [
          "完全沒有問題",
          "規模擴大後補辦登記反而更麻煩，提早了解規則比較安全",
          "學生一定不用登記",
          "只有食品業需要登記",
        ],
        answer: 1,
        explain: "覺得小規模擺攤不用管這些是常見誤區，規模擴大後補辦登記反而更麻煩。",
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

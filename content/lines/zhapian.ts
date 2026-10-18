/**
 * 詐騙線 content (04-CONTENT §9): six case files, each its own task set.
 * Placement is by station topic: case 3 (投資) → station 9, case 4 (解除分期)
 * → station 11, case 6 (假冒親友) → station 12. Cases 1, 2 and 5 are the
 * 案件庫 (library). Each case's hook matches its own scenario; the line hook
 * (the 洗錢 call) sits on case 2, the 假檢警 call.
 *
 * Sources:
 * - 2025 statistics (case 1 and case 3 cards): 內政部警政署 警政統計通報
 *   115年第14週 (2026-04-01), as framed in components/lessons/Module9.tsx
 *   (19.8 萬件, 投資詐欺 29.69% 最多) and Module11.tsx (未滿 18 歲和 18–23 歲
 *   被害人最常遇到假網路拍賣（購物）).
 * - Case 5 law note: quoted from components/lessons/Module10.tsx, verified
 *   2026-10-06 against 全國法規資料庫 (洗錢防制法 §22; 刑法 §339-4).
 * - 165 反詐騙諮詢專線: 內政部警政署.
 * - Every person, shop, bank and account below is fictional. Amounts inside
 *   the chats are what the scammer says, not facts.
 */

import type {
  BiasReveal,
  ChatData,
  ChoiceStep,
  FindStep,
  Hook,
  LessonCard,
  LineContent,
  OrderStep,
  StationLesson,
  Takeaway,
} from "@/lib/tasks/types";

const lineHook: Hook = {
  question: "接到電話說你涉及洗錢，要你保密配合，你會怎麼做？",
  options: [
    { id: "comply", label: "照他說的做" },
    { id: "verify", label: "掛掉，打 165 查證" },
    { id: "family", label: "先問家人" },
  ],
};

const cardThreeNo: LessonCard = {
  kind: "text",
  title: "防詐三不",
  body: "不信陌生來訊，不理可疑連結，不照指示轉帳。有懷疑就多問、多查、多確定，打 165。",
};

const reveal: BiasReveal = {
  bias: "急迫感和權威",
  default: "詐騙最常用兩招：讓你急，讓你怕。只要對方要你『馬上』或『保密』，就先停下來。",
};

const takeaway: Takeaway = {
  name: "防詐三不",
  lines: ["不信陌生來訊", "不理可疑連結", "不照指示轉帳", "有懷疑就打 165"],
};

const SCAM_TYPES: ChoiceStep["options"] = [
  { id: "shopping", label: "網購詐騙" },
  { id: "police", label: "假檢警" },
  { id: "investment", label: "投資詐騙" },
  { id: "installment", label: "解除分期詐騙" },
  { id: "job", label: "求職詐騙（人頭帳戶、車手）" },
  { id: "friend", label: "假冒親友" },
];

function findStep(targets: Record<string, string>, explanation: string): FindStep {
  return {
    id: "s1",
    type: "find",
    prompt: "找出對話裡的警訊。",
    materialIndex: 0,
    targets: Object.keys(targets),
    explainTargets: targets,
    explanation,
  };
}

function typeStep(correct: string, explanation: string): ChoiceStep {
  return {
    id: "s2",
    type: "choice",
    prompt: "這是哪一種詐騙？",
    options: SCAM_TYPES,
    correct,
    explanation,
  };
}

const orderStep: OrderStep = {
  id: "s3",
  type: "order",
  prompt: "遇到這種狀況，該怎麼做？排出順序。",
  items: [
    { id: "stop", label: "停止回應" },
    { id: "verify", label: "用官方電話查證或打 165" },
    { id: "never", label: "絕不轉帳或給驗證碼" },
    { id: "report", label: "保留證據並報案" },
  ],
  answer: ["stop", "verify", "never", "report"],
  explanation:
    "先停下來，不再回應。再用官方電話查證，或打 165。不管對方怎麼說，都不轉帳、不給驗證碼。最後留下對話和截圖，去報案。",
};

interface CaseSpec {
  n: number;
  stationId: number | null;
  minutes: number;
  title: string;
  hook: Hook;
  extraCard?: LessonCard;
  situation: string;
  chat: ChatData;
  targets: Record<string, string>;
  findExplanation: string;
  type: string;
  typeExplanation: string;
}

function caseLesson(c: CaseSpec): StationLesson {
  return {
    stationId: c.stationId,
    placement: c.stationId === null ? "library" : "station",
    hook: c.hook,
    lessonCards: c.extraCard ? [cardThreeNo, c.extraCard] : [cardThreeNo],
    task: {
      id: `zhapian.case${c.n}.v1`,
      kind: `zhapian_case${c.n}_v1`,
      title: c.title,
      brief: { role: "你", situation: c.situation },
      materials: [{ kind: "chat", data: c.chat }],
      steps: [findStep(c.targets, c.findExplanation), typeStep(c.type, c.typeExplanation), orderStep],
      passScore: 0.6,
    },
    reveal,
    takeaway,
    minutes: c.minutes,
    lifeGameTurn: true,
    doLine: "讀完對話，抓出詐騙的破綻",
  };
}

// --- case 1: 半價球鞋 (library) --------------------------------------------------

const case1 = caseLesson({
  n: 1,
  stationId: null,
  minutes: 15,
  title: "案件一：半價球鞋",
  // Added (04 silent): case 1's own hook; the line hook moved to case 2.
  hook: {
    question: "看到限量球鞋只要三折，你會先轉帳搶下來嗎？",
    options: [
      { id: "buy", label: "會，先搶再說" },
      { id: "check", label: "先查這家店" },
      { id: "skip", label: "太便宜，不買" },
    ],
  },
  extraCard: {
    kind: "text",
    title: "年輕人最常遇到的",
    // 警政署 警政統計通報 115年第14週 (see header).
    body: "2025 年，未滿 18 歲和 18 到 23 歲的詐欺被害人，最常遇到的都是假網路拍賣（購物）詐騙。",
  },
  situation: "你在社群看到限量球鞋三折的廣告。點進去後，賣家把你拉到私訊。",
  chat: {
    contact: "潮鞋小舖",
    messages: [
      {
        time: "20:41",
        from: "them",
        text: "你好，是從廣告來的吧？這雙限量聯名鞋原價 NT$6,800，今天三折，只要 NT$2,040。",
      },
      { time: "20:43", from: "me", text: "真的假的？有 26 號嗎？" },
      { time: "20:43", from: "them", text: "有喔，26 號還有。" },
      { time: "20:45", from: "me", text: "可以貨到付款嗎？" },
      {
        time: "20:46",
        from: "them",
        text: "貨到付款已經賣完了。現在只能先轉帳保留，今天轉，明天就寄。",
      },
      { time: "20:47", from: "me", text: "好，帳號是多少？" },
      {
        time: "20:47",
        from: "them",
        text: "青山銀行 帳號 1234-5678-9012，戶名 陳美玲。是老闆娘的私人帳戶，入帳比較快。",
      },
    ],
  },
  targets: {
    "msg:0": "限量鞋打三折，價格低得不合理。太便宜，通常就是餌。",
    "msg:4": "不能貨到付款，只能先轉帳。錢一轉出去，就很難拿回來。",
    "msg:6": "收款戶名跟店名不一樣。正常商店會用公司帳戶收款。",
  },
  findExplanation: "三個警訊：價格太低、要你轉帳不能貨到付款、收款帳戶名字跟店名不一樣。",
  type: "shopping",
  typeExplanation: "價格太低、只收轉帳、戶名不對，這是網購詐騙。",
});

// --- case 2: 地檢署來電 (library) ------------------------------------------------

const case2 = caseLesson({
  n: 2,
  stationId: null,
  minutes: 15,
  title: "案件二：地檢署來電",
  // The line hook (04 §2) is about exactly this call, so it lives here.
  hook: lineHook,
  situation: "一個沒看過的號碼打來，你接起電話。下面是通話內容。",
  chat: {
    contact: "未顯示號碼",
    mode: "call",
    messages: [
      { time: "10:12", from: "them", text: "喂，請問是你本人嗎？有件事要跟你確認。" },
      { time: "10:12", from: "me", text: "是我，什麼事？" },
      {
        time: "10:13",
        from: "them",
        text: "這裡是臺北地方檢察署。你的帳戶被查到跟一起洗錢案有關，不配合調查，就會直接發拘票。",
      },
      { time: "10:13", from: "me", text: "我沒有做這種事啊。" },
      {
        time: "10:14",
        from: "them",
        text: "我們知道你可能是被利用。這是偵查不公開，你不能告訴任何人，家人也不行。",
      },
      { time: "10:15", from: "me", text: "那我要怎麼做？" },
      {
        time: "10:15",
        from: "them",
        text: "把你的存款轉到監管帳戶，讓我們查清楚，查完全部退還給你。",
      },
      { time: "10:16", from: "me", text: "我先想一下。" },
    ],
  },
  targets: {
    "msg:2": "用公家機關的名義，再拿拘票嚇你。真的檢察署不會在電話裡這樣施壓。",
    "msg:4": "要你保密，連家人都不能說。不讓你問別人，就是怕你發現。",
    "msg:6": "沒有任何檢警單位會要你把錢轉到「監管帳戶」。",
  },
  findExplanation: "三個警訊：用公家機關名義施壓、要你保密、要你轉帳到監管帳戶。",
  type: "police",
  typeExplanation: "冒充檢察署、要你保密、要你轉帳到監管帳戶，這是假檢警。",
});

// --- case 3: 投資老師群組 (station 9) --------------------------------------------

const case3 = caseLesson({
  n: 3,
  stationId: 9,
  minutes: 8,
  title: "案件三：投資老師群組",
  hook: {
    question: "群組裡有人曬出賺錢截圖，你會想跟著買嗎？",
    options: [
      { id: "follow", label: "會想試試" },
      { id: "watch", label: "先看看再說" },
      { id: "no", label: "不會" },
    ],
  },
  extraCard: {
    kind: "text",
    title: "最常見的詐騙",
    // 警政署 警政統計通報 115年第14週 (see header).
    body: "2025 年台灣發生的詐欺案件約 19.8 萬件，其中最多的是投資詐欺，約占三成（29.69%）。",
  },
  situation: "有人把你拉進一個 LINE 股票群組。群組裡每天都有人在曬賺錢。",
  chat: {
    contact: "飆股研究室 VIP 群",
    messages: [
      { time: "19:30", from: "them", text: "歡迎新朋友！我是群組助理，大家跟著老師操作就好。" },
      { time: "19:31", from: "them", text: "【老師】跟著我，每個月穩穩賺 20%，保證不會賠。" },
      { time: "19:40", from: "me", text: "真的嗎？我只有一點點錢。" },
      {
        time: "19:42",
        from: "them",
        text: "先放 NT$5,000 試試看。你看，已經幫你賺了 NT$500，現在就可以領出來。",
      },
      { time: "20:05", from: "me", text: "哇，真的領到了！" },
      {
        time: "20:06",
        from: "them",
        text: "老師的 VIP 方案只剩三個名額。加入要 NT$50,000，賺得更多。",
      },
      { time: "20:10", from: "me", text: "我想一下，那是我全部的存款。" },
    ],
  },
  targets: {
    "msg:1": "投資一定有風險。說「保證不會賠」的，就是詐騙。",
    "msg:3": "先讓你小賺、順利領錢，是為了讓你相信，等你投入更多。",
    "msg:5": "小賺之後，馬上要你加碼一大筆，還用名額催你。",
  },
  findExplanation: "三個警訊：保證獲利、先讓你小賺、要求加碼大筆金額。",
  type: "investment",
  typeExplanation: "保證獲利、先給甜頭、再要大錢，這是投資詐騙。",
});

// --- case 4: 客服說誤設分期 (station 11) -----------------------------------------

const case4 = caseLesson({
  n: 4,
  stationId: 11,
  minutes: 7,
  title: "案件四：客服說誤設分期",
  hook: {
    question: "接到「客服」電話說你的訂單設錯了，你會怎麼做？",
    options: [
      { id: "follow", label: "照他說的處理" },
      { id: "hang_up", label: "掛掉，自己找官方客服" },
      { id: "family", label: "先問家人" },
    ],
  },
  situation: "你上週網購了一副耳機，今天接到自稱客服的電話。下面是通話內容。",
  chat: {
    contact: "自稱網購客服",
    mode: "call",
    messages: [
      {
        time: "14:20",
        from: "them",
        text: "您好，這裡是拾光購物客服。您上週買的耳機，系統出錯，被設成每個月扣款，扣 12 期。",
      },
      { time: "14:20", from: "me", text: "什麼？我只買一次啊。" },
      {
        time: "14:21",
        from: "them",
        text: "很抱歉。等一下銀行專員會打給您，請您照他說的配合，就能取消。",
      },
      {
        time: "14:25",
        from: "them",
        text: "您好，我是青山銀行專員。請您現在到附近的 ATM，我在電話裡一步一步教您。",
      },
      { time: "14:26", from: "me", text: "ATM 可以取消分期喔？" },
      {
        time: "14:27",
        from: "them",
        text: "可以，您按「轉帳」，再輸入我給您的代碼，分期就解除了。",
      },
      { time: "14:28", from: "me", text: "好像怪怪的，為什麼要按轉帳？" },
    ],
  },
  targets: {
    "msg:2": "對方主動打來，還安排「銀行專員」要你配合。真的有問題，你可以自己打官方客服問。",
    "msg:3": "真正的客服和銀行，不會要你去 ATM 處理任何事。",
    "msg:5": "ATM 沒有解除分期的功能。按下轉帳，就是把錢轉給對方。",
  },
  findExplanation: "三個警訊：主動來電要你配合、要你去 ATM 操作、ATM 根本不能解除分期。",
  type: "installment",
  typeExplanation: "說訂單設錯、要你去 ATM 解除，這是解除分期詐騙。",
});

// --- case 5: 日領 3,000 的工作 (library) ----------------------------------------

const case5 = caseLesson({
  n: 5,
  stationId: null,
  minutes: 15,
  title: "案件五：日領 3,000 的工作",
  hook: {
    question: "一天 3,000 元、工作很輕鬆，你會想去嗎？",
    options: [
      { id: "apply", label: "會想去" },
      { id: "ask", label: "先問清楚做什麼" },
      { id: "no", label: "不會" },
    ],
  },
  situation: "你在網路上找打工。有人看到你的貼文，私訊你。",
  chat: {
    contact: "輕鬆打工小幫手",
    messages: [
      {
        time: "22:05",
        from: "them",
        text: "看到你在找打工！我們的工作很輕鬆，不用經驗，一天就能領 NT$3,000。",
      },
      { time: "22:06", from: "me", text: "要做什麼？" },
      {
        time: "22:07",
        from: "them",
        text: "很簡單。把你的提款卡和密碼寄給公司，借你的帳戶收貨款就好。",
      },
      { time: "22:08", from: "me", text: "為什麼要用我的帳戶？" },
      {
        time: "22:09",
        from: "them",
        text: "公司帳戶額度不夠而已。不想給卡也行，幫我們去取包裹，再去 ATM 把錢領出來交給同事。",
      },
      { time: "22:10", from: "me", text: "這樣合法嗎？" },
      { time: "22:10", from: "them", text: "放心啦，很多學生都在做，當天就領現金。" },
    ],
  },
  targets: {
    "msg:0": "不用經驗、工作輕鬆、薪水卻很高，通常不是正常工作。",
    "msg:2": "要你的提款卡和密碼，就是要拿你的帳戶當人頭帳戶，收詐騙的錢。",
    "msg:4": "幫人領錢再轉交，就是詐騙集團裡的車手。",
  },
  findExplanation: "三個警訊：高薪輕鬆、要你的帳戶或提款卡、要你幫人領錢。",
  type: "job",
  // Law wording quoted from components/lessons/Module10.tsx (verified 2026-10-06).
  typeExplanation:
    "要你交出帳戶，或幫人領錢，這是求職詐騙。沒有正當理由把帳戶交給別人用，第一次會被警察告誡。但只要收了好處、一次交出三個以上帳戶，或被告誡後五年內再犯，就不只是告誡：可處三年以下有期徒刑、拘役或科或併科新臺幣一百萬元以下罰金。幫人領錢的車手，會成為加重詐欺的共犯：刑法第 339 條之 4，處一年以上七年以下有期徒刑，得併科一百萬元以下罰金。",
});

// --- case 6: 好朋友借點數 (station 12) -------------------------------------------

const case6 = caseLesson({
  n: 6,
  stationId: 12,
  minutes: 8,
  title: "案件六：好朋友借點數",
  hook: {
    question: "好朋友突然傳訊息說急著要你幫忙，你會怎麼做？",
    options: [
      { id: "help", label: "先幫他再說" },
      { id: "call", label: "先打電話給他" },
      { id: "ask", label: "問問共同朋友" },
    ],
  },
  situation: "好朋友阿哲突然傳訊息給你。",
  chat: {
    contact: "阿哲",
    messages: [
      { time: "16:02", from: "them", text: "在嗎？幫我一個忙，很急！" },
      { time: "16:03", from: "me", text: "怎麼了？" },
      {
        time: "16:03",
        from: "them",
        text: "我要買遊戲點數，卡一直刷不過。你可以先幫我買 NT$3,000 的點數嗎？明天還你。",
      },
      { time: "16:04", from: "them", text: "買好之後，把點數卡的序號拍給我就好。" },
      { time: "16:05", from: "me", text: "我打給你好了，比較快。" },
      { time: "16:05", from: "them", text: "現在不方便講電話，在上課。你先買，拜託。" },
      { time: "16:06", from: "me", text: "你真的是阿哲嗎？" },
    ],
  },
  targets: {
    "msg:0": "一開口就說很急，讓你來不及想。",
    "msg:3": "點數序號跟現金一樣，傳出去就被用掉，拿不回來。",
    "msg:5": "不能講電話，因為一聽聲音就會露餡。帳號可能被盜了。",
  },
  findExplanation: "三個警訊：急著要、要點數序號、不能講電話。",
  type: "friend",
  typeExplanation: "朋友的帳號急著要點數、又不肯講電話，這是假冒親友。先打電話給本人確認。",
});

export const content: LineContent = {
  slug: "zhapian",
  hook: lineHook,
  bias: "急迫感、權威",
  takeaway,
  unlocks: "詐騙事件會標出安全的選項",
  lessons: [case1, case2, case3, case4, case5, case6],
};

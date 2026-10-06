/**
 * 165 判讀中心 (詐騙線 terminal) — a timed real/fake message classifier, not
 * a financial-math simulation like the other lines. Cards mix realistic
 * scam openers (matching the line's five stations) with ordinary everyday
 * messages, in a fixed order — no live/scraped content, entirely
 * illustrative and modeled on publicly documented scam patterns.
 */

export interface FraudCard {
  id: string;
  sender: string;
  text: string;
  isScam: boolean;
  explain: string;
  /**
   * What actually happens if a student believes a scam card. The line
   * promises that wrong answers show real consequences; `explain` describes
   * the pattern, this says what it costs. Scam cards only.
   */
  consequence?: string;
}

export const FRAUD_CARDS: FraudCard[] = [
  {
    id: "c1",
    sender: "LINE 群組・「飆股情報站」",
    text: "老師今天又報中三檔，跟上車的都賺爛了！現在加入還來得及，名額有限～",
    isScam: true,
    explain: "假投資群組的典型話術：一位「老師」報明牌＋其他人曬獲利。那些截圖很可能是同夥安排的假帳號。",
    consequence: "照著做的話：老師會叫你下載一個投資 App，先讓你小賺幾筆加碼；等你想把錢領出來，就要你先繳「保證金」「稅金」，錢再也領不回來。",
  },
  {
    id: "c2",
    sender: "同學",
    text: "欸你禮拜五有空嗎？想約你一起去看電影",
    isScam: false,
    explain: "單純的朋友邀約，沒有要求轉帳、沒有可疑連結，是正常訊息。",
  },
  {
    id: "c3",
    sender: "簡訊・購物網客服",
    text: "您已訂閱本平台月付方案，如需取消請至 ATM 依指示操作，客服專線 0800-000-000",
    isScam: true,
    explain: "真正的客服不會要求你去 ATM「解除」任何交易。這類操作的真正目的是把你帳戶裡的錢轉出去。",
    consequence: "照著做的話：你在 ATM 按的其實是「轉帳」，錢直接進了對方的帳戶；轉出去的錢很難追回。",
  },
  {
    id: "c4",
    sender: "超商取貨通知",
    text: "您訂購的商品已送達門市，取件碼 8823，請於 7 日內憑碼取件，逾期將退回",
    isScam: false,
    explain: "正常的物流通知，沒有要求提供個資或點擊可疑連結。",
  },
  {
    id: "c21",
    sender: "LINE 視訊・自稱「地檢署檢察官」",
    text: "你的帳戶涉及洗錢案，這是你的拘票。偵查不公開，不能告訴家人，請把存款轉到法院的監管帳戶，查清楚就退還",
    isScam: true,
    explain: "假檢警：檢察官、警察不會用 LINE 辦案，也沒有「監管帳戶」這種東西。「不能告訴家人」是為了讓你沒機會求證。",
    consequence: "照著做的話：「監管帳戶」就是詐騙集團的帳戶，轉進去的存款不會退還；有些人還被要求交出存摺和提款卡。",
  },
  {
    id: "c5",
    sender: "交友軟體・認識 3 週的對象",
    text: "認識你這陣子很開心。跟你說一個秘密，我最近在做一個穩賺的投資，想帶你一起試試看",
    isScam: true,
    explain: "殺豬盤的典型轉折點：先培養感情，再提到投資。時間長不代表關係真實，一提到投資就該提高警覺。",
    consequence: "照著做的話：對方會帶你到一個假的投資平台，帳面上一直賺；等你想領出來，平台要你再繳錢，最後人和錢一起消失。",
  },
  {
    id: "c6",
    sender: "簡訊・中華郵政",
    text: "您的包裹因地址不全遭退回，請於 24 小時內至以下網址更新資料：http://post-tw-update.tk",
    isScam: true,
    explain: "官方網域不會是這種奇怪的縮寫或免費網域，這是典型的釣魚簡訊，目的是騙取個資或安裝惡意程式。",
    consequence: "照著做的話：你在假網站填的個資和卡號，會被拿去盜刷或轉賣給其他詐騙集團。",
  },
  {
    id: "c7",
    sender: "家人",
    text: "晚餐想吃什麼，我下班順路買",
    isScam: false,
    explain: "日常家人對話，沒有任何可疑之處。",
  },
  {
    id: "c8",
    sender: "LINE・打工社團",
    text: "缺工讀嗎？在家打字日賺 2000，需先繳 300 元材料保證金才能開始接案",
    isScam: true,
    explain: "任何要求求職者「先繳錢」才能開始上班的機會，都該高度懷疑——真正合法的工作不會這樣要求。",
    consequence: "照著做的話：繳了保證金就聯絡不上對方；有些「工作」其實是要你交出帳戶，讓你變成人頭帳戶。",
  },
  {
    id: "c9",
    sender: "簡訊・165 反詐騙",
    text: "您好，我是刑事局警察，您的健保卡疑似涉及刑案，請將帳戶內款項轉入安全帳戶配合調查",
    isScam: true,
    explain: "公家機關不會用電話或簡訊要求把錢轉入「安全帳戶」。真正的公家機關會用正式公文聯繫。",
    consequence: "照著做的話：「安全帳戶」就是詐騙集團的帳戶，轉進去的錢不會還給你。",
  },
  {
    id: "c10",
    sender: "電信業者",
    text: "您的月租費帳單已產生，金額 399 元，將於 15 日自動扣款，詳情請登入官方 App 查詢",
    isScam: false,
    explain: "單純的帳單通知，沒有要求點擊不明連結或立即操作，屬於正常訊息。",
  },
  {
    id: "c11",
    sender: "LINE 群組・「飆股情報站」",
    text: "【群組公告】小明剛剛出金 18 萬，恭喜！大家要把握這一波，晚了就沒機會了",
    isScam: true,
    explain: "「已經有人出金了」是假投資群組常見的取信手法，製造「別人都在賺、你不跟就虧了」的急迫感。",
    consequence: "照著做的話：你投入的錢只是假平台上的數字，越晚發現、投進去的越多。",
  },
  {
    id: "c12",
    sender: "銀行",
    text: "您於今日 14:32 以行動銀行 App 登入成功，如非本人操作請洽本行客服 0800-000-000",
    isScam: false,
    explain: "單純的登入通知，只是告知、沒有要求你點擊連結或提供任何資訊，是正常的銀行警示訊息。",
  },
  {
    id: "c22",
    sender: "電話・自稱「購物網客服」",
    text: "王小明您好，您 3 月 2 日訂的藍牙耳機，訂單編號尾數 4471，系統錯誤被設成 12 期分期，需要您到 ATM 協助取消",
    isScam: true,
    explain: "講得出你的姓名和訂單，不代表是真客服——個資外洩很常見。真正的客服不會要你到 ATM 或網銀「取消分期」。",
    consequence: "照著做的話：對方會一步步叫你按 ATM，其實是把錢轉給他；就算掛掉電話，也要自己打給購物網站官方客服確認。",
  },
  {
    id: "c13",
    sender: "簡訊・不明號碼",
    text: "偵測到您的網路銀行帳戶異常登入，請點擊以下連結重新驗證密碼：http://bit.ly/bank-verify",
    isScam: true,
    explain: "要求點連結「重新驗證密碼」是典型的釣魚簡訊，銀行不會用簡訊連結要你輸入密碼。",
    consequence: "照著做的話：你輸入的帳號密碼會被拿去登入你的網路銀行，把錢轉走。",
  },
  {
    id: "c14",
    sender: "老師",
    text: "作業已經公布在學校平台上，記得下週三前繳交",
    isScam: false,
    explain: "正常的課業通知，沒有可疑之處。",
  },
  {
    id: "c15",
    sender: "LINE・不熟的朋友",
    text: "急需你的銀行帳戶收一筆貨款，事成後給你 5000 元謝禮，今天就要用喔",
    isScam: true,
    explain: "這是典型的人頭帳戶招募話術。提供帳戶給他人使用，你就會成為法律上的人頭帳戶，可能背上刑責。",
    consequence: "照著做的話：你的帳戶會被拿去收詐騙贓款，被列為警示帳戶，名下帳戶可能都被凍結，還可能觸犯洗錢防制法。",
  },
  {
    id: "c16",
    sender: "醫院掛號系統",
    text: "提醒您預約的門診時間為明天上午 10:00，如需改期請提前 24 小時致電",
    isScam: false,
    explain: "正常的預約提醒，沒有要求任何操作或個資，是正常訊息。",
  },
  {
    id: "c17",
    sender: "簡訊・「中獎通知」",
    text: "恭喜您中得 iPhone 15 一支！請提供身分證字號與地址以利寄送，並支付運費 198 元",
    isScam: true,
    explain: "沒參加的抽獎不會無緣無故中獎。要求提供身分證字號、支付「運費」才能領獎，是典型的假中獎詐騙。",
    consequence: "照著做的話：付了運費也收不到手機，給出去的身分證字號還可能被拿去冒名申辦門號或帳戶。",
  },
  {
    id: "c18",
    sender: "社團幹部",
    text: "本週社課因場地維修，改到活動中心 3 樓進行，時間不變",
    isScam: false,
    explain: "正常的社團公告，沒有可疑之處。",
  },
  {
    id: "c19",
    sender: "交友軟體・新認識的網友",
    text: "我在國外工作，最近手上有一筆外匯投資機會，報酬很穩定，要不要我教你怎麼開始？",
    isScam: true,
    explain: "「國外工作」「穩定報酬」是殺豬盤常見的人設包裝，目的是建立專業感、降低戒心，最終導向假投資平台。",
    consequence: "照著做的話：「穩定報酬」會帶你到假的投資平台，帳面上賺錢、實際領不出來，跟殺豬盤的結局一樣。",
  },
  {
    id: "c20",
    sender: "同學",
    text: "數學筆記借我拍一下好嗎，明天要考試了",
    isScam: false,
    explain: "日常同學互動，沒有任何可疑之處。",
  },
];

/**
 * The end screen. 165 is 內政部警政署's 反詐騙諮詢專線 (data.gov.tw dataset
 * 78432, checked 2026-10). No claim about hours or cost is made.
 */
export const AFTER_SCAM_STEPS = [
  "先停下來：不要再轉帳，也不要再回覆或照對方的指示操作。",
  "打 165 反詐騙諮詢專線（緊急時打 110），說清楚轉帳的時間、金額和對方帳號。",
  "保留證據：對話截圖、通話紀錄、轉帳收據，帶著它們到警察局報案。",
] as const;

export interface FraudOutcome {
  total: number;
  correct: number;
  wrong: { card: FraudCard; userSaidScam: boolean }[];
  timedOut: number; // cards never answered before time ran out
}

/** answers: cardId -> user's judgment (true = "詐", false = "真"). Cards with
 * no entry were never reached before the 60-second timer ran out. */
export function computeFraud(answers: Record<string, boolean>): FraudOutcome {
  let correct = 0;
  let timedOut = 0;
  const wrong: FraudOutcome["wrong"] = [];
  for (const card of FRAUD_CARDS) {
    const userSaidScam = answers[card.id];
    if (userSaidScam === undefined) {
      timedOut++;
      continue;
    }
    if (userSaidScam === card.isScam) {
      correct++;
    } else {
      wrong.push({ card, userSaidScam });
    }
  }
  return { total: FRAUD_CARDS.length, correct, wrong, timedOut };
}

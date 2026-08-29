import type { LineSlug } from "@/lib/lines";

/**
 * 支線 (branches) — two short optional reads per line, full content per the
 * spec. Unlike stations, branches carry no quiz and aren't required for a
 * line's "complete" status — they're extra depth for a student who wants it.
 */
export interface Branch {
  id: string; // URL slug, unique within its line
  lineSlug: LineSlug;
  title: string;
  body: string;
  mistake: string;
}

export const BRANCHES: Branch[] = [
  // 起薪線
  {
    id: "jiaban",
    lineSlug: "qixin",
    title: "加班費怎麼算",
    body: "勞基法規定，平日加班前 2 小時工資按平日每小時工資額加給 1/3 以上，超過 2 小時的部分加給 2/3 以上；休息日、國定假日加班則有更高的加成規定。搞懂這個公式，才知道自己的加班費有沒有算對。",
    mistake: "覺得「反正老闆說多少就是多少」不去核對加班費計算是否正確。自己抓時數簡單試算，發現不對可以詢問或申訴。",
  },
  {
    id: "zizhi",
    lineSlug: "qixin",
    title: "離職與資遣費的差別",
    body: "自己主動離職通常沒有資遣費；被公司資遣（非自願離職）則依照年資可以請領資遣費，還可以請領失業給付。搞清楚自己是「離職」還是「被資遣」，直接影響能拿到多少錢。",
    mistake: "被公司要求簽「自願離職」同意書就簽了，卻不知道這樣可能會失去請領資遣費與失業給付的資格。",
  },
  // 存錢線
  {
    id: "fenzhanghu",
    lineSlug: "cunqian",
    title: "分帳戶理財法",
    body: "把薪水或零用錢分配到不同帳戶，像是「生活費帳戶」「存錢帳戶」「娛樂帳戶」，錢一進來就自動分流，比全部放同一個帳戶更容易控制花費。",
    mistake: "帳戶開太多反而增加管理難度。三個帳戶通常就夠，不需要為了「精緻理財」開一堆帳戶。",
  },
  {
    id: "xiaofei-xinli",
    lineSlug: "cunqian",
    title: "消費型 vs 儲蓄型花費心理學",
    body: "「消費型花費」帶來立即滿足感（手搖飲、遊戲課金），「儲蓄型花費」延遲滿足但累積長期價值。了解自己容易被哪種心理驅動，能幫助設計適合自己的存錢策略。",
    mistake: "用「完全禁止自己消費」的方式存錢，通常撐不了多久就報復性花費，適度保留小額娛樂預算反而更持久。",
  },
  // 信用線
  {
    id: "xuedai-xinyong",
    lineSlug: "xinyong",
    title: "助學貸款算不算信用紀錄",
    body: "就學貸款屬於正式的信用往來，一樣會進入聯徵中心的紀錄。準時繳款是建立信用的第一步，遲繳或違約則會留下不良紀錄。",
    mistake: "覺得就學貸款「政府給的，不用太在意繳款時間」。它跟其他貸款一樣受信用紀錄規範，遲繳一樣有後果。",
  },
  {
    id: "daoshua",
    lineSlug: "xinyong",
    title: "卡片被盜刷的處理流程",
    body: "發現卡片被盜刷，第一時間應該立刻聯繫發卡銀行掛失止付，並確認是否符合「持卡人非過失盜刷保障」的理賠條件。動作越快，損失範圍通常越小。",
    mistake: "發現不明扣款先觀察幾天再處理。盜刷應該立即處理，拖延可能讓損失擴大或影響理賠資格。",
  },
  // 投資線
  {
    id: "zhudong-beidong",
    lineSlug: "touzi",
    title: "主動 vs 被動投資的差異",
    body: "主動投資是自己選股或請經理人主動判斷買賣時機，追求打敗大盤；被動投資（像 0050）直接追蹤指數，不主動選股，長期費用較低。",
    mistake: "覺得「主動選股一定比較厲害」。多數研究顯示長期而言，扣除管理費後，主動投資能穩定打敗大盤指數的比例並不高。",
  },
  {
    id: "haiwai-quanshang",
    lineSlug: "touzi",
    title: "海外券商與稅務的基本認識",
    body: "透過海外券商投資美股等海外市場，獲利可能涉及不同的稅務規定，跟透過台灣券商買賣台股的稅制不同。這是進階內容，但提早知道能避免未來誤觸稅務問題。",
    mistake: "覺得「投資海外市場的獲利不用申報」。海外所得達一定門檻需要列入最低稅負制計算，實際規定發布前請查證最新規定。",
  },
  // 詐騙線
  {
    id: "qiuzhi-zhapian",
    lineSlug: "zhapian",
    title: "求職詐騙",
    body: "針對學生的求職詐騙常見手法：「輕鬆日領千元」「在家打字賺錢」「面試前先繳保證金或購買材料」。真正合法的工作不會要求求職者「先繳錢」才能開始上班。",
    mistake: "急著找打工賺錢，遇到「先繳保證金」的要求還是照做。任何要求求職者先付錢的工作機會都該高度懷疑。",
  },
  {
    id: "jiamao-gongjia",
    lineSlug: "zhapian",
    title: "假冒公家機關的詐騙手法",
    body: "詐騙集團假冒警察、健保局、法院等單位來電，聲稱「你涉及案件」「健保卡被盜用」，要求提供個資或將錢轉入「安全帳戶」。公家機關不會用電話要求轉帳到「安全帳戶」。",
    mistake: "因為對方聽起來很正式、講得出部分個資就相信是真的公家機關。真正的公家機關會用正式公文聯繫。",
  },
  // 學貸線
  {
    id: "liuxue-shisuan",
    lineSlug: "xuedai",
    title: "出國留學費用試算",
    body: "出國留學的總花費除了學費，還包含生活費、住宿、機票、保險，匯率波動也會直接影響總成本。提早用試算工具估算四年總花費，幫助更實際地規劃是否可行。",
    mistake: "只用「學費」估算留學總成本，沒把生活費、匯率波動、保險等隱性成本算進去。",
  },
  {
    id: "zhuanxue-yanbi",
    lineSlug: "xuedai",
    title: "轉學、延畢對學貸的影響",
    body: "轉學或延畢通常會延長在學年限，這會影響就學貸款的補貼利息期間與還款起算時間。做這類決定前，建議先了解對學貸還款規劃的實際影響。",
    mistake: "做轉學或延畢決定時完全沒考慮對學貸的影響，事後才發現還款規劃被打亂。",
  },
  // 報稅線
  {
    id: "yanqi-jiaoshui",
    lineSlug: "baoshui",
    title: "打工族的延期繳稅選項",
    body: "如果核定稅額較高、一次繳納有困難，國稅局提供分期繳納的申請管道。了解這個選項存在，能避免因為一時繳不出稅款而產生額外的滯納金壓力。",
    mistake: "繳不出稅款就選擇不繳、不理會，滯納金會持續累積，應該主動聯繫國稅局申請分期。",
  },
  {
    id: "fapiao-duijiang",
    lineSlug: "baoshui",
    title: "電子發票中獎對獎",
    body: "台灣的統一發票有中獎機制，電子發票可以直接用手機載具對獎，不用擔心紙本發票遺失。輕鬆的台灣在地小知識，適合放在報稅線做調劑。",
    mistake: "使用電子發票載具卻沒有定期對獎，錯過中獎機會。",
  },
  // 租屋線
  {
    id: "fenzu-heyue",
    lineSlug: "zuwu",
    title: "分租室友合約怎麼簽",
    body: "跟室友分租一個單位時，建議額外簽一份室友間的分租協議，明確約定各自負擔的租金比例、水電分攤方式、退租通知期限，避免只靠口頭約定產生糾紛。",
    mistake: "覺得室友是朋友，口頭講好就好，不需要白紙黑字。金錢相關的約定，寫下來對雙方都是保障。",
  },
  {
    id: "banjia-feiyong",
    lineSlug: "zuwu",
    title: "搬家費用清單",
    body: "搬家的隱性成本常被低估：搬家公司費用、押金、水電瓦斯過戶費、網路安裝費、家具家電採購。建議準備一份完整的搬家成本檢查清單。",
    mistake: "只算「押金加第一個月租金」就以為算完搬家成本，漏掉了搬運、過戶、添購用品等實際支出。",
  },
  // 保險線
  {
    id: "lvyou-pingan",
    lineSlug: "baoxian",
    title: "出國旅遊平安險",
    body: "出國旅遊平安險保障旅程中的意外傷害、突發疾病醫療、行李延誤等狀況，保費相對便宜，是短期高保障的典型例子，適合搭配學貸線的出國留學情境一起認識。",
    mistake: "覺得旅遊平安險「應該用不到」而不買。海外醫療費用經常遠高於台灣，沒有保險可能面臨龐大自費負擔。",
  },
  {
    id: "baodan-jianjian",
    lineSlug: "baoxian",
    title: "保單健檢怎麼做",
    body: "隨著人生階段改變（出社會、成家），過去買的保單可能不再符合需求。保單健檢就是定期檢視現有保單的保障範圍是否足夠、有沒有重複投保，是理財成熟後該養成的習慣。",
    mistake: "保單買了就放著不管，好幾年沒有重新檢視，可能保障已經不符合現在的生活狀況。",
  },
  // 創業線
  {
    id: "qunzhong-mouzi",
    lineSlug: "chuangye",
    title: "群眾募資基本認識",
    body: "群眾募資平台讓創業者在正式生產前先驗證市場需求、募集啟動資金，常見模式有「回饋型」（支持者獲得產品或紀念品）與「股權型」（支持者取得公司股份）。",
    mistake: "以為群眾募資「募到錢就結束了」。募資成功只是開始，後續出貨、履約才是真正的挑戰，很多專案卡在這一步。",
  },
  {
    id: "shangbiao",
    lineSlug: "chuangye",
    title: "品牌與商標的基本概念",
    body: "品牌名稱、Logo 如果沒有申請商標註冊，理論上可能被他人搶先註冊，之後自己反而不能用。及早了解商標註冊的基本概念，能保護創業初期投入心力打造的品牌資產。",
    mistake: "覺得「小生意不需要註冊商標」。品牌做起來之後才發現名稱被別人搶註，是新創常見的痛。",
  },
];

export function branchesForLine(slug: LineSlug): Branch[] {
  return BRANCHES.filter((b) => b.lineSlug === slug);
}

export function getBranch(lineSlug: string, branchId: string): Branch | undefined {
  return BRANCHES.find((b) => b.lineSlug === lineSlug && b.id === branchId);
}

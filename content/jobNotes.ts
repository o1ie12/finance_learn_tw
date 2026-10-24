/**
 * 06 G2, block 3 of the compare screen: 「這份工作實際怎麼做」. One or two
 * sentences on what a real person in this job does with this document.
 *
 * Drafted by Claude Code from each lesson's own takeaway and model answers,
 * and the brief's role. No outside facts and no new numbers. Every line is
 * TODO-REVIEW until Ryan checks it; REVIEWED lists the ones that have been.
 * The quiz stations of a line share their line's note.
 */
export const JOB_NOTES: Record<string, string> = {
  // 職涯線 (人資專員)
  "zhiya.interest.v1": "人資面試新人時，常先問你喜歡做什麼、別人常找你幫什麼忙，兩者重疊的地方，最適合先試。", // TODO-REVIEW
  "zhiya.compare.v1": "人資比較兩份工作時，會把實拿薪水、住和通勤的花費、每月剩下多少和能學到什麼放在同一張表上看。", // TODO-REVIEW

  // 消費線 (學姊)
  "qixin.firstmonth.v1": "領到薪水的那天，先把要存的錢移走，再用剩下的錢過這個月；每筆花費前問：需要嗎？急嗎？付得起嗎？", // TODO-REVIEW
  "qixin.needwant.v1": "做預算時，先把需要和想要分開，想要的東西排在存錢之後，用花錢三問決定買不買。", // TODO-REVIEW
  "qixin.budgetgap.v1": "排一整年的預算，會先算每月剩多少，再把一年才來一次的花費列出來，缺口用少花、多賺或拉長時間補。", // TODO-REVIEW
  "qixin.scooter.v1": "買車這種大東西，會先算總價：標價、每年的固定花費和可能的維修，而不是只看標價。", // TODO-REVIEW

  // 存錢線 (理財專員)
  "cunqian.goal.v1": "理財專員幫人訂存錢目標時，會寫清楚金額和期限，再算出每個月要先存多少：收入減存錢，才是可以花的錢。", // TODO-REVIEW
  "cunqian.rate.v1": "理財專員看一個人會不會存錢，會先算儲蓄率：每月存下的錢除以月薪，而不是只看存了多少。", // TODO-REVIEW
  "cunqian.compound.v1": "理財專員用 72 法則快速估算錢翻倍要幾年：72 除以年利率。同一個算法也說明卡債為什麼翻倍得更快。", // TODO-REVIEW

  // 信用線 (放款主管)
  "xinyong.statement.v1": "收到帳單，先看繳款截止日，盡量繳全額；繳不出來時，先停刷再想辦法。", // TODO-REVIEW
  "xinyong.bank.v1": "放款人員審件時，會看收入穩不穩、每月要還多少、有沒有準時、最近有沒有到處借、有沒有幫人擔保。", // TODO-REVIEW
  "xinyong.friendloan.v1": "朋友開口借錢時，先問兩件事：真的需要嗎？他還得起嗎？兩個都是，就約好什麼時候還；有一個不是，就有勇氣說不。", // TODO-REVIEW
  "xinyong.protect.v1": "保護信用卡靠的是習慣：保護個資、定期對帳、小心保管密碼；不點不明連結、不給卡號和驗證碼、不把卡借人。", // TODO-REVIEW
  "xinyong.payoff.v1": "同時欠好幾筆錢時，每筆的最低應繳先繳，多的錢先還利率最高的；還不出來，就馬上找銀行談。", // TODO-REVIEW
  "xinyong.borrow.v1": "借款前，先問清楚借多少、多久、利率多少，利率會不會變、能不能提前還、還有哪些費用。", // TODO-REVIEW

  // 投資線 (研究員)
  "touzi.ready.v1": "研究員給新手的第一個建議是先管好錢：留好緊急預備金、先還高利息的債，沒想清楚之前不借錢投資。", // TODO-REVIEW
  "touzi.etfcode.v1": "看 ETF 時，先看代號後面的字母：槓桿和反向追的是每天的倍數，放久了會跟指數走不一樣，不適合長抱。", // TODO-REVIEW
  "touzi.crash.v1": "市場大跌時，研究員提醒的是三不：不恐慌賣、不動預備金、不借錢加碼。", // TODO-REVIEW
  "touzi.risk.v1": "投資前先問兩件事：這筆錢什麼時候要用？有沒有分散？", // TODO-REVIEW
  "touzi.pitch.v1": "聽到保證、保本、高報酬一起出現，或被催著快匯款，就先停下來，打 165 查證。", // TODO-REVIEW
  "touzi.m42.v1": "研究員給新手的第一個建議是先管好錢：留好緊急預備金、先還高利息的債，沒想清楚之前不借錢投資。", // TODO-REVIEW

  // 詐騙線 (反詐騙專員)
  "zhapian.case1.v1": "反詐騙專員看訊息時，會先問：是不是陌生來訊？有沒有可疑連結？是不是要你照指示轉帳？有懷疑就打 165。", // TODO-REVIEW
  "zhapian.case2.v1": "反詐騙專員看訊息時，會先問：是不是陌生來訊？有沒有可疑連結？是不是要你照指示轉帳？有懷疑就打 165。", // TODO-REVIEW
  "zhapian.case3.v1": "反詐騙專員看訊息時，會先問：是不是陌生來訊？有沒有可疑連結？是不是要你照指示轉帳？有懷疑就打 165。", // TODO-REVIEW
  "zhapian.case4.v1": "反詐騙專員看訊息時，會先問：是不是陌生來訊？有沒有可疑連結？是不是要你照指示轉帳？有懷疑就打 165。", // TODO-REVIEW
  "zhapian.case5.v1": "反詐騙專員看訊息時，會先問：是不是陌生來訊？有沒有可疑連結？是不是要你照指示轉帳？有懷疑就打 165。", // TODO-REVIEW
  "zhapian.case6.v1": "反詐騙專員看訊息時，會先問：是不是陌生來訊？有沒有可疑連結？是不是要你照指示轉帳？有懷疑就打 165。", // TODO-REVIEW
  "zhapian.m10.v1": "反詐騙專員的三不：不信陌生來訊、不理可疑連結、不照指示轉帳；有懷疑就打 165。", // TODO-REVIEW
  "zhapian.m13.v1": "反詐騙專員的三不：不信陌生來訊、不理可疑連結、不照指示轉帳；有懷疑就打 165。", // TODO-REVIEW

  // 學貸線 (生輔組老師)
  "xuedai.monthly.v1": "生輔組老師幫學生看學貸時，會先算畢業後每月要還多少：借你需要的，不是借你能借的。", // TODO-REVIEW
  "xuedai.m14.v1": "生輔組老師幫學生看學貸時，會先算畢業後每月要還多少：借你需要的，不是借你能借的。", // TODO-REVIEW
  "xuedai.m16.v1": "生輔組老師幫學生看學貸時，會先算畢業後每月要還多少：借你需要的，不是借你能借的。", // TODO-REVIEW
  "xuedai.m17.v1": "生輔組老師幫學生看學貸時，會先算畢業後每月要還多少：借你需要的，不是借你能借的。", // TODO-REVIEW
  "xuedai.m18.v1": "生輔組老師幫學生看學貸時，會先算畢業後每月要還多少：借你需要的，不是借你能借的。", // TODO-REVIEW

  // 報稅線 (稅務服務人員)
  "baoshui.m19.v1": "稅務服務人員常提醒：退稅是你多繳的錢，把它當成薪水的一部分來規劃。", // TODO-REVIEW
  "baoshui.m20.v1": "稅務服務人員常提醒：退稅是你多繳的錢，把它當成薪水的一部分來規劃。", // TODO-REVIEW
  "baoshui.m21.v1": "稅務服務人員常提醒：退稅是你多繳的錢，把它當成薪水的一部分來規劃。", // TODO-REVIEW
  "baoshui.m22.v1": "稅務服務人員常提醒：退稅是你多繳的錢，把它當成薪水的一部分來規劃。", // TODO-REVIEW
  "baoshui.m23.v1": "稅務服務人員常提醒：退稅是你多繳的錢，把它當成薪水的一部分來規劃。", // TODO-REVIEW

  // 租屋線 (房東)
  "zuwu.m24.v1": "簽租約前要做三查：查房東是不是屋主、對照內政部的住宅租賃契約書範本、押金不超過兩個月租金。", // TODO-REVIEW
  "zuwu.m25.v1": "簽租約前要做三查：查房東是不是屋主、對照內政部的住宅租賃契約書範本、押金不超過兩個月租金。", // TODO-REVIEW
  "zuwu.m26.v1": "簽租約前要做三查：查房東是不是屋主、對照內政部的住宅租賃契約書範本、押金不超過兩個月租金。", // TODO-REVIEW
  "zuwu.m27.v1": "簽租約前要做三查：查房東是不是屋主、對照內政部的住宅租賃契約書範本、押金不超過兩個月租金。", // TODO-REVIEW
  "zuwu.m28.v1": "簽租約前要做三查：查房東是不是屋主、對照內政部的住宅租賃契約書範本、押金不超過兩個月租金。", // TODO-REVIEW

  // 保險線 (保險業務員)
  "baoxian.matrix.v1": "保險業務員把風險分成四格：損失小的自己承擔或想辦法降低，損失大又少見的才轉給保險，大又常見的直接避開。", // TODO-REVIEW
  "baoxian.fourrisks.v1": "保險業務員排保單的順序是：先保會讓你破產的，再保會讓你不方便的。", // TODO-REVIEW
  "baoxian.scooter.v1": "機車保險分三層：強制險賠被撞的人，第三人責任險賠更多的傷和別人的東西，車體險、竊盜險和傷害險才是保自己。", // TODO-REVIEW
  "baoxian.m30.v1": "保險業務員看風險的原則：大又少見的才買保險。", // TODO-REVIEW
  "baoxian.m32.v1": "保險業務員看風險的原則：大又少見的才買保險。", // TODO-REVIEW
  "baoxian.m33.v1": "保險業務員看風險的原則：大又少見的才買保險。", // TODO-REVIEW

  // 創業線 (小店老闆)
  "chuangye.m34.v1": "小店老闆做決定時看未來，不看已經花掉的：花掉的錢拿不回來，要看的是接下來會不會賺。", // TODO-REVIEW
  "chuangye.m35.v1": "小店老闆做決定時看未來，不看已經花掉的：花掉的錢拿不回來，要看的是接下來會不會賺。", // TODO-REVIEW
  "chuangye.m36.v1": "小店老闆做決定時看未來，不看已經花掉的：花掉的錢拿不回來，要看的是接下來會不會賺。", // TODO-REVIEW
  "chuangye.m37.v1": "小店老闆做決定時看未來，不看已經花掉的：花掉的錢拿不回來，要看的是接下來會不會賺。", // TODO-REVIEW
  "chuangye.m38.v1": "小店老闆做決定時看未來，不看已經花掉的：花掉的錢拿不回來，要看的是接下來會不會賺。", // TODO-REVIEW

  // 財務決策線 (理財顧問)
  "caiwujuece.m41.v1": "理財顧問幫人評估買房，會先算三件事：頭期款、月付比和預備金。", // TODO-REVIEW
};

/** Notes Ryan has checked; every other entry above is still TODO-REVIEW. */
export const REVIEWED: ReadonlySet<string> = new Set<string>();

# STOP 3: each P1 task's numbers and model answers

Generated from the content and the engine (`lib/tasks/compute.ts`). Every figure below is worked out by code; the inputs are listed so the math can be checked by hand.

## 預算缺口 (`qixin.budgetgap.v1`, 加碼任務 on qixin)

**Brief:** 小安 · 學姊 · 星河大學: 「我每個月都有剩，年底卻沒存到錢。幫我把這一年的預算算清楚。」 你會學到：為什麼每個月有剩，一年下來還是會缺錢。 你要做的：算出一年的缺口，再選一個補法。 約 8 分鐘

**Engine figures**

| Name | Formula and inputs | Value |
|---|---|---|
| income | `{"fn":"sum","of":[34000]}` | NT$34,000 |
| spend | `{"fn":"sum","of":[31800]}` | NT$31,800 |
| left | `{"fn":"diff","a":34000,"b":31800}` | NT$2,200 |
| yearLeft | `{"fn":"diff","a":0,"b":{"fn":"budgetGap","monthlyIncome":34000,"monthlySpend":31800,"extras":[]}}` | NT$26,400 |
| extraTotal | `{"fn":"sum","of":[2400,12000,4000,3500,3600,4500]}` | NT$30,000 |
| gap | `{"fn":"budgetGap","monthlyIncome":34000,"monthlySpend":31800,"extras":[2400,12000,4000,3500,3600,4500]}` | NT$3,600 |
| perMonth | `{"fn":"div","a":{"fn":"budgetGap","monthlyIncome":34000,"monthlySpend":31800,"extras":[2400,12000,4000,3500,3600,4500]},"by":12}` | NT$300 |
| phoneLater | `{"fn":"diff","a":0,"b":{"fn":"budgetGap","monthlyIncome":34000,"monthlySpend":31800,"extras":[2400,4000,3500,3600,4500]}}` | NT$8,400 |

**Document:** {"name":"小安的每月預算（示意）","rows":[{"label":"實領月薪","value":"NT$34,000"},{"label":"每月花費合計","value":"NT$31,800"},{"label":"每月剩下","value":"NT$2,200"}]}

**Document:** {"title":"這一年還會有的花費（示意）","rows":[{"item":"機車保養","amount":2400},{"item":"手機換新","amount":12000},{"item":"家人生日禮物","amount":4000},{"item":"看牙醫","amount":3500},{"item":"朋友婚禮紅包","amount":3600},{"item":"證照考試報名","amount":4500}]}

**Step 1 (number):** 這一年的缺口是多少？（一年的額外花費，減掉每月剩下的 × 12）

- Right answer: NT$3,600
- Why: 每月剩 NT$2,200，一年剩 NT$26,400。額外的花費共 NT$30,000，所以差了 NT$3,600。

**Step 2 (number):** 要補上這個缺口，平均每個月要多出多少？

- Right answer: NT$300
- Why: NT$3,600 ÷ 12 個月 = 每月 NT$300。

**Step 3 (choice, not scored):** 你會怎麼補這個缺口？

- option: 每月少花 NT$300，例如少喝幾杯手搖
- option: 每月多賺 NT$300，例如多接一次家教
- option: 手機晚一年再換
- Why: 三種都可以：每月少花 NT$300、每月多賺 NT$300，或手機晚一年換，這一年還會多出 NT$8,400。沒有唯一的答案，只有你做得到的那個。

**Reveal:** 規劃謬誤：做計畫時，人常常只想到每個月固定的帳，忘了一年才來一次的花費。這叫規劃謬誤。

**Takeaway:** 一年預算三步：先算每月剩多少；再列一年才來一次的花費；缺口用少花、多賺或拉長時間補

## 機車的真實成本 (`qixin.scooter.v1`, 加碼任務 on qixin)

**Brief:** 小安 · 學姊 · 星河大學: 「我想買機車，新車和二手車還在猶豫。幫我算算第一年和三年各要花多少。」 你會學到：標價之外，一台車每年還要花多少。 你要做的：算兩個數字，再比較三年的總花費。 約 8 分鐘

**Engine figures**

| Name | Formula and inputs | Value |
|---|---|---|
| new1 | `{"fn":"ownershipCost","price":72000,"yearly":[600,6000,1500,3600],"years":1}` | NT$83,700 |
| used1 | `{"fn":"ownershipCost","price":30000,"yearly":[600,7200,6000,3600],"years":1}` | NT$47,400 |
| new3 | `{"fn":"ownershipCost","price":72000,"yearly":[600,6000,1500,3600],"years":3}` | NT$107,100 |
| used3 | `{"fn":"ownershipCost","price":30000,"yearly":[600,7200,6000,3600],"years":3,"extras":[5000]}` | NT$87,200 |
| diff3 | `{"fn":"diff","a":{"fn":"ownershipCost","price":72000,"yearly":[600,6000,1500,3600],"years":3},"b":{"fn":"ownershipCost","price":30000,"yearly":[600,7200,6000,3600],"years":3,"extras":[5000]}}` | NT$19,900 |
| diff3wan | `{"fn":"diff","a":{"fn":"ownershipCost","price":72000,"yearly":[600,6000,1500,3600],"years":3},"b":{"fn":"ownershipCost","price":30000,"yearly":[600,7200,6000,3600],"years":3,"extras":[5000]}}` | 2 萬 |

**Document:** {"title":"新車：第一年（示意）","rows":[{"item":"車價","amount":72000},{"item":"強制險","amount":600},{"item":"油錢","amount":6000},{"item":"保養","amount":1500},{"item":"停車費","amount":3600}]}

**Document:** {"title":"二手車：第一年（示意）","rows":[{"item":"車價","amount":30000},{"item":"強制險","amount":600},{"item":"油錢（老車比較耗油）","amount":7200},{"item":"保養維修","amount":6000},{"item":"停車費","amount":3600}]}

**Document:** {"title":"二手車：第二年預估還要換（示意）","rows":[{"item":"電瓶和輪胎","amount":5000}]}

**Step 1 (number):** 新車第一年總共要花多少？

- Right answer: NT$83,700
- Why: 車價，加上一年的強制險、油錢、保養和停車：NT$83,700。

**Step 2 (number):** 二手車第一年總共要花多少？

- Right answer: NT$47,400
- Why: 車價便宜很多，但油錢和維修比較貴：NT$47,400。

**Step 3 (choice):** 騎三年的話，哪一台比較省？

- option: 新車比較省
- option: 兩台差不多
- **建議答案**: 二手車比較省，大約差 NT$2 萬
- option: 二手車比較省，差超過 NT$5 萬
- Why: 三年下來，新車 NT$107,100，二手車 NT$87,200（含第二年換電瓶和輪胎），二手車省 NT$19,900。買二手車前，先請懂車的人檢查。

**Reveal:** 錨定效應：第一個看到的數字（車價）會變成判斷的標準，讓人忽略每年都要付的錢。這叫錨定效應。

**Takeaway:** 買東西前先算總價：標價；每年的固定花費；可能的維修

## 複利與 72 法則 (`cunqian.compound.v1`, station 3 on cunqian)

**Brief:** 王小姐 · 理財專員 · 晨光儲蓄所: 「阿哲 18 歲開始存錢，小琪 28 歲才開始。幫我算算 60 歲時差多少。」 你會學到：複利和 72 法則：錢和債是怎麼翻倍的。 你要做的：估兩個數字，再用 72 法則算兩題。 約 10 分鐘

**Engine figures**

| Name | Formula and inputs | Value |
|---|---|---|
| monthly | `{"fn":"sum","of":[2000]}` | NT$2,000 |
| dep18 | `{"fn":"savingsFV","monthly":2000,"annualRate":0,"years":42}` | NT$1,008,000 |
| dep28 | `{"fn":"savingsFV","monthly":2000,"annualRate":0,"years":32}` | NT$768,000 |
| a18_2 | `{"fn":"savingsFV","monthly":2000,"annualRate":0.02,"years":42}` | NT$1,577,697 |
| b28_2 | `{"fn":"savingsFV","monthly":2000,"annualRate":0.02,"years":32}` | NT$1,074,565 |
| a18_6 | `{"fn":"savingsFV","monthly":2000,"annualRate":0.06,"years":42}` | NT$4,540,320 |
| b28_6 | `{"fn":"savingsFV","monthly":2000,"annualRate":0.06,"years":32}` | NT$2,315,362 |
| depDiff | `{"fn":"diff","a":{"fn":"savingsFV","monthly":2000,"annualRate":0,"years":42},"b":{"fn":"savingsFV","monthly":2000,"annualRate":0,"years":32}}` | NT$240,000 |
| lateGap | `{"fn":"diff","a":{"fn":"savingsFV","monthly":2000,"annualRate":0.06,"years":42},"b":{"fn":"savingsFV","monthly":2000,"annualRate":0.06,"years":32}}` | NT$2,224,958 |
| cardRate | `{"fn":"repoRate","of":"cardCap"}` | 15% |
| card72 | `{"fn":"rule72","annualRate":"cardCap"}` | 4.8 年 |
| cardExact | `{"fn":"doublingYears","annualRate":"cardCap"}` | 5.0 年 |
| depRate | `{"fn":"repoRate","of":"timeDeposit1y"}` | 1.7% |
| dep72 | `{"fn":"rule72","annualRate":"timeDeposit1y"}` | 42.4 年 |

**Document:** {"name":"兩個人的存錢計畫（示意）","rows":[{"label":"阿哲","value":"18 歲開始，每月 NT$2,000，存到 60 歲"},{"label":"小琪","value":"28 歲開始，每月 NT$2,000，存到 60 歲"},{"label":"年報酬","value":"6%（長期投資的示意，不保證）"}]}

**Step 1 (choice):** 年報酬 6% 時，阿哲 60 歲時大約有多少？

- option: 約 NT$100 萬
- option: 約 NT$230 萬
- **建議答案**: 約 NT$450 萬
- option: 約 NT$900 萬
- Why: 阿哲自己存了 NT$1,008,000，6% 時 60 歲會有 NT$4,540,320。多出來的，大部分是利息再生的利息。

**Step 2 (choice):** 小琪晚 10 年開始，60 歲時大約比阿哲少多少？

- option: 約少 NT$50 萬
- option: 約少 NT$100 萬
- **建議答案**: 約少 NT$220 萬
- option: 約少 NT$500 萬
- Why: 小琪只少存了 NT$240,000，60 歲時卻少了 NT$2,224,958（她有 NT$2,315,362）。最早存的錢，滾得最久。

**Step 3 (number):** 卡債年利率 15%，用 72 法則算，大約幾年會翻倍？

- Right answer: 4.8 年 (±0.3)
- Why: 72 ÷ 15% ≈ 4.8 年，精算是 5.0 年。欠 NT$1 萬不還，大約 5.0 年就變 NT$2 萬。

**Step 4 (number):** 一年期定存年利率 1.7%，用 72 法則算，大約幾年會翻倍？

- Right answer: 42.35 年 (±2)
- Why: 72 ÷ 1.7% ≈ 42.4 年。同樣是翻倍，欠款翻得很快，存款翻得很慢。

**Reveal:** 指數成長偏誤：人常把複利想成直線，以為晚幾年開始只少一點。這叫指數成長偏誤：越早開始，差距越大。

**Takeaway:** 72 法則：72 ÷ 年利率 ≈ 翻倍要幾年；存錢越早開始越好；卡債翻倍得更快

**Sources** (verifiedOn 2026-10): 臺灣銀行 新臺幣存款牌告利率（一年期定存） https://rate.bot.com.tw/twd?Lang=zh-TW; 銀行法第 47-1 條（信用卡利率上限） https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0380001&flno=47-1

## 雪球還是雪崩 (`xinyong.payoff.v1`, 加碼任務 on xinyong)

**Brief:** 林經理 · 放款主管 · 星河銀行: 「阿凱同時欠了四筆錢，每月能還 NT$12,000。幫他排出還錢的順序。」 你會學到：雪崩法和雪球法，還有還不出來時該怎麼辦。 你要做的：排出還錢的順序，再做一個決定。 約 8 分鐘

**Engine figures**

| Name | Formula and inputs | Value |
|---|---|---|
| budget | `{"fn":"sum","of":[12000]}` | NT$12,000 |
| bal0 | `{"fn":"sum","of":[30000]}` | NT$30,000 |
| min0 | `{"fn":"sum","of":[1000]}` | NT$1,000 |
| bal1 | `{"fn":"sum","of":[120000]}` | NT$120,000 |
| min1 | `{"fn":"sum","of":[2500]}` | NT$2,500 |
| bal2 | `{"fn":"sum","of":[200000]}` | NT$200,000 |
| min2 | `{"fn":"sum","of":[2000]}` | NT$2,000 |
| bal3 | `{"fn":"sum","of":[10000]}` | NT$10,000 |
| min3 | `{"fn":"sum","of":[500]}` | NT$500 |
| minimums | `{"fn":"sum","of":[6000]}` | NT$6,000 |
| cardRate | `{"fn":"repoRate","of":"cardCap"}` | 15% |
| loanRate | `{"fn":"repoRate","of":"studentLoan"}` | 0.775% |
| avalInterest | `{"fn":"debtPayoff","debts":[{"balance":30000,"annualRate":0.15,"min":1000},{"balance":120000,"annualRate":0.07,"min":2500},{"balance":200000,"annualRate":0.00775,"min":2000},{"balance":10000,"annualRate":0,"min":500}],"budget":12000,"order":[0,1,2,3],"field":"interest"}` | NT$11,265 |
| avalMonths | `{"fn":"debtPayoff","debts":[{"balance":30000,"annualRate":0.15,"min":1000},{"balance":120000,"annualRate":0.07,"min":2500},{"balance":200000,"annualRate":0.00775,"min":2000},{"balance":10000,"annualRate":0,"min":500}],"budget":12000,"order":[0,1,2,3],"field":"months"}` | 31 個月 |
| snowInterest | `{"fn":"debtPayoff","debts":[{"balance":30000,"annualRate":0.15,"min":1000},{"balance":120000,"annualRate":0.07,"min":2500},{"balance":200000,"annualRate":0.00775,"min":2000},{"balance":10000,"annualRate":0,"min":500}],"budget":12000,"order":[3,0,1,2],"field":"interest"}` | NT$12,078 |
| snowMonths | `{"fn":"debtPayoff","debts":[{"balance":30000,"annualRate":0.15,"min":1000},{"balance":120000,"annualRate":0.07,"min":2500},{"balance":200000,"annualRate":0.00775,"min":2000},{"balance":10000,"annualRate":0,"min":500}],"budget":12000,"order":[3,0,1,2],"field":"months"}` | 32 個月 |
| minInterest | `{"fn":"debtPayoff","debts":[{"balance":30000,"annualRate":0.15,"min":1000},{"balance":120000,"annualRate":0.07,"min":2500},{"balance":200000,"annualRate":0.00775,"min":2000},{"balance":10000,"annualRate":0,"min":500}],"budget":6000,"order":[],"field":"interest"}` | NT$35,853 |
| minMonths | `{"fn":"debtPayoff","debts":[{"balance":30000,"annualRate":0.15,"min":1000},{"balance":120000,"annualRate":0.07,"min":2500},{"balance":200000,"annualRate":0.00775,"min":2000},{"balance":10000,"annualRate":0,"min":500}],"budget":6000,"order":[],"field":"months"}` | 104 個月 |
| saved | `{"fn":"diff","a":{"fn":"debtPayoff","debts":[{"balance":30000,"annualRate":0.15,"min":1000},{"balance":120000,"annualRate":0.07,"min":2500},{"balance":200000,"annualRate":0.00775,"min":2000},{"balance":10000,"annualRate":0,"min":500}],"budget":12000,"order":[3,0,1,2],"field":"interest"},"b":{"fn":"debtPayoff","debts":[{"balance":30000,"annualRate":0.15,"min":1000},{"balance":120000,"annualRate":0.07,"min":2500},{"balance":200000,"annualRate":0.00775,"min":2000},{"balance":10000,"annualRate":0,"min":500}],"budget":12000,"order":[0,1,2,3],"field":"interest"}}` | NT$813 |

**Document:** {"name":"阿凱的四筆欠款（示意）","rows":[{"label":"卡債","value":"NT$30,000，年利率 15%，每月最低 NT$1,000"},{"label":"信貸","value":"NT$120,000，年利率 7%，每月最低 NT$2,500"},{"label":"學貸","value":"NT$200,000，年利率 0.775%，每月最低 NT$2,000"},{"label":"跟朋友借的","value":"NT$10,000，不算利息，每月還 NT$500"},{"label":"每月能拿來還錢","value":"NT$12,000"}]}

**Step 1 (order):** 每筆最低應繳都繳了以後，多的錢要先還哪一筆？從先到後排好。

- Right order: 卡債 → 信貸 → 學貸 → 跟朋友借的
- Why: 先還利率最高的（雪崩法）：總利息 NT$11,265，31 個月還完。先還金額最小的（雪球法）：NT$12,078，32 個月。雪崩法省 NT$813；只繳最低的話，要 104 個月，利息 NT$35,853。

**Step 2 (choice):** 如果哪個月真的還不出來，先做什麼？

- **建議答案**: 主動打給銀行，說明狀況，談分期或協商
- option: 先不接銀行電話，等有錢再說（不接電話，債不會消失，利息和違約金還會一直加。）
- option: 再辦一張卡，用新卡繳舊卡（以卡養卡，債只會越滾越大。）
- option: 跟網路上的借貸廣告借錢（來路不明的借貸，常常是高利貸或詐騙。）
- Why: 越早聯絡越好。欠銀行的錢還不出來時，可以向最大債權銀行申請協商，分期最長大約 15 年，但會在信用紀錄上留下註記。

**Reveal:** 鴕鳥效應：壞消息讓人想先躲開：不看帳單、不接電話。這叫鴕鳥效應，越躲，利息和麻煩越多。

**Takeaway:** 欠款三步：每筆的最低應繳先繳；多的錢先還利率最高的；還不出來，馬上找銀行談

**Sources** (verifiedOn 2026-10): 消費者債務清理條例第 151 條 https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=B0010042&flno=151; 金融機構辦理消費者債務清理條例（前置協商）作業準則 https://www.ba.org.tw/memberStandard/details?id=90; 銀行法第 47-1 條（信用卡利率上限） https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0380001&flno=47-1

## 機車保險三層 (`baoxian.scooter.v1`, 加碼任務 on baoxian)

**Brief:** 周專員 · 保險業務員 · 安心保險: 「小凱騎車撞到人，也撞壞了東西。幫我看看每一筆損失，是哪一種保險在賠。」 你會學到：機車保險分三層，每一層賠什麼。 你要做的：把每筆損失放進對的保險，再回答一題。 約 8 分鐘

**Engine figures**

| Name | Formula and inputs | Value |
|---|---|---|
| medCap | `{"fn":"insuranceCap","of":"medical"}` | NT$200,000 |
| deathCap | `{"fn":"insuranceCap","of":"death"}` | NT$3,000,000 |

**Document:** {"name":"這場車禍（示意）","rows":[{"label":"發生什麼事","value":"小凱騎機車，在路口撞到走路的王先生，又擦到路邊停著的汽車"},{"label":"王先生","value":"受傷住院，醫藥費 NT$260,000；手機摔壞 NT$15,000"},{"label":"路邊的汽車","value":"車門刮傷，修理 NT$8,000"},{"label":"小凱","value":"自己的機車要修 NT$12,000，自己也受了傷"},{"label":"小凱有的保險","value":"強制險、第三人責任險（體傷和財損都有）。沒有車體險和傷害險"}]}

**Step 1 (sort):** 每一筆損失，是哪一種保險在賠？

- 王先生的醫藥費（前 NT$200,000） → 強制險：強制險賠被撞到的人，醫療每人最多 NT$200,000，不管誰的錯。
- 王先生醫藥費超過 NT$200,000 的部分 → 第三人責任險：超過強制險上限的傷，由第三人責任險的體傷保額來賠。
- 王先生摔壞的手機 → 第三人責任險：強制險不賠東西。別人的財物損失，由第三人責任險的財損來賠。
- 路邊汽車的刮傷 → 第三人責任險：別人的車也是財物，由第三人責任險的財損來賠。
- 小凱自己機車的修理費 → 他買的車險都不賠：自己的車要買車體險才有賠，小凱沒有買。
- 小凱自己的醫藥費 → 他買的車險都不賠：強制險不賠自己的駕駛。健保會付一部分醫療費，想要更多保障，要另外買傷害險。
- Why: 強制險賠被撞到的人；第三人責任險賠更多的傷和別人的東西；自己的車和自己的傷，要另外買保險。

**Step 2 (choice):** 強制險為什麼賠了王先生，卻不賠小凱自己？

- **建議答案**: 強制險保的是被撞到的人（乘客和車外的人），不是騎車的自己
- option: 因為小凱騎太快（強制險不論誰的錯都賠受害人；問題不在速度。）
- option: 因為強制險只保汽車（機車也一定要保強制險。）
- option: 因為小凱沒有繳保費（小凱有保，只是強制險本來就不賠自己。）
- Why: 強制險賠的是車禍裡受傷的乘客和車外的人，騎車的人自己不算受害人。想保自己，要另外買傷害險。

**Reveal:** 樂觀偏誤：很多人以為有保險就全包，或事故不會輪到自己。這叫樂觀偏誤：先弄懂每一層保什麼，才知道還缺什麼。

**Takeaway:** 機車保險三層：強制險：賠被撞的人；第三人責任險：賠更多的傷和別人的東西；車體險、竊盜險、傷害險：保自己

**Sources** (verifiedOn 2026-10): 強制汽車責任保險法 https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0390060; 強制汽車責任保險給付標準（115 年 5 月 29 日修正） https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0390067; 金管會：單一事故駕駛人強制車險不賠 https://www.fsc.gov.tw/ch/home.jsp?id=96&parentpath=0,2&mcustomize=news_view.jsp&dataserno=201203060004&dtable=News; 自用汽車保險定型化契約範本 https://law.fsc.gov.tw/LawContent.aspx?id=FL047990

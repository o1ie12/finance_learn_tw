# 04. Content (all 12 lines)

Everything a student reads in the redesign. Paste it into `content/lines/<slug>.ts` using the types in `03-TASK-ENGINE.md`. Do not rewrite it. If a sentence is wrong, fix the fact, keep the voice, and list the change in your report.

**Slugs:** use the real slugs from `lib/lines.ts`, matched by line name (消費線's slug is the legacy `qixin`). This file uses line names.

**Stations:** each line's core stations (mode-aware `requiredStations`) get the task sets below in order: first core station → Task A, second → Task B, and so on. If a line has more core stations than task sets, the extra core stations keep their current quiz, wrapped in the new station flow (hook, lesson, quiz, reveal). Deep stations keep their current content and quiz, also wrapped. The line's simulation page becomes the line's last task set plus the life-game unlock.

**Numbers in answers:** where an answer depends on a formula (payroll, interest, ETF prices), compute it in code from the existing constants. The numbers written here are what the formula should give with today's constants; if code gives a different number, code wins, and tell us.

**Pre/post banks:** no line's pre/post questions change in this job. No bank version bumps.

**Fictional names:** every person, company and bank below is invented. Documents carry the footnote "名稱皆為虛構".

---

## 1. Global content

### 1.1 The why (shown on onboarding, the dashboard help, and the end of every line)

> 錢是用來換選擇的。
> 管好錢，你就多一點選擇：選工作、選住哪裡、選要不要冒險。
> 不管錢的代價，是焦慮、衝動消費，還有月底心慌。

### 1.2 The money cycle (one lesson card on the first station of the course)

`flow` card, title 「錢的七件事」, steps:

1. 賺：用工作換收入
2. 存：為目標先留住錢
3. 花：有計畫地花
4. 借：守住信用，量力而為
5. 保：把大又少見的風險轉出去
6. 投：讓錢替你工作，也投資自己
7. 助：幫助別人，也是錢的用途

Caption: 「你每天都在做這些決定，只是沒發現：早餐要不要加飲料？手機一次買還是分期？同學都去玩，我要不要跟？」

### 1.3 Goal cards (onboarding step 2)

| Card | Default amount | Default months |
|---|---|---|
| 一台新筆電 | NT$30,000 | 12 |
| 畢業旅行 | NT$20,000 | 10 |
| 第一台機車 | NT$45,000 | 18 |
| 三個月的緊急預備金 | 3 × the starter monthly essentials | 12 |
| 學一項技能 | NT$12,000 | 6 |
| 自己寫 | blank | blank |

SMART ticks:

| Tick | Rule | Hint when not met |
|---|---|---|
| 具體 Specific | Name is filled | 「要存錢買什麼？寫清楚一點。」 |
| 可衡量 Measurable | Amount > 0 | 「目標要有金額，才知道離終點多遠。」 |
| 做得到 Achievable | amount ÷ months ≤ the starter job's monthly money left after essentials | 「每個月要存 NT$X，超過你目前能存的。試試拉長時間或降低金額。」 |
| 相關 Relevant | Student picked a reason from: 對我很重要 / 讓生活更安全 / 為了未來的自己 / 別人都有 (this last one does not tick it) | 「別人有，不一定代表你需要。這個目標對你重要嗎？」 |
| 有期限 Time-bound | 1 to 60 months | 「給自己一個期限。」 |

Below the ticks: 「每個月要存：NT$X」 (amount ÷ months, rounded up to NT$100).

### 1.4 Voice

Talk like an older cousin who is good with money: direct, warm, never preachy. Never call a choice stupid. Name the trap, show the number, let the student decide. No emoji.

---

## 2. Line overview: hook, bias, takeaway

| Line | Hook question | Bias revealed | Takeaway tool |
|---|---|---|---|
| 職涯線 | 「月薪多 NT$5,000 但要搬去台北，你會去嗎？」 | 只看月薪 (focusing illusion) | 工作比較表：實拿、房租、通勤、成長 |
| 消費線 | 「早餐每天多加一杯 NT$60 的飲料，一個月是多少？」 | 錨定效應、跟別人比 | 花錢三問：需要嗎？急嗎？付得起嗎？ |
| 存錢線 | 「現在拿 NT$1,000，或一年後拿 NT$1,100，你選哪個？」 | 現在偏誤 | 月初先存：收入 − 存錢 = 可以花的錢 |
| 信用線 | 「卡費只繳最低應繳，算是有好好繳嗎？」 | 最低應繳的錨定 | 借錢兩問：真的需要嗎？還得起嗎？ |
| 詐騙線 | 「接到電話說你涉及洗錢，要你保密配合，你會怎麼做？」 | 急迫感、權威 | 不信、不理、不轉帳，打 165 |
| 投資線 | 「股市一個月跌了 10%，你手上的 ETF 要賣嗎？」 | 損失趨避、怕錯過、從眾 | 先管好錢，再讓錢長大 |
| 保險線 | 「保險買越多越安心嗎？」 | 因為害怕而買 | 風險四格：大又少見才保險 |
| 租屋線 | 「房東說『很多人在看，今天不簽就沒了』，你會簽嗎？」 | 稀缺感 | 簽約前三查 |
| 學貸線 | 「在學期間不用付利息，那借多一點也沒關係？」 | 只看現在 | 先算畢業後每月要還多少 |
| 報稅線 | 「五月收到退稅 NT$3,000，這是賺到的嗎？」 | 心理帳戶 | 退稅是你多繳的錢 |
| 創業線 | 「店已經虧了三個月，投進去的錢不能白費，要繼續嗎？」 | 沉沒成本 | 看未來，不看已經花掉的 |
| 財務決策線 | 「大家都說要買房，租房就是在幫房東繳房貸？」 | 從眾、現狀偏誤 | 買房前三算：頭期款、月付比、預備金 |

**Hook options (id: label).** Where a line's reveal below keys on a hook answer, it means the option with that label.

| Line | Options |
|---|---|
| 職涯線 | `go`: 會去 / `stay`: 不會去 / `calc`: 要先算清楚 |
| 消費線 | `no_calc`: 不用算，小錢而已 / `est`: 大概一千多 / `unknown`: 不知道 |
| 存錢線 | `now`: 現在拿 NT$1,000 / `later`: 一年後拿 NT$1,100 |
| 信用線 | `yes`: 算 / `no`: 不算 / `unsure`: 不確定 |
| 詐騙線 | `comply`: 照他說的做 / `verify`: 掛掉，打 165 查證 / `family`: 先問家人 |
| 投資線 | `sell`: 賣掉 / `hold`: 不動 / `buy`: 再買一些 |
| 保險線 | `yes`: 是 / `depends`: 不一定 |
| 租屋線 | `sign_now`: 先簽再說 / `read_first`: 回家看完合約再決定 / `ask_deposit`: 先問押金和規定 |
| 學貸線 | `yes`: 對 / `no`: 不對 / `unsure`: 不確定 |
| 報稅線 | `windfall`: 是，意外之財 / `mine`: 不是，本來就是我的錢 / `unknown`: 不知道 |
| 創業線 | `continue`: 繼續，不然之前都白花了 / `depends`: 看接下來能不能賺再決定 / `stop`: 馬上收 |
| 財務決策線 | `buy_early`: 對，越早買越好 / `calc_first`: 不一定，要先算 / `unsure`: 我還不知道 |

Hooks in sections 10, 12 and 13 repeat their options for convenience; this table is the source.

---

## 3. 職涯線

**Unlocks:** chosen job, 學技能, `course_sale` event.

### Task A: 你的興趣地圖 (unscored reflection)

- Brief: role 「你」, situation 「在選工作之前，先弄清楚自己喜歡什麼、擅長什麼。」
- Lesson card (`compare`), title 「喜歡的 ≠ 擅長的」: left 喜歡的 (rows: 做了不會累, 會主動想多做); right 擅長的 (rows: 別人常找你幫忙, 做得比同學快). Note: 「兩個都有的地方，最值得先試。」
- Step 1 `SortStep` (`scored: false`): sort 8 cards into 喜歡 / 擅長 / 都有 / 都沒有: 畫畫或設計, 跟人聊天說服別人, 修東西或組裝, 照顧別人, 算數字和整理資料, 寫文章或拍影片, 做菜, 寫程式或玩電腦.
- Step 2 `ChoiceStep` (`scored: false`): 「選工作時，你最在意哪一個？」 options: 薪水, 離家近, 工作穩定, 能學到東西. Saved to the profile as `careerPriority` (new optional field, additive).
- Output: the existing interest buckets are pre-selected from the 都有 and 喜歡 cards (map each card to the existing bucket ids in code). The student confirms or changes, then picks a path as today.

### Task B: 比較兩份工作

- Brief: role 「剛畢業的你」, situation 「你拿到兩份工作。先別看月薪，算算每個月真的剩多少。」
- Materials: two `payslip`s and two `billSheet`s.
  - 工作 A 台北行銷助理: 月薪 NT$34,000. 要在台北租雅房 NT$8,000, 水電 NT$900, 餐費 NT$9,000, 交通 NT$1,200, 手機 NT$499, 日用品 NT$1,500.
  - 工作 B 桃園行政助理: 月薪 NT$30,000. 住家裡, 孝親費 NT$3,000, 餐費 NT$7,500, 交通 NT$1,200, 手機 NT$499, 日用品 NT$1,500.
- Step 1 `NumberStep`: 「工作 A 實發多少？」 answer = engine payroll on NT$34,000. Tolerance 0.
- Step 2 `NumberStep`: 「工作 A 每月繳完帳單還剩多少？」 answer = net A − 21,099.
- Step 3 `NumberStep`: 「工作 B 每月繳完帳單還剩多少？」 answer = net B − 13,699.
- Step 4 `ChoiceStep`: 「只看錢，哪份工作每月剩比較多？」 options A / B. Correct B. Reasons: (a) 「B 雖然月薪少 NT$4,000，但住家裡省下房租和水電。」 correct; (b) 「A 月薪比較高，所以剩比較多。」; (c) 「兩份差不多。」
- Model answer note: 「錢不是唯一標準。A 的經驗可能讓你三年後薪水更高。這一站只是教你：比較工作要看『實拿 − 生活成本』，不是只看月薪。」
- Reveal (`focusing illusion`), default: 「人很容易只盯著最大的那個數字。月薪最醒目，但房租和通勤會默默吃掉差距。」
- Takeaway 「工作比較表」: 實拿多少 / 要花多少住和通勤 / 每月剩多少 / 能學到什麼.

---

## 4. 信用線 (pilot line)

**Unlocks:** credit card, 還卡債, `guarantor` event. Writes `creditRecord` to the profile exactly as today (from Task A's payment choice, using the existing rules).

### Task A: 你的第一張帳單

- Brief: role 「18 歲上大學，剛辦了第一張信用卡」, situation 「第一張帳單寄來了。先看懂，再決定怎麼繳。」
- Lesson card (`text`), 「帳單上最重要的三個數字」: 「本期應繳總額、最低應繳金額、繳款截止日。只繳最低，剩下的會從每筆消費的入帳日開始算利息。」
- Material `cardStatement` (星河銀行, fictional):
  - 帳單月份 2026/10, 結帳日 10/15, 繳款截止日 10/30, 信用額度 NT$20,000
  - Transactions (消費日 / 入帳日 / 說明 / 金額): 9/19 / 9/21 / 藍牙耳機 / 2,490; 10/3 / 10/4 / 聚餐 / 860; 10/8 / 10/9 / 線上課程 / 1,990; 10/12 / 10/13 / 高鐵票 / 1,050
  - 本期應繳總額 NT$6,390; 最低應繳金額 = the existing engine's minimum rule on 6,390; 循環利息 本期 NT$0
- Step 1 `FindStep`: 「點出：本期應繳總額、最低應繳金額、繳款截止日」 (3 targets).
- Step 2 `FindStep`: 「如果只繳最低，利息會從哪一天開始算？點出那個欄位。」 targets: the 入帳日 column.
- Step 3 `ChoiceStep`: 「這個月你戶頭有 NT$8,000，你要繳多少？」 options: 全額 NT$6,390 / 最低應繳 / 繳 NT$3,000 / 先不繳. Correct 全額. Reasons: (a) 「繳全額就完全不用付利息，信用紀錄也最好。」 correct; (b) 「繳最低就不算遲繳，所以沒差。」; (c) 「留著錢比較安心，利息應該不多。」
- Step 4 `NumberStep`: 「如果這期只繳最低，下期帳單大約會多出多少利息？」 answer = existing engine's interest for this statement, tolerance NT$5.
- Model answer: 「全額繳清。最低應繳只代表『不算遲繳』，不代表沒事。沒繳的部分每天都在算利息，信用卡循環利率法定上限是年利率 15%。」
- Reveal (`最低應繳的錨定`): `outcomeFrom` step 3, map 全額 → `paidFull`, 最低應繳 → `paidMin`, 繳 NT$3,000 → `paidPartial`, 先不繳 → `paidNone`. byOutcome:
  - `paidMin`: 「帳單把『最低應繳』印得很清楚，很多人就把它當成『該繳的金額』。這就是錨定：一個數字先出現，就變成你的標準。」
  - `paidPartial`: 「繳一部分比只繳最低好，但沒繳的部分一樣從入帳日開始算利息。」
  - `paidNone`: 「不繳會有違約金，還會留下遲繳紀錄，之後借錢都會更難。」
  - `paidFull`: 「你沒被最低應繳帶走。很多人第一眼看到那個小數字，就以為繳那樣就好。」
  - default: 「帳單上最小的那個數字，最容易被當成標準。」
- Takeaway 「看帳單三步」: 先看截止日 / 盡量繳全額 / 繳不出來時，先停刷再想辦法.

### Task B: 你是銀行 (You Are the Bank)

- Brief: role 「星河銀行的放款專員」, situation 「今天有 6 個人申請貸款或信用卡。看完每份資料，給他們 1、2 或 3 分。」
- Rating meaning (shown above the files): **1 不核准** / **2 小額或要求更多資料** / **3 核准**
- Lesson card (`text`), 「銀行在看什麼」: 「有沒有穩定收入、每月要還多少、過去準不準時、最近是不是到處借錢、有沒有幫別人擔保。」
- Lesson card (`text`), 「信用小白」: 「從沒用過信用卡或貸款的人，不是信用差，是銀行沒資料可看。」
- Step: one `RateStep` with 6 files drawn at random from the 18 below (seeded per attempt). Each file is a `creditReport` material. After rating, each file flips to show what happened and the detail that mattered, highlighted in the report.
- Scores in reports are labelled 「信用評分（示意）」. `VERIFY` the real score range of the national credit bureau (believed 200 to 800) and put it in the lesson card; if unverified, say only 「分數越高越好」.

| # | 姓名 / 年齡 / 職業 | 月收入 / 年資 | 卡 (張, 使用率, 近 12 月遲繳) | 每月要還 | 近 3 月被查詢 | 保證人 | 停卡 / 呆帳 | 評分 | 申請 | 答案 | 關鍵細節 → 後來 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 陳怡君 / 28 / 護理師 | 52,000 / 4 年 | 2, 18%, 0 | 學貸 2,800 | 1 | 無 | 無 | 680 | 信貸 150,000 進修 | 3 | 收入穩、使用率低、從不遲繳 → 準時還完 |
| 2 | 林冠宇 / 24 / 業務 | 平均 38,000，近半年 26,000 到 60,000 / 1 年 | 3, 85%, 2 | 0 | 5 | 無 | 無 | 560 | 信貸 300,000 換車 | 1 | 卡幾乎刷爆、最近兩次遲繳、三個月申請五次 → 半年後開始遲繳 |
| 3 | 張雅婷 / 22 / 行政助理 | 30,000 / 3 個月 | 0, 無, 無 | 0 | 0 | 無 | 無 | 無資料 | 第一張信用卡 額度 30,000 | 2 | 信用小白，不是信用差 → 銀行先核 NT$20,000 額度，一年後調高 |
| 4 | 黃志明 / 35 / 工程師 | 85,000 / 8 年 | 4, 10%, 0 | 房貸 28,000 | 0 | 弟弟的車貸 600,000 | 無 | 700 | 信貸 500,000 | 2 | 自己很好，但當了大額保證人，弟弟沒還就要他還 → 銀行降到 200,000 |
| 5 | 吳佩珊 / 30 / 自己開咖啡店 | 去年報稅所得 480,000 (月均 40,000)，每月起伏大 / 2 年 | 2, 40%, 0 | 0 | 1 | 無 | 無 | 640 | 創業貸款 200,000 | 2 | 收入不固定，需要看報稅和店的帳 → 補了資料後核 120,000 |
| 6 | 劉建宏 / 41 / 公務員 | 62,000 / 15 年 | 1, 5%, 0 | 0 | 0 | 無 | 無 | 740 | 信貸 100,000 修房子 | 3 | 收入最穩、幾乎沒負債 → 準時還完 |
| 7 | 蔡宗翰 / 27 / 外送員 | 平均 35,000 / 3 年 | 2, 95%, 1 | 機車分期 3,000 | 3 | 無 | 兩年前被強制停卡 | 520 | 信貸 80,000 還卡債 | 1 | 有停卡紀錄、卡刷到 95% → 銀行建議先找銀行談債務協商 |
| 8 | 鄭心怡 / 26 / 設計師 | 45,000 / 2 年 | 2, 30%, 0 | 0 | 6 | 無 | 無 | 600 | 信貸 200,000 投資股票 | 1 | 三個月內申請六次，而且是借錢投資 → 被拒後她改成每月定期定額 |
| 9 | 許家豪 / 33 / 醫院行政 | 48,000 / 6 年 | 2, 25%, 0 | 車貸 9,000 | 1 | 無 | 無 | 670 | 信貸 120,000 辦婚禮 | 3 | 加上新貸款，每月要還的也不到收入三成 → 準時還完 |
| 10 | 楊雅雯 / 29 / 補習班老師 | 鐘點制，平均 40,000 / 1 年 | 1, 20%, 0 | 學貸 3,000 | 2 | 無 | 無 | 630 | 信貸 60,000 | 3 (2 也給滿分) | 收入不固定，但借得少、紀錄好 → 準時還完 |
| 11 | 周俊傑 / 38 / 貨車司機 | 55,000 / 10 年 | 5, 70%, 0 | 信貸 12,000 + 車貸 15,000 | 2 | 無 | 無 | 610 | 信貸 300,000 整合負債 | 1 | 每月要還 27,000，快一半收入了 → 銀行建議找債務協商，不再加貸 |
| 12 | 江美玲 / 45 / 家管 | 本人無收入 / 無 | 1 (附卡), 無, 0 | 0 | 0 | 無 | 無 | 無資料 | 信貸 100,000 | 1 | 申請人自己沒有收入，還款來源不明 → 改由有收入的家人申請 |
| 13 | 謝承恩 / 23 / 工程師 | 48,000 / 6 個月 | 1, 15%, 0 | 學貸 2,500 | 0 | 無 | 無 | 650 | 第二張信用卡 | 3 | 年資短，但收入穩、用卡習慣好 → 核卡 |
| 14 | 何品妤 / 31 / 自由接案翻譯 | 去年報稅所得 560,000 / 接案 3 年 | 2, 12%, 0 | 0 | 1 | 無 | 無 | 690 | 信貸 150,000 買設備 | 3 | 接案也能借，關鍵是三年都有報稅紀錄 → 準時還完 |
| 15 | 羅志偉 / 50 / 餐廳主廚 | 70,000 / 3 年 (五年換四份工作) | 3, 60%, 1 (11 個月前) | 房貸 25,000 | 2 | 無 | 無 | 610 | 信貸 400,000 | 2 | 收入不錯但工作常換、借很多 → 核 150,000 |
| 16 | 王詩涵 / 25 / 銀行櫃員 | 38,000 / 2 年 | 2, 8%, 0 | 0 | 0 | 朋友的機車分期 80,000 (朋友已遲繳 2 期) | 無 | 620 | 信貸 50,000 | 2 | 她擔保的人已經遲繳，債可能落到她身上 → 核 30,000 |
| 17 | 陳柏翰 / 34 / 軟體工程師 | 120,000 / 5 年 | 6, 3%, 0 | 0 | 5 (上個月) | 無 | 無 | 700 | 信貸 600,000 | 2 | 收入很高，但一個月內突然到處申請，可能急需用錢 → 銀行要求說明用途 |
| 18 | 林宛蓉 / 27 / 護理師 | 50,000 / 3 年 | 2, 35%, 0 | 0 | 1 | 無 | 無 | 660 | 信貸 700,000 買加密貨幣 | 1 | 借月薪 14 倍去做高風險投資 → 銀行拒絕 |

- Scoring: exact = 1, off by one = 0.5 (except #10 where 2 also gets 1). Pass 0.6.
- Model answer per file: the 關鍵細節 column, plus the highlighted report fields.
- Reveal (`過度自信`), default: 「當銀行才發現：一個小細節就能改變答案。你看別人的資料這麼仔細，銀行看你的時候也一樣。」
- Takeaway 「銀行看你的五件事」: 收入穩不穩 / 每月要還多少 / 有沒有準時 / 最近有沒有到處借 / 有沒有幫人擔保.
- `VERIFY` (lesson card only, not required for the game): the regulator's cap that unsecured debt from banks should not exceed 22 times monthly income. If verified, add one line to the 「銀行在看什麼」 card: 「無擔保的借款總額，原則上不超過月收入的 22 倍。」

### Task C: 朋友要跟你借錢

- Brief: role 「你」, situation 「同學傳訊息來借錢。」
- Lesson card (`flow`), 「借錢兩問」: 真的需要嗎？ → 他還得起嗎？ → 兩個都是：約好什麼時候還 / 有一個不是：有勇氣說不
- Material `chat` (阿凱):
  - 21:14 阿凱: 欸在嗎
  - 21:14 阿凱: 可以先借我 5000 嗎 月底就還你
  - 21:15 你: 怎麼了？
  - 21:16 阿凱: 想買新的球鞋 限量的 今天不買就沒了
  - 21:16 阿凱: 我打工薪水下個月才會進來
  - 21:17 阿凱: 上次跟小傑借的 1500 我還沒還他 但這次一定還你
- Step 1 `FindStep`: 「找出兩個讓你該猶豫的地方」 targets: the 限量球鞋 message (not a need), the 小傑 message (past not repaid).
- Step 2 `ChoiceStep`: 「你怎麼回？」 options: 借 5000 / 借一半 / 不借，但幫他想辦法 / 直接已讀不回. Correct: 不借，但幫他想辦法. Reasons: (a) 「這不是必要的花費，而且他還有一筆沒還。」 correct; (b) 「朋友就應該互相幫忙。」; (c) 「5000 不多，不借很小氣。」
- Step 3 `ChoiceStep`: 「如果他接著說：『那你幫我當分期的保證人就好』？」 options: 答應 / 拒絕. Correct 拒絕. Reasons: (a) 「當保證人等於答應他不還時由我來還。」 correct; (b) 「保證人只是簽個名。」; (c) 「他是好朋友，不會害我。」
- Model answer: 「拒絕不等於不夠朋友。你可以說：『這次我不借，但我可以陪你算算看怎麼存到。』」
- Reveal (`怕傷感情`), default: 「我們常常為了不尷尬而借錢。但借出去收不回來，傷的感情更多。」
- Takeaway: 「借錢兩問」 as above.

### Task D: 保護你的卡

- Lesson card (`compare`), 「三要三不」: left 要 (保護個資, 定期對帳, 小心保管密碼); right 不要 (點不明連結, 給別人卡號和驗證碼, 把卡借別人).
- Step `SortStep`: sort into 要 / 不要: 每月對一次帳單, 把簡訊驗證碼告訴「銀行客服」, 密碼用生日, 收到「刷卡失敗」簡訊就點連結, 開啟刷卡通知, 把卡借給室友刷一下, 卡片遺失馬上打給銀行掛失, 網購只在熟悉的網站.
  Answers: 要 = 每月對帳, 開啟刷卡通知, 遺失馬上掛失, 只在熟悉的網站; 不要 = the rest.
- Reveal (`習慣`), default: 「大部分盜刷不是駭客多厲害，是我們順手點了一個連結。」
- Takeaway 「三要三不」.

---

## 5. 消費線

**Unlocks:** editable flexible bill items in the life game.

### Task A: 你的第一個月

- Brief: role 「剛領到第一份薪水的你」, situation 「月薪 NT$32,000。先存再花，看看這個月怎麼過。」
- Lesson card (`formula`), 「先存再花」: formula 「收入 − 存錢 = 可以花的錢」, example 「不是『收入 − 花掉的 = 剩下的才存』。月初就先存，剩下的才是你能花的。」
- Lesson card (`compare`), 「兩種順序」: left 脆弱的順序 (收入 → 花錢 → 剩下的才存); right 穩的順序 (收入 → 先存 → 再花).
- Materials: `payslip` (月薪 32,000, engine payroll), `billSheet` (family housing: 孝親費 3,000, 餐費 9,000, 交通 1,200, 手機 499, 日用品 1,500).
- Step 1 `NumberStep`: 「實發多少？」 engine answer.
- Step 2 `NumberStep`: 「繳完帳單，還剩多少？」 = net − 15,199.
- Step 3 `ChoiceStep`: 「你打算月初先存多少？」 options: 0 / 收入的 10% / 收入的 20% / 收入的 50%. Correct: 10% or 20% (both full credit; set `accept`). Reasons: (a) 「先存一個固定比例，剩下的才花，比月底才存容易成功。」 correct; (b) 「月底剩多少再存多少就好。」; (c) 「存越多越好，先存一半。」 Explanation for 50%: 「存很多很好，但要留夠生活費。存到月底不夠花，最後會用卡補，反而更糟。」
- Step 4 `ChoiceStep`: 「早餐要不要每天加一杯 NT$60 的飲料？」 options: 加，才 60 而已 / 加，但先算一個月多少 / 不加. Correct: 加，但先算一個月多少. Reasons: (a) 「每天 60，一個月上班 22 天就是 NT$1,320。知道總數再決定。」 correct; (b) 「小錢不用算。」; (c) 「花錢就是不好。」
- Step 5 `ChoiceStep`: 「同學約週末唱歌，一人 NT$800，你這週已經花超過預算。」 options: 去 / 不去 / 去，但下週少花 NT$800. Correct: 去，但下週少花. Reasons: (a) 「社交也是生活的一部分，預算可以挪，但要從別的地方補回來。」 correct; (b) 「大家都去，不去很怪。」; (c) 「存錢比朋友重要。」
- Reveal (`跟別人比`), byHookOption: if the hook answer was 「不用算」: 「小錢最容易被忽略。單看一杯不貴，加起來就是一個月 NT$1,320。」 default: 「我們很容易用『大家都這樣』來決定花不花。先知道自己的總數，再決定要不要跟。」
- Takeaway 「花錢三問」: 需要嗎？ / 急嗎？ / 付得起嗎？

### Task B: 需要還是想要

- Lesson card (`text`), 「特價的陷阱」: 「原價 NT$1,990，特價 NT$990，看起來省了 1,000。但如果本來就不需要，你其實是花了 990。」
- Step 1 `SortStep`: 需要 / 想要: 房租或孝親費, 每天的午餐, 新出的手機殼, 上班的交通費, 第三雙球鞋, 感冒看醫生, 串流平台第二個方案, 冬天的外套 (`accept` 需要 or 想要 for 冬天的外套 and 每天的午餐 note: 「吃飯是需要，吃多貴是想要。」).
- Step 2 `ChoiceStep`: 「機車壞了要修 NT$3,000，這個月預算已經用完。」 options: 用緊急預備金 / 刷卡，下個月再說 / 跟家人借. Correct: 用緊急預備金. Reasons: (a) 「緊急預備金就是為這種事存的。用完再慢慢補回來。」 correct; (b) 「刷卡比較方便。」; (c) 「家人應該會幫忙。」
- Reveal (`錨定效應`), default: 「先看到原價，特價就顯得很便宜。這叫錨定：第一個數字變成你判斷的標準。」
- Takeaway: 「花錢三問」.

---

## 6. 存錢線

**Unlocks:** 存定存, goal tracking in the life game.

### Task A: 讓目標變具體

- Lesson card (`text`), 「SMART 目標」: 「具體、可衡量、做得到、相關、有期限。『我要存錢』不是目標，『12 個月存 NT$30,000 買筆電』才是。」
- Step 1 `ChoiceStep`: 「哪一個是好目標？」 options: 我要開始存錢 / 我要存很多錢 / 我要在 12 個月內存 NT$30,000 買筆電 / 我要跟同學一樣有新手機. Correct: the third. Reasons: (a) 「有東西、有金額、有期限。」 correct; (b) 「越多越好比較有動力。」; (c) 「跟同學一樣比較不會被比下去。」
- Step 2 `NumberStep`: 「12 個月存 NT$30,000，每個月要存多少？」 answer 2,500.
- Step 3 `NumberStep`: the student's own goal from onboarding: 「你的目標每個月要存多少？」 answer = their amount ÷ months, rounded up to NT$100.
- Reveal (`現在偏誤`), byHookOption: chose NT$1,000 now: 「大部分人都選現在拿。眼前的東西感覺比較大，這叫現在偏誤，也是存錢難的原因。」 default: 「你願意等，這正是存錢需要的能力。」
- Takeaway 「月初先存」.

### Task B: 誰比較會存

- Lesson card (`compare`), 「看比例，不看金額」: left 阿哲 (月薪 40,000, 必要開銷 30,000, 每月存 6,000); right 小琪 (月薪 40,000, 必要開銷 22,000, 每月存 10,000). Note: 「儲蓄率 = 每月存下 ÷ 月薪」.
- Step 1 `NumberStep`: 「阿哲的儲蓄率是幾 %？」 answer 15.
- Step 2 `NumberStep`: 「小琪的儲蓄率是幾 %？」 answer 25.
- Step 3 `ChoiceStep`: 「阿哲說：『我必要開銷比較高，所以我存不了那麼多。』他可以怎麼做？」 options: 想辦法降低固定開銷 / 等加薪再說 / 不用存了. Correct: 降低固定開銷. Reasons: (a) 「固定開銷每個月都會發生，省一次就每個月都省。」 correct; (b) 「加薪了自然就會存了。」; (c) 「開銷高就沒辦法。」
- Step 4 `ChoiceStep`: 「哪個習慣比較容易存到錢？」 options: 月初就存 / 月底剩多少存多少. Correct 月初. Reason (a) 「月底才存，錢通常已經不見了。」
- Lesson tip (shown after the task): 「52 週存錢法：第 1 週存 NT$10，第 2 週存 NT$20，每週多存 10 元，一年存到 NT$13,780。」
- Step 5 `NumberStep` (deep, optional): 「NT$50,000 放一年期定存，年利率 1.70%，一年利息多少？」 answer 850 (from the existing 定存 constant).
- Reveal (`看絕對金額`), default: 「存比較多錢的人不一定比較會存。要看存下的錢占收入的比例。」
- Takeaway: 「儲蓄率 = 每月存下 ÷ 月薪」.

---

## 7. 投資線

**Unlocks:** ETF moves, 定期定額, 賣出, fast-forward.

### Task A: 準備好了嗎

- Lesson card (`text`), 「投資是冰山的頂端」: 「水面上是投資，水面下是預算、存款和緊急預備金。沒有這些就急著投資，常常不是理財，是賭。」
- Lesson card (`flow`), 「進場前四件事」: 留好 3 到 12 個月的緊急預備金 → 先還掉高利息的債 → 存錢是投資的本 → 沒想清楚之前，不借錢投資
- Material: three `snapshot` cards: 小安 (存款 NT$60,000, 每月必要開銷 18,000, 卡債 0); 阿德 (存款 NT$80,000, 卡債 NT$25,000 循環中); 美美 (存款 NT$8,000, 每月必要開銷 16,000, 卡債 0).
- Step `ChoiceStep`: 「誰最適合開始每月投資一點？」 options 小安 / 阿德 / 美美. Correct 小安. Reasons: (a) 「有三個多月的預備金，也沒有高利息的債。」 correct; (b) 「阿德存款最多。」; (c) 「美美最需要讓錢變多。」 Explanation for 阿德: 「卡債年利率最高到 15%，先還卡債，等於穩穩賺 15%。」
- Reveal (`急著讓錢變多`), default: 「看到別人投資賺錢，我們會急著跳過前面的步驟。但底下沒打穩，一次意外就會被迫在低點賣掉。」
- Takeaway 「先管好錢，再讓錢長大」.

### Task B: 看懂 ETF 代號

- Lesson card (`text`), 「代號最後的英文字母」: 「ETF 代號最後的英文字母代表類型。L、R、U、B 已經用了很多年；A 是近年才有的主動式 ETF。像 0050 這樣沒有字母的，是一般的股票型 ETF。」 (`VERIFY` when each letter came into use before adding any date to this card; without verification, keep the card date-free as written.)
- Step 1 `SortStep` (6 boxes): match code to type: 0050 → 一般股票型（被動）; 00980A → 主動式股票型; 00982B → 債券型（新台幣）; 00631L → 槓桿型; 00632R → 反向型; 00642U → 期貨型. (`VERIFY` each example code and meaning against the exchange's or the source article's list before shipping.)
- Step 2 `ChoiceStep`: 「哪兩種不適合長期放著不管？」 options: L 和 R / A 和 B / 0050 和 B. Correct L 和 R. Reason (a) 「槓桿和反向追的是『每天』的倍數，放久了會跟指數走不一樣。」 correct.
- Step 3 `ChoiceStep`: 「為什麼這門課用大盤 ETF 當例子，不是黃金或加密貨幣？」 options: 大盤 ETF 擁有很多會賺錢的公司 / 黃金和加密貨幣一定會賠 / 大盤 ETF 保證賺. Correct first. Reasons: (a) 「公司會賺錢、發股利；黃金不會產生收入，加密貨幣波動很大，詐騙也多。」 correct; (b) 「因為大盤不會跌。」; (c) 「因為老師說的。」 Model note: 「這不代表黃金或加密貨幣一定不好，只是風險和道理不同，新手先從看得懂的開始。」
- Takeaway: 「L 和 R 不長抱」.

### Task C: 真實的暴跌月

- Brief: role 「你」, situation 「你每月定期定額大盤 ETF，已經投入 NT$50,000。這個月新聞說台股大跌。」
- Data: compute from `historical_prices` (split-adjusted 0050): find the month with the biggest monthly fall in the series that also has at least 6 later months, then take its change and the next 6 months' closes. Do not hard-code a month. (Monthly closes smooth out drops that happened inside a month, so April 2025 is not the answer; let the data pick.)
- Material: a `priceChart` of the 12 months ending at the drop month, and a `newsCard`: 「台股單月重挫 X%」 (X from data).
- Step `ChoiceStep`: 「你要怎麼做？」 options: 全部賣掉，先保住剩下的 / 繼續定期定額 / 用緊急預備金加碼. Correct 繼續定期定額. Reasons: (a) 「長期投資本來就會遇到大跌，賣掉就把帳面虧損變成真的虧損。」 correct; (b) 「先賣掉，等漲回來再買。」; (c) 「跌越多越要把所有錢都放進去。」 Explanation for 加碼: 「緊急預備金是給意外用的，不是給投資用的。」
- After answering: reveal the next 6 real months from data, with the student's NT$50,000 valued under each option.
- Reveal (`損失趨避`): `outcomeFrom` the step, map 全部賣掉 → `sold`, 繼續定期定額 → `held`, 用緊急預備金加碼 → `added`. byOutcome: `sold` 「賠錢的痛，大約是賺錢快樂的兩倍。所以大跌時人會想逃。這叫損失趨避。」 `held` 「你撐住了。很多人在這種月份賣掉，之後就錯過了回升。」 `added` 「想撿便宜很正常，但不能動到預備金。」 default: 「大跌的時候，最難的不是算數學，是管住自己的害怕。」 If the real 6 months after the drop did not recover, say so in the after-answer screen; never imply recovery is guaranteed.
- Takeaway: 「大跌時三不：不恐慌賣、不動預備金、不借錢加碼」.

---

## 8. 保險線

**Unlocks:** 醫療險, 意外險, 壽險 in the life game.

### Task A: 風險四格

- Lesson card (`matrix`), 「處理風險的四種方法」: x 發生機率 (低, 高), y 損失金額 (低, 高), cells: 低損失低機率 → 自己承擔; 低損失高機率 → 想辦法降低; 高損失低機率 → 轉給保險; 高損失高機率 → 直接避開.
- Step `SortStep` into the four boxes:
  - 手機螢幕摔破 → 想辦法降低 (買保護殼). `accept` 自己承擔.
  - 弄丟一把便宜的雨傘 → 自己承擔.
  - 住院開刀 → 轉給保險.
  - 騎車不戴安全帽 → 直接避開.
  - 撞傷別人要賠一大筆錢 → 轉給保險.
  - 酒後騎車 → 直接避開.
  - 家裡失火 → 轉給保險.
  - 感冒看醫生 → 自己承擔 (`accept` 想辦法降低; note: 「健保已經幫你分擔很多了。」).
- Reveal (`因為害怕而買`), default: 「保險推銷常常從『萬一』開始講。害怕的時候，我們會想把每件事都保起來。但保費是每個月都要付的。」
- Takeaway 「大又少見才保險，小的自己扛」.

### Task B: 人身四大風險

- Lesson card (`compare`) 「四種人生風險」: rows: 走得太早 → 壽險; 病得太重 → 醫療險; 傷殘需要照顧 → 失能險或長照險; 活得太久錢不夠 → 年金險.
- Step 1 `SortStep`: match each situation to a policy type: 「家裡主要賺錢的人突然過世」→ 壽險; 「住院開刀花了很多錢」→ 醫療險; 「車禍後不能工作，需要長期照顧」→ 失能險或長照險; 「退休後活到 95 歲，存款用完了」→ 年金險.
- Step 2 `ChoiceStep`: 「22 歲、單身、剛工作、沒有人靠你養，最先考慮哪種？」 options: 醫療險和意外險 / 壽險 / 年金險 / 全部都買. Correct: 醫療險和意外險. Reasons: (a) 「生病和意外是現在最可能遇到又最花錢的。沒有人靠你的收入生活，壽險可以晚點再說。」 correct; (b) 「壽險最重要，越早買越便宜。」; (c) 「全部都買最安心。」
- Takeaway: 「先保會讓你破產的，再保會讓你不方便的」.

The existing policy-vs-定存 sim stays as a deep station.

---

## 9. 詐騙線: case files

**Unlocks:** safe options highlighted on scam events.

Replace the real-or-scam cards with 6 case files. **Each case is its own TaskSet.** The line's core stations get cases in order (first core station → case 1, and so on); any cases left over form a 「案件庫」 on the line page that students can replay any time, and the line's simulation page runs a random unplayed case. The `ChoiceStep` options are the 6 scam types from the table, with no reason part. Each case: brief, a `chat` (or call transcript shown as a chat), 3 steps: `FindStep` (find the red flags), `ChoiceStep` (what kind of scam, with reason), `OrderStep` (what to do, in order). The `OrderStep` answer is the same for all cases: 停止回應 → 用官方電話查證或打 165 → 絕不轉帳或給驗證碼 → 保留證據並報案.

Lesson card (`text`), 「防詐三不」: 「不信陌生來訊，不理可疑連結，不照指示轉帳。有懷疑就多問、多查、多確定，打 165。」

Use the existing 詐騙線 source notes for any statistics. The 2025 police statistics already in the repo say 投資詐欺 is the most common type overall, and 網購 is most common for victims under 18 and 18 to 23. Keep that exact framing.

| # | Case | Chat content (summary; write each as 5 to 8 messages) | Red flags to find | Type (answer) |
|---|---|---|---|---|
| 1 | 半價球鞋 | Social-media ad for limited sneakers at 70% off; seller moves you to a private chat; "貨到付款 sold out, transfer now to hold"; account name differs from shop name | 價格太低; 要你轉帳不能貨到付款; 收款帳戶名字不一樣 | 網購詐騙 |
| 2 | 地檢署來電 | Caller says "臺北地方檢察署", your account is linked to money laundering, do not tell family, transfer savings to a "監管帳戶" for checking | 要你保密; 要你轉帳到監管帳戶; 用公家機關名義施壓 | 假檢警 |
| 3 | 投資老師群組 | Invited to a LINE stock group; screenshots of big wins; "老師" lets you withdraw NT$500 profit first, then asks for NT$50,000 to join a "VIP plan" | 保證獲利; 先讓你小賺; 要求加碼大筆金額 | 投資詐騙 |
| 4 | 客服說誤設分期 | "Online shop customer service" says your order was wrongly set to 12 installments; "bank staff" will help you cancel at an ATM | 要你去 ATM 操作; ATM 不能解除分期; 主動來電要你配合 | 解除分期詐騙 |
| 5 | 日領 3,000 的工作 | Job post: easy work, NT$3,000 a day, only need to lend your bank account or pick up packages and withdraw cash | 高薪輕鬆; 要你的帳戶或提款卡; 幫人領錢 | 求職詐騙（人頭帳戶、車手） |
| 6 | 好朋友借點數 | A friend's account asks you to buy NT$3,000 of game points and send the codes, "I'll pay you back tomorrow, can't talk on the phone" | 不能講電話; 要點數序號; 急著要 | 假冒親友 |

Case 5 extra model-answer note (keep the law framing already in the repo's 詐騙 station): 「把帳戶交給別人，或幫人領錢，可能觸犯洗錢防制法和刑法加重詐欺。拿了報酬交出帳戶，可以直接被處罰。」 Use the repo's existing verified wording; do not restate penalties from memory.

- Reveal (`急迫感和權威`), default: 「詐騙最常用兩招：讓你急，讓你怕。只要對方要你『馬上』或『保密』，就先停下來。」
- Takeaway 「防詐三不」 and 「165」.

---

## 10. 租屋線

**Unlocks:** 搬出去住, 房屋基金, `rent_up` event.

Keep the existing lease clause hunt (it already works well). Wrap it:

- Hook: 「房東說『很多人在看，今天不簽就沒了』，你會簽嗎？」 options: 先簽再說 / 回家看完合約再決定 / 先問押金和規定.
- Lesson card (`flow`), 「簽約前三查」: 查房東是不是屋主 → 對照政府的租賃契約範本 → 押金不超過兩個月租金. (`VERIFY` the two-month deposit cap in the residential lease law and the official model contract's name before shipping.)
- Reveal (`稀缺感`), byHookOption 先簽再說: 「『很多人在看』會讓我們怕錯過，判斷就變快變草率。好房東通常給你時間看合約。」 default: 「時間壓力是最常見的推銷技巧，租屋也一樣。」
- Takeaway 「簽約前三查」.

---

## 11. 學貸線

**Unlocks:** student loan repayment on the life-game bill sheet.

Keep the existing three-phase engine (in school, grace period, repayment at the verified 0.775%). New task:

- Hook: 「在學期間不用付利息，那借多一點也沒關係？」
- Lesson card (`text`), 「現在不用付，不代表不用付」: 「畢業後的每個月，都會有一筆固定的還款。先算出來，再決定借多少。」
- Step 1 `NumberStep`: 「如果借 NT$400,000，畢業後每月要還多少？」 answer from the existing engine.
- Step 2 `NumberStep`: 「如果只借學費 NT$200,000，生活費靠打工，每月要還多少？」 engine answer.
- Step 3 `ChoiceStep`: 「起薪 NT$32,000，你會選哪個？」 options: 借 40 萬 / 借 20 萬加打工 / 看情況. Correct 看情況 with reason (a) 「先算每月還款占薪水多少，再看打工會不會影響課業。」 correct; (b) 「利息很低，借越多越好。」; (c) 「學貸很可怕，完全不要借。」 Model note: 「學貸利率很低，是好用的工具。重點是借你需要的，不是借你能借的。」
- Reveal (`只看現在`), default: 「現在不用付的錢，感覺就不像是錢。這是只看現在的偏誤。」
- Takeaway: 「先算畢業後每月要還多少」.

---

## 12. 報稅線

**Unlocks:** real yearly `tax_notice` in the life game.

Keep the existing payslip and deduction tasks (115年度 constants, already verified). Add:

- Hook: 「五月收到退稅 NT$3,000，這是賺到的嗎？」 options: 是，意外之財 / 不是，本來就是我的錢 / 不知道.
- After the existing task, a `ChoiceStep`: 「退稅 NT$3,000，你會怎麼用？」 options: 當作獎勵全花掉 / 放進緊急預備金或目標 / 一半一半. Correct: 放進預備金或目標, `accept` 一半一半 for half credit. Reason (a) 「退稅是你之前每月多被扣的錢，把它當成薪水的一部分來規劃。」 correct.
- Reveal (`心理帳戶`), byHookOption 是: 「我們會把『退稅』放進『意外之財』的帳戶，花起來比較不心疼。但它其實是你自己多繳的錢。」 default: 「同樣是一塊錢，放在不同心裡的帳戶，就會被花得不一樣。」
- Takeaway: 「退稅是你多繳的錢」.

---

## 13. 創業線 and 財務決策線

### 創業線

**Unlocks:** 副業.

Keep the bubble tea loop (毛利率, stock-outs, day-12 price decision). Add:

- Hook: 「店已經虧了三個月，投進去的錢不能白費，要繼續嗎？」 options: 繼續，不然之前都白花了 / 看接下來能不能賺再決定 / 馬上收.
- Lesson card (`formula`), 「損益兩平」: formula 「每月固定成本 ÷ 每杯賺的錢 = 每月要賣幾杯才不虧」, example 「房租加人事 NT$60,000，一杯賺 NT$30，每月要賣 2,000 杯。」
- After the existing sim, a `ChoiceStep`: 「已經投入 NT$300,000。照現在的生意，接下來每月還會虧 NT$10,000。你會？」 options: 繼續撐 / 調整後再試三個月，沒改善就收 / 馬上收. Correct: 調整後再試三個月. Reason (a) 「已經花掉的錢拿不回來，要看的是接下來會不會賺。」 correct.
- Reveal (`沉沒成本`), byHookOption 繼續: 「已經花掉的錢叫沉沒成本。不管繼續或停止，它都拿不回來，所以不該影響決定。」 default: 「做決定時，只看接下來會發生什麼。已經花掉的，不管怎麼選都回不來。」
- Takeaway: 「看未來，不看已經花掉的」.

### 財務決策線 (the finale)

Keep the existing buy-vs-rent engine. It now reads the life-game state (savings, 房屋基金, card record, income, monthly saving) in addition to the profile, with the same `known` flags and stand-in labels.

- Hook: 「大家都說要買房，租房就是在幫房東繳房貸？」 options: 對，越早買越好 / 不一定，要先算 / 我還不知道.
- Lesson card (`flow`), 「買房前三算」: 頭期款存夠了嗎 → 每月房貸占收入多少 → 買完還有沒有緊急預備金
- Final screen: the student's whole journey on one card: job, saving rate, emergency fund months, credit record, investments, freedom %, stress. Then the existing decision and result.
- Reveal (`從眾`), byHookOption 對: 「『大家都說』是最有力的推銷。買房可能是好決定，但要用你自己的數字算，不是用別人的。」 default: 「買或租都可以是對的，答案在你自己的數字裡。」
- Takeaway: 「買房前三算」.
- Ending text (after the result): 「這條路線走完了，但你的人生遊戲還會繼續。每個月回來一次，看看小宇會變成什麼樣子。」 (use the student's character name)

---

## 14. Life-game event texts

Write each event card exactly as below. `{name}` is the character's name. Costs come from `02` section 6.

| id | Card title | Card text | Option labels |
|---|---|---|---|
| `phone_break` | 手機螢幕摔破了 | {name} 下公車時手機掉在地上，螢幕裂了。修好要 NT$6,000。 | (none) 「付錢修」 |
| `dental` | 牙齒要根管治療 | 牙痛了一週，醫生說要做根管治療。健保給付後，自己還要付 NT$6,000。 | 「付錢」 |
| `scooter_service` | 機車要保養了 | 機油、輪胎、煞車皮一起換，NT$2,500。 | 「付錢」 |
| `accident` | 騎車擦撞受傷 | 下雨天路滑，{name} 擦撞受傷，醫藥費 NT$12,000。 | 「處理」 |
| `hospital` | 急性腸胃炎住院 | 住院三天，費用 NT$30,000。 | 「處理」 |
| `birthday` | 朋友生日聚餐 | 好朋友生日，大家約吃燒肉，一人 NT$1,500。 | 「去」 / 「不去」 |
| `concert` | 喜歡的歌手來台灣 | 演唱會門票 NT$4,800，今晚開賣。 | 「買票」 / 「不買」 |
| `japan_trip` | 同學都要去日本 | 同學揪五天四夜去日本，一人約 NT$25,000。 | 「跟」 / 「不跟」 / 「只去三天（NT$15,000）」 |
| `new_phone` | 新手機上市 | 新手機 NT$32,000，可以分 12 期。 | 「現金買」 / 「分 12 期」 / 「先不買」 |
| `scam_msg` | 一則奇怪的簡訊 | 「您的包裹地址有誤，請點此更新：https://」 | 「點連結」 / 「不理它」 / 「打 165 查證」 |
| `friend_loan` | 朋友想借錢 | 同學想跟你借 NT$5,000。你知道：{clue1}；{clue2}。 | 「借」 / 「借一半」 / 「不借」 |
| `guarantor` | 學長請你當保證人 | 學長要貸款，請你當保證人：「只是簽個名而已。」 | 「答應」 / 「拒絕」 |
| `family_help` | 家人需要幫忙 | 家裡這個月比較緊，媽媽問你能不能幫忙。 | 「給 NT$5,000」 / 「給 NT$2,000」 / 「這次沒辦法」 |
| `rent_up` | 房東要漲房租 | 房東說下個月起每月漲 NT$1,000。 | 「接受」 / 「搬家（搬家費 NT$6,000）」 |
| `invoice` | 中發票了 | 對中了一張發票，NT$200。 | 「收下」 |
| `course_sale` | 想學的課程特價 | 一直想學的線上課程特價 NT$1,990。 | 「買」 / 「不買」 |
| `layoff` | 公司縮編 | 公司裁員，{name} 被資遣了。接下來三個月沒有薪水，可以申請失業給付。 | 「申請失業給付，開始找工作」 |
| `market_drop` | 台股單月重挫 | 新聞說台股這個月跌了 {pct}%。你的 ETF 現在值 NT${value}。 | 「全部賣出」 / 「繼續持有」 / 「加碼」 |
| `bonus` | 年終獎金 | 年終發下來了：NT${amount}！ | 「全部存起來」 / 「拿去投資」 / 「花一半存一半」 / 「全部花掉」 |
| `raise` | 加薪了 | 年度調薪，月薪變成 NT${salary}。 | 「太好了」 |
| `tax_notice` | 五月報稅 | 去年的所得稅算好了：{result}。 | 「好」 |

Friend-loan clues (draw 2 per event; the repay chance is 80% with two good clues, 50% with one, 15% with none):
- Good: 「他有固定打工」, 「上次跟你借的 500 隔天就還了」, 「這筆錢是要繳學費」
- Bad: 「他還欠別人錢沒還」, 「他說要買限量球鞋」, 「他上個月才換新手機」

After every choice event, one short line explains the lesson, using the 「Teaches」 column in `02` section 6.

---

## 15. VERIFY list (fact-checker agents start here)

| # | Item | Where used | Primary source to check |
|---|---|---|---|
| 1 | 2026 minimum monthly wage NT$29,500 | `02` 3.2 | 勞動部 |
| 2 | Voluntary 勞退 contribution up to 6%, tax-deductible | `02` 3.2 | 勞工退休金條例, 勞動部勞工保險局 |
| 3 | TPASS 基北北桃 monthly price NT$1,200 | `02` 3.3 | 交通部 or the TPASS official site |
| 4 | 定存 early-break rule (80% of the matching rate) | `02` 3.4 (lesson only) | 臺灣銀行 定存 terms |
| 5 | 0050 recent cash dividend yield | `02` 3.4 | 元大投信 or TWSE |
| 6 | 0056 recent cash dividend yield | `02` 3.4 | 元大投信 or TWSE |
| 7 | Typical 定期定額 minimum (NT$1,000) and broker fee minimum (NT$20) | `02` 3.4 | Two major brokers' official pages |
| 8 | 失業給付 60% of average insured salary, up to 6 months | `02` 6 | 就業保險法, 勞保局 |
| 9 | 零利率分期 wording and fees | `02` 6 `new_phone` | One bank's official installment terms |
| 10 | National credit bureau score range (200 to 800) | `04` 4B | 財團法人金融聯合徵信中心 |
| 11 | Unsecured debt cap of 22× monthly income | `04` 4B | 金融監督管理委員會 |
| 12 | ETF code examples and meanings: 00980A, 00982B, 00631L, 00632R, 00642U | `04` 7B | TWSE or the issuer pages |
| 13 | Residential lease deposit cap of 2 months and the official model contract name | `04` 10 | 租賃住宅市場發展及管理條例, 內政部 |
| 14 | 雙北 single-room rent median (optional) | `02` 3.3 | 內政部 實價登錄 |

Already verified in the repo and not to be re-litigated: 115年度 tax figures, 2026 勞保 and 健保 rates and the NT$45,800 cap, 臺灣銀行 活存 0.825% and 定存 1.70%, card interest from 入帳日 and the 15% cap, the late-fee schedule, ETF transaction tax 0.1% vs stock 0.3%, student loan 0.775%, the 0050 split adjustment, and the 2025 scam statistics framing.

# 05 Fix Order: report

Branch `fix/playtest-05`, built on `main` (326df7a). Parts A, B and C are done, plus the follow-ups Ryan and Oliver asked for (section 10). Not pushed yet; Ryan approved a push to `main` once the final checks pass. Part D has not started; it waits for a design direction.

## 1. Commits

| Hash | Stage | What |
|---|---|---|
| 26ee90a | A3, A4 | Tasks moved to the stations that teach their topic. The statement has no hint box during the task. |
| 9b8c2cf | A2, A5, A6, A7, C | Answers stay on the server until submit. Interest question is a range choice computed by the engine. New retry copy. Options shuffled per attempt. Station flow is one thing per screen. |
| 4cf0a11 | A8.1 to A8.3 | Solo game is 人生遊戲. Train sign shows the destination. 已存下 is now 存款 (活存 + 定存), with a tap-open breakdown of the emergency fund. |
| fc1af89 | A8.5 | Station and terminal submits run their database reads together, then their writes together. |
| 4ac438a | A8.6, A8.7 | Fixes for taps that did nothing. Starting cash explained on screen. |
| 0d056ac | A1 | Every station runs the station flow. 26 stations wrap their old quiz. |
| 0a36f0b | B | Monthly 生活風格 step between 帳單 and 行動. |
| 6fd9b59 | C | Turn, dashboard and reader fit the screen. New screen check script. |
| 71cd308 | B follow-up | 省 streak stress grows +5 a month, capped at +15; resets on 普通 or 享受. Tests. |
| 4ce4f1b, 7b42646 | Follow-up | 信用線 end-to-end walk with a failed attempt, a retry and a pass. Screenshots folder ignored. |
| 7a0589f | Follow-up | Seven article facts fixed against official sources. |
| (this commit) | Report | This report. |

## 2. Migrations

None. The new life-game fields have defaults, so older saves load as they are. `task_results.kind` has no list of allowed values, so the 26 new task kinds need no migration.

## 3. What was verified, and how

- **`npm run check`:** 140 tests pass, the contract check passes, and the content check has 0 errors. The new tests are:
  - every station of every line has a station-flow lesson (A1)
  - the wrapped lessons pass the content validator
  - no answer is in the page sent to the browser (A2)
  - the interest answer equals the engine's number (A5)
  - retry copy (A6)
  - no option position above 40% over 100 attempts (A7)
- **`tsc`:** clean. **ESLint:** 0 errors; 9 warnings, all in files this work did not touch.
- **Screen check:** `scripts/check-screens.mjs`, run against a local dev server on the file store. It walks four things and checks `scrollHeight <= innerHeight + 1` on every screen:
  - the dashboard (each phone tab)
  - one full wrapped station (租屋線 看房站)
  - that station's whole life-game month, including 生活風格
  - the 看完整課文 reader

  Results: 390×844, 28 screens, 0 scroll; 1440×900, 24 screens, 0 scroll. No page errors.
- **Realism tests (02 §9):** pass with 生活風格 in place. No range changed (see section 9).
- **Not verified:**
  - **A8.5:** submit time on production. I did not run anything against production, and the local file store has no network delay to measure. The change removes queued round trips: the longest chain in a station submit went from about 11 database calls in a row to about 5.
  - **A8.6:** not checked on a real phone. The fixes target causes I found in the code (below). The script walked with touch emulation and every tap worked.
  - **Hook fallback:** the hook's no-script fallback (`?hook=`) was not tested with scripts turned off.
  - **Not walked this round:** 信用線's own stations, the retry path and the terminal pages. I walked them in the earlier round, before the A8 and Part C changes.

## 4. Decisions where the package was silent

1. **省 streak stress:** decided by Ryan and Oliver (section 10).
2. **Short on cash for 想要 spending:** the card covers the gap if it is unlocked. Otherwise the shortfall is simply not spent. Fun never becomes a 欠款.
3. **Ledger:** 想要 spending goes in the ledger's 帳單 cell, and the hint says so. Autopilot and 快轉 keep the student's last choice.
4. **A8.7:** I kept the NT$10,000 starting cash and explained it on the first payday: 「錢包裡已經有 NT$10,000：爸媽給你的第一筆生活費（示意）。」
5. **Wrapped stations:**
   - They use the line's bias and default reveal text, not the per-answer reveals, which belong to other hooks.
   - Em dashes in the old module text become 「：」 inside the station flow. The articles themselves are unchanged.
6. **看完整課文 reader:** from a station it is a paging reader without the old quiz, since the quiz now runs in the station flow. Logged-out visitors still get the old reading page.
7. **Two panes scroll inside themselves:**
   - The 路線圖 tab on phone, like a document viewer.
   - The 行動 step on phone: its card scrolls inside itself, but the page does not move.
8. **A8.6 causes found and fixed:**
   - **Dashboard 上車:** the first-visit tour opened on load, and its dim layer swallowed the tap. A tap on the dim area now closes the tour, and the tour's cut-out includes 上車.
   - **Hook answers:** tapped before the script loaded, they did nothing. They now work through a plain form.
   - **Press-shrink effect:** on touch screens it pulled a button's edge away from the finger. It now applies to mouse only.
9. **詐騙線 bug found on the way:** its simulation page picks a random unplayed case, so it could have picked a wrapped quiz. It now draws from case files only.

## 5. Where I departed from the package

1. **Dashboard tabs:** the phone dashboard has 4 tabs (今天 / 狀態 / 路線圖 / 行動), not 3. Without 今天 there is no way back to the character and today's stop.
2. **Character on the turn screen:** hidden below 1100px wide so the turn fits. It still shows on the dashboard.
3. **Playwright:** added as a dev dependency so the screen check lives in the repo. It is not part of `npm run check`, because it needs a running dev server: `npm run check:screens`.

## 6. VERIFY results

- **生活風格 amounts:** NT$3,000 / 7,000 / 12,000. 示意, from 05, labelled 示意 on screen.
- **Starting cash NT$10,000:** 示意, labelled on screen.
- **Rates:** no other figure is new in this round. The 活存 rate (0.825%, 臺灣銀行) and the card interest come from the engine as before.
- **Wrapped-station cards:** every number is taken from that station's existing article. While writing the cards, the agent flagged article facts that look wrong. I did not change the articles; see open question 3.

## 7. Open questions (Ryan and Oliver)

The first round's five questions are answered (section 10). Still open:

1. **Part D:** waiting for the three mocked directions.
2. **學生團保 office (Module 33):** no official page names the office. Left as is. Do you know which office your partner schools use?
3. **學生團保 coverage (Module 33, pre/post question pp-baoxian-6):** both say it is 「多為意外傷害醫療」. 國教署 says high-school 團保 has been a policy insurance under its own law since 109/8/1 and also covers illness. This was not flagged and is not changed. Fix it?
4. **房仲費 source:** the 1.5-month cap comes from the 內政部 standard as quoted by 監察院. The 內政部 page itself would not open. Is a 監察院 quote good enough, or should someone confirm it on the ministry site?

## 8. What a student sees now (signup to the end of 信用線)

1. **Sign up:** after the avatar and goal, the student lands on one phone screen: their character, today's stop, and 上車. 狀態 / 路線圖 / 行動 sit in tabs at the bottom.
2. **Station flow:** every station, all 42, opens with a gut-check hook. Then come lesson cards one at a time, the task one question per screen, a score, then model answers one per screen with the student's answer beside each.
3. **信用站 (你是銀行):** one applicant per screen, big 1 / 2 / 3 buttons, six dots. The score shows as points, for example 「3.5 / 6」.
4. **卡片站 (你的第一張帳單):**
   - A card lesson explains how interest is counted, then the statement task.
   - The interest question is a range choice: 約 NT$10 / 100 / 1,000 / 5,000.
   - The model answer shows the engine's exact number and the 入帳日 sentence.
5. **Failing a station:** a first fail says 「還差一點。再試一次；第二次不論分數，這一站都會完成。」 The retry has a new option order.
6. **After each station, one life-game month in 7 steps:** 發薪日, 先存錢, 帳單, 生活風格 (省 / 普通 / 享受), 行動 (swipe through unlocked cards), 人生事件, 記帳.
7. **Month summary:** shows 「這個月想要的花費」. Then the train ride, whose sign shows the next station's name, line color and code.
8. **Line terminal:** 信用線 ends at its terminal (the original card simulation). An optional link to the classic version sits on the first lesson card.

## 9. Added for 05

**A1, station by station.** "Task" means the station already had its own task set. "New" means it now wraps its old quiz in the station flow; before this round it opened the old reading page and quiz.

- 職涯線: 39 興趣站 task, 40 職涯站 task
- 存錢線: 3 複利站 task, 6 習慣站 task
- 消費線: 1 心理站 task, 2 記帳站 task
- 信用線: 4 信用站 task (你是銀行), 7 卡片站 task (你的第一張帳單)
- 投資線: 5 投資站 task, 8 策略站 task, 42 新聞站 **new**
- 詐騙線: 9 假投資站 task, 10 人頭站 **new**, 11 客服站 task, 12 交友站 task, 13 個資站 **new**
- 學貸線: 14 學費站 **new**, 15 貸款站 task, 16 住宿站 **new**, 17 打工站 **new**, 18 獎學金站 **new**
- 報稅線: 19 to 23 all **new** (薪資單, 級距, 憑單, 扶養, 補充保費)
- 租屋線: 24 to 28 all **new** (看房, 契約, 報稅爭議, 修繕, 退租)
- 保險線: 29 健保站 task, 30 職災站 **new**, 31 商保站 task, 32 儲蓄險站 **new**, 33 團保站 **new**
- 創業線: 34 to 38 all **new** (成本, 定價, 兩平, 現金流, 登記)
- 財務決策線: 41 決策站 **new**

**Realism (Part B).** No expected range changed. Measured over 500 seeds, by 生活風格 level:

| Level | 8a median freedom at turn 120 (range 3% to 20%) | 8b median best freedom, all-in (must stay under 100%) | 8c saw a 10% fall (must be 30% or more) |
|---|---|---|---|
| 省 | 4.5% | 34% | 500 / 500 |
| 普通 | 4.5% | 25.7% | 500 / 500 |
| 享受 | 3.6% | 16.3% | 500 / 500 |

The playtest case, NT$32,000 living at home, first month: net pay NT$30,704, saved first NT$3,200, bills NT$15,199. Cash still grew by NT$7,305 at 省, NT$3,305 at 普通, and fell by NT$1,695 at 享受. Before this step it grew by about NT$10,000 with nothing to spend on.

**Screenshots at 390×844.** In `screens-390x844/`, in walk order:

- 01 to 04: dashboard, each tab
- 05 to 16: every screen of 看房站, in order
- 17 to 24: one life-game month, including 生活風格 (20) and the summary (24)
- 25 to 28: the 看完整課文 reader

## 10. Follow-ups after Ryan and Oliver's answers

**省 streak stress.** From the third 省 month in a row, stress goes up by 5 a month: +5, +10, then +15 for as long as the streak lasts. 普通 or 享受 resets the streak to zero. `tests/lifestyle.test.ts` covers four things:
- the growth
- the +15 cap over 8 months of 省
- the reset after 普通 and after 享受
- the default choice

**信用線 re-walked end to end** on the local dev server (file store), with `tests/e2e/xinyong-retry.mjs`. 12 checks, all pass, no page errors:

| Station | Attempt | Copy shown | Station done? |
|---|---|---|---|
| 信用站 (你是銀行) | 1, answered wrong on purpose | 「還差一點。再試一次；第二次不論分數，這一站都會完成。」 | No |
| 信用站 | 2, after 再試一次 (opens on the brief), all correct, 6 / 6 | 「過關了，這一站完成。」 | Yes |
| 卡片站 (你的第一張帳單) | 1, wrong | 「還差一點。再試一次；第二次不論分數，這一站都會完成。」 | No |
| 卡片站 | 2, wrong again, 0 / 4 | 「這一站完成了。」, no third try offered | Yes |

Between the stations the walk played 信用站's life-game month and rode the train to 卡片站. It then played 卡片站's month.

**Article facts.** Each fix was checked against an official source. These texts changed:
- the article (`components/lessons/Module<N>.tsx`)
- its quiz in `lib/modules.ts`
- the wrapped-station cards in `content/stations.ts`
- the matching pre/post questions in `lib/prePostQuestions.ts`

1. **職災保險, Module 30:** fixed. It was 「111 年 5 月起與勞保整合施行」. It now says the 勞工職業災害保險及保護法 took effect 111/5/1 and split 職災保險 out of 勞保 into its own law. Workers at a registered business must be insured, whatever the company's size. Sources:
   - https://www.mol.gov.tw/1607/28162/28472/28486/50681/
   - https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0050031
2. **薪資單, Module 19:** fixed. It listed 「勞退提繳（部分由雇主負擔）」 as a pay deduction. It now says:
   - The employer's 6% or more is paid in full by the employer and never deducted.
   - Only 勞退自提, up to 6% of wages, comes out of pay.
   - Tax withholding now says 「薪水比較高的人」. Under the 5% method, a monthly tax of NT$2,000 or less is not withheld.

   Sources:
   - https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=N0030020&flno=14
   - https://www.mol.gov.tw/1607/28690/87756/87796/87812/lpsimplelist
   - https://www.etax.nat.gov.tw/etwmain/tax-info/understanding/tax-q-and-a/national/individual-income-tax/withheld-rule/rule/NM11BZY
3. **房仲費, Module 24:** fixed. It said 「行情約為半個月租金」. The official rule is a cap: landlord and tenant together pay at most **1.5 months' rent** (not one month, as the first report guessed). It can be negotiated, and the split must be written in the contract. The "tenant pays half a month" figure is gone; only rental sites support it. The source is the 內政部 不動產仲介經紀業報酬計收標準 as quoted by 監察院. The 內政部 page would not open. Sources:
   - https://cybsbox.cy.gov.tw/CYBSBoxSSL/edoc/download/2352
   - https://cybsbox.cy.gov.tw/CYBSBoxSSL/edoc/additional/download/4353
4. **警示帳戶, Module 10:** fixed. It said 「名下所有銀行帳戶都會被凍結」.
   - It now says the 警示帳戶 has all transactions suspended.
   - The student's other accounts become 衍生管制帳戶: no ATM card, no online transfers, and the bank may refuse counter withdrawals without proof.
   - The claim that it affects 「大學申請的部分審查項目」 is removed; no official source supports it.

   Source: https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0380199 (§3, §5).
5. **學費, Module 14:** fixed. It said private tuition is 「公立的一倍以上」, with a 29,000 vs 58,000 scenario.
   - 教育部 112 figures: public about NT$62,000 a year, private about NT$110,000. That is about 1.77 times.
   - It now notes the NT$17,500 per semester reduction for private 學士班 since 113/2.

   Sources:
   - https://depart.moe.edu.tw/ed2200/News_Content.aspx?n=90774906111B0527&s=C4CCF0636B61F83D
   - https://depart.moe.edu.tw/ED2200/News_Content.aspx?n=90774906111B0527&sms=F0EAFEB716DE7FFA&s=2EDE4F31E2D60B04
   - https://www.ey.gov.tw/Page/5A8A0CB5B41DA11E/39863a8a-a8a6-4e3d-bd1c-b6c587cb3f9e
6. **登記, Module 38:** fixed. It blurred 商業登記 and 稅籍登記. It now says:
   - 攤販 and businesses under the 營業稅 起徵點 may skip 商業登記 (商業登記法 §5).
   - Fixed stalls must still register for tax with the 國稅局.

   Sources:
   - https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=J0080004&flno=5
   - https://law-out.mof.gov.tw/LawContent.aspx?id=FL006091
   - https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0340080&flno=28
7. **扣繳憑單, Module 21:** fixed. It said 「打工滿一定金額，雇主會開立扣繳憑單」. It now says the employer issues a 扣繳憑單, or a 免扣繳憑單 when no tax was withheld, at any amount, by 2/10. Sources:
   - https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0340003&flno=92
   - https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=G0340003&flno=89
8. **學生團保, Module 33:** **unverified, left as is.** No official page names the office that handles it. The 團體保險效力理賠補助及管理辦法 §7 says only that the school helps with claims. Sources read:
   - https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=H0060083
   - https://www.edu.tw/News_Content.aspx?n=9E7AC85F1954DDA8&s=3B134E8BD7920F8A

Old em dashes in Modules 10, 14 and 21 were also removed.

**Partner names.** The repo's content check stores the denied names only as hashes. I ran that matcher, with word boundaries for the short acronym, over every file changed since 326df7a, this report, and every commit message on the branch. 0 hits. The screenshots folder is in `.gitignore` and not committed.

**Final checks before the push:** `npm run check` passes (run before this commit). `npm run check:screens` and the push are still to do.

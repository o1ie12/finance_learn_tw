# STOP 4: the rest of E16, P2, the small cards, F3.5 to F3.8

Branch `feat/design-e`, pushed as its own branch for a Vercel preview. `main` is untouched.

## Where to look (preview, signed in)

| Screen | Path |
|---|---|
| Life-game turn | `/turn` |
| Tabs | `/status`, `/map`, `/moves` |
| Settings and creator | `/settings`, `/creator` |
| Line page | `/line/xinyong` (any slug) |
| Ride | play a month after any station on `/line/<slug>/station/<n>`, then 完成 |
| New tasks | `/line/touzi/bonus/touzi.risk.v1`, `/line/touzi/bonus/touzi.pitch.v1`, `/line/xinyong/bonus/xinyong.borrow.v1` |
| Worlds | `/dev/character?scene=<slug>` (dev only, 404 in production) |

## Done

### E16 step 5: turn, tabs, creator, line page

- **Life-game turn (E8.6), `/turn`.** Same engine, API and steps as `/play`; both now share one hook (`useTurn`).
  - **Frame:** a flat bar 「第 N 個月」, a 7-step rail, and a money strip with only 現金 and 緊急預備金. Below that, a 160px world band showing the line the turn came from, with the character; the band hides under 740px of height. Then one step card, with its buttons pinned.
  - **Character mood** follows the game:
    - happy when insurance paid;
    - stressed after a cost of a month's living or more;
    - worried when cash is under one month's bills;
    - otherwise it follows the stress level.
  - **生活風格:** option rows with a live 「這個月想要的花費」.
  - **Verbs follow E7.16:** 收下, 存起來, 繳費, 決定, 確定, 繼續, 完成. The old labels 對答案, 看這個月的帳, 下個月 and 搭車到下一站 are gone.
  - **Motion:** event cards turn over as they resolve. Cash counts to its new value and shows ▲/▼ with a signed amount for 600ms.
  - **Routes:** stations and 今天 now lead to `/turn`.
- **狀態 (E8.7).**
  - Four stat cards: 現金, 存款, 投資, 負債.
  - 緊急預備金 as a 6-segment bar; a sheet explains how it is counted.
  - 自由度.
  - Rows to 工具箱, 證書 and 設定.
- **路線.**
  - The 12 lines leave one 起點 bar, with a 20px dot per station: done filled with a check, the rest open.
  - One ring marks the place to continue.
  - + / − zoom, and drag to pan.
  - Line chips focus one line; a station sheet offers 上車.
  - A 44px row list is the accessible version.
- **行動.** The move cards in a snapping row, with dots and ‹ ›. Locked moves sit in a sheet with their unlock rule. The cards and the turn's step share one text file.
- **設定.** The older menu's rows as a list. The game reset is not built; see Skipped.
- **Creator (E8.8), `/creator`.**
  - On the platform, with 臉 / 髮型 / 衣服 / 顏色.
  - 64px options drawn with the part; the selected one gets a 2px ink ring and a check.
  - A name field (2 to 8 characters) and 出發.
  - Same avatar schema and API as before.
- **Line page (E8.9, F3.5, F3.6), `/line/[slug]`.** It moved to the new shell. Same data and behavior as before: progress, terminal, tests, optional stations, 加碼任務, 支線.
  - **Overview:** the line's sign, a one-sentence promise, 免費 · 自學 · minutes · difficulty, and the four achievement cards.
  - **Station list:** each station with 你會學到, 你要做的 and minutes.
  - **Layout:** 總覽 / 站點 on a phone; side by side on Regular.

### E11 train ride

- **Sequence:** the platform doors open, the character walks in from behind, the doors close, and the car leaves with a stripe in the destination line's color. The arrival card shows 下一站 and the destination's sign, for example 「CREDIT LINE · CR02」.
- **Timing:** same module as before (setTimeout only). 跳過 works from the start; rides are short after three; reduced motion gives a 120ms crossfade.
- **Destination codes** now use the line letters.

### E9.4 worlds

- **Eleven new worlds** from the E9.4 table. The spec says 10, but 12 lines minus the bank is 11.
- **Budget:** 13 to 28 elements and about 3KB each, one sign at most. Props stay outside the character zone; the stage light is drawn last.
- **Review gate:** `scripts/review-scenes.mjs` renders every world with all 8 outfit colors and measures the character's edge against the scene. Every world is ≥ 3:1 in light and dark.

### E12 motion

- Sheets leave in 200ms (a 120ms fade under reduced motion) on 關閉, Esc or the backdrop.
- Everything else in the E12 table was already in place: press, screen enter, rail, sheet enter, mood crossfade, idle and blink off under reduced motion.

### F3

- **F3.5 achievements.**
  - **證書.**
  - **學習紀錄用語:** built only from tasks the student actually did, and always ending 「線上自主學習，非實習或工作經驗」. It does **not** say it counts for 學習歷程; see D3.
  - **面試小提示:** 3 per line.
  - **學到的技能:** 4 to 6 per line.
- **F3.6 program page:** the line page above. Copy for all 12 lines is in `content/linePages.ts`; it says what students do, never a job outcome.
- **F3.7 video slot:** `intro?: { videoUrl, captionsUrl, name, role, org }`. It is empty, so nothing shows (D2).
- **F3.8 rule:** the content check now requires every authored task to have a decision step. It warns when a task has no document to read; the list is below.
- **Certificate:** now says 「這是學習練習，不是真實的工作經驗。」

### 06 P2 and small cards (verified items only)

**P2 tasks.** Figures come from the engine; illustrative amounts are labelled 示意.

| Task | Where | Numbers |
|---|---|---|
| 誰能冒多少險 (P2 #6) | 投資線, 加碼任務 | NT$10,000 example (示意). No returns promised. Seven instruments sorted by how they move (see the spec note below). |
| 好得不像真的 (P2 #7) | 投資線, 加碼任務 | A 保證 8%, 保本, 隨時領回 chat pitch, compared with the 定存 rate of 1.7% (臺灣銀行). Ends with 165. |
| 借錢之前 (P2 #8) | 信用線, 加碼任務 | Loan of NT$100,000 over 36 periods, with a 開辦費 of NT$6,000 taken from the payout. The engine gives the amount received as **NT$94,000**. Rate: 1.99% for 3 months, then 8% to 15% (示意). |
| 情緒消費 (P2 #9) | Life-game event 「很累的一天」 | A NT$2,800 jacket (示意). Appears only when stress ≥ 40 (6% a turn). 馬上買 pays it; 先問自己三個問題 and 關掉 App cost nothing. Autopilot takes the questions. |

**Small cards**, each tied to its VERIFIED.md item:

| Card | Where | VERIFIED | Content |
|---|---|---|---|
| 存款保險 | 存錢線 讓目標變具體, plus a question | 1 | **NT$3,000,000** per depositor per insured bank, interest included, NT$ and foreign currency combined. Funds, stocks and insurance are not deposits. |
| 免費查自己的信用報告 | 你是銀行 | 2 | One free copy online and one on paper each year, counted separately. Then **NT$80** online or **NT$100** on paper. Online from age **18**. |
| 一般保證人和連帶保證人 | 朋友要跟你借錢 | 4 | The comparison, plus 銀行法 §12-1. |
| 保單上的三個角色 | 人身四大風險 | 7 | 要保人, 被保險人, 受益人. |
| 一種分法（示意） | 你的第一個月 | none (example only) | 20 / 50 / 30 as an example split. |

**Inflation card** on 準備好了嗎: computed as amount ÷ (1 + i)^n. NT$100 after 15 years is worth **NT$64.2** at 3% and **NT$55.5** at 4%. The deck's 54 was wrong.

**New engine refs:** `fact` (verified constants: the deposit insurance cap and the credit report fees) and `realValue`.

### Bug found and fixed (it affected STOP 2 and 3 too)

Line chips had a grey ground instead of the line's tint. In dark mode, their text kept the light-mode ink on a dark ground and failed contrast.

- **Cause:** `--line-soft` and `--line-ink` were resolved on `:root`.
- **Fix:** both are now re-derived on every element that sets `--line`.
- **Why it was missed:** the contrast script checks the intended mixes, so it passed; the page did not apply them.

## E18 and checks

| Check | Result |
|---|---|
| E18 browser check (`scripts/check-design.mjs`) on 14 screens: 今天, 信用站, 複利站, 讓目標變具體, two 加碼任務, `/turn`, 狀態, 路線, 行動, 設定, the creator and two line pages | 252 checks. Pass at 390×844, 375×667, 360×740 and 1440×900, light and dark, covering: no scroll, 200% text, targets ≥ 44 and ≥ 8px apart, the 12px floor, focus rings, reduced motion and layout shift. The 14 failures are the accepted font-request miss, one per page. |
| Turn walker (`tests/e2e/turn-e.mjs`) | 3 months by keyboard at 390×844 and 375×667, light and dark: 45 and 46 screens, 0 failures. |
| Ride walker | Light, dark and reduced motion: each phase on time, and it lands on the next station. |
| Tabs walker | 46 checks: every sheet opens and closes by 關閉 and by Esc, and focus returns. |
| 信用站 | 48 screens. |
| Retry walk | 12 of 12 checks. |
| Older screens | 24 screens, 0 scroll. |
| P1 tasks | 5 tasks, 116 screens. |
| P2 tasks and the deposit question | 4 tasks, 100 screens. All 0 failures and 0 page errors. |
| Scene review gate | 26 of 26 at ≥ 3:1. |
| `npm run check` | 163 tests, contract ALL PASS, content 0 errors (82 warnings), contrast 0 misses. The static design check now covers every new screen and the scene budgets: 0 problems. |
| `next build` and partner-name scan | Build passes; name scan 0 hits. |

## Skipped, and why

- **Steppers (− / amount / +) on the move cards (E8.6).** The typed amount fields stay. Amounts run from NT$0 to all the student's cash, so a fixed step would take many taps. Say if you want steppers anyway.
- **Swipe on lesson cards, and pinch on the map.** The buttons, the arrow keys, + / − and drag all work. Swipe and pinch are not built.
- **Draft autosave (E6.2).** Not built.
- **Game reset, the one alert (E7.14).** The Alert component exists, but there is no reset API. Deleting a student's save needs your decision first.
- **Monthly ▲/▼ on 狀態's cards.** Only on 現金, which has last month's start and end in the ledger. The save keeps no per-account history.
- **還卡債 snowball/avalanche in the life game (P1 #4).** The game has one debt that charges interest (the card). Installments are 0%, so choosing an order would teach nothing yet.
- **Credit staircase art.** It needs a verified list of what credit unlocks.
- **Retirement calculator and TISA deep stations.** TISA is only partly verified (VERIFY 8). The retirement exercise must start from the student's own income (06 section 3 item 8), which needs a design.
- **F3.4: ungraded stations and an end-of-line check.** That is D1; the A6 rule stays.
- **F3.9: report a mistake.** There is still no address to send reports to.
- **verifiedOn on older tasks.**
- **E17 performance (Lighthouse, JS delta).** Not measured on this run.
- **我 in the older pages** (dashboard, passport and others). Not swept; those pages are next to be replaced. The new screens have none, and 我的工具 is now 工具箱 everywhere.
- **F3.8: tasks with no document to read** (warnings for review):
  - 保險線: 風險四格, 人身四大風險
  - 存錢線: 讓目標變具體, 誰比較會存
  - 消費線: 需要還是想要
  - 投資線: 看懂 ETF 代號
  - 信用線: 保護你的卡
  - 職涯線: 你的興趣地圖

## What in the spec was wrong or needed a call

- **E16:** "the other 10" scenes are 11.
- **E9.1.4 in dark mode.** Dark mode dims scenes to 50%, which puts the dark outline under 3:1 on some day scenes. The character's light rim now comes on in dark mode everywhere, not only on the platform.
- **E8.6 world band.** "object-position: bottom" would show bare floor. The band shows the strip from the platform edge up.
  - The character is 108 wide, not 120. Our 240:350 character at 120 wide is taller than the 160px band.
- **F3.5 disclaimer.** 「不是真實銀行的經驗」 fits only 信用線, so every line uses 「不是真實的工作經驗」.
- **P2 #6 boxes.** The spec asks for 低 / 中 / 高. Calling a broad stock-market ETF "medium risk" is open to argue, so the boxes describe the behavior instead:
  - 本金不會跌
  - 會漲跌，但分散
  - 波動很大，或可能虧超過本金
- **E7.16 「下一張」.** It is a retired word, but the card row needs back/next labels. They are now 「前面的卡」 and 「後面的卡」.
- **Deposit insurance at a second bank.** VERIFIED notes no page states outright that it is covered separately, so no copy says it.

## Questions for you

- **`/line/[slug]` for logged-out visitors.** It is now the Part E page for everyone, including visitors from `/lines`; they see a 建立帳號 button. Keep it, or show logged-out visitors the older page?
- **Report-a-mistake address.** Who should receive the reports?

## Not decided here (TODO-VERIFY)

- **D1:** ungraded stations.
- **D2:** practitioner intro videos; the slot is built and empty.
- **D3:** 學習歷程 wording; the snippet makes no claim.
- **TISA:** partly verified.

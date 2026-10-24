# 02. The Life Game

The backbone of the course. One character, one life, one month per turn. Every line unlocks a move. The goal bar is passive income divided by salary.

All logic lives in `lib/lifeGame/` as pure TypeScript. The server runs the engine. The client only sends choices; it never sends balances, scores or totals (class-mode score injection shipped once; do not repeat it).

---

## 1. Teaching goals (every rule below serves one of these)

1. Save first: income − saving = spending.
2. An emergency fund turns a bad month into an annoying month.
3. Card debt grows on its own; minimum payments keep it alive.
4. Investing is the tip of the iceberg: it only works on top of a budget, savings and no high-interest debt.
5. Real markets fall. Selling in a panic locks in the loss.
6. Insurance is for big, rare losses, not for everything.
7. Financial freedom takes many years. Anything that promises it fast is a scam or a gamble.

---

## 2. State

```ts
// lib/lifeGame/types.ts (zod schema mirrors this; STATE_VERSION = 1)
type LifeState = {
  version: 1;
  seed: number;            // uint32
  turn: number;            // months since start, 0-based
  startCalendarMonth: 7;   // the game starts in July (first job after graduation); calendar month = ((7 - 1 + turn) % 12) + 1
  ageMonths: number;       // starts at 22*12
  job: { id: string; title: string; grossMonthly: number; source: 'careerLine' | 'starter' };
  housing: 'family' | 'shared' | 'studio';
  accounts: {
    cash: number;          // wallet + checking, no interest
    demand: number;        // 活存
    timeDeposits: { amount: number; startTurn: number; termMonths: 12 }[]; // 定存
    housingFund: number;   // earmarked, same rate as 定存 (示意)
  };
  holdings: { etfBroad: Holding; etfDividend: Holding }; // units + costBasis
  debts: {
    card: CardState;       // reuse lib/sims credit interest model
    installments: { label: string; monthly: number; turnsLeft: number }[]; // e.g. new_phone
    guarantee: { amount: number; triggerTurn: number; willTrigger: boolean } | null; // rolled at signing, hidden from the student
    guaranteeOwed: number; // set when a guarantee triggers; paid down like a bill (NT$5,000 a month minimum, 示意)
    overdueBills: number;
  };
  receivables: { from: string; amount: number; dueTurn: number; willRepay: boolean }[]; // money the student lent
  insurance: { medical: boolean; accident: boolean; life: boolean };
  plan: { saveFirst: number; etfMonthly: number; givingMonthly: number }; // standing plan
  skills: { id: string; doneTurn: number | null; monthsLeft: number }[];
  sideBusiness: { active: boolean; startedTurn: number } | null;
  unlocked: MoveId[];      // derived from completions on load, cached here
  history: TurnRecord[];   // last 36 turns kept in full; older turns summarized yearly
  stats: { stress: number; efMonths: number; freedomPct: number; netWorth: number };
  flags: { seenFullRides: number; lastLedgerTurn: number };
};
```

Save table (migration 21, additive):

```sql
create table public.life_game_saves (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_team_id text null,
  state jsonb not null,
  state_version int not null default 1,
  seed bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- one solo save per student
create unique index life_game_saves_solo on public.life_game_saves (student_id) where class_team_id is null;
-- one save per class team
create unique index life_game_saves_team on public.life_game_saves (class_team_id) where class_team_id is not null;
```

A team save's `student_id` is the team member who started it (the captain). Any joined member of that team may advance it (section 8). Follow the existing access pattern (server-side API routes only). Down migration drops the table.

**Money rounding:** all money is whole NT$ (integers). Round each computed amount (interest, fee, tax, dividend, payroll line) to the nearest dollar at the moment it is posted, half up. Never store fractions.

**Determinism:** all randomness comes from a seeded PRNG (mulberry32 or similar) keyed by `seed` and `turn`, so replaying a turn gives the same result and class teams with the same seed see the same events.

---

## 3. Numbers

Every value here goes in `lib/lifeGame/constants.ts` with a source comment. `示意` values are labelled on screen with a small "示意" tag. Reuse existing constant objects where they exist (tax and payroll year object, deposit rates, credit rules, student loan rate); do not duplicate them.

### 3.1 Jobs

- If 職涯線 is done: use the job and salary path the student chose, from the existing 職涯線 data (code wins).
- If not: assign one of 4 starter jobs at random using `seed`. Pick 4 entries from the existing 職涯線 job data with different interest buckets and salaries (one near minimum wage, one around NT$32,000, two between). Show "這是系統隨機分配的工作。完成職涯線可以自己選。"
- Raises: every 12 turns, a raise check (section 6).

### 3.2 Payslip (every turn)

Reuse the existing year-constants object for 勞保 and 健保 (115年度 / 2026 values already verified: 勞保 rate 12.5%, employee share 20%, insured salary cap NT$45,800; 健保 rate 5.17%, employee share 30%).

- 勞保 insured salary = gross, rounded up to the next 勞保 bracket if brackets are already modeled; else gross, capped at NT$45,800 (the 勞保 cap only). Floor: the 2026 minimum monthly wage (`VERIFY`: NT$29,500, source 勞動部).
- 健保 insured amount: use the 健保 bracket table if the repo has it; it has its own, much higher cap, so never apply the 勞保 cap to 健保. If the repo has no 健保 table, use gross (no cap within this game's salary range) and add the table to the `VERIFY` list.
- 勞保自付 = 勞保 insured × 12.5% × 20%
- 健保自付 = 健保 insured × 5.17% × 30% (no dependents)
- 勞退自提: 0% by default. Student may set 0 to 6% (`VERIFY`: 勞工退休金條例 voluntary contribution up to 6%, tax-deductible). It goes to a locked 勞退 account shown on the dashboard but not spendable. It is not passive income in this game.
- Net = gross − 勞保 − 健保 − 自提. Income tax is ignored monthly (報稅線 handles it yearly; section 6 annual event).

### 3.3 Bill sheet (every turn)

| Item | Amount | Source |
|---|---|---|
| 房租 (family) | NT$0, plus 孝親費 NT$3,000 | 示意 |
| 房租 (shared room) | NT$8,000 | 示意 (`VERIFY` if a 內政部 rental median for 雙北 single rooms is easy to find; else keep 示意) |
| 房租 (studio) | NT$14,000 | 示意 |
| 水電瓦斯 (renting only) | NT$900 | 示意 |
| 餐費 | NT$9,000 (NT$300 a day) | 示意 |
| 交通 | NT$1,200 | `VERIFY`: TPASS 基北北桃 monthly pass price |
| 手機 | NT$499 | 示意 |
| 日用品 | NT$1,500 | 示意 |
| 保費 | sum of active policies | section 3.5 |
| 學貸還款 | from the student loan engine, if 學貸線 is done and the loan is in repayment | existing (0.775%) |
| 卡費 | per the card model | existing |

Starter housing is `family`. Moving out unlocks with 租屋線 and is a choice event (section 6).

### 3.4 Moves (what the student does with leftover money)

| Move | Unlocked by | Rule | Passive income? |
|---|---|---|---|
| 存活存 | start | 臺灣銀行 活期儲蓄 0.825% a year, interest monthly on the end balance. Existing constant | Yes |
| 存定存 | 存錢線 | 1-year term at the existing 1.70% constant. Breaking early pays the 活存 rate for the months held (示意 simplification; the real rule is 80% of the matching shorter-term rate, `VERIFY` and show it in the lesson, not the game) | Yes |
| 房屋基金 | 租屋線 | Same rate as 定存. Earmarked for 財務決策線's finale | Yes |
| 市值型 ETF | 投資線 (the readiness warning shows, but the student may still buy) | Price path from real 0050 monthly closes (split-adjusted, `historical_prices`). Dividends: trailing yield constant (`VERIFY` 0050 recent cash dividend yield; until verified use 2.5% 示意), paid quarterly | Dividends only |
| 高股息 ETF | 投資線 | Same, using 0056 closes; dividend yield `VERIFY` (until verified 6% 示意). Teaches: higher payout, not higher total return | Dividends only |
| 定期定額 | 投資線 | Standing monthly ETF buy, minimum NT$1,000 (`VERIFY` typical broker minimum; else 示意) | |
| 賣出 ETF | 投資線 | Sell any units at this month's price | |
| 還卡債 | 信用線 | Pay more than the minimum | |
| 保險 | 保險線 | section 3.5 | |
| 學技能 | 職涯線 | NT$2,000 a month for 6 months (示意). When done, the next raise check succeeds more often (section 6) | No |
| 助人 | start | Give any amount. No money comes back. Adds to the 助人紀錄 shown on the profile and lowers stress by 3 that month (giving feels good; keep it small) | No |
| 副業 | 創業線 | One-time NT$20,000 setup. Monthly profit drawn from a normal-ish distribution, mean NT$3,000, spread NT$4,000, can be negative (示意). Counts as income, not passive | No |
| 搬出去住 | 租屋線 | Choice of shared room or studio from next turn | |

**ETF math:** units = (amount − fee) / price. Buy fee 0.1425% of amount, minimum NT$20 (`VERIFY` minimum). Sell: fee 0.1425% plus ETF transaction tax 0.1%. Reuse the existing fee and tax constants from 投資線; do not redefine them.

**ETF price path:** at game start, pick a random start month in the historical series using `seed`. Each turn advances one real month. When the series ends, wrap to its start (log it in state). Real data means real drops. Never smooth it. Note: on monthly closes, April 2025 was a small fall (the big drop was within the month), so do not build anything on "April 2025"; use whatever the data says.

**Readiness check before the first ETF buy** (from the iceberg and the roots lesson): if the card has a revolving balance, or the emergency fund is under 1 month, the game shows a warning card: "先管好錢，再讓錢長大" with the reason, and asks "還是要買嗎？". The student may continue. The choice is recorded and named in the next bias reveal.

### 3.5 Insurance (unlocked by 保險線)

All premiums 示意 for a healthy 22-year-old. Label them.

| Policy | Monthly premium | Covers |
|---|---|---|
| 醫療險 (實支實付) | NT$600 | 90% of hospital event costs, up to NT$100,000 per event |
| 意外險 | NT$120 | 100% of accident medical costs, up to NT$50,000 per event |
| 壽險 | NT$900 | Nothing in this game for a single person with no dependents. When bought, the game says "目前沒有人靠你的收入生活，壽險可以晚點再考慮。" |

Small, common costs (phone screen, dental) are never covered. That is the risk-matrix lesson.

### 3.6 Credit card (unlocked by 信用線)

- Card limit NT$30,000 (示意).
- Some events offer "刷卡" as a payment option.
- Statement logic, 入帳日 interest, 15% annual cap, minimum payment and late fees: reuse the existing 信用線 engine exactly. The game feeds it the month's card charges and the student's payment.
- Paying in full: no interest. Paying the minimum: interest from each charge's 入帳日 on the unpaid part. Missing: late fee per the existing schedule and `creditRecord` worsens.
- `creditRecord` in the game is separate from the profile's value set by 信用線, but starts from it.

---

## 4. The turn loop

Each turn runs these steps in order. The UI shows them as the 6-step strip in `01` section 6.4.

1. **發薪日:** add net pay to `cash`. Add side-business profit if active.
2. **先存錢:** move `plan.saveFirst` from cash to 活存 (the student can change it here). Show: 收入 − 存錢 = 可以花的錢. Saving comes before bills on purpose; that is the lesson.
3. **帳單:** pay the bill sheet from what is left. If cash is short, the game asks how to cover it, in this order of options: take back some of this month's saving, 活存, break a 定存, card (if unlocked), sell ETF (if held). If none can cover it, the shortfall becomes a 欠款 (overdue bill) that adds stress and must be paid next turn. If the student had to take saving back, the turn summary says so plainly: 「這個月存太多了，帳單不夠付。」
4. **行動:** the student uses leftover cash on unlocked moves. Standing plan items (定期定額, giving) run automatically and are shown.
5. **人生事件:** draw events (section 6). Apply costs after insurance. If an event is a choice, the student picks.
6. **月底:** interest, dividends (quarterly), card statement, skill progress, age +1 month, recompute stats (section 5). Every 3rd turn, the ledger check (section 4.1). Append to history.

Fast-forward (after 投資線): run 12 turns with the standing plan. Choice events default to the safest option and are listed in a summary. Stop early if stress reaches 高 or a 欠款 appears.

### 4.1 Ledger check (記帳)

Every 3rd turn, the student fills in: 月初現金, 收入, 存錢, 帳單, 行動, 事件, 月底現金. The engine already knows the answers. Each wrong cell gets a hint ("收入是實發金額，不是應發"). Two tries, then the answer shows. Score feeds the line's task score only if the turn ran inside a station; otherwise it is practice. Never block progress on it.

---

## 5. Stats

**Monthly essentials** = bill sheet total (section 3.3) excluding 卡費 and 保費.

**Emergency fund (months)** = (活存 + 定存 + cash above NT$5,000) ÷ monthly essentials, one decimal. The dashboard shows "N / 3 個月" with the target 3. The lesson says the common guideline is 3 to 12 months of essential spending; label it as a guideline, not a law.

**Stress (0 to 100):**

```
stress = 20
  + (efMonths < 1 ? 25 : efMonths < 3 ? 10 : 0)
  + (card revolving balance > 0 ? 20 : 0)
  + (monthly debt payments / net pay > 0.30 ? 15 : 0)
  + (overdue bill this turn ? 20 : 0)
  + (an event this turn cost more than 50% of net pay after insurance ? 10 : 0)
  - (insurance covered an event this turn ? 5 : 0)
  - (gave money this turn ? 3 : 0)
clamped to 0..100
```

Levels: 0 to 34 低 (calm), 35 to 64 中 (a little tense), 65 to 100 高 (very stressed). The mood bubble shows the biggest single reason.

**Net worth** = cash + 活存 + 定存 + 房屋基金 + ETF market value + receivables that will be repaid (count only those not yet due; a receivable that fails is written off on its due turn) − card balance − remaining installments − guaranteeOwed − overdue bills. (勞退 shown separately.) Monthly debt payments in the stress rule = card minimum + installment payments + guarantee payment.

**Freedom %** = passive monthly income ÷ gross monthly salary × 100, one decimal. Passive income = this month's interest + trailing-12-month ETF dividends ÷ 12. Side business is not passive.

---

## 6. Events deck

Draw each turn: roll every random event's monthly chance with the seeded PRNG; keep at most 2 random events per turn (highest priority first; priority = list order). Scheduled events do not count toward that limit:

- December: 年終獎金 with a 70% chance (rolled).
- Every 12th turn (turn 12, 24, ...): the raise check.
- Every May, once at least 12 turns have passed: the tax notice.
- `market_drop`: triggered by the data, not rolled; does not count toward the limit.
- Due dates: friend repayments, installments and guarantee triggers happen on their turn and do not count.

All costs 示意 unless noted. Each event has an id, title, text, cost, protection, and for choice events the options and what each teaches.

| id | Title | Chance / month | Effect | Protection or choice | Teaches |
|---|---|---|---|---|---|
| `phone_break` | 手機螢幕摔破 | 4% | −NT$6,000 | Emergency fund only. Not insurable here | Small and common: pay it yourself |
| `dental` | 牙齒要根管治療 | 3% | −NT$6,000 (after 健保) | None | Same |
| `scooter_service` | 機車保養 | 5% | −NT$2,500 | None | Regular costs belong in the budget |
| `accident` | 騎車小擦撞受傷 | 2% | −NT$12,000 medical | 意外險 pays 100% | Insurance for the unexpected |
| `hospital` | 急性腸胃炎住院三天 | 1% | −NT$30,000 | 醫療險 pays 90% | Big, rare: transfer the risk |
| `birthday` | 朋友生日聚餐 | 8% | Choice: 去 (−NT$1,500) / 不去 (stress +2 this turn) | Choice | Social spending is real; plan for it |
| `concert` | 喜歡的歌手來開演唱會 | 4% | Choice: 買票 (−NT$4,800, card allowed) / 不買 | Choice | Wants vs goals |
| `japan_trip` | 同學都要去日本玩五天 | 2% | Choice: 跟 (−NT$25,000) / 不跟 / 跟但改三天 (−NT$15,000) | Choice | 同學都去，我要不要跟？ |
| `new_phone` | 新手機上市 | 3% | Choice: 現金買 (−NT$32,000) / 分期 12 期 (an installment: NT$2,667 for 11 turns and NT$2,663 on the 12th, total NT$32,000, shown as 零利率 if the card is used, `VERIFY` wording for 零利率分期 fees) / 等等再說 | Choice | Installments are still spending |
| `scam_msg` | 陌生訊息：「你的包裹地址有誤」 | 3% | Choice: 點連結 (−NT$10,000 and stress +10) / 不理 / 打 165 查證 | Choice. If 詐騙線 is done, the safe options are highlighted | 不信、不理、不轉帳 |
| `friend_loan` | 朋友想跟你借 NT$5,000 | 3% | Choice: 借 / 不借 / 借一半. Lending creates a `receivable` due in 3 turns; `willRepay` is rolled at lending from the clues (`04` section 14). On the due turn it is paid back or written off | Choice. Uses the borrowing check: 真的需要嗎？他還得起嗎？ | 拒絕的勇氣 |
| `guarantor` | 學長請你當他貸款的保證人 | 1% (after 信用線) | Choice: 答應 / 拒絕. If yes: a `guarantee` is stored with a 25% `willTrigger` roll and a trigger turn 6 to 18 turns ahead. If it triggers, `guaranteeOwed` becomes NT$50,000 | Choice | 保證人等於替別人背債 |
| `family_help` | 家人臨時需要幫忙 | 2% | Choice: 給 NT$5,000 / 給 NT$2,000 / 不給 (stress +5) | Choice | Giving is part of the cycle |
| `rent_up` | 房東要漲房租 | 2% (renting) | +NT$1,000 rent from next turn. Choice: 接受 / 搬家 (−NT$6,000 moving, rent back to base) | Choice | Housing is the biggest bill |
| `invoice` | 中了統一發票 | 5% | +NT$200 | | Small wins are small |
| `course_sale` | 想學的線上課程特價 | 3% (after 職涯線) | Choice: 買 (−NT$1,990, starts a 3-turn skill) / 不買 | Choice | Investing in yourself |
| `layoff` | 公司縮編，你被資遣了 | 0.5% | Salary 0 for 3 turns. 失業給付 60% of insured salary during those turns (`VERIFY` 就業保險法: 60% of average insured salary, up to 6 months) | Emergency fund | Why the fund exists |
| `market_drop` | 新聞：台股單月重挫 | Triggered when this month's ETF return ≤ −8% and the student holds ETF | Choice: 全部賣出 / 繼續持有 / 加碼 NT$X. Next turns show what the real series did | Choice. Never auto-sell | Fear of losses; selling locks the loss |
| `bonus` | 年終獎金 | December, 70% | +1 month gross (示意) | Choice: 存起來 / 投資 / 花掉一半 / 全花 | Windfalls test the plan |
| `raise` | 年度調薪 | Every 12 turns: 50%, or 80% if a skill finished this year | Salary +5% (示意) | | Skills raise income |
| `tax_notice` | 五月報稅 | Every May turn after 12 turns | Refund or bill from the 報稅線 engine for last year's income (reuse it). If 報稅線 not done: a flat 示意 refund of NT$0 and "完成報稅線看懂這張單" | | Taxes are yearly |

Each choice event's text and options are written in full in `04-CONTENT.md` section 14.

---

## 7. Unlocks and today's stop

### 7.1 Unlock table

Unlocks are derived from `line_completions` plus live completion (`lineStatus`), mode-aware, on every load. Never store unlocks as the source of truth.

| Line | Unlocks |
|---|---|
| start | 存活存, 助人, the bill sheet, payslip |
| 職涯線 | Your chosen job, 學技能, `course_sale` event |
| 消費線 | Edit the bill sheet's flexible items (餐費, 日用品, 交通 choice) |
| 存錢線 | 存定存, savings goal tracking |
| 信用線 | Credit card, 還卡債, `guarantor` event |
| 投資線 | 市值型 ETF, 高股息 ETF, 定期定額, 賣出, fast-forward |
| 保險線 | 醫療險, 意外險, 壽險 |
| 詐騙線 | Safe options highlighted on scam events, 165 option explained |
| 租屋線 | 搬出去住, 房屋基金, `rent_up` event |
| 學貸線 | Student loan repayment appears on the bill sheet with the student's choice |
| 報稅線 | Real `tax_notice` |
| 創業線 | 副業 |
| 財務決策線 | The finale decision (buy or keep renting) using the life-game state |

### 7.2 Today's stop

1. If a line is in progress: its next required station (mode-aware order).
2. Else: the first line in the recommended order whose prerequisites are done and which is not complete. Recommended order: 職涯, 消費, 存錢, 信用, 詐騙, 投資, 保險, 租屋, 學貸, 報稅, 創業, 財務決策.
3. Else: "今天玩一個月" (one life-game turn).

Show the station's hook question and its time estimate (station metadata; default 15 minutes).

### 7.3 Streak (Stage K)

Migration 23: `daily_activity (student_id uuid, day date, actions int default 0, primary key (student_id, day))`. Increment on a completed station task or a completed turn. Day in Asia/Taipei. Streak = consecutive days with actions > 0 ending today or yesterday.

---

## 8. Class mode

- A teacher's room can start a "人生賽局" round. Each team gets one save with the room's shared seed, so every team faces the same months and events.
- The leaderboard does **not** rank by net worth alone (that rewards max risk). It shows three columns and ranks by **財務健康分**:

```
health = 40 * min(efMonths / 6, 1)
       + 40 * min(freedomPct / 10, 1)
       + 20 * (1 - stress / 100)
       - (card revolving > 0 ? 15 : 0)
       - (overdue bill ? 15 : 0)
rounded, floor 0
```

- Scores are computed on the server from the saved state. The client never submits a score. Only joined participants can advance their team's save (reuse the existing join-cookie guard).

---

## 9. Tests (all required, each must fail without its rule)

1. **Determinism:** same seed and choices give identical states after 24 turns.
2. **Save-first:** saving is applied before bills in every turn, and the turn summary always satisfies net pay − saved = money available for bills and spending.
3. **No money from nowhere:** after every turn, net worth change equals income − spending + interest + dividends + market change − write-offs, to the dollar (all money is whole NT$).
4. **Card interest:** a scripted minimum-payment run matches the existing 信用線 hand-checked numbers.
5. **Insurance:** `hospital` with 醫療險 costs 10%; without costs 100%; `phone_break` is never covered.
6. **Readiness warning:** first ETF buy with card debt shows the warning; with no debt and ≥ 1 month fund it does not.
7. **Real prices:** the ETF path for a fixed seed equals the split-adjusted closes in `historical_prices`, month by month. The single biggest monthly fall in the series appears for a seed that covers it, and `market_drop` fires on any month at or below −8% (if the series has none, lower the trigger to the 5th-percentile monthly return and report the value).
8. **Realism (Monte Carlo, 500 seeds):**
   - Saving 20% of a NT$32,000 salary, all into 市值型 ETF from turn 12: median freedom % at turn 120 is between 3% and 20%.
   - No strategy reaches 100% freedom in under 180 turns (15 years) at the median.
   - Holding through: at least 30% of seeds see a month with net worth down ≥ 10% from its previous peak.
9. **Server authority:** an API call with a client-supplied balance or score is rejected or ignored.
10. **Stress levels:** scripted states land in the expected level for each rule.
11. **Unlocks:** derived from completions; completing a line after the save exists unlocks its move on next load; sticky completions still unlock.
12. **Old data:** students with no save get a new one; existing sim results and completions are unchanged.
13. **Hidden tab:** the turn UI finishes its step transitions with the tab hidden (timeouts, not rAF).

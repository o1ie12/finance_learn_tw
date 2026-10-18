# Finline redesign: build plan

Branch `redesign/finline-life`. Written at Stage A after a read-only audit of
the repo at `1a49ca9`. The build package (00 to 04 plus two mockups) lives
outside the repo; the mockups are copied to `docs/design/` for reference.

Where this plan and the code disagree, the code is right (package rule 1).
Section 9 lists every conflict found.

---

## 1. What the audit found (facts the plan relies on)

| Area | Fact | Where |
|---|---|---|
| Lines | 12 lines, order = array order, no prerequisites. Colors from `color` / `colorInk`. 消費線 slug is `qixin` | `lib/lines.ts:54` |
| Stations | 42 modules. Each has `tier: core \| deep`, `minutes`, `subtitle`, optional `tip`, `quiz` | `lib/modules.ts` |
| Modes | `sim_first` (default) and `full`. `requiredStations()` = core only in sim_first, all in full. `homeFor()` → `/simulate` or `/dashboard` | `lib/modeModel.ts` |
| Completion | `lineStatus()` = required stations done + a sim run exists; sticky via `line_completions` (migration 20) | `lib/progressModel.ts:43`, `lib/lineCompletion.ts` |
| Station done | any `module_progress` row with `completed_at`. Written by `POST /api/progress` | `app/api/progress/route.ts` |
| Sim done | the line has **any** `simulation_runs` row (latest per line is read) | `lib/db.ts:645,675` |
| Kinds | 25 kinds, append-only `SIM_KINDS`; registration points: types, dispatch, `writeProfileContribution` (never-switch), `outcomeTitleFor`, `lineStub`, certificate `simResult`, contract script `CASES`, tests | `lib/sims/types.ts:43` |
| Profile | zod `StudentProfileSchema` in `students.profile` jsonb; `financialSnapshot()` with `known` flags | `lib/studentProfile.ts` |
| Constants | payroll `TAX_YEAR.payroll`; deposits `DEMAND_SAVINGS`, `TIME_DEPOSIT_1Y`; card `creditCard.ts`; fees `BROKER_FEE_RATE`, `ETF_TAX_RATE`; loan `LOAN_ANNUAL_RATE`, `GRACE_YEARS = 2` | various |
| Prices | `SEED_ROWS` (split-adjusted, the same data as `historical_prices`), pure import, 2012-07 to 2026-08, 170 months per ticker | `lib/historicalPricesSeed.ts` |
| Layout | Root layout renders `SiteHeader`, `<main>`, `SiteFooter` for every page. No route groups | `app/layout.tsx` |
| Dashboard | `/dashboard` and `/simulate` both render `RouteNetworkView` (variant learn / simulate) | `app/dashboard/page.tsx` |
| Tour | 5 steps anchored by `data-tour-id`; auto-starts by `tutorialSeenVersion` | `lib/tour.ts`, `components/tour/*` |
| DB access | supabase-js over PostgREST with service role; dev file store (`USE_DEV_STORE=1`) mirrors every function | `lib/db.ts` |
| Class mode | Rooms run one line's pre/post quiz for anonymous participants. **No teams.** Score is computed in the browser | `app/class/*`, `app/api/class/*` |
| Signup | lands on `/simulate` | `components/SignupForm.tsx` |
| Tests | `node:test` via `tsx --test`, one file, 37 tests; no route rendering tests | `tests/regressions.test.ts` |
| Tooling | Tailwind v4 `@theme` in `globals.css`; zod 4 present transitively (already used); Playwright browsers cached but the package is not installed | |

---

## 2. Cross-cutting decisions

1. **Where results go.** A sim run marks a line's sim as done, so station
   tasks must never write `simulation_runs`. Station and library task results
   go to a new `task_results` table (migration 24) and, when the station
   counts as done (score ≥ pass, or the second attempt), to `module_progress`
   through the same code path as `POST /api/progress`. Only a line's
   **terminal** task set (the simulation page) writes `simulation_runs`, as a
   new kind registered everywhere existing kinds are.
2. **Server scoring.** The client sends answers only. `POST /api/task` and
   the simulation route load the content on the server, score it, and store
   the result. The same rule as the life game.
3. **Task placement per line.** A line's task sets are placed in order:
   first core station → Task A, and so on; the **last** task set is the
   simulation page. Task sets left over after the core stations are filled
   become optional 加碼任務 on the line page (the 詐騙線 案件庫 pattern from
   04 §9). Core stations left over keep their quiz, wrapped in the new flow.
   Lines whose existing simulation is kept (職涯, 租屋, 學貸, 報稅, 創業,
   財務決策) keep it as the terminal, with the new hook, reveal and takeaway
   around it and any "after the existing sim" step appended.
4. **Life game data.** Real 0050 / 0056 monthly closes come from `SEED_ROWS`
   (the source the `historical_prices` table was seeded from), so the engine
   stays pure and testable without a database.
5. **Life game turn as a state machine.** The spec's `LifeState` plus a
   `phase` field (`payday → saveFirst → bills → actions → event → ledger`).
   Each API call submits one action for the current phase; the server applies
   it with the pure engine and saves. Hidden fields (`willTrigger`,
   `willRepay`, `seed`) are stripped before state reaches the browser.
6. **Game shell.** A route group `app/(game)/` with its own layout. The root
   layout keeps `<html>`, fonts and `TourProvider`; header and footer move
   into a `(site)` group layout so the landing and public pages render
   exactly as before.
7. **Dev store parity.** Every new DB function gets a dev-store branch, as
   every existing one has, so the app runs locally without Postgres.
8. **Browser checks.** Playwright is run from the scratchpad
   (`npx playwright@1.x`) against the cached browsers. It is not added to
   `package.json`. E2E specs live in `tests/e2e/` and run with that command;
   `npm run check` stays dependency-free.

---

## 3. Stage B: life game engine (pure)

Create `lib/lifeGame/`:

| File | Holds |
|---|---|
| `types.ts` | zod schema for `LifeState` (version 1), `TurnRecord`, `Action`, `MoveId`, `Phase` |
| `constants.ts` | every number with a source comment; reuses existing constant objects |
| `rng.ts` | mulberry32, `streamFor(seed, turn, label)` |
| `prices.ts` | monthly closes for 0050 / 0056 from `SEED_ROWS`, start index from seed, wrap with continuous returns |
| `payroll.ts` | payslip from `TAX_YEAR.payroll`, 勞退自提, 失業給付 |
| `bills.ts` | the bill sheet, essentials |
| `card.ts` | the game card, built on `creditCard.ts` (`interestOn`, minimum rule, `LATE_FEES`, 沖抵 order exported as `applyPayment`) |
| `events.ts` | the deck, eligibility, priority, choice effects, friend-loan clues |
| `moves.ts` | move catalogue, unlock rules, validation of an allocation |
| `unlocks.ts` | lines → moves, derived from completions on every load |
| `stats.ts` | stress, emergency fund, freedom %, net worth, health score |
| `ledger.ts` | the 記帳 cells and hints |
| `engine.ts` | `newGame()`, `applyAction()`, `fastForward()`, `viewFor()` |
| `index.ts` | public surface |

Changes: `lib/sims/creditCard.ts` exports `minimumPayment()` and
`applyPayment()` that `computeRound` already does inline (no behavior change;
existing tests pin it).

Migration 21: `life_game_saves` exactly as 02 §2, plus a down file.
`lib/db.ts`: `getLifeSave`, `getTeamLifeSave`, `createLifeSave`,
`updateLifeSave` (optimistic on `updated_at`), dev-store branches.

Tests (`tests/lifeGame.test.ts`): all 13 in 02 §9. Test 13 (hidden tab) is a
Playwright spec in Stage C.

## 4. Stage C: `/play` v0

- `app/(game)/play/page.tsx` (server: load or create the save, derive
  unlocks) and `components/play/*` (turn strip, six step cards, pills).
- `app/api/life-game/route.ts` (GET: load or create), `app/api/life-game/action/route.ts`
  (POST `{expect: {turn, phase}, action}`).
- Class mode: migration 25 adds `class_rooms.kind` (`quiz` default,
  `life`), `class_rooms.seed`, `class_participants.team`. A `life` room gives
  each team one save keyed `class_team_id = <room_id>:<team>` with the room
  seed. The leaderboard computes 財務健康分 on the server from saved state.
  The existing quiz rooms are unchanged.

## 5. Stage D: task engine

- `lib/tasks/types.ts` (03 §1 types; `LineSlug` from `lib/lines.ts`),
  `scoring.ts` (6 step types, `accept`, reflection steps), `kinds.ts`
  (registry of task kinds, exhaustive), `reveal.ts` (pick order),
  `compute.ts` (formula-backed answers: payroll, card interest, loan),
  `placement.ts` (rule 2.3).
- `components/tasks/`: `StationFlow`, `HookPanel`, `LessonCards`,
  `TaskRunner`, one component per step type, `ModelAnswer`, `BiasReveal`,
  `TakeawayCard`, `MaterialViewer` (modal with focus trap).
- `components/documents/`: `Payslip`, `CardStatement`, `CreditReport`,
  `ChatThread`, `BillSheet`, `Ledger`, `Policy`, `Snapshot`, `PriceChart`,
  `NewsCard`, plus a wrapper around the existing lease.
- `content/lines/<slug>.ts` × 12, typed, pasted from 04.
- `scripts/check-content.ts` (03 §5.5), wired into `npm run check`.
- `app/api/task/route.ts`, migration 24 `task_results`.

## 6. Stage E: 信用線 pilot

Content `content/lines/xinyong.ts` (Tasks A to D, 18 bank files). Placement:
station 4 → A, station 7 → B, 加碼任務 → C, simulation page → D. New
terminal kind `xinyong_card_safety_v1`; `creditRecord` keeps coming from the
statement payment choice (Task A, step 3), written through the same profile
rules. Old `xinyong_credit_card_v1/v2` rows still read and stamp. Unlocks
card, 還卡債, `guarantor`.

## 7. Stage F: game shell and dashboard

- `app/(site)/layout.tsx` (header + footer) for every existing public page;
  `app/(game)/layout.tsx` (StationScene, no header or footer) for
  `/dashboard`, `/simulate`, `/play`, `/onboarding/*`, `/line/*`,
  `/passport`, `/transfer/*`.
- `app/(game)/game.css`: tokens from 01 §2 to §4.
- `components/game/*`: `StationScene`, `FloatCard`, `StationSign`,
  `StatBar`, `MoneyStat`, `Chip`, `PrimaryButton`, `NamePlate`,
  `MoodBubble`, `MiniMap`, `LineChip`, `GameTopBar`.
- `app/(game)/dashboard/page.tsx` and `simulate/page.tsx` render
  `GameHome` (mode-aware). `homeFor()` unchanged. Tour targets move onto
  the new cards.

## 8. Stages G to L

- **G:** `/onboarding/character`, `/onboarding/goal`; avatar parts in
  `components/avatar/*`; migration 22 `students.avatar jsonb`; goal stored
  in the profile (`goal`, additive field). Test: no avatar input depends on
  money.
- **H:** `components/game/TrainTransition.tsx`; `seenFullRides` counter in
  the profile (per student, not per save).
- **I:** hook, reveal, takeaway per line; `WhyFirst` component; 我的工具
  list on the profile (`savedTools`).
- **J:** the other 11 lines, one commit each.
- **K:** migration 23 `daily_activity`; streak pill; today's stop; certificate
  progress.
- **L:** full verification, Lighthouse, fresh-eyes review, CLAUDE.md update.

---

## 9. Conflicts between the package and the code

| # | Package says | Code says | What this build does |
|---|---|---|---|
| C1 | Class mode: "teams share a seed", "reuse the existing join-cookie guard", `class_team_id` | Rooms have no teams; participants are anonymous names in a quiz room; the quiz score is computed in the browser | Adds a `life` room kind with teams (migration 25, additive). Quiz rooms untouched. **Needs Ryan's OK** (report question 1) |
| C2 | 信用線 has 4 task sets for its core stations | 信用線 has 2 core stations (4, 7) | Placement rule 2.3: C becomes a 加碼任務 |
| C3 | 消費線 / 存錢線 / 投資線 sims become "the line's last task set" | Each has a working sim that writes profile fields (`savingsBehavior`, `savingsAmount`, `investedAmount`) other lines read | New terminal kinds must keep writing those fields, or the kept field gets a default and the change is reported |
| C4 | Broker fee minimum NT$20 (`VERIFY`) | Repo states the exchange stopped applying the NT$20 minimum in 2021 | Kept as a broker practice, labelled 示意 |
| C5 | "Reuse the 健保 bracket table if the repo has it" | No table exists | Uses gross pay; added to VERIFY |
| C6 | 02 §3.1 starter jobs: one near minimum wage, one about NT$32,000, "two between" | Only three paths from different buckets sit between NT$29,500 and NT$32,000 | Picks 平面設計 30,000, 會計 30,000, 照顧服務 32,000, 技術工 35,000 |
| C7 | "`/dashboard` and `/simulate` render the new home"; header/footer removed after login | The header holds the mode toggle, help button and tour target | The game top bar carries a settings menu with the mode toggle, help (tour), access code and sign out |
| C8 | 04 §9: 2025 police statistics framing "already in the repo" | Present in station copy, tested by `tests/regressions.test.ts:357` | Reused as is |

### Departures recorded during the build

| # | Package says | Build does | Why |
|---|---|---|---|
| D1 | 04 §9: first core station gets case 1, and so on | 詐騙線 cases placed by station topic: case 3 → station 9 (假投資), case 4 → 11 (客服), case 6 → 12 (交友); cases 1, 2, 5 are the 案件庫 | Each station's lesson matches its task |
| D2 | 02 §5: net worth counts receivables "that will be repaid" | Every unsettled receivable counts at face value; a default is written off on its due turn | Counting only the good ones would reveal the hidden repayment roll |
| D3 | 02 §5: essentials = bill total minus 卡費 and 保費 | Living costs only (housing, utilities, food, transport, phone, daily, 學貸); debt payments and 課程費 are left out | Debt payments are not "months of living"; this keeps the fund honest |
| D4 | 02 §3.4: dividends quarterly | 0050 pays twice a year (Jan, Jul), 0056 quarterly | sources.md items 5 and 6 |
| D5 | 02 §4.1: the ledger score feeds the station's task score | Ledger scores are recorded on the turn but are practice only | The month after a station runs after the station is scored; feeding it back would change a stored result |
| D6 | 03 §4: a station counts as done on a pass or the second attempt | Same for stations; a terminal task set counts on any submit | Old simulations counted any run; terminals keep that meaning |
| D7 | (none) | Task content, including correct answers, is in the page data before submit | Scoring is on the server; hiding answers needs a second round trip for the model answer. Not a grading system |
| D8 | 01 §6.5: stations run the task | Stations with a task can still be completed through 「看完整課文」 and the original quiz (`?read=1`) | The old 學習 mode stays (00 §6) |
| D9 | 00 §4 Stage J: one line per commit | Lines converted in grouped commits | Content was written in parallel; each line is its own file |
| D10 | 02 §6: 0050 `market_drop` | Fires on the worst return among the funds held | A 0056-only holder would otherwise never see it |
| D11 | 01 §3: Noto Sans TC via next/font | Kept the repo's runtime load (FontLink); Barlow via next/font | The repo moved Noto off next/font for LCP |
| D12 | 03 §1: one hook per station | 04 gives one hook per line; later task sets got a short hook written in the same voice | Each station needs a question |

---

## 10. Migrations (none run against production)

| # | File | What | Safe to apply |
|---|---|---|---|
| 21 | `migration-21-life-game-saves.sql` | `life_game_saves` table + two partial unique indexes | Before deploy (new table, nothing reads it yet) |
| 22 | `migration-22-student-avatar.sql` | `students.avatar jsonb null` | Before deploy |
| 23 | `migration-23-daily-activity.sql` | `daily_activity` table | Before deploy |
| 24 | `migration-24-task-results.sql` | `task_results` table | Before deploy |
| 25 | `migration-25-class-life-rooms.sql` | `class_rooms.kind`, `class_rooms.seed`, `class_participants.team` (all with defaults) | Before deploy |
| 26 | `migration-26-line-completions-rls.sql` | Enables row level security on `line_completions` (migration 20 left it off; every other table has it). The app uses the service role, which bypasses RLS | Any time |

Apply in order 21, 22, 23, 24, 25, 26. Each has a `-down.sql`. Each is tested on a throwaway local cluster
(`supabase/test/run-redesign-migrations.sh`).

---

## 11. Risks

1. **Scale.** Twelve lines of new content plus a game. Lines convert one per
   commit so any one can be reverted.
2. **Moving pages into route groups** changes no URL, but every page file
   moves. Done in one mechanical commit with `git mv` so history follows.
3. **Profile writes from new kinds** (C3) must keep the threaded state
   other lines read. The contract script asserts every terminal kind's
   profile contribution.
4. **Hidden information in the game** (guarantee and friend repayment
   rolls) never leaves the server.
5. **Real prices wrap.** When a game outlives the 170-month series it wraps
   to the start with continuous returns (no fake crash at the seam); the
   wrap is logged in state.

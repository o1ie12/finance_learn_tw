# Ship log: feat/design-e to main

Started 2026-10-24 on `feat/design-e`. Claude Code prepares and verifies; it
does not merge and does not touch production data or production env vars.
Ryan presses merge.

## 1. Preview database safety

- **Ran:** looked for the Vercel CLI (`which vercel`: not installed; no
  `.vercel/` project link in the repo), then opened
  https://vercel.com/olivers-projects-1298c00d/finance-learn/settings/environment-variables
  in the built-in browser.
- **Result: BLOCKED.** The page redirects to the Vercel login. Claude Code does
  not sign in to accounts, so the Preview and Production Supabase values were
  not compared.
- **Until this is resolved:** nothing in this log signs up, logs in or writes on
  the preview. Lighthouse (step 7) runs only on public pages, or locally.

## 2. task-e (five P1 tasks) and short-e

- **Ran** on the local dev store at 390×844, light and dark: keys from
  `tests/e2e/task-key.ts`, then `tests/e2e/task-e.mjs` and
  `tests/e2e/short-e.mjs`.
- **First run:**
  - **task-e:**
    - 預算缺口 (`qixin.budgetgap.v1`): 24 screens, 0 failing.
    - 機車的真實成本 (`qixin.scooter.v1`): 24, 0.
    - 複利與 72 法則 (`cunqian.compound.v1` on /line/cunqian/station/3): 28, 0.
    - 雪球還是雪崩 (`xinyong.payoff.v1`): 20, 0.
    - 機車保險三層 (`baoxian.scooter.v1`): the light pass finished; the dark
      pass timed out waiting for 得分 after question 2.
  - **short-e:** 56 checks, **12 failing**, for two causes:
    - 今天 had text under the 12px floor: the sign's 下一站 NEXT · code and the
      zone English labels. This was a real bug.
    - The walker expected the lesson bar's kicker to start with 「3 分鐘版」.
      It now reads 「<line> · 3 分鐘版」, so the walker was out of date.
- **Fixed:**
  - Every 11px and 10px label in the new screens is now 12px: 今天, the course
    page, the landing, the lesson bar, MetroRide and the sidebar brand.
  - short-e checks that the kicker includes 「3 分鐘版」.
- **Re-run:**
  - short-e: **56 checks, 0 failing**.
  - 機車保險三層: **20 screens, 0 failing, 0 page errors**. The earlier timeout
    did not repeat. It happened while the other four walkers had just run on
    the same dev server.
- **Result: PASS.**

## 3. Class mode walker; Google sign-in

### Class mode: `tests/e2e/class-e.mjs` (new)

- **What it covers.** Class mode has no "student does a station, teacher sees
  it" flow. Students do stations on their own accounts, and teachers have no
  view of that. The walker covers the two flows class mode has, with a
  teacher browser and a student browser:
  1. **即時測驗:**
     - the teacher picks 信用線 and creates a room;
     - the student joins with the code and appears on the teacher's
       leaderboard;
     - the teacher starts; the student answers all ten and sends;
     - the teacher's leaderboard shows the student's score.
  2. **人生賽局:**
     - the teacher creates and starts a room;
     - a signed-in student joins 第1隊 and plays a whole month (發薪日 to
       「第 1 個月結束了」);
     - the teacher's table ranks 第1隊.
- **Ran** on the local dev store.
  - First run: the walker clicked a visually hidden radio. It now clicks the
    label, as a person does.
  - Second run: **9 checks, 0 failing, 0 page errors.**
- **Result: PASS.**
- **Not covered:** a teacher seeing a student's station progress, because
  the app has no such view. If that is wanted, it is a new feature, not part
  of this release.

### Google sign-in and linking: cannot be mocked here

- **Why:**
  - `/api/auth/google/callback` exchanges a real Supabase OAuth code for a
    session.
  - The dev store has no Supabase auth: `isGoogleAuthConfigured()` needs
    `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
  - Faking it would mean standing up a fake Supabase auth server. That is out
    of scope, and it would not prove the real setup works.
- **Result: NEEDS A HUMAN.** Do it on the preview, and only after step 1
  shows the preview does not write to the production database. Use a Google
  account that is not a real student's.
  1. Open the preview's `/signup`, then click 「使用 Google 登入」 and finish
     Google's consent.
     - Expect `/signup/google`, which offers 「已經有代碼了？」 or 「從頭開始」.
     - Choose 從頭開始, fill in 建立你的帳號, and submit. Expect the goal step,
       then 今天.
  2. Sign out by clearing the site's cookies. Click 「使用 Google 登入」 again
     with the same Google account. Expect 今天 directly (the account exists).
  3. Sign up a second test account by code (`/signup`, 建立並上車). Open 設定,
     then 「連結 Google 帳號」, and use a different Google account.
     - Expect `/settings?linked=1` and 「已成功連結 Google 帳號。」.
  4. On that same code account, link again with the Google account from
     step 1.
     - Expect `/settings?linked_error=already_used` and the "already linked"
       message.
  5. Delete both test rows afterwards. That is a database action for a
     person, not for Claude Code.

## 4. The full-ride counter (`/api/rides`, `profile.seenFullRides`)

- **Ran:** `grep -rn "seenFullRides|api/rides|onFullRideComplete|fullRide"` over
  app, components, lib, tests, scripts, content and supabase.
- **What reads it:** only `lib/transitionTiming.ts`, through the old train
  (`Train`, `TrainTransition`). After three full rides, the train plays a short
  crossfade instead. Nothing else reads it: no streak, stat, certificate, badge
  or class-mode logic. `lifeGame` state has its own `flags.seenFullRides`,
  which is set to 0 and never read.
- **What still writes it:**
  - `PlayRide`: the old `/play` screen's ride, reached only from `PlayScreen`
    with a `ride`. `/play` redirects to `/turn`, and class mode
    (`ClassLifePlay`) passes no `ride`.
  - `GoalSetter`.
- **Found and fixed:**
  - The goal step is now the first screen after sign-up, and it still played
    the old train with the student's avatar on it. That broke the "avatar out
    of the main flow" decision.
  - It now rides in the MetroRide car (no gate, no avatar), like the turn.
  - Files: `components/onboarding/GoalSetter.tsx`,
    `app/(game)/onboarding/goal/page.tsx`.
- **Result: PASS.** Nothing now reads a zero by mistake. The counter only made
  the old train shorter, and the main flow no longer shows that train. The
  endpoint and the field stay; older code ignores them.

## 5. Report a mistake

- **Built:**
  - Under every model answer, a plain link 「這題有錯？回報錯誤」, in both
    the new lesson player (`components/flow/StationFlow.tsx`) and the older
    flow (`components/tasks/StationFlow.tsx`).
  - It is a `mailto:` from `lib/reportMistake.ts`. The subject is
    `回報錯誤：<line · station> · <task id> · <step id>`, and the body repeats
    them with a prompt. Nothing about the student goes in it.
- **Address:** not answered yet. `REPORT_ADDRESS` is `null` with a
  `TODO-ADDRESS` note. Until it is set, the link shows in development only, so
  production never shows a mailto to a placeholder. Setting the address is a
  one-line change.
- **Test:** `tests/regressions.test.ts`, 「回報錯誤」. It checks the subject,
  the body and that both answer screens use it.
- **Result: PASS.** It needs the address before production shows the link.

## 6. The life-game reset (06 E7.14, the one alert)

- **Built:**
  - `POST /api/life-game/reset`. The body must be JSON
    `{ "confirm": "reset" }` with an `application/json` content type, so a
    cross-site form cannot trigger it. The student must be signed in.
  - `resetSolo()` (`lib/lifeGame/server.ts`) writes a new game (new seed,
    month 1) over the student's one solo save. It uses the same optimistic
    concurrency as every save. `updateLifeSave` gained an optional `seed`.
  - **What it leaves alone:** class team saves, line completions (so the
    unlocks, which are derived from them), and the streak.
  - It also works on an unreadable save, which is when a reset helps most.
  - In 設定, a row 「重新開始人生模擬」 in destructive text on `--surface-2`,
    never filled, labelled 「人生模擬（路線的進度不受影響）」. It opens the
    existing `Alert`:
    - title 「要重新開始遊戲嗎？」;
    - body 「目前的進度和存款會清除，無法復原。」;
    - 重新開始 above 取消;
    - focus on the dialog, so no button is the default; Esc cancels.
  - After a reset, the student goes to 今天. When the alert closes, focus
    returns to the row.
- **Test:** `tests/e2e/reset-e.mjs` (new), **17 checks, 0 failing, 0 page
  errors**:
  - the API refuses a missing JSON type (415), a missing confirm (400) and a
    signed-out request (401), and a refused reset changes nothing;
  - there is no alert on load;
  - the title, the body and the button order;
  - focus is on the dialog;
  - Enter does nothing;
  - Esc and 取消 each cancel and keep the game; focus returns to the row;
  - 重新開始 lands on 今天 at month 1, at 發薪日.
  - The first run found that focus did not return to the row after Esc. That
    is fixed.
- **Result: PASS.**

## 7. Performance; reduced motion and the low-end flag

### Where it was measured

- **Not on the preview.** The preview is behind Vercel login, so Lighthouse
  cannot load it. `/today` and a lesson also need a signed-in test account on
  the preview's database, and step 1 has not cleared that.
- **Instead:** a local production build (`next build`, then `next start`,
  with no database). On that build only the public pages render: `/` and a
  course page while signed out (`/line/xinyong`). `/today` and a lesson
  redirect without a session, because the dev store is off in production
  mode by design.
- **Tool:** Lighthouse 13.5.0, mobile form factor, run with Playwright's
  Chromium.

| Page | Lighthouse, simulated throttling (the default) | Lighthouse, applied (devtools) throttling | Chromium trace, slow-4G-class network and 4× CPU |
|---|---|---|---|
| `/` | perf 56 · FCP 10.5 s · **LCP 12.3 s** · CLS 0 · TBT 0 ms | perf 98 · FCP 1.8 s · **LCP 1.8 s** · CLS 0 · TBT 70 ms | FCP 0.95 s · LCP 0.95 s |
| `/line/xinyong` (signed out) | perf 79 · FCP 2.1 s · **LCP 5.1 s** · CLS 0 · TBT 30 ms | perf 95 · FCP 2.4 s · **LCP 2.4 s** · CLS 0 · TBT 20 ms | FCP 1.33 s · LCP 1.33 s |
| `/today`, a lesson | not measured (needs the preview and a test account) | not measured | not measured |

- **Total JS transferred:** 184 KB on `/`, 188 KB on the course page.
- **Fonts transferred:** **956 KB** on `/`, 886 KB on the course page. That is
  Noto Sans TC in four weights (400, 500, 700, 900), cut by Google into many
  unicode-range files (44 on `/`).

**Flag: LCP over 2.5 s on throttled mobile in Lighthouse's default
simulated mode:** `/` at 12.3 s and the course page at 5.1 s.

- **Why the two modes disagree:**
  - Simulated mode estimates the page from its request graph, and it counts
    the ~0.9 MB of font files as part of the first paint.
  - A real throttled load paints at 0.95 s and 1.33 s. Blocking the Google
    font requests changes first paint by under 0.2 s, because every font
    uses `font-display: swap` and the font stylesheet is injected after
    hydration (`FontLink`).
  - With applied throttling, both pages are under 2.5 s, but the course page
    is close at 2.4 s.
- **The font weight is not new to this redesign.** The root layout already
  loaded the same four weights before it. The redesign uses Noto for the
  headlines too.
- **The fix, if wanted (small, not done here):**
  - load 400, 700 and 900 only (drop 500, which is used for little);
  - or subset the headline weight to the characters the landing uses.
  - Either cuts the font payload by roughly a quarter or more. Then re-run
    Lighthouse on the preview.

### Reduced motion, reduced transparency and the low-end flag: `tests/e2e/motion-e.mjs` (new)

- **Found and fixed:**
  - **The redesign's glass ignored both switches.** `--glass` and
    `--glass-blur` were not reset under `prefers-reduced-transparency` or
    `[data-lowend]`. Fixed in `app/tokens.css`.
  - **The low-end flag never reached the shells.** It is set on `<html>`,
    but the shells re-declare the tokens on themselves, which overrode it.
    The flag's rule now also targets `[data-lowend] .fl-shell` and
    `[data-lowend] .game-shell`.
  - **The MetroRide overlay used a raw `blur()`.** It now drops the blur
    under reduced transparency and the low-end flag.
  - **The low-end flag now also stops the MetroRide motion,** in CSS and in
    the ride's timing (`MetroRide.tsx`'s `reduced()`).
  - **The sign-up forms used Tailwind's `backdrop-blur-xl`.** They now use
    `--glass-blur`, so they follow both switches too.
- **Ran** on the local dev store, at 1440×900, on a course page (sidebar,
  then 上車 → 直接感應 → the car). Result: **16 checks, 0 failing, 0 page
  errors**:

  | Mode | Sidebar blur | Blur behind the ride | Car animation | Ride to station |
  |---|---|---|---|---|
  | default | blur(26px) | blur(18px) | runs | 4.5 s |
  | low-end flag | none | none | none | 1.7 s |
  | reduced motion | blur(26px) (blur follows reduced *transparency*, per E7.1) | blur(18px) | none | 1.7 s |
  | reduced transparency | none | none | runs | 3.4 s |

- **Result:**
  - Reduced motion, reduced transparency and the low-end flag: **PASS**.
  - Performance: **PARTIAL**. Two of the four pages were measured, both
    flagged under simulated throttling and both under 2.5 s with applied
    throttling. `/today` and a lesson need a human, or step 1 cleared.

## 8. The 8 tasks with no document to read

- **Ran:** a one-off script over `allLineContent()` listing every lesson with
  `materials.length === 0`.
- **What it found:** 8 authored tasks, the F3.8 warnings in STOP-4, which are
  the ones this item means. It also found the converted quiz stations (m10 to
  m38: 學貸, 報稅, 租屋, 保險, 創業 and others). Those are short check
  questions from the older modules and were never meant to read a document,
  so they are left out here.
- **Proposals:** each row says which kind of document the task would read,
  using the existing document kinds in `components/documents/`. No facts are
  written. Every figure or rule a document would carry is **TODO-VERIFY**
  (needs a dated primary source before it is written), and every name and
  amount is fictional and labelled 示意.

| Task | Line, place | What it asks | Document it needs | Kind | To verify |
|---|---|---|---|---|---|
| 風險四格 (`baoxian.matrix.v1`) | 保險線, station | Sort life risks into four ways of handling them | A household's list of risks over one month, with how often and how costly each is | Snapshot (a table) | TODO-VERIFY: any frequency or cost figure. The task can stay qualitative, with 示意 labels. |
| 人身四大風險 (`baoxian.fourrisks.v1`) | 保險線, station | Match situations to an insurance type; what a 22-year-old needs first | A one-page summary of each policy type: what it pays for and what it excludes | Policy | TODO-VERIFY: each type's coverage wording against a real policy's terms. No premiums unless sourced. |
| 讓目標變具體 (`cunqian.goal.v1`) | 存錢線, station | Pick a good goal, compute a monthly amount, deposit insurance | A savings goal card plus a bank deposit page showing the 存款保險 mark | Snapshot + Policy | TODO-VERIFY: the 存款保險 maximum and its wording, from 中央存款保險公司. |
| 誰比較會存 (`cunqian.rate.v1`) | 存錢線, 加碼任務 | Two savers' rates, habits, one 定存 interest sum | Two people's monthly payslips or budgets side by side, and a bank's 定存 rate board | Payslip ×2 + Snapshot | TODO-VERIFY: the 定存 rate, to stay the repo's verified 臺灣銀行 one year rate with its date. |
| 需要還是想要 (`qixin.needwant.v1`) | 消費線, station | Sort purchases into need or want; a repair with no budget left | A student's month of spending (a bank app list or receipts) | BillSheet or Ledger | Fictional prices with 示意 labels. Nothing to verify unless real prices are used. |
| 看懂 ETF 代號 (`touzi.etfcode.v1`) | 投資線, terminal | Sort ETF codes by suffix; which suit holding | A broker's ETF search results page: codes, names, type | Snapshot | TODO-VERIFY: what each suffix (B, L, R, U, K) means, from TWSE's ETF pages; real codes only if their names are checked. |
| 保護你的卡 (`xinyong.protect.v1`) | 信用線, terminal | Sort card habits into do and don't | A bank's security notice SMS or chat, plus a statement with one suspicious line | ChatThread + CardStatement | TODO-VERIFY: the steps a bank tells you to take, and any hotline number. |
| 你的興趣地圖 (`zhiya.interest.v1`) | 職涯線, station | Sort 8 cards into 喜歡, 擅長, 都有, 都沒有 | A short self-check sheet or a teacher's note on the student's strengths | Snapshot | Nothing factual; fictional, labelled 示意. |

- **Result: DONE (listed).** Writing the documents is content work for after
  the release.

## 9. Superseded notes on the old design specs

- **Added** the line 「Superseded by docs/design/ (professional
  course-platform redesign). Part F and the audit content still apply.」 in
  two places:
  - under the `# PART E. DESIGN BUILD SPEC` heading of
    `docs/finline-redesign/06-DECK-AUDIT.md`;
  - at the top of `docs/finline-redesign/01-DESIGN-SYSTEM.md`.
- **The file name:** there is no `06-FINLEA-AUDIT.md` in the repo or the spec
  folder. `06-DECK-AUDIT.md` is the only 06 audit, and its Part E is the
  design build spec, so that is the file meant. The copies in
  `~/Downloads/Finline` are outside the repo and unchanged.
- **Result: DONE.**

## 10. Full check

Run on `4ef73dc` (code), local dev store for the walkers.

| Check | Result |
|---|---|
| `npm run check` | First run: design-static FAILED on the word 「我們」 in the new report link; the copy is now 「這題有錯？回報錯誤」. Re-run: **165 tests pass, 0 fail**; sim contract ALL PASS; content 0 errors (82 warnings, unchanged); contrast 52 pairs, 0 misses; design-static 0 problems |
| `tsc --noEmit` | clean |
| `eslint` | 0 errors, 9 warnings (unused variables in older files and walkers, unchanged) |
| `check-names` | 284 files and the commit messages since `origin/main`, 0 hits |
| `next build` | passes |
| station-e 390×844 | 48 screens, 0 failing, 0 page errors |
| station-e 1440×900 | 48 screens, 0 failing, 0 page errors |
| turn-e | 47 screens, 0 failing |
| ride-e | 0 page errors (all ride checks ok) |
| tabs-e | 40 checks, 0 failing |
| xinyong-retry | 12 checks, 0 failed, 0 page errors |
| switch-e | all checks ok, 0 page errors |
| task-e ×5 (P1) | 24, 24, 28, 20, 20 screens, 0 failing, 0 page errors |
| short-e | 56 checks, 0 failing |
| class-e (new) | 9 checks, 0 failing |
| reset-e (new) | 17 checks, 0 failing |
| motion-e (new) | 16 checks, 0 failing |

**Result: PASS** (locally). Nothing has been run against the preview's database (step 1 is blocked).

---

# Round 2: one mode, live-site fixes (06 Part G), 2026-10-24

Branch `feat/flow-v2`, from `main` (0fbb116). The user said pushing to `main`
is fine for this round. The flow change is behind `NEXT_PUBLIC_FLOW_V2`.
`next.config.ts` derives the flag: on for Vercel preview builds, off for
production, and an explicit value always wins.

**The spec:** Part G was added to `docs/finline-redesign/06-DECK-AUDIT.md` and
03 points to it. The copy in the spec folder names the partner organisations
in plain text, so those names were replaced, and the in-repo file keeps its
scrubbed name. `check-names`: 0 hits.

## R2-1. Preview database safety

- **Ran:** the Vercel CLI is not installed. The dashboard's env var page
  (built-in browser) redirects to the Vercel login.
- **Result: BLOCKED,** same as round 1.
- **Precaution:** nothing in this round signs up, logs in or writes on the
  preview. All tests ran on the local dev store.

## R2-2. Inventory and Part G0 to G3

### Inventory: behind the 模擬/學習 toggle

- **The toggle (`components/ModeToggle.tsx`) is rendered in:**
  - `components/SiteHeader.tsx` (the site header);
  - `app/(game)/layout.tsx` (the old game menu);
  - `app/(app)/settings/page.tsx` (設定);
  - `components/RouteNetworkView.tsx` (an old dashboard view; rendered
    nowhere).
- **It writes through `app/api/mode/route.ts`.**
- **What reads the mode** (`effectiveMode`, `readingRequired`,
  `optionalStations`, `sim_first`):
  - `lib/modeModel.ts`, `lib/buildStations.ts`, `lib/progressModel.ts`,
    `lib/lineCompletion.ts`, `lib/stationNav.ts`, `lib/gameHome.ts`,
    `lib/routeBoard.ts`, `lib/lifeGame/server.ts`, `lib/db.ts`,
    `lib/clientCookies.ts`;
  - `components/HomeLink.tsx`, `components/LineNetworkPanel.tsx`,
    `components/TipCard.tsx`, `components/sims/BuyVsRentSim.tsx`;
  - the pages `today`, `map`, `line/[slug]`, `line/[slug]/station/[n]`,
    `line/[slug]/certificate`, `line/[slug]/course/[n]`,
    `line/[slug]/simulation`, `transfer`, `transfer/[id]` and `lines`.

### Inventory: "simulation" routes

- `/simulate`: the 模擬 home. It already redirected signed-in students to
  今天.
- `/line/[slug]/simulation`: each line's last station. For 信用線, 投資線
  and 詐騙線 it runs a task set, in the old player. For the other nine it
  is the original simulation engine.
- `/api/simulation`: stores a last-station result. It stays.
- `/simulation`: a `next.config` redirect to 消費線's simulation.
- `/invest-replay`: a public replay tool, not a mode. It stays.

### G0: one mode

**Flag on:**

- **No 模擬/學習 switch** in the header, 設定 or the old game menu. The
  header is brand, 路線圖, help and 我的進度.
- **One path for everyone:** `effectiveMode()` returns the default path
  (core stations required, the rest optional) whatever was stored. Completed
  lines stay completed.
- **`/simulate` redirects with 308** to 今天.
- **`/line/{xinyong,touzi,zhapian}/simulation` redirects with 308** to the
  new `/line/[slug]/end`. That runs the last station in the same player as
  every station. `?classic=1` keeps the original simulation reachable. The
  nine lines whose last station is an original engine keep it: it is the
  engine, and Part G says to keep the engines.
- **The quiz is off the path:** one 「小測（選填）」 card in the progress
  panel, never gating anything.

### G1: the new station flow

1. **想一想.**
2. **任務:** the ticket, then the steps, with no teaching before them. Every
   step has 「看提示」, which opens a sheet with the side note that covers
   the step (`LessonCard.covers`, else the first card), labelled
   「看提示不影響分數」.
3. **先懂:** the side notes, framed 「剛剛的任務，專家怎麼想」.
4. **對答案.**
5. **人生.**

The bar and the landing's FL03 follow this order.

- **「再做一次（N 題）」** asks only the missed steps. Attempt 2 is stored as
  a new attempt, and the A6 rule applies unchanged.
- **Carried answers are scored against their own attempt** (`ScoreContext.
  carried`, `submitTask`). This matters for 你是銀行, whose files are drawn
  per attempt.
- **The side-note length warning in the content check: NOT DONE.** It is
  listed under G1 but deferred to the next round.

### G2: the compare screen

- **Three blocks:**
  - 你做得好的 (up to 3 ✓);
  - 可以再想想 (each step's 你的答案, 建議答案 and why, using the existing
    model-answer component; then the fixed line
    「這是一種做法，不是唯一的答案。」);
  - 這份工作實際怎麼做.
- **`TaskSet.jobNote`:** filled from `content/jobNotes.ts`. All 56 notes are
  drafted from each lesson's own takeaway and its sender's role, with no
  outside facts, and are marked TODO-REVIEW.

### G3: the saved position

- **What is saved:** the stop name with the order it was saved in
  (`lib/flowPosition.ts`), per student and task, on the device. Nothing goes
  to the database. The old order (flag off) saves too, so positions migrate
  when the flag flips.
- **How it migrates:**
  - old 先懂 → the new 先懂 (with no result yet, the side notes lead to the
    task);
  - task → task;
  - hook → hook;
  - a newer attempt → stale.
- **Tests:** `tests/flowPosition.test.ts` seeds every stop in both orders
  (3 tests pass).

### Walkers

- **`tests/e2e/flow-v2-e.mjs` (new): 15 checks, 0 failing, 0 page errors:**
  - the task comes before the side notes; the bar order;
  - 看提示 opens and closes;
  - after the attempt come the side notes;
  - 對答案 has all three blocks;
  - one missed step, so 再做一次（1 題） opens on 第 3 題; attempt 2 scores 4/4
    with the carried answers;
  - an old-order 先懂 position opens on the side notes, then the task;
  - an old-order task position opens on the ticket.

**Result: PASS,** except the side-note length warning, which is not done.

## R2-3. Live-site bugs (G5)

### Item 1: names and content (信用線 checked against 04)

- **CR01 信用站** runs 04's Task B (你是銀行). It matches.
- **CR02 卡片站** runs Task A (你的第一張帳單). Module 7 is
  「信用卡運作與循環利息陷阱」, which matches.
- **The last station was the mismatch.** It was named 帳單站 and labelled
  終點模擬, but it runs Task D (保護你的卡), a do/don't sort, not a
  scenario. 帳單站 was the name of the original bill simulation that the
  task replaced.
  - **Changed:** the last station is now **護卡站 · 保護你的卡**, and it
    shows as a station, not 終點模擬. `sim.station` and `sim.title` stay for
    the original simulation (`?classic=1`).
- **The same rule caught 投資線:** its last station runs 看懂 ETF 代號 (a
  sort and two questions). It now shows as a station, with that title.
- **New rule:** a last station is labelled 終點模擬 only if it is a scenario
  (`sim.scenario`). `tests/lineStats.test.ts` checks it.

### Item 2: counts and minutes

- **One rule, in `lib/lineStats.ts`:**
  - 站 = every station including the last one;
  - 分鐘 = the sum of the lesson minutes, from the content.
  - An original simulation counts as 10 minutes
    (`ORIGINAL_SIM_MINUTES`), because its content has no minutes.
- **Everywhere reads it:** the landing, `/lines`, the line page and 今天.
- **A test** checks the count against the line page's rows, and that none of
  these files computes a count of its own.

### Items 3 to 8

- **Item 3, the start line:** `START_LINE` = 職涯線, first in 今天's order.
  It sets the income the later lines read. The landing, `/lines` and the
  goal step's first ride all use it, and the 旗艦 badge is gone.
- **Item 4, the `/lines` rebuild:**
  - labels and copy: done;
  - visual rebuild: **not done.**
- **Item 5, the `/lines` button:** 「開始」 when nothing is done, otherwise
  「繼續：<next>」. done/total uses the same total as the header.
- **Item 6, sign-up:** school is 選填, with the copy
  「只需要暱稱，學校選填。不收真實姓名、電話或金融帳號。」. The API accepts
  a blank school and stores ""; the column stays not null.
- **Item 7, the two live bonus tasks:**
  - 雪球還是雪崩 is verified (VERIFIED item 5, card cap, 學貸 rate). Live.
  - 借錢之前: its card claims a student loan's rate is lower than an
    ordinary loan's, and VERIFIED.md has no item for that. **Hidden**, with
    its Short, behind `NEXT_PUBLIC_SHOW_UNVERIFIED`
    (`lib/tasks/hidden.ts`).
- **Item 8, signed out:** 今天 goes to `/signup`, which has the code form.
  `/line/*` and `/lines` load signed out (google-e and switch-e cover it).

**Result: PASS** for items 1, 2, 3, 5, 6, 7 and 8. Item 4 is partial: the
labels and copy are done, the visual rebuild is not.

## R2-3b. G9, second walk

### High

1. **The old standalone simulation after a station: partly fixed.**
   - **Income:** the simulations started from NT$30,000 (`DEFAULT_MONTHLY_INCOME`) while the life game uses NT$32,000 (`STARTER_GROSS`). They are now the same, with a test.
   - **Pre-reading:** with the flag on, the simulation page no longer shows the second pre-reading (`WhyFirstCard` and the cards).
   - **Same player:** 信用線, 投資線 and 詐騙線 now run their last station in the station player (`/line/[slug]/end`). The other nine lines keep their original engines, as Part G says to keep the engines; porting them into the player is later work.
2. **The capstone done without the simulation: CHECK, not reproduced.**
   - A line, its last node and its stamp complete only with a `simulation_runs` row.
   - Rows are written only by `POST /api/simulation`, which the simulation's own submit calls.
   - No other writer exists in the code. On that walk, the student landed on the 消費線 simulation page (item 1), so the row most likely came from that page.
   - **Added:** a test that finishing every station alone leaves the line incomplete and its last node not done. It passes.
   - **Needs:** the test account's `simulation_runs` rows, to confirm.
3. **3 分鐘版 from another line: FIXED.** The card's Short comes from the card's own line; if that line has none, there is no button.
4. **Done and not passed together: FIXED.**
   - **Not passed, first try:** 「還沒過關，先看建議答案，再做一次。」
   - **Completed on the second try:** 「這一站完成了。先看建議答案，想再練可以再做一次。」 with the verdict 「已完成」.
   - **Passed:** unchanged.
   - A test checks the two never mix.
5. **行動 overlap: FIXED.** The cash line now sits inside the sticky button bar, above 確定, so they cannot overlap. Not measured on a 360×640 phone; turn-e covers 390×844.
6. **Submit speed: CHECK, not measured.**
   - The preview is behind Vercel login, and local dev timings mean nothing for Vercel.
   - **Code reading:** `submitTask` already does its reads in parallel, then its writes in parallel.
   - **Measure on the preview:** the time for `POST /api/task` and `POST /api/life-game/action`.
7. **The write prompt with no 1-rated applicant: FIXED.** `WriteStep.ifNoRating` asks 「挑一位你給最高分的申請人，用一兩句話說說為什麼放心核准。」 when no file got 1. The model answer and the self-check still describe the reject case; review that copy.

### Medium

- **8, the reason said twice: FIXED.** The model box no longer repeats 「理由：」; the reason is said once, under 為什麼.
- **9, the 「一種做法」 line under facts: FIXED.**
  - New per-step field `answerKind`: number steps are facts by default. 存款保險 (存錢線 s4) is marked fact.
  - Facts say 「正確答案」 and carry no 「這是一種做法」 line. The compare screen shows that line once, only when a judgment answer is there.
- **10, arrow fragments and the orphan bold line: FIXED.**
  - 你是銀行's 18 explanations are now two sentences (「A。後來：B。」).
  - The bold line was a collapsed `<details>` summary; it now reads 「點開資料，看關鍵的欄位」.
  - The content check warns on arrows in explanations.
- **11, unearned reveals and 「我們」: FIXED.**
  - A default reveal shown on a pass becomes a neutral 「這一站帶走的」 screen (the bias is named only when the answers point to it).
  - 「我們」 is removed from 8 narrator lines. The scammers' own chat lines in 詐騙線 keep theirs.
- **12, the ticket highlighting 先懂: FIXED.** In the old order the ticket now highlights 任務; in the new order it already did.
- **19, the toggle in 設定: FIXED behind the flag** (G0). The 前後測 question bank stays, because class mode uses it; the note is added to G0 in the spec.
- **Left for later, as asked:** 13, 14, 15, 16, 17, 18, 20, 21.

### Facts

- **Sources added:** `verifiedOn` 2026-10 and three sources from `VERIFIED.md` items 2 (free credit report) and 3 (DBR22) on 信用站. No number changed.
- **Score range 200 to 800:** not in `VERIFIED.md`. Its source is `docs/redesign/sources.md` item 10, so it needs confirming there.
- **0.825% 活期儲蓄:** not in `VERIFIED.md`. It is dated and sourced in `lib/rates.ts` (臺灣銀行, 2026-10-06).
- **Payslip 勞保 NT$800 and 健保 NT$496: CHECK.** These need the official insured-salary tables.
- **Deposit insurance NT$3,000,000:** matches `VERIFIED.md` item 1.

## R2-4. Walkers (see R2-8 for the final run)

- **Updated for the new order and these fixes:**
  - station-e, task-e (either order, and the neutral reveal);
  - switch-e (one mode, the signed-out 今天 → `/signup`);
  - short-e (the line-matched Short).
- **New:**
  - `flow-v2-e.mjs`;
  - `google-e.mjs` (no Google control on `/`, `/signup`, the code login, `/dashboard`, 設定, class mode or 今天, signed out and in; the Google routes go back to `/signup`).
- **Google sign-in now needs an explicit switch:** `NEXT_PUBLIC_GOOGLE_SIGNIN=1` as well as the keys.

## R2-5. The full-ride counter

**PASS,** same as round 1. The only reader is the old train's length. The goal step already rides the MetroRide car; that change is on `main`.

## R2-6. 回報內容錯誤

**DONE.** On the compare screen, per step, plus one for the whole task when every step matched. It is a mailto with the line, station, task id and step id. The address is still a TODO; until it is set, the link shows in development only.

## R2-7. Content crosswalk

**DONE, private.**
- `docs/design/private/` is in `.gitignore`, verified with `git status` and `git check-ignore` before the file was written.
- `CONTENT-CROSSWALK.md` covers all 59 rows of section 1 and the P1/P2 check.
- It was never committed, and no slide number or deck text is in any committed file.

## R2-8. Full check

Run on `feat/flow-v2`; walkers on the local dev store.

| Check | Result |
|---|---|
| `npm run check` | 176 tests pass, 0 fail; sim contract ALL PASS; content 0 errors (88 warnings, 6 of them the new side-note warnings); contrast 0 misses; design-static 0 problems |
| `tsc --noEmit` | clean |
| `eslint` | 0 errors (7 old warnings) |
| `check-names` | 0 hits in the files and the commit messages since `origin/main` |
| `next build` | passes |
| **Flag on:** station-e | 36 screens, 0 failing |
| **Flag on:** flow-v2-e | 15 checks, 0 failing |
| **Flag on:** turn-e | 47 screens, 0 failing |
| **Flag on:** ride-e | 0 page errors |
| **Flag on:** tabs-e | 40 checks, 0 failing |
| **Flag on:** xinyong-retry | first run 3 failed (it expected the old result wording, G9 item 4); updated, then 12 checks, 0 failed |
| **Flag on:** switch-e | ok, 0 page errors |
| **Flag on:** task-e 複利 and 雪球 | 20 and 16 screens, 0 failing |
| **Flag on:** short-e | first run failed (it expected a Short on every card, G9 item 3); updated, then 46 checks, 0 failing |
| **Flag on:** google-e | 22 checks, 0 failing |
| **Flag on:** class-e | 9 checks, 0 failing |
| **Flag on:** reset-e | 17 checks, 0 failing |
| **Flag off:** station-e | 50 screens, 0 failing |
| **Flag off:** switch-e | ok |
| **Flag off:** task-e 複利 | 28 screens, 0 failing |

**Not re-run this round:**
- motion-e (passed in round 2);
- task-e for 預算缺口, 機車, 保險三層.

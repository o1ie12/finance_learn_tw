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
  - Under every model answer, a plain link 「這題有錯？回報給我們」, in both
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

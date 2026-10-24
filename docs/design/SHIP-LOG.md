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

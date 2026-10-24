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

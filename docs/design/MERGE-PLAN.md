# Getting feat/design-e (and fix/playtest-05) to main

## Final pre-merge checklist (2026-10-24)

- **Branch:** `feat/design-e`.
  - At the time of writing it is 57 commits ahead of `main` (326df7a), with
    281 files, +24,711 / −1,800. Checked commit: `d6fdda7`. Preview (behind Vercel login):
    https://finance-learn-mpehnb7cf-olivers-projects-1298c00d.vercel.app.
  - The merge is a fast-forward. There are no new migrations.
- **Evidence for every item:** `docs/design/SHIP-LOG.md`.

### DONE BY CLAUDE CODE

- [x] `npm run check`: 165 tests, sim contract, content, contrast and
  design-static all pass.
- [x] `tsc` clean, `eslint` with 0 errors, `next build` passes,
  `check-names` 0 hits.
- [x] All walkers pass on the local dev store:
  - station-e (390 and 1440), turn-e, ride-e, tabs-e, xinyong-retry and
    switch-e;
  - task-e on the five P1 tasks and short-e;
  - class-e, reset-e and motion-e (new).
- [x] The full-ride counter audited: nothing reads it except the old train's
  length. The goal step no longer rides the old avatar train.
- [x] Report-a-mistake link on every model answer. **It waits for an email
  address** (`lib/reportMistake.ts`, `REPORT_ADDRESS`). Until then it is
  hidden in production.
- [x] The life-game reset (the one alert) is built and tested.
- [x] Reduced motion, reduced transparency and the low-end flag turn off
  the glass blur and the MetroRide motion. Two bugs were found and fixed.
- [x] Lighthouse on a local production build:
  - `/` and a course page, both under 2.5 s LCP with applied throttling
    (1.8 s and 2.4 s);
  - both over 2.5 s in Lighthouse's simulated mode (12.3 s and 5.1 s),
    because of about 0.9 MB of Noto Sans TC files. See SHIP-LOG step 7.
- [x] The 8 tasks without documents are listed, with what each needs
  (TODO-VERIFY).
- [x] The old Part E and 01 design specs point to `docs/design/`.

### NEEDS A HUMAN

1. **Preview database (blocks 2 to 4).** Sign in to Vercel. Open Project →
   Settings → Environment Variables and check whether `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_ANON_KEY` have the same values
   for Preview and Production.
   - If they match, the preview writes to production. Give Preview its own
     Supabase project or branch first, and do not test sign-ups on the
     preview until then.
   - Claude Code could not check this: the Vercel CLI is not installed, and
     the dashboard needs a login.
2. **Google sign-in and linking on the preview:** the five steps in SHIP-LOG
   step 3. They cannot be mocked locally.
3. **Class mode by hand on the preview:** one teacher laptop and one student
   phone, for 即時測驗 and 人生賽局. The walker proves the flows locally, not
   on Vercel with Supabase.
4. **Lighthouse for `/today` and a lesson on the preview,** with a test
   account. Then decide whether to trim the Noto weights first.
5. **A real phone:** iOS Safari, one station end to end (course page → 上車 →
   station → its month → the car), the landing's fare gate, and 設定 →
   重新開始人生模擬.
6. **The report-a-mistake email address.**
7. **Ryan presses merge:** `git push origin feat/design-e:main`. This is a
   fast-forward; Vercel then deploys production.
8. **Rollback, if needed:** in Vercel → Deployments, promote the previous
   production deployment (instant, no data change). Do not roll back to
   326df7a; see "If it goes wrong" below.


Written 2026-10-24. Nothing is merged; `main` is still 326df7a, which is production.

## The shape of it

- `feat/design-e` sits on top of `fix/playtest-05`, which sits on top of `main`. `main` has not moved since, so the merge is a **fast-forward**: no conflicts, no squash needed.
- **Size:** 45 commits (13 from 05, 32 from design-e); 242 files, about +20,100 / −1,200 lines.
- **No database migrations.** Production already has 21 to 26.
- **Partner names:** both branches are already public on GitHub. The name scan finds 0 hits in the files and in the commit messages since `main`.

## The 2026-10-24 look

The course-platform redesign is on this branch too: the 錢途 palette with Taipei Metro colors, glass for navigation, Noto Sans TC bold. Rebuilt: the landing page and sign-up, 今天 (continue card, life-sim card, the route board), the course page (with the MetroRide tap-in gate), the lesson player (glass bar with named stops, task ticket), and the turn (no avatar band). The design canvas is the reference.

## What changes for real students (38 accounts as of 2026-09-24)

### Where they land (decision 1: switch, made 2026-10-24)

**Every student lands on 今天 (`/today`).** That covers sign-in by code or Google, and both modes; the mode still decides which stations are required.
- `/dashboard` and `/simulate` redirect to 今天. Signed out, they still show the code form, and 今天 sends signed-out visitors there.
- Onboarding is the goal step, then 今天. The character creator left the main flow on 2026-10-24 (the course-platform redesign); `/creator` still exists but nothing sends students there.
- `/play` redirects to `/turn` and keeps a station's ride.
- The Google link prompt and its result moved to 設定 (`/settings?linked=1`).
- 設定's 模擬 / 學習 switch saves and stays on 設定.
- Class mode keeps its own turn screen.

**What this replaces.** Without the switch, students would still have landed on the older home. The Part E line page would have been one tap away, and from there the new screens have no way back. Each student's experience would have depended on where they tapped.

**Still in the older look:** pages with no Part E version yet open in it from the new screens. These are 護照, 工具箱, 證書, 複習, 前後測, 支線, the line simulations and class mode.

### What changes inside the older pages (from 05)

- **Station flow:**
  - Every station runs the station flow.
  - Answers stay on the server until submit.
  - Screens are one per question, with no page scroll.
  - A station counts as done on a pass or on the second attempt.
- **Life game:**
  - Each month has a new step, 生活風格 (省 / 普通 / 享受). 省 several months in a row raises stress.
  - 人生遊戲 naming.
  - The train sign shows where the train is going.
  - The starting cash is explained.
- **Content:** seven article facts corrected, and tasks matched to their stations' topics.

### What changes from design-e, visible in the older pages too

- **Every task:** opens with a message from someone (the brief). Model answers now say 「和建議答案一樣/不同」.
- **Turn button labels:** now 收下, 存起來, 繳費, 決定, 確定, 繼續, 完成.
- **工具箱** replaces 我的工具.
- **New content:**
  - 複利站 now runs 複利與 72 法則. Completions earned on the old task stay.
  - 存錢線 station 6 (讓目標變具體) gains a fourth question, on deposit insurance.
  - Six new 加碼任務.
  - Five small cards.
  - A write step on 你是銀行: the text is saved on the student's own profile only.
- **Life game:** stressed players can get the new 情緒消費 event.
- **Certificate:** now says it is a learning exercise, not work experience.

### Data

- **Life-game saves load.** Pre-05 saves have no 生活風格 fields; the new fields have defaults. I tested it: a save stored mid-month at 帳單 loads, and the next step is 生活風格.
- **Profile:** gains an optional `writes`.
- **`task_results`:** gains new kinds (`short_v1` and the new tasks). It is a text column.
- **No existing rows change.**

## Decisions before the merge

1. **Done: switch.** Make the new design the home now, or merge as is? Merging as is leaves students moving between two looks depending on where they tap.
   - **Switch** means one small commit before the merge:
     - logged-in home goes to `/today` for both modes;
     - `/dashboard` and `/simulate` redirect there;
     - onboarding uses `/creator` (since 2026-10-24: the goal step only);
     - `/play` redirects to `/turn`.
     Class mode keeps its own screen.
   - **The cost:** pages with no Part E version yet would open in the older look from the new screens: 護照, 工具箱, 證書, 複習, 前後測, 支線, the line simulations, and class mode.
2. **Which database does the Vercel preview use?** I can't see this from here: the preview is behind Vercel login. Check Vercel → Project → Settings → Environment Variables and see whether `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set for **Preview**.
   - **If they are, previews write to production.** A sign-up on the preview creates a real row next to the 38 students.
   - **Options:**
     - point Preview at a separate Supabase project (best);
     - or test with one clearly named test account and delete it afterwards;
     - or test read-only.
3. **Who merges.** 05 said Ryan pushes to `main`, so who presses the button?

## What to check on the preview first

Use a test account only, per decision 2. All of this already passes locally on the dev store. The preview proves it on Vercel with a real database.

1. **New student:** from the landing page's fare gate (drag the card or 直接感應), sign up, set the goal, and land on 今天.
   - Also: `/dashboard`, `/simulate` and `/play` redirect.
   - Google sign-in lands on 今天; linking Google from 設定 comes back to 設定 with the result. This is the one path I couldn't run locally: Google isn't configured on the dev store.
2. **Old student:** log in with an account that has progress and a life-game save.
   - The save opens at the right month.
   - 生活風格 appears after 繳費.
   - Earned stations and certificates are still there.
3. **One station end to end:** the 信用線 course page → 上車 (the tap-in gate) → 信用站 → its month on `/turn` → the MRT car → 卡片站.
4. **A retry:** fail a station once, then do it again. It counts as done.
5. **A 加碼任務 and a Short** (今天 → 3 分鐘版). Both save, and neither marks a station done.
6. **Class mode** (`/class/life`): one host and one team play a month. Its turn screen now shares code with `/turn` (`useTurn`), and no walker covers class mode.
7. **Tabs:** 狀態, 路線 and 行動 show the save's real numbers.
8. **Phone and dark mode:** one pass on a real phone (iOS Safari), light and dark.

## The steps

1. **Settle decisions 1 to 3.** For "switch", I make that commit on `feat/design-e`, run the checks and push. A new preview builds.
2. **Run the preview checks above** and note anything wrong. Fixes go on `feat/design-e`, then re-check.
3. **Right before the merge, on `feat/design-e`:**
   - `npm run check`
   - `next build`
   - the walkers: station, retry, turn, ride, tabs, tasks, Shorts
   - `npx tsx scripts/check-names.ts`
4. **Merge as a fast-forward:** `git push origin feat/design-e:main`. No squash; the branch history is clean. Vercel deploys production.
5. **Right after:**
   - Open production read-only: home, a line page, 今天.
   - Watch Vercel's function logs for errors for the first hour.
   - Log in once with the test account and play a month.
6. **Tell students and teachers what is new** (one short note), if Ryan wants to.

## If it goes wrong

- **Fastest:** promote the previous production deployment in Vercel. It is instant, and no data migration needs undoing.
- **Not back to 326df7a.** Rolling back to the version from before 05 has one trap. Any student who saved during the new 生活風格 step would have a save that version cannot read, because it doesn't know that step: they would see 「存檔暫時讀不到」.
- **Instead, roll back to the last good build that includes 05** (any `fix/playtest-05` or `feat/design-e` build). Or fix forward.
- **Everything else new code writes is ignored by older code:** the `writes` profile field, and new `task_results` kinds and Short ids.

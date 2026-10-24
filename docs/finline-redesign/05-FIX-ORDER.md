# 05. Fix Order (after the first playtest)

Ryan and Claude played the live site on 2026-10-18 with a test account: dashboard, both 信用線 stations, one life-game month, the train ride, and 你是銀行. The engine is solid. This file lists what is broken and how to fix it.

Work in this order: **Part A (content and logic) → Part B (life-game economy) → Part C (click-through structure) → Part D (design reboot)**. Parts A to C ship first. Part D does not start until Ryan and Oliver pick a design direction.

The rules from `00-MASTER-PROMPT.md` still apply. One new rule, because it was broken last time: **do not push.** Commit locally; Ryan pushes. `main` deploys to production automatically.

Use at most **3 subagents at once.** Ten at once overloaded the laptop last time.

---

## Part A: content and logic bugs (must fix before any student test)

Each item: what we saw → the fix → the test that proves it.

### A1. Today's stop opens an unconverted station
- **Seen:** the dashboard's 上車 links to `/line/qixin/course/2` (記帳站). It still renders the old article and the old 3-question quiz, with only a hook line pasted on top. The 6 other stations we checked do use the new 5-step flow.
- **Fix:** find every required station that still renders the old page (write a script that loads each `requiredStations` route and checks for the new flow). Give each one the new flow. Where `04-CONTENT.md` has no task set for it, wrap the existing quiz as a `ChoiceStep` task inside the 5-step flow (hook with options, 1 to 3 lesson cards cut from the old article, the quiz, reveal, life-game turn), exactly as `04` describes for extra core stations.
- **Test:** the script runs in `npm run check` and fails if any required station renders the old layout.

### A2. Answers are in the page source
- **Seen:** `/line/xinyong/course/7` ships `"answer":2` and each applicant's explanation in the HTML before the student submits.
- **Fix:** split every task set into a public part (prompt, options, materials) and a private part (answers, explanations, highlights, model answers, outcome maps). Only the public part goes to the client. The submit route scores on the server and returns the private part for that task in its response. Lesson pages must not import answer data into client components.
- **Test:** for every task set, render its page HTML and assert none of its answer values or explanation strings appear. Run it in `npm run check`.

### A3. The statement task gives away step 1
- **Seen:** step 1 asks students to find 本期應繳總額, 最低應繳金額 and 繳款截止日. The statement already draws a box around exactly those 3 fields during the task.
- **Fix:** the `CardStatement` document renders all fields the same during a task. The 「關鍵」 box appears only in the model answer view.
- **Test:** during the task, the three target fields have the same markup and classes as the other fields.

### A4. 信用線 tasks are on the wrong stations
- **Seen:** 信用站 (台灣的銀行、信用與借貸) got 「你的第一張帳單」. 卡片站 (信用卡運作與循環利息陷阱) got 「你是銀行」.
- **Fix:** swap them. 信用站 → 你是銀行. 卡片站 → 你的第一張帳單. Check every other line the same way: a task must match its station's topic. Where the station order in `lib/lines.ts` conflicts with the "first core station gets Task A" rule, match by topic instead and list each change in the report.
- **Test:** a content check that maps each task set id to an explicit station id (no positional mapping).

### A5. The interest question can't be answered, and its answer isn't from the engine
- **Seen:** 「如果這期只繳最低，下期帳單大約會多出多少利息？」 Nothing teaches the formula. The "correct" NT$107 comes from 「平均 45 天」, a rough estimate, not the real interest engine used by the 信用線 sim and the life game.
- **Fix:** make it a `ChoiceStep` with 4 ranges: 約 NT$10 / 約 NT$100 / 約 NT$1,000 / 約 NT$5,000. The correct range is whichever contains the real engine's interest for this statement (compute it; do not hard-code). The model answer shows the engine's exact number and a one-line explanation: 「沒繳的部分，每天照年利率計算，從每筆消費的入帳日開始算。」 Add one lesson card before the task with that same sentence.
- **Test:** the model-answer number equals the engine's output for this statement.

### A6. The failing screen says the station is done, but it isn't
- **Seen:** after scoring 1.3 / 4 the screen says 「還沒過關。還差一點。再試一次，不論分數都算完成這一站。」 The station stays undone (信用線 still showed 1/2).
- **Fix:** follow the rule in `03` section 4 (done on pass, or after the second attempt) and make the copy match it:
  - First failed attempt: 「還差一點。再試一次；第二次不論分數，這一站都會完成。」
  - Second attempt, any score: 「這一站完成了。」 and the station is marked done.
- **Test:** two failed submits mark the station done; one does not; the copy matches the state.

### A7. Correct answers are always listed first
- **Seen:** in every `ChoiceStep` we saw, the correct option and the correct reason were first.
- **Fix:** shuffle options and reasons per attempt with a seeded shuffle (keep ordered scales such as ranges in order). Store the shown order with the attempt so the model answer view matches what the student saw.
- **Test:** across all content, the correct option's displayed position is spread across positions (no position above 40% over 100 seeded attempts).

### A8. Smaller fixes
1. The solo game is titled 「人生賽局」. That is the class-mode name. Solo is **人生遊戲**; 人生賽局 stays for class rooms.
2. The train transition's station sign shows 「人生賽局 LIFE · M1」. It must show the destination station (name, line color, line and station code).
3. Dashboard shows 已存下 NT$0 next to 緊急預備金 0.3 個月 (the fund counts cash above NT$5,000). Show the fund's breakdown on tap, and rename 已存下 to 存款 (活存 + 定存).
4. Scores show as 「0.9 / 1」 for a 6-file rating step. Show points as earned: 「5.5 / 6」.
5. Submitting a task took 3 to 6 seconds. Profile the submit route and get it under 1 second on production (no extra round trips; batch the writes).
6. Some taps did nothing the first time (a hook answer, the dashboard 上車). Check on a real phone for hydration delays, overlapping elements, or the card-lift transform moving the target. Fix the cause.
7. Starting cash of NT$10,000 is not in the spec. Either remove it or explain it on screen (「爸媽給你的第一筆生活費」) and list it in the report.

---

## Part B: the life game is too easy to save in

- **Seen:** at NT$32,000 living at home, about NT$15,000 is left every month after bills, with nothing to spend it on. Saving 50% happens on its own. The saving lesson has nothing to push against.
- **Fix: a monthly lifestyle choice (生活風格).** Add a step between 帳單 and 行動. The student picks a level for 想要 spending this month. The amount is spent like a bill:

| Level | Monthly 想要 spending | What it covers (示意) |
|---|---|---|
| 省 | NT$3,000 | 偶爾手搖、一次電影 |
| 普通 | NT$7,000 | 每週聚餐一次、串流平台、偶爾買衣服 |
| 享受 | NT$12,000 | 常常外食聚會、新衣服、遊戲課金 |

- Default is the student's last choice; first month defaults to 普通.
- 省 for 3 months in a row adds stress +5 (a life with no fun is hard to keep up). 享受 adds nothing to stress.
- The choice shows on the turn summary: 「這個月想要的花費：NT$7,000」.
- Temptation events (`birthday`, `concert`, `japan_trip`, `new_phone`) stay on top of this.
- After 消費線 the student can also edit the flexible bills (already in the spec).
- Re-run the realism tests in `02` section 9. Update the expected ranges only if they fail, and report the new ranges.

---

## Part C: click through, don't scroll

Ryan's direction: it must feel like Forage. You finish something, you go to the next screen. No scrolling through paragraphs. This applies to every page after login.

**The rule:** each screen holds one thing to read or do, and fits inside the viewport at 390×844 (phone) and 1440×900 (desktop) without page scrolling. A long document opens in a viewer that scrolls inside itself; the page around it does not.

| Where | Now | Change to |
|---|---|---|
| Station flow | 5 steps, but steps scroll (the statement plus all questions on one long page) | One screen per step **and** per question. Lesson cards are one card per screen with 下一張. Each task question is its own screen with the document beside it (desktop) or behind a 「看文件」 button (phone) |
| 你是銀行 | All 6 credit reports stacked on one long page | One applicant per screen: the report, three big buttons 1 / 2 / 3, then the next applicant slides in. A 6-dot progress bar at the top |
| Model answers | One long page of every answer | One screen per question: your answer, the model answer, why. 下一題 |
| Life game turn | Mostly fits, the action step scrolls | The action step shows unlocked moves as a horizontal set of cards (swipe on phone) and hides locked moves behind 「還沒解鎖的 (N)」 |
| Dashboard | A long scrolling page on phone | One screen: the character and today's stop. Stats, map and moves move to 3 tabs at the bottom (狀態 / 路線圖 / 行動), each its own screen |
| Old lesson text | 「看完整課文」 opens the whole article | Opens a reader that pages, not scrolls (one section per page) |

Transitions between screens: a 200ms slide (reduced motion: instant). Keyboard: Enter or → goes forward once the screen is done; ← goes back where allowed.

**Test:** a Playwright check that walks one full station, one full life-game turn and the dashboard at 390×844 and asserts `document.scrollingElement.scrollHeight <= innerHeight + 1` on every screen (document viewers excluded).

---

## Part D: design reboot (do not start until a direction is picked)

The current look reads as generic AI output. The fix is a process, not another blind pass.

### D1. Install the design tools

| Tool | What it is for | Install |
|---|---|---|
| **Impeccable** (Paul Bakaus) | Design review and polish: audit, critique, typography, spacing, color, motion. Also writes `PRODUCT.md` and `DESIGN.md` | `npx skills add https://github.com/pbakaus/impeccable --skill impeccable` |
| **Hallmark** (Together AI) | Anti-generic design skill. "Study" mode extracts the design DNA from a screenshot or URL; "audit" mode flags generic patterns | `npx skills add nutlope/hallmark` |
| **LottieFiles motion-design** | Motion principles: timing, easing, personalities (Playful fits us), a checklist | `npx -y skills add lottiefiles/motion-design-skill --skill motion-design --agent claude-code` |
| **UI UX Pro Max** (optional) | Large library of styles, palettes and font pairings to explore directions | `npm install -g uipro-cli` then `uipro init --ai claude` |

Read each skill's own instructions before using it. They inform; this file and Ryan's picks decide.

### D2. Write the brief first

Run Impeccable's `init` to produce `PRODUCT.md`. It must say, in these words: Traditional Chinese financial-literacy game for Taiwanese high schoolers; feels like a game you click through, not a website; Forage-style tasks; a metro world where each line is a different place; character the student identifies with; playful but trustworthy; runs on cheap phones.

### D3. Study references, don't copy them

Use Hallmark's study mode on screenshots Ryan provides (Forage task screens, Duolingo lesson flow, any games he likes) to extract principles: pacing, how one task fills a screen, button weight, feedback moments. Write the findings into `docs/design/references.md`. Never copy a brand's assets, logo, characters or exact look.

### D4. Three directions, static, before any code

Produce **3 distinct visual directions** as static screens (dashboard, one task question, one model-answer screen, one life-game step, the train ride) at phone size. Each direction gets a name, a palette, a type pairing and a one-paragraph rationale. Ryan and Oliver pick one (or mix). Only then build.

Two things each direction must solve:
- **The world changes by line.** Each line is its own place with its own background: 消費線 a night market, 信用線 a bank lobby, 投資線 a trading floor, 保險線 a hospital waiting room, 詐騙線 a dark alley of phone screens, 租屋線 a rental apartment, and so on. The metro platform appears only on the map and during the train ride.
- **The character needs real art.** Hand-drawn SVG circles will not get there. Options, in order of preference:
  1. A commissioned character in Rive (rigged, with state-machine moods). Rive has an avatar-creator tutorial and a React runtime.
  2. Oliver draws a character set in Figma; you rig it.
  3. A free illustration kit made for mix-and-match characters (check its license allows commercial use and modification).
  Until art exists, use a clearly temporary silhouette and say so. Do not polish the current character.

### D5. Then build, then review

Build the chosen direction behind the click-through structure from Part C. After each screen, run Impeccable's audit and Hallmark's audit, fix what they find, and take a phone-size screenshot. Ryan reviews screenshots, not code.

---

## Report

Same format as `00` section 5. Add:
- The station-by-station list from A1 (which were old, which are fixed).
- The new realism ranges if Part B changed them.
- Screenshots at 390×844 for every screen changed in Part C.

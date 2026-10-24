# Finline Redesign: Master Build Order

You are the lead engineer on Finline's biggest change so far. This package tells you exactly what to build: content, numbers, colors, layouts and order. Your job is to code it, verify it, and report honestly. Do not redesign what is specified here. Where the spec is silent, choose the simplest option that fits it and record the choice in your report.

This package is five files. Read all five before writing code.

| File | What it holds |
|---|---|
| `00-MASTER-PROMPT.md` (this file) | Orders, rules, stages, agents, gates, reporting |
| `01-DESIGN-SYSTEM.md` | Every color, font, spacing and motion token, and every screen's layout |
| `02-LIFE-GAME.md` | The life game: state, turn loop, numbers, events deck, unlocks, tests |
| `03-TASK-ENGINE.md` | The shared task engine: data model, task types, scoring, result contract |
| `04-CONTENT.md` | All new content for all 12 lines, in Traditional Chinese, ready to paste |

Two reference mockups come with the package: `mockups/Main.dc.html` (dashboard) and `mockups/Transition.dc.html` (train transition). They are design references, not code to import. They use a design-tool runtime (`support.js`) that does not exist in the repo. Match their layout and feel in our own React components. Put them in `docs/design/` for reference.

---

## 1. What we are building and why

Finline today is 12 separate simulations and 42 lesson stations. Each sim takes about 5 minutes to click through, and nothing makes a student come back. We sat in on a full-day financial literacy class run by an outside education group. Their two classroom games (a life-budget game and a "you are the bank" credit game) worked far better than slides. We also studied Forage's job simulations: role, real materials, a task, then a model answer.

The redesign turns Finline into **one life**:

1. A student signs up, creates a character, sets one goal, and boards a train.
2. The metro map is the world. Each line is a chapter. Each station is a short daily lesson: hook question, a short visual lesson, a task with real-looking Taiwanese documents, a model answer that names the psychology behind the student's choice, then one turn of the life game.
3. The **life game** is the backbone. The character earns, pays bills, saves, borrows, invests, insures, and faces random life events. Each line unlocks a new move in the game. The goal bar is passive income divided by salary. 100% is financial freedom.
4. The **dashboard** is the character's home screen: character in the middle standing on a metro platform, stat cards floating on the left, a small floating map on the right, today's stop below.
5. Between stations, a **train transition** plays: character boards, doors close, train whooshes away.

What stays: all checked figures, the profile thread (`financialSnapshot()` with `known` flags), the `kind` result contract, sticky `line_completions`, versioned pre/post banks, class mode, the mode toggle, the masked access code, accessibility fixes, and every regression test. **The landing page (`/`) stays exactly as it is.** Everything after login is redesigned.

---

## 2. Hard rules (read twice)

1. **CLAUDE.md wins on architecture facts.** If this package and the code disagree about how something works today, the code is right. Stop and report the conflict; do not silently bend either.
2. **The repo is public.** Never commit partner material: no outside organisation's slides, photos, wording, emails, or funding or team arrangements. Every idea in `04-CONTENT.md` is already rewritten in our own words. Do not add names of partner organisations to code, comments or commit messages. Refer to "the October class" if you must.
3. **Every figure has a named source in a code comment**, or is labelled on screen as `示意` (illustrative). Figures marked `VERIFY` in this package must be checked against the named primary source before they ship. If you cannot verify one, keep it labelled `示意`, list it in your report, and move on. Never invent a figure to fill a gap.
4. **Migrations are additive (expand/contract).** Next free number is **21** (production has 1 to 20; never re-run 20). Every migration gets a down file. Never run anything against production. Write the SQL, test it on local Postgres, and list it in your report with the exact order to apply.
5. **Old data keeps its meaning.** New result shapes are new `kind`s. Old rows must still parse, render and count. Old completions stay complete. Bank versions bump only when questions change.
6. **No spending makes the character look richer.** The character shows security (mood, options, open doors), never luxury items. This is a teaching rule, not a style choice. There is a test for it in Stage G.
7. **No heavy dependencies.** Animation is CSS transforms and SVG. No Rive, Lottie, Framer Motion, game engines or UI kits unless a stage below says so. If you believe one is needed, stop and justify it in your report first.
8. **Accessibility is not optional.** Real buttons and links, visible focus (3px, `--focus`), keyboard play for every task type, 44×44 minimum targets, 4.5:1 text contrast, `prefers-reduced-motion` honored everywhere, every animation skippable.
9. **Performance budget.** Every screen must work at 360px wide and on a low-end Android phone. Animations use `transform` and `opacity` only. Test with Playwright at 6× CPU throttle. Never depend on `requestAnimationFrame` to finish a state change: hidden tabs pause it (this bug shipped before). Use timeouts as the fallback for every `transitionend`.
10. **Copy rules.** Traditional Chinese (Taiwan usage), plain words, short sentences, no em dashes. Numbers use `NT$` and thousands separators. Nothing on screen reads like an article: a screen holds at most about 80 Chinese characters of body text unless it is a document the student is meant to read.
11. **No pushing.** Commit each stage on its own branch-local commits with clear messages. Never push, never merge to main, never deploy. Ryan pushes.
12. **No accounts or credentials on real services.** Create test students only on localhost.

---

## 3. How to run this job

### 3.1 Use a task list

Create a task list from the stages in section 4 before writing code. Keep it current. A stage is done only when its gate passes.

### 3.2 Use subagents, and boss them

You are expected to use subagents heavily. You stay the lead: you decide, they do bounded work and report back.

| Agent | Use it for | Rules |
|---|---|---|
| **Explore** (read-only) | Stage A audit: every file that touches lines, modules, sims, profile, dashboard, layouts, coach, certificate, class mode | Breadth "very thorough". Ask for file paths and line numbers, not opinions |
| **Fact-checker** (general-purpose, web) | Every `VERIFY` item in `02` and `04`, in parallel batches of 5 to 8 | Must open the primary source page, quote the exact figure, give the URL and date. A search snippet is not a source. Secondary sources only to corroborate |
| **Content agents** (general-purpose) | Converting `04-CONTENT.md` into typed content files, one agent per line | Give each agent the exact TypeScript types from Stage D. They paste content; they do not rewrite it |
| **Test writer** (general-purpose) | Writing the regression tests listed per stage | Each test must fail when the fix or feature is removed. Prove it by reverting once |
| **Fresh-eyes reviewer** (general-purpose) | End of every stage. Has not seen the work | Reviews the diff against this package and the hard rules. Reports defects only. You fix or justify each one |
| **Browser verifier** (general-purpose with Playwright) | End of every UI stage: 360px and 1440px, keyboard-only pass, reduced motion, 6× CPU throttle | Screenshots plus a list of failures. Real key presses, not synthetic events |

Run independent agents in parallel. Never let two agents edit the same file. Never let an agent push, run migrations on production, or change auth.

### 3.3 The gate (every stage)

A stage is done only when all of these pass:

1. `npm run check` (all tests plus `check-sim-contract`)
2. `npx tsc --noEmit`
3. eslint on source folders (0 errors)
4. `next build`
5. New tests for the stage exist and were proven to fail without the change
6. UI stages: browser verifier report clean at 360px and 1440px, keyboard-only, reduced motion
7. Fresh-eyes reviewer findings fixed or justified in the report
8. One commit (or a few) for the stage, not pushed

### 3.4 When to stop and ask

Stop, commit what is clean, and report when:

- A change would alter auth, sessions or the access-code system.
- A migration would drop, rename or rewrite existing data.
- Existing student progress, completions or results would change meaning.
- This package conflicts with the code (rule 1).
- A `VERIFY` figure is wrong in a way that changes a lesson's conclusion.
- You are about to add a dependency (rule 7).

Everything else: decide, record the decision, keep going.

---

## 4. Stages, in order

Priority: **P0** must ship, **P1** should ship, **P2** ship if P0 and P1 are green. Do them in this order. Stages marked parallel may overlap through subagents once their inputs exist.

### Stage A (P0): Audit and plan (read-only)

1. Explore agents map: `lib/lines.ts`, `lib/modules.ts`, `lib/sims/*`, `lib/outcomeTitle.ts`, `lib/coach.ts`, the profile reader (`financialSnapshot`), `lib/modeModel.ts`, `lib/buildStations.ts`, `lineStatus` and `requiredStations`, `line_completions` read/write paths, `app/dashboard`, `app/simulate`, `app/line/[slug]/*`, `components/sims/*`, `components/SiteHeader.tsx`, footer, `TourProvider`, `CoachPanel`, certificate, passport, class mode routes, `scripts/check-sim-contract.ts`, the test folder, `supabase/` migrations, `historicalPricesSeed.ts`.
2. Write `docs/redesign/plan.md`: for each stage below, the exact files to create and change, the data each screen reads, migration list, risks, and anything in this package that conflicts with the code.
3. Fact-checker agents start on every `VERIFY` item now, in parallel. Results go to `docs/redesign/sources.md` (figure, value, URL, date checked, quote).
4. Commit the two docs. Continue to Stage B unless a stop condition hit.

### Stage B (P0): Life game engine (pure logic, no UI)

Build `lib/lifeGame/` exactly per `02-LIFE-GAME.md`: state schema (zod, versioned), seeded RNG, turn loop, bill sheet, moves, events deck, unlock rules, stress, freedom bar, ledger check, ETF returns drawn from real 0050 monthly returns in `historical_prices`, card debt using the existing credit interest model. Migration 21 for saves. All tests in `02` section 9. No UI in this stage.

### Stage C (P0): Life game screen v0, placeholder art

Route `/play`. The turn screen per `01` section 6.4 with plain shapes, no character art yet. Persist and resume. Class mode: teams share a seed (`02` section 8). Gate includes: 5 full turns playable by keyboard only, resume after reload, same seed gives same events.

Ryan and Oliver will test this with real students before art. Make it fun with boxes first.

### Stage D (P0, parallel with C): Shared task engine

Build `components/tasks/*` and `lib/tasks/*` per `03-TASK-ENGINE.md`: brief, materials viewer (8 document types plus 3 simple cards: snapshot, price chart, news), 6 task types, model answer and bias reveal, scoring, result `kind`s, contract script coverage. Then content agents convert `04-CONTENT.md` into typed content files under `content/lines/<slug>.ts`, one agent per line.

### Stage E (P0): 信用線 rebuilt as the pilot line

Per `04` section 4: the four new tasks including **You Are the Bank** (all 18 applicant files) and reading your first statement. Reuse the existing interest engine. Writes `creditRecord` to the profile exactly as today. Unlocks the card and borrowing moves in the life game. Old `xinyong` results still render.

### Stage F (P0): New dashboard and the game shell

Per `01` sections 5 and 6.1. Route group `app/(game)/` with its own layout: **no SiteHeader, no footer**, station background, floating cards. `/dashboard` and `/simulate` both render the new home (mode-aware). Keep `homeFor()` and every route the regression tests cover; update tests only where a behavior is meant to change, and say which. The landing page and its layout are untouched.

### Stage G (P1): Character creator, avatar, onboarding

Per `01` section 6.2 and 6.3. Avatar parts as SVG layer components, stored as JSON on the student (migration 22). Mood derived from life-game state. Onboarding after signup: create character → set one SMART goal (`04` section 1.3) → first train ride → dashboard. Existing students see the creator once on next login, skippable. Test: no avatar part or visual state is tied to spending amount or purchases (rule 6).

### Stage H (P1): Train transition

Per `01` section 7.3. `<TrainTransition from to onDone>`. Total 2.6s in product, skippable from frame one, auto-short (0.4s fade) after a student has seen the full ride 3 times, instant crossfade under reduced motion. Plays between stations and when changing lines. Timeouts back up every `transitionend`.

### Stage I (P1): Why-first layer on every line

Per `04` section 2: a hook question, a bias reveal and a takeaway framework for every line. Station pages and sim results show them per `01` section 6.5. Content only plus one shared component.

### Stage J (P1): Convert the remaining lines

Order: 消費線, 存錢線, 投資線, 保險線, 詐騙線, 職涯線, 學貸線, 報稅線, 租屋線, 創業線, 財務決策線. Each per its section in `04`. One line per commit. Each new sim is a new `kind`; old kinds still render. Each line wires its unlock into the life game. Bank versions bump only for lines whose pre/post questions change (listed in `04`).

### Stage K (P1): Streaks, today's stop, certificate progress

Per `01` section 5 and `02` section 7. Migration 23 for daily activity. Streak counts days (Asia/Taipei) with at least one completed station task or life-game turn. Today's stop logic per `02` section 7.2. Certificate progress on the dashboard. No email or LINE reminders.

### Stage L (P2): Polish and the full verification pass

1. Full browser verification of every route at 360px and 1440px, keyboard-only, reduced motion, 6× CPU throttle.
2. Lighthouse on `/dashboard`, `/play` and one station: performance ≥ 85 mobile, accessibility ≥ 95.
3. Fresh-eyes reviewer on the whole branch against all five files.
4. Update `CLAUDE.md` with the new architecture (life game, task engine, game shell, new kinds, migrations 21 to 23). Keep it factual and short.

---

## 5. What the final report must contain

Plain wording, short sentences, no em dashes. Ryan reads every report.

1. **Commits table:** hash, stage, one line.
2. **Migrations to run, in order,** each with what it does and whether it is safe before or after deploy.
3. **What was verified and how** (tests, browser, local Postgres). What was not verified, said plainly.
4. **Decisions you made** where the package was silent.
5. **Where you departed from the package and why.**
6. **VERIFY results:** every figure, verified or not, with source.
7. **Open questions** for Ryan and Oliver, at most 8, each one line.
8. **What a student sees now,** walked through from signup to the end of 信用線, in about 10 lines.

Do not claim anything you did not see happen. If a check was skipped, say so.

---

## 6. Defaults already decided (do not ask about these)

| Question | Decision |
|---|---|
| Turn length | One turn is one month. After 投資線 unlocks, the student may fast-forward 12 months on autopilot (same plan each month, events still drawn) |
| Job | From 職涯線 if done. If not, the game assigns one of 4 starter jobs at random (`02` section 3.1) and says so |
| Old 學習 mode | Stays. Lesson pages remain readable. The daily lesson wraps them; it does not delete them |
| Art | SVG layer components now, built so a real artist's parts can replace them later |
| Reminders | On-site streak only. No email, no LINE |
| Dark mode | The game shell has one look (the lit station). Do not build a dark theme for it in this job |
| Language | Traditional Chinese only for student-facing copy |

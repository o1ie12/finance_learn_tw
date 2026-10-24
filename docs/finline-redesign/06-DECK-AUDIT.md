# 06. Partner deck audit (60 slides vs Finline)

Source: a partner organisation's class deck, 60 pages (10/22). Used as a checklist of ideas only.

**Hard rules for this file**
- Rebuild every idea in our own words, our own numbers and our own drawings. Do not copy slide text, images, layouts or posters.
- No partner or agency names, logos or slide references in the repo, in the UI or in commit messages.
- Every real-world fact we add goes through the VERIFY list below before it ships. The deck has errors (see section 3). Do not trust it.
- Audited against the 12 lines and task sets in `04-CONTENT.md` plus the report on `fix/playtest-05`. Claude Code maps each GAP to a station id in `lib/modules.ts` (match by topic, as in A4).

Legend: COVERED = we already teach it. GAP = missing, worth adding. SKIP = not for us.

---

## 1. Slide by slide

Note: the PDF has 2 slides per page, so about 120 slides. The numbers in the first column are approximate slide order, grouped by topic. Match by topic, not by number.

| Slides | Idea | Verdict | Where it goes |
|---|---|---|---|
| 1-5 | Why learn finance, iceberg, the 7-part money cycle, daily decisions | COVERED | `04` section 1.1 and 1.2 |
| 6-8 | Eisenhower matrix, ESBI quadrant, 5W1H, Golden Circle | SKIP | ESBI only as one lesson card on 職涯線 (employee vs self-employed vs owner), optional |
| 9-11 | Ikigai, 1111/104/UCAN sites, rarity rule (25% x 3) | COVERED (Ikigai via 興趣地圖). Rarity rule: small GAP | add one `formula` card to 職涯線 Task A. Do not name the job sites |
| 12 | Subsidy for training yourself (產業人才投資方案) | SKIP | niche, rules change. Revisit only if VERIFY passes |
| 13 | Deposit insurance, NT$3,000,000 per bank | GAP | 存錢線 lesson card: 「存款有保障，但每家銀行有上限」 + one `ChoiceStep` (split NT$4M?). VERIFY the cap and what it covers |
| 14-17 | SMART goal, laptop and scooter monthly saving, 4-step plan loop | COVERED | 存錢線 Task A, onboarding goal cards |
| 18 | New vs used scooter, first-year budget (one-off, fixed, surprise costs) | GAP, high value | new task 「機車的真實成本」 (below) |
| 19-20 | Income 56,000 vs spend 53,600 with a gap, three fixes: cut, earn more, stretch the timeline | GAP, high value | new task 「預算缺口」 (below) |
| 21 | Full-cost iceberg | GAP | merge into 「機車的真實成本」 |
| 22-23 | Two savers (early vs late), saving-efficiency table, behaviour rules | GAP | merge into the compound-interest task (below) |
| 24 | Simple vs compound interest, four tools (iceberg, stairs, gears, curve) | GAP, high value | 存錢線 Task C 「複利」 |
| 25-26 | Fixed / variable / emotional spending; 10-second spending firewall with 3 gates | GAP | 消費線 lesson card + life-game stress event 「情緒消費」 |
| 27 | Spending splits (50/20/10/10/10, student 60/20/10/10) | GAP, small | one `compare` card in 消費線 Task A. Present as examples, not rules |
| 28 | Monthly budget form, takeaways, homework (3-day log, 3-month goal) | COVERED | life-game 記帳 step + goal cards |
| 29 | Credit as an invisible asset | COVERED | 信用線 Bank task cards |
| 30 (deck p21) | Personal trust score, borrowing logic (need it? can repay? when?) | COVERED | Task C 「借錢兩問」 |
| 31 | Where credit is used in life (job, rent, card, loan, business, migration) | GAP, small | use as the 信用線 map art: a staircase of unlocks. No new task |
| 32 | Anti-scam poster, 多問多查多確定, 165 | COVERED | 詐騙線 「防詐三不」 |
| 33 | How banks evaluate you (basics, assets, debt pressure, card record, risk flags); free national credit report once a year | COVERED mostly. GAP: the free report | 信用線 deep card + one `ChoiceStep`: 「怎麼查自己的信用？」. VERIFY price and frequency |
| 34 | Unsecured debt cap, 22x monthly income | GAP | add to the existing Bank lesson card only after VERIFY (already a VERIFY item in `04`). Do not say "law" unless verified |
| 35 | Deadly-wound list: stop-card, over-debt, too many applications, guarantor, income risk, no data | COVERED | Bank files 2, 7, 8, 11, 12, 16, 17 |
| 36-37 | Digital finance, payment networks | SKIP | not decision-relevant. 3-do/3-don't is COVERED by Task D |
| 38 | Good debt vs bad debt | GAP | 信用線 `compare` card + one `SortStep` (學費, 機車, 手機分期, 球鞋分期, 創業貸款, 刷卡聚餐). Teach "good debt" carefully: a loan that buys an income or skill, still must be repayable |
| 39 | Secured vs unsecured, four checks before borrowing (amount/term/rate, how rate changes, early-repay limits, hidden fees) | GAP | 信用線 new task 「借款前四問」: read a fictional loan offer, `FindStep` the four items |
| 40 | Joint vs general guarantor | GAP | extend Task C step 3 with a `compare` card. Our `guarantor` event already exists. VERIFY the legal difference |
| 41-42 | Card statement iceberg, minimum payment trap, interest from posting date, 15% cap | COVERED | Task A. This is our strongest content |
| 43 | Rule of 72, debt doubling vs deposit doubling | GAP, high value | merge into compound-interest task with engine numbers |
| 44 | Card behaviour profile (payment tool not credit tool, budget cap, record spending daily, pay in full) | COVERED | takeaway 「看帳單三步」. Add "set a monthly cap" |
| 45 | Debt crisis table: snowball vs avalanche | GAP, high value | 信用線 new task + life-game 還卡債 move asks the order |
| 46-47 | Don't avoid, contact the lender; consolidation vs negotiation | GAP | in the snowball task as a final `ChoiceStep`. VERIFY the real conditions. The deck ties negotiation to 22x, which is probably wrong |
| 48 | Compass summary, "credit takes years to build" | COVERED | line ending text |
| 49-50 | Risk is everywhere, superstition vs reality | COVERED | 保險線 hook and reveal |
| 51-55 | Avoid / prevent / transfer; before, during, after; insurance as mutual aid; loss/probability matrix; premium is a cost | COVERED | 風險四格 task. GAP: 「保險不是投資」 (below) |
| 56-58 | Three roles (要保人, 被保險人, 受益人) | GAP | 保險線 lesson card + `SortStep` (who is who in a family scenario) |
| 59-60 | Four life risks, insurance map | COVERED | 保險線 Task B |
| 61-62 | Car and scooter insurance layers; life insurance as three lines of defence | GAP, high value for teens | new task 「機車保險三層」 (below) |
| 63-64 | Lever principle, time principle (cover big and near risks first, at which age) | GAP | takeaway of 風險四格 already says it. Add "保近不保遠" as a lesson card in Task B |
| 65-66 | Why premiums differ, policy adjustment (surrender, reduced paid-up, extended term) | GAP, small | deep station only. Not for 16-year-olds' first pass |
| 67-70 | Action checklist, "buying the wrong policy is worse than none" (right product, enough cover) | COVERED in spirit | 保險線 ending text |
| 71-73 | Protection-type vs savings-type policies, protection gap formula (need minus existing resources), gap sizes for death, medical, long-term care | GAP | one `formula` card in 保險線 Task B. Numbers are adult-oriented, do not show to 16-year-olds |
| 74-76 | Term life + invest the difference vs whole life, 5 million comparison | GAP, handle with care | see section 3. Teach the reasoning, not the product verdict |
| 77-78 | Protect first then invest; adults before kids; golden triangle | COVERED / SKIP | "先保險再投資" is in 投資線 Task A. Skip "adults before kids" |
| 79 | Five-step insurance blueprint | SKIP | adult planning |
| 80-81 | Why invest: inflation shrinks 100 to about 55 in 15 years | GAP, high value | 投資線 Task A lesson card + `priceChart`-style chart. Use our own computation |
| 82 | Risk-return triangle, "guaranteed principal and high return" breaks the rules | GAP, high value | 投資線 new task and link to 詐騙線 case 3 |
| 83 | Prerequisites: emergency fund, pay high-interest debt, saving first, no borrowing to invest | COVERED | 投資線 Task A. Bank file 8 and 18 reinforce it |
| 84 | Deposits as the safe tool, CDIC | GAP | same card as slide 13 |
| 85 | Personal risk tolerance diagnosis (time horizon, goal importance, personal situation) | GAP, high value | 投資線 Task D |
| 86-88 | Asset allocation X/Y/Z, diversification across industries and companies | GAP, high value | 投資線 Task D |
| 89 | Instrument spectrum from deposits to futures | GAP | `SortStep` in Task D |
| 90-92 | Three disciplines, five-step wealth loop, biggest risk is yourself | COVERED / GAP small | takeaway 「大跌時三不」. Add 「聽不懂不買」 as a one-line rule |
| 93 | Time as buffer by age band | GAP, small | one `compare` card in Task D |
| 94-96 | Simple vs compound, 40-year gap, Buffett snowball | GAP, high value | compound-interest task. Use a realistic rate (see section 3) |
| 97 | Compounding applies to skills, 1.1^10 and 1.2^10 | GAP, small | one `formula` card. Fix the wording (see section 3) |
| 98-101 | TISA fund: low fee, monthly auto-invest, minimum NT$1,000, 24-month rule | GAP | VERIFY first (rules change). If it holds, a deep station on 投資線 |
| 102-105 | Walking down Wall Street, 10 investing rules | PARTLY COVERED | rules 1 to 3, 6, 8, 10 are already our takeaways. Skip the list as a list |
| 106 | Passive index ETF is the beginner answer, avoid leveraged, inverse, factor ETFs | COVERED | 投資線 Task B |
| 107 | Retirement calculator: NT$20M in 30 years, how much per year | GAP | 投資線 deep `NumberStep`, computed by the engine at three rates |
| 108 | Seven concepts wrap-up | COVERED | same as our 七件事 |

**Honest summary:** the deck is mostly a wider, more adult version of what we teach. We already beat it on credit statements, the bank rating game, scams and the life game. We are weak where it is strong: compound interest, real cost of owning something, insurance for a scooter, risk tolerance and diversification, and what to do when you are already in debt.

---

## 2. What to add (ranked, 9 additions, not 40)

Each is a new `TaskSet` in the existing engine, same 5-step flow, answers server-side, all numbers from the engine or a stated formula. Keep one idea per task.

**P1 (do first, they change what students do)**

1. **預算缺口** (消費線 or 存錢線). A fictional person earns NT$56,000, plans NT$53,600 of spending, then a full-year budget exposes a gap of about NT$3,400 once one-off and surprise costs are added. `NumberStep` for the gap, then `ChoiceStep`: cut spending / earn more / stretch the timeline, with a reason. Model answer shows all three with the numbers, and says there is no single right answer, only the one you can keep doing. Use our own numbers, not the deck's.
2. **機車的真實成本** (消費線). New vs used scooter. Materials: a `billSheet` with price, license, plate, insurance, fuel, repairs, parking. `NumberStep` for the first-year cost, `ChoiceStep` for which is cheaper over three years. Reveal: 冰山 (the sticker price is the tip).
3. **複利與 72 法則** (存錢線 Task C). Two savers, one starts at 18 and one at 28, same monthly amount, engine compound at 2% and at a realistic market rate. Then the rule of 72 on a card debt at 15%: debt doubles in about 5 years, a deposit at 1.7% in about 42. Connects straight to our card interest engine.
4. **雪球還是雪崩** (信用線 new task, also a life-game 還卡債 choice). Four debts (學貸 1.2%, 信貸 7%, 卡債 15%, 朋友借款 0%). Student orders the payoff and the engine runs both strategies and shows total interest and months. Final `ChoiceStep`: "還不出來時先做什麼？" Correct: contact the lender early. Reveal: avoidance. VERIFY the consolidation and negotiation rules before adding them.
5. **機車保險三層** (保險線). One crash scene. Three layers: the compulsory cover, the third-party cover, the top-up cover. `SortStep` matches each loss to the layer that pays, with a "nothing pays" box (your own bike, your own injury). VERIFY the layer names and what each covers in Taiwan. Most useful insurance lesson for a 16-year-old who rides.

**P2**

6. **風險承受度與分散** (投資線 Task D). Three people (age, goal date, income stability). `ChoiceStep`: who can take risk. Then an allocation `SortStep` of instruments (活存, 定存, 債券 ETF, 大盤 ETF, 單一股票, 加密貨幣, 期貨) into 低 / 中 / 高 risk, then a one-question diversification check. Rule shown: "錢什麼時候要用" decides first.
7. **通膨與「保本高報酬」** (投資線 Task A card + Task E). A chart of NT$100 under 3% and 4% inflation. Then a scam-style pitch: "保證 8% 還能隨時領回". `FindStep` the impossible claim. Reveal ties to 詐騙線 case 3.
8. **好債與壞債 + 借款前四問** (信用線). `SortStep` of six debts, then read a fictional loan offer and `FindStep` the four items to check (amount/term/rate, how the rate can change, early-repay limits, hidden fees).
9. **情緒消費防火牆** (消費線 + life game). Add a life-game stress event 「情緒消費」: a bad day with a tempting purchase, answer three gate questions (需要嗎, 等 10 秒後還想要嗎, 付得起嗎) or skip. It shows up as a real choice, not a lecture.

**Small cards (no new task)**
- Deposit insurance cap: 存錢線 card + one question.
- Free credit report from the national bureau: 信用線 deep card. VERIFY.
- Joint vs general guarantor: `compare` card in Task C.
- 要保人 / 被保險人 / 受益人: card in 保險線 Task B.
- Student budget splits as examples: card in 消費線 Task A.
- The staircase of things credit unlocks: art for the 信用線 map.
- Retirement calculator (PMT) and TISA: deep stations, only after VERIFY.

---

## 3. Errors and traps in the deck (do not repeat)

1. **Inflation chart:** says NT$100 becomes 54 after 15 years at 4%. 100 ÷ 1.04^15 is about 55.5. The deck used (1 - 0.04)^15. Our card must compute it properly.
2. **Compound chart:** NT$100,000 at 15% for 40 years. 15% a year for 40 years is not a realistic market return and teaches a fantasy. Use 5 to 7% and say the rate is not guaranteed.
3. **"Improve 10% a day for 10 years":** the formula uses years. Say "每年進步 10%".
4. **Term life + invest the difference** compares NT$13,365 against NT$156,915 a year, assumes a guaranteed 5% return for 20 years, and ignores that term cover ends and whole life has a cash value. It is a one-sided sales argument. If we teach it, we show both sides: what each gives you at year 20 and year 40, what happens if you stop investing, and that a return is never guaranteed. Our line stays "先弄懂它是保障還是儲蓄", not "buy term".
5. **"法律規定" on the 22x debt cap:** probably a regulator-and-banks rule, not a statute. Say "金融機構的規範" unless VERIFY says otherwise.
6. **Negotiation "only when debt is over 22x":** do not repeat. Real eligibility rules differ.
7. **"信用 takes years, can collapse overnight":** fine as a feeling, but do not teach a fixed score like 750. We have no verified score range yet.
8. **Retirement NT$20,000,000 target:** a round number with no basis. Our retirement exercise must start from the student's own income and spending, not a stock target.

---

## 4. VERIFY list (fact-checker agents, official sources only)

1. Deposit insurance cap per depositor per institution, and what is covered (foreign currency, interest).
2. Free national credit report: how many a year, price after the first, how to request.
3. Unsecured-debt cap relative to monthly income: who set it, what it applies to, exact multiple.
4. Joint vs general guarantor: the legal difference.
5. Debt consolidation and pre-negotiation: eligibility, effects on the record.
6. Taiwan scooter and car insurance layers: names, what each pays, which are mandatory.
7. Insurance roles (policyholder, insured, beneficiary): standard wording.
8. TISA: launch status, minimum amount, fee ceiling, the 24-month rule, which institutions.
9. Student loan, tax and card constants already in the repo stay as verified. Do not change them from the deck.
10. Anything new with a number gets a source or a 示意 flag, per `03` section 5.

---

## 5. Order of work

1. Finish Parts A to C and push (already approved while there are no students).
2. Content additions P1 (tasks 1 to 5), one subagent per line, at most 3 at once.
3. VERIFY list runs in parallel. Nothing in P2 or the small cards ships before its check passes.
4. Part E (design build spec, at the end of this file) replaces Part D. Do not run the "three directions" step. Ryan and Oliver review at the two stop-points in E16 (after the character, after the first full station).
5. P2 and small cards after the design reboot, so the new tasks are built once in the new look.


---
---

# PART E. DESIGN BUILD SPEC (replaces `05` Part D and supersedes `01` sections 2, 3, 5, 6)

> **Superseded by docs/design/ (professional course-platform redesign). Part F and the audit content still apply.**

**How to use this part.** Everything below is decided. Do not run the Part D "three directions" process; Ryan's brief was: Apple-grade UI, simple-game character art, keep the old metro look but with more soul, Forage-like (real work, real teaching, but it plays like a game). This part is the direction. Claude Code only codes it.

**Conflicts.** Where this part disagrees with `01-DESIGN-SYSTEM.md`:
- `01` sections 2 (colors), 3 (type), 5 (components), 6 (screens): **this part wins.**
- `01` section 7.3 (train transition) and section 8 (documents): **still apply**, with the adjustments in E7.6 and E11.
- `03` (task engine), `04` (content), Parts A to C of `05`: unchanged. The click-through rule in Part C is now enforced by the layouts in E8.

**Reference prototypes** (real renders, in `mockups/`; the numbers in this spec were taken from them):

| File | What it is |
|---|---|
| `tokens.css` | The complete token sheet. Copy it into `app/globals.css` (adapt `@theme`, see E2.1) |
| `character.js` | The character as a pure function returning an SVG string. Port to a React component (E10) |
| `scenes.js` | Two world scenes (platform, bank). Pattern for the other 10 (E9.4) |
| `screens.mjs` | Builds 4 phone screens and 1 desktop screen. CSS in it is the component CSS (E7) |
| `screens.png`, `screens-dark.png`, `desktop.png`, `sheet.png` | Renders: phone light, phone dark, desktop, character contact sheet |
| `spring.py` | Generates the two spring curves (E12) |
| `shot.py` | Playwright screenshot helper, used by the acceptance tests (E18) |

The prototypes use approximate fonts (see E4). Real fonts change line breaks slightly. Everything else is exact.

---

## E1. Design thesis

**One sentence.** Finline is a metro line you ride to learn money: the world is a place (a platform, a bank lobby, a night market), the job is real paperwork, and the progress is the yellow tactile strip at the platform edge.

**What we keep from the old look** (Ryan: "keep the design style from way past"): the metro world, the line colors from `lib/lines.ts`, the station sign as the title of every place, the yellow tactile strip, the Finline name plate, the character standing in the scene, the train ride between stations.

**What changes** (the AI-slop fixes, each one observed in the playtest):

| Was | Is | Why |
|---|---|---|
| Frosted-glass cards floating over the scene, blurred text | Solid white cards. Blur only on the top bar and the tab bar | Apple: material belongs to the functional layer, never the content layer (`materials.md`: Liquid Glass and blur belong to the functional layer, not the content layer) |
| Every element a different pill, shadow and radius | 6 radii (including pill), 3 elevations, one primary button | Craft: one system, not many accents |
| Colored gradient buttons | Ink-black primary button, one per view | `buttons.md › Best practices`: one or two prominent buttons per view; use style, not size, to prefer an option |
| Emoji and generic icons | One SVG icon set, 2.2px round stroke, filled when active | UI UX Pro Max: SVG icons, no emoji |
| Hand-drawn circles for a character | A proportioned flat character with a rig (E10) | Ryan: "character design from simple games" |
| Progress bar as a generic blue bar | **The tactile strip**: 8px yellow bar with dark dashes every 18px | The signature (below) |
| Scrolling pages | One thing per screen (Part C), enforced in E8 | Forage pacing |
| Same station platform on every page | A different world per line (E9.4) | `05` D4: "the world changes by line" |

**The signature (the one thing the product is remembered by).** The **tactile-strip progress rail**: a yellow platform-edge bar that fills as you move through a station, under the top bar of every task screen, with `repeating-linear-gradient(90deg, signal 0 16px, signal-deep 16px 18px)`. It is a real object from the real station, it carries real information (how far along), and it is the only saturated yellow in the UI. Everything else is quiet on purpose.

**The second memorable thing: the voice.** Questions and key sentences are set in **Huninn** (a rounded, friendly Traditional Chinese face), everything functional in Inter and Noto Sans TC. The voice font is the soul; the UI font is the professionalism. That split is the "Forage plus game" mix: the work is set like documents, the teaching speaks like a person.

**What we cut after critique** (so Claude Code does not add it back):
- No parallax, no confetti, no floating decorations, no gradient backgrounds.
- No glass on cards. No inner glows. No 3D.
- No in-app dark mode toggle (Apple: follow the system, `dark-mode.md › Best practices`).
- No sounds by default (E13).
- No streak shaming, no fake urgency, no timers on answers (`accessibility.md`: limit time-boxed UI).

---

## E2. Tokens

### E2.1 Where they live
- `app/globals.css`: paste the `:root`, dark, and `@media` blocks from `mockups/tokens.css` as-is.
- Tailwind v4: expose them with `@theme inline { --color-ink: var(--ink); ... }` so classes like `bg-surface`, `text-ink-2`, `rounded-md` work. **Components may not contain raw hex.** (Exceptions: the character and scene SVG files, which are art.)
- `--line` is set per page on a wrapper: `<div style={{ '--line': line.color } as CSSProperties}>`. `--line-ink` and `--line-soft` are derived in CSS (see `tokens.css`).

### E2.2 Color (light)

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F3F5F8` | Page ground behind content |
| `--surface` | `#FFFFFF` | Cards, documents, sheets |
| `--surface-2` | `#F7F9FB` | Inset areas, option rows, document header |
| `--ink` | `#15202B` | Text, primary button, name plate, sign |
| `--ink-2` | `#3D4A57` | Secondary text |
| `--ink-3` | `#5F6C79` | Captions, labels, inactive tab |
| `--ink-inv` / `--ink-inv-2` | `#FFFFFF` / `#C9D3DB` | Text on ink |
| `--hairline` / `--hairline-strong` | `rgba(21,32,43,.10)` / `.20` | Dividers / control outlines |
| `--track` | `#DDE3E8` | Empty rail, disabled button |
| `--signal` / `--signal-deep` | `#F2C200` / `#D9A900` | Tactile strip only |
| `--focus` | `#1F5FB8` | Focus ring: 3px, offset 2px |
| `--good` `--warn` `--bad` `--info` `--money` | `#0B6E51` `#8F4B00` `#B3261E` `#1F5FB8` `#8A6508` | Meaning text and icons. Soft backgrounds: `#E3F3EC` `#FFF1DE` `#FDE7E7` `#E6EEFB` |

Rules:
- **Meaning is never color alone.** Every use of good/warn/bad pairs with an icon or a word (`accessibility.md`, `color.md`).
- **Signal yellow is never text and never a fill for anything but the tactile strip.** (Yellow on white fails contrast; it is a physical object, not a UI color.)
- **One color, one meaning** (`color.md › Best practices`: "Avoid using the same color to mean different things"). `--info` blue is informational status only (the emergency-fund bar, info banners). The document-type badge is therefore neutral (`--track` background, `--ink-2` text), not blue, and the focus ring is the only blue outline.
- **Charts and markets never use red or green.** In Taiwan, red means a price went up and green means it went down, the reverse of `--good` and `--bad` everywhere else in the app. `color.md › Inclusive color` uses exactly this case (a rising stock drawn green in English and red in Chinese). So: no chart, price, candle or market scene uses red or green. Use `--ink` lines, ▲ and ▼ glyphs, and the words 漲 and 跌.
- **Line color** appears only as: the station sign's side stripes, the `.chip` (as `--line-ink` on `--line-soft`), the small label above a question, a 4px top border on a line's cards, and the train stripe. Never as button fill.

### E2.3 Color (dark; follows the system, no toggle)

Paper `#0E141B`, surface `#19222C`, surface-2 `#202B37`, ink `#F2F5F8`, ink-2 `#C4CED8`, ink-3 `#9AA7B4`, track `#2C3947`, good `#3DC79A`, warn `#FFB04D`, bad `#FF8A80`, info `#7FB0FF`, money `#E0B84A`. Primary button inverts (white on dark: `--ink-inv` becomes `#15202B`). Scenes get `filter: brightness(.5) saturate(.9)` (the `.scene` rule). Material becomes `rgba(25,34,44,.72)`. Shadows become black at .4 to .55.

**Increased contrast** (`color.md`: supply light, dark and increased-contrast variants for each custom color). `tokens.css` has `@media (prefers-contrast: more)` blocks, light and dark. Light: `--good #075A41` (8.24 on white), `--warn #6E3900` (9.34), `--bad #8F1912` (9.07), `--info #154A94` (8.61), `--money #6B4E04` (7.73), `--ink-2 #26313C` (13.23), `--ink-3 #3D4A57` (9.07), hairlines `.45` and `.65`. Dark: `--good #7FE6BF` (10.70 on surface), `--warn #FFC680` (10.44), `--bad #FFB0A8` (9.21), `--info #A9CBFF` (9.70), `--money #F0CB6E` (10.31), `--ink-3 #C4CED8` (10.08).

Apple targets 4.5:1 minimum and 7:1 where possible in dark (`dark-mode.md › Best practices`); the table below is measured, not estimated.

### E2.4 Measured contrast (WCAG 2.x; reproduce with the E18 script)

| Pair | Ratio | Needs |
|---|---|---|
| ink on surface | 16.49 | 4.5 |
| ink-2 on surface | 9.07 | 4.5 |
| ink-3 on surface / on paper | 5.37 / 4.92 | 4.5 |
| white on ink (primary button) | 16.49 | 4.5 |
| good / warn / bad / info / money on white | 5.44 / 5.95 / 5.53 / 5.31 / 5.32 | 4.5 |
| focus ring on paper | 6.20 | 3 |
| dark: ink / ink-3 / good / bad / warn / info on surface | 14.69 / 6.55 / 6.25 / 6.67 / 7.61 / 6.55 | 4.5 (aim 7) |

Also measured: dark ink-3 on surface-2 5.85, dark ink-3 on paper 7.55, dark ink-2 on surface-2 9.01, ink-3 on surface-2 (light) 5.09, sign English line `#C9D3DB` on ink 10.86. One known miss: **ink-3 on track is 4.15** (the label of a disabled primary button). WCAG exempts disabled controls, so it ships, but disabled buttons must also carry `aria-disabled="true"` and a visible reason nearby (for example the helper line 「選一個答案」), so a disabled state never relies on the dim label alone.

### E2.5 Line colors: a build check
`lib/lines.ts` colors are fixed. For **each of the 12**, the E18 contrast script must check: (a) `--line-ink` on `--line-soft` ≥ 4.5 (the chip text); (b) `--line` against `--surface` ≥ 3 (a stripe and the 4px border are graphics: 3:1). (c) white text on `--line` ≥ 3 (the scene sign uses 20px bold white text, which counts as large text). If a line fails (a), the CSS `color-mix` percentage for `--line-ink` is lowered (darker) **for that line only** via an optional `lineInk` override in `lib/lines.ts`. Report any line that needed one. Never change a line's base color.

### E2.6 Shape, elevation, space

| Token | Value | Use |
|---|---|---|
| `--r-xs` 8 · `--r-sm` 12 · `--r-md` 16 · `--r-lg` 20 · `--r-xl` 28 · `--r-pill` 999 | px | xs: badge, sign. sm: name plate. md: buttons, options, documents. lg: cards, rating options. xl: sheet top corners. pill: chips, tab pills |
| `--e1` | `0 1px 2px rgba(21,32,43,.06), 0 2px 8px rgba(21,32,43,.05)` | Documents, pills |
| `--e2` | `0 1px 2px rgba(21,32,43,.06), 0 8px 24px rgba(21,32,43,.10)` | Cards, bubbles, sign |
| `--e3` | `0 2px 4px rgba(21,32,43,.08), 0 16px 40px rgba(21,32,43,.16)` | Sheets, today's-stop card |
| Space | `4 8 12 16 20 24 32 40 56` | 4pt grid. **No other spacing values.** Screen gutter 16px (20px inside a sheet) |

Progressive enhancement: `@supports (corner-shape: squircle)` adds the class `.squircle` (Apple-style continuous corners). Put `.squircle` on buttons, cards and sheets. Browsers without support show normal rounded corners; no one is worse off.

---

## E3. Layout and breakpoints

Apple's rule is size classes, not device types: same functions at every size, layout follows available space (`layout.md › Best practices`). We use two layouts:

| Layout | Width | Behavior |
|---|---|---|
| **Compact** (default, mobile-first) | < 840px | One column. Top bar 56px, tab bar 56px + safe area. Task screens are full-screen. Hook and reveal use a bottom sheet |
| **Regular** | ≥ 840px | Max content width 1120px, centered. Tasks use two panes: document 600px left, question 420px right, gap 28px (see `desktop.png`). Tab bar becomes a left rail 88px wide with the same four tabs (single-word labels). Sheets become centered dialogs 480px wide, `--r-xl`, `--e3`, with a dimmed backdrop `rgba(14,20,27,.45)` |

- **Safe areas.** `padding-top: env(safe-area-inset-top)` on the top bar; `padding-bottom: max(34px, env(safe-area-inset-bottom))` under the primary button and tab bar. `viewport-fit=cover` in the meta tag.
- **Height.** Use `100dvh`, never `100vh`. The page itself never scrolls (Part C); inner viewers (a document, the life-game card row) scroll inside their own box.
- **Large text exception (important).** HIG wants text to scale to 200% (`accessibility.md › Text sizes`). When the student's system text size makes a question screen taller than the viewport, **the question body scrolls inside its own region** (`overflow-y:auto` on the middle region; header, primary button and tab bar stay fixed). That is the one allowed scroll. Do not shrink text to make it fit. The Playwright no-scroll test (E18) runs at default text size.
- **Reach.** The primary action is always at the bottom, inside the thumb zone. Close (✕) is top right, back (‹) top left, both 44×44.
- **One interaction per screen** (`accessibility.md`: break multistep flows into one interaction per screen).

---

## E4. Type

### E4.1 Fonts and loading

| Role | Family | Weights | Load |
|---|---|---|---|
| UI (Latin, numbers) | **Inter** | 400, 500, 600, 700 | `next/font/google`, `variable`, subsets `['latin']`, `display:'swap'`, `adjustFontFallback` on |
| UI (Chinese) | **Noto Sans TC** | 400, 500, 700 | `next/font/google`, `preload:false` (the CJK file is large; it loads by unicode-range as needed), `display:'swap'` |
| Voice | **Huninn** | 400 only (the page asks for 500; the browser uses 400; see note) | `next/font/google`, `preload:false`, `display:'swap'` |
| Signs (English line name) | **Barlow Condensed** | 600 | `next/font/google`, `subsets:['latin']`, only used on the station sign's small caps line |

Stacks are in `tokens.css` (`--font-ui`, `--font-voice`, `--font-sign`). Note on Huninn: it ships one weight. Do **not** use `font-weight:700` on it (it would fake-bold and look smeared). For emphasis inside voice text use a color change or `<mark>`-style underline, not bold.

**Budget.** Latin subsets together under 120KB; no CJK font file preloaded; total font requests on first screen ≤ 4. If the Chinese fonts have not loaded, text renders in the system CJK fallback (PingFang TC, Microsoft JhengHei) with no layout jump: `size-adjust` is set by `next/font`. CLS must stay under 0.1 (E17).

### E4.2 Scale (iOS "Large" sizes from `typography.md`, with Chinese line height)

| Style | Size / line | Weight | Font | Use |
|---|---|---|---|---|
| Large title | 34 / 44 | 400 | voice | Reveal headline (「最低應繳的錨定」) |
| Title 1 | 28 / 36 | 400 | voice | Hook question on desktop |
| Title 2 | 24 / 34 | 400 | voice | Hook question in a sheet |
| Title 3 | 22 / 32 | 400 | voice | Today's-stop question |
| Headline | 17 / 24 | 700 | UI | Bar title, document title, card title |
| Body | 17 / 28 | 400 | UI | Reading text. **28px line height for Chinese** (the Latin 22px is too tight for CJK) |
| Callout | 16 / 24 | 500 | voice or UI | Bubble |
| Subhead | 15 / 22 | 600 | UI | Document values |
| Footnote | 13 / 18 | 600 | UI | Labels (letter-spacing .04em) |
| Caption | 12 / 16 to 18 | 400 to 500 | UI | Fine print, tab labels. **12px is the floor** (HIG minimum is 11; we stay at 12) |

Rules:
- Body default **17px** (`accessibility.md`: 17pt default).
- Numbers always `font-variant-numeric: tabular-nums` (money columns line up).
- Questions and reveals use `text-wrap: balance`. Body paragraphs use `text-wrap: pretty`. This fixed the one-character last line seen in the prototype.
- Chinese uses full-width punctuation 「，。？」 and no space between Chinese and numbers except NT$ amounts (`NT$52,000`). Never `font-weight` under 400. Never letter-spacing on Chinese body text.
- Text must **reflow, not truncate**. No `text-overflow: ellipsis` on anything a student must read.
- Dynamic sizing: root font size follows the browser setting (`font-size: 100%`); all sizes above in `rem` (1rem = 16px; 17px = 1.0625rem). Layouts must survive 200% (E18 check).

---

## E5. Iconography

- One set, drawn as inline SVG in `components/ui/icons.tsx`. 24×24 viewBox, `stroke-width: 2.2`, round caps and joins, `currentColor`. **Tab bar icons are always filled** (`tab-bars.md › Best practices`: prefer filled symbols). The active tab is shown by three things together, never color alone: icon and label in `--ink` (inactive `--ink-3`), label weight 700 (inactive 600), and `aria-current="page"`.
- Prototype icon paths are in `screens.mjs` (`ic.back`, `ic.close`, `ic.flame`, `ic.check`, `ic.today`, `ic.me`, `ic.map`, `ic.bolt`). Use them as the starting set; add per need in the same style.
- Never emoji. Never icon-only without `aria-label` (all icon buttons in the prototype have one).
- Icons next to text match text weight; 24px in tab bar, 22px in bars, 18px inline, 16px in pills.


---

## E6. Navigation and structure

### E6.1 The shell
After login, the app has **four tabs** (HIG: few tabs, single-word labels, tabs navigate and never act, never hide or disable a tab: `tab-bars.md › Best practices`):

| Tab | Label | Icon | Screen | Replaces (Part C) |
|---|---|---|---|---|
| 1 | 今天 | home | The character in today's world, today's stop, 上車 | Dashboard |
| 2 | 狀態 | person | Numbers: cash, savings, investments, debt, emergency fund (tap = breakdown), freedom %, 工具箱, certificates | "狀態" tab |
| 3 | 路線 | map | The 12 lines as a metro map; tap a line for its stations | "路線圖" tab |
| 4 | 行動 | bolt | Unlocked moves, and 「還沒解鎖的 (N)」 | "行動" tab |

- The tab bar is visible on these four screens only. Inside a station, a task or a life-game turn, it is hidden and replaced by the top bar with ‹ and ✕ (a full-screen flow owns the screen: `sheets.md`: use full-screen presentation for complex or multistep flows).
- Deep links exist for every screen (`/today`, `/status`, `/map`, `/moves`, `/line/[slug]/station/[n]/step/[k]`). The browser back button and the ‹ button behave identically and predictably (UI UX Pro Max: predictable back, deep links).
- `/class` (人生賽局 for classrooms), login and settings are reached from 狀態, never from the tab bar.
- On Regular width the tab bar becomes a left rail (88px, same four items, icons 24 over 12px labels).

### E6.2 What opens how (modality)

| Thing | Presentation | Why |
|---|---|---|
| Station hook (step 1) | **Sheet** with grabber, medium height, over the line's world | Short, one question, keeps the world visible (`sheets.md`: consider the medium detent for progressive disclosure) |
| Lesson cards (step 2) | Full-screen, one card per screen | Reading |
| Task (step 3) | **Full-screen** | Multistep (`sheets.md › Best practices`) |
| Model answer + reveal (step 4) | Full-screen per question, then the reveal as full-screen | Reading and reflection |
| Life-game turn (step 5) | **Full-screen** | Multistep |
| 工具箱 (a saved takeaway) | Sheet, medium | Single short task |
| Reset the game | Alert (E7.14), the only alert | Rare and cannot be undone (`alerts.md`) |

Rules (`sheets.md`, `modality.md`): one sheet at a time; every sheet has a grabber, swipe-down to dismiss, and **also a visible way out** (‹ or ✕ in the bar above it); never put a Done button alone, pair it with ✕ or ‹; a sheet never opens another sheet, and a full-screen task never opens a sheet over itself (`modality.md`: let people dismiss a modal before presenting another). The station flow is a pushed full-screen flow with ‹ back (it is not stacked on another modal); the hook sheet is that flow's first screen, not a second layer. Sheets are opened only from the four tab screens, the hook, and the map.

**Leaving mid-task is always safe and never asks.** Tapping ‹ or ✕, or swiping down, returns to 今天 and the station resumes at the same step. Whatever the student had selected or typed on the current screen is **autosaved as a draft** and restored on return (`modality.md`: help people avoid data loss; `alerts.md`: no alert for a common action that loses nothing). No penalty, no streak loss, no dialog.

---

## E7. Components (exact)

Class names are from `screens.mjs`; copy the CSS and port to Tailwind or CSS modules. All sizes are CSS px. Every interactive element: **hit region ≥ 44×44** (`buttons.md`, `accessibility.md`; the 28×28 minimum is not used), **≥ 8px between hit regions**, a visible **focus ring** (`outline: 3px solid var(--focus); outline-offset: 2px`, shown on `:focus-visible` only), a **hover state** on fine pointers only (`@media (hover:hover)`), and a **pressed state** (`buttons.md`: always a press state).

### E7.1 Top bar (`.bar`, `.bar.flat`)
- Height 56 on Compact (64 on Regular, padding 0 24, rail at top 64), top at safe-area. Two kinds: **material** over a scene (`background: var(--material); backdrop-filter: var(--material-blur); border-bottom: 1px solid var(--material-border)`) and **flat** on plain paper (`background: var(--paper); border-bottom: 1px solid var(--hairline)`). Use flat whenever there is no scene behind it.
- Layout: left `iconbtn` 44×44 (‹), center title (17/22, 700) over subtitle (12/16, 500, ink-3), right `iconbtn` (✕). On 今天 the bar is two pills instead: 「第 N 個月」 (700; the one number that says where you are in the game) and 「連續 N 天」 (flame icon, `--warn`-orange `#C45A00` fill is decorative: the number carries meaning).
- Under `prefers-reduced-transparency`, `--material` becomes `var(--surface)` and blur is removed (tokens already do this).

### E7.2 Tactile-strip rail (`.rail`)
- Absolute under the bar: `top = 47 + 56 = 103px` (phone), `height: 8px`, track `--track`, fill `repeating-linear-gradient(90deg, var(--signal) 0 16px, var(--signal-deep) 16px 18px)`.
- Fill = `(completedSteps / totalSteps)`. Implement as a full-width fill clipped with `clip-path: inset(0 calc(100% - P%) 0 0)` and `transition: clip-path 290ms var(--spring-snappy)` (reduced motion: instant). This keeps the dashes unstretched and triggers no layout. (The prototype uses `width` only because it is a static render.) Role `progressbar` with `aria-valuenow/min/max` and `aria-label="第 N 步，共 M 步"`.
- A station has 5 steps (hook, lesson, task, reveal, turn). 你是銀行 uses its own rail: 6 applicants. The life-game turn uses 7 steps (E8.6). Never show a rail with more than 10 segments' worth of detail; width alone carries it.

### E7.3 Buttons (`.btn`)
- Height 52, radius `--r-md` (16), font 17/700, full width in a screen's action zone (gutter 16). Icon (optional) 20px, gap 8.
- **Primary** (`.btn.primary`): bg `--ink`, text `--ink-inv`. **One per screen.** Press: scale .97 (`--dur-press` 100ms, spring-snappy) and bg `color-mix(in oklab, var(--ink), #fff 14%)`. Hover (fine pointer): `#fff 8%`. Disabled: bg `--track`, text `--ink-3`, `aria-disabled="true"`, plus a helper line says why (E2.4).
- **Secondary** (`.btn.secondary`): bg `--surface-2`, inset 1px `--hairline-strong`, text `--ink`. Press: bg `--track`.
- **Destructive** (rare: reset game): text `--bad` on `--surface-2`, never filled, never the primary (`buttons.md`: never make a destructive action the primary button).
- Labels are verbs that say what happens, from the fixed vocabulary in E7.16. Never 提交; never 送出 alone.
- Loading: the label stays, a 16px spinner replaces the icon, the button stays 52 high, pointer events off, `aria-busy="true"`. The submit route must answer in < 1 s (Part A8.5); show the spinner only if it exceeds 250 ms.

### E7.4 Option row (`.opt`) for Choice, Sort, Number choices
- `min-height: 56`, padding 12 16, radius 16, bg `--surface-2`, inset 1px `--hairline`, text 17/24 weight 500, a 22px radio (`.r`) on the left, gap 14, margin-top 10.
- Selected (`.opt.sel`): bg `--surface`, inset **2px `--ink`**, radio filled `--ink` with a white ✓ (18px, stroke 3). Selection is shown by **border + filled radio + checkmark**, never by color alone.
- Press: scale .985 + bg `--surface`. Whole row is the hit region. Role `radio` inside a `radiogroup` (or `checkbox` for multi-select), arrow keys move, Space selects.
- After submit: correct/incorrect state appears **on the model-answer screen only**, not here (the answer is server-side, Part A2). There it uses `--good-soft` + ✓ icon + the word 「建議答案」, or `--bad-soft` + ✕ + 「你的選擇」 (words, not just colors).
- Option order is shuffled per attempt (Part A7) and the shown order is stored.

### E7.5 Rating row (`.rate .o`) for the Rate step (1 / 2 / 3)
- Three equal columns, gap 10. Each: radius 20, bg `--surface`, inset 1px `--hairline-strong`, padding 12 6, min-height 88, number 28/32 weight 700, label 13/18 weight 600 `--ink-2`.
- Selected: inset 2px `--ink`, bg `--surface-2`. Keyboard: keys 1, 2, 3 select; Enter confirms (shown as the fine-print line on desktop: 「按 1、2、3 選擇，Enter 確定」). The row is a `radiogroup` with labels 「1，不核准」 etc.
- The legend 「1 不核准 · 2 小額 · 3 核准」 sits top right of the document in `.fine`.

### E7.6 Document viewer (`.doc`) (all 11 documents from `01 §8`)
- Container: bg `--surface`, radius 16, `--e1`, 1px `--hairline` border, `overflow:hidden`. Header (`.doc-h`): bg `--surface-2`, padding 14 16, bottom hairline; left title 17/24 700 and subtitle 12/16 `--ink-3`; right a `.badge` (12/16 700, padding 4 8, radius 6, `--info-soft` bg, `--info` text) naming the document type, for example 「信用報告」.
- Key-value grid (`.grid2`): two columns, `.cell` padding 10 16, hairline dividers; key 12/16 `--ink-3`, value 15/22 weight 600, tabular numbers. Last row has no bottom border.
- **Documents look like paper, not like UI.** No colored fills inside a document except the one header tint. All fields have identical markup and class during a task (Part A3: no field is highlighted until the model answer).
- Footnote under every document: 「名稱皆為虛構。」 (`.fine`, 12/18).
- Real elements, in reading order, so screen readers read it as a table or definition list.
- Phone: when the document is taller than the space between the header and the action zone, **only the document scrolls**, with a bottom fade (24px gradient `--surface` → transparent) to show there is more. Desktop: it sits left in its pane.
- On phone, when a question screen cannot show the document and the answer control together, a **two-segment control** 「文件」/「問題」 (44 high, full width, under the bar) swaps the middle region between the two. Same screen, nothing stacked on top (`modality.md`: no second modal over a modal). The student's selection is kept when swapping, and the primary button stays fixed and visible.

### E7.7 Station sign (`.sign`)
- Inline-flex, bg `--ink`, radius 8, `--e2`. Left and right **line-color stripes** 12px wide (`.sign b`, bg `--line`). Center padding 8 18: line name 22/28 weight 700 letter-spacing .1em (e.g., 信用站), English small-caps line 13/16 Barlow Condensed 600, letter-spacing .14em, color `#C9D3DB`, uppercase: 「CREDIT LINE · C03」.
- Code format: line letter(s) + two-digit station number. Letters per line are in `lib/lines.ts`; if absent, generate `C` for 信用 etc. from the English name's first letter and fix collisions (two lines starting with the same letter get the second letter).
- Used: on 今天 (top of the scene, y116), on the train arrival card. Not used inside tasks (the bar carries the title there).

### E7.8 Name plate
Ink background, radius 12, padding 6 16. Name 17/22 weight 700, then 12/16 `#C9D3DB`: 「19 歲 · 剛出社會」. Centered under the character's feet (y490 on 今天). Name is plain text, never HTML.

### E7.9 Speech bubble (`.bubble`)
Bg `--surface`, radius 18, padding 10 14, `--e2`, max-width 210, voice font 16/24 weight 500. Tail: a 16×16 square rotated 45°, radius 3, at `bottom:-7px; left:30px`. Content is **one status or one hint**, ≤ 14 Chinese characters ideal, ≤ 20 max. Status bubbles start with a 9px dot (`--good`, `--warn`, `--bad`) **and** carry words (「安心：有緊急預備金」, 「緊張：下個月帳單要到了」). Bubbles never contain buttons.

### E7.10 Chip (`.chip`)
Height 32, padding 0 12, radius pill, bg `--line-soft`, text `--line-ink`, 13/600, 8px colored dot (`--line`) on the left. Used for who/where context: 「星河銀行 · 放款專員」. Not tappable (if tappable, grow to 44 high).

### E7.11 Card (`.card`)
Bg `--surface`, radius 20, `--e2` (`--e3` for the today's-stop card). Padding 16 18. Top label (13/18 600 `--line-ink`, letter-spacing .04em), then voice-font text, then a button. A line's own cards add a **4px top border in `--line`** (inside the radius).

### E7.12 Sheet (`.sheet`)
Absolute bottom, bg `--surface`, radius 28 28 0 0, `--e3`, padding 0 20 34 (bottom = `max(34, inset)`), grabber 36×5 radius 3 `--hairline-strong`, margin 8 auto 0. Height = content, max `78dvh`. Enter: `translateY(100% → 0)` 380ms `--spring-soft`. Exit: 200ms `--ease-in`. **No dimming backdrop on Compact** (the world stays visible behind it; the character is the context); on Regular, a dimmed backdrop + centered dialog. Focus moves into the sheet on open and returns on close; Esc closes.

### E7.13 Tab bar (`.tabbar`)
Content height 49 + bottom inset (`max(34px, env(safe-area-inset-bottom))`) = 83 on a modern iPhone. `--tab-h` is **49px** in `tokens.css` (it was 56 in the first draft; the prototype hard-codes the 83 total). Material background like the top bar. Four equal tabs: 24px icon over a 12/16 label, gap 2, active ink 700, inactive `--ink-3` 600. Each tab ≥ 44 hit region (they are ~97×49). **No badges and no red dots in v1** (calm, not nagging).

### E7.14 Alert (one use only)
`alerts.md › Best practices`: "Use alerts sparingly"; do not use one merely to inform; not for common undoable actions; not at launch. So Finline has **one alert**: 「要重新開始遊戲嗎？」 (reset). Everything else is handled in place: errors inline next to what failed (E7.15), drafts autosaved (E6.2), saved confirmations as a toast.
- Centered dialog 300 wide, radius 20, `--e3`, backdrop `rgba(14,20,27,.45)`. Title is a complete sentence in 17/24 700 with ending punctuation (`alerts.md › Content`: complete-sentence titles take ending punctuation); one line of body 15/22 stating what is lost (「目前的進度和存款會清除，無法復原。」).
- Two buttons stacked, 52 high: top **「重新開始」** (it is the action the student chose, so the normal secondary style, not destructive style: `alerts.md › Buttons`, the Empty Trash example), bottom **「取消」** (the exact word for canceling). **No button is the default**: nothing is auto-focused (focus starts on the dialog), so a stray Enter does nothing. Esc and 「取消」 both cancel.
- Never more than one alert at a time. Never shown on load.

### E7.15 Number counters, toasts, empty states
- **Money change**: count old → new over 500ms with tabular numbers; gains flash `--good` for 600ms, losses `--bad`, each with ▲ or ▼ and a sign, never color alone. Reduced motion: no count, the new value appears.
- **Toast**: bottom, above tab bar, 44 high, radius pill, bg `--ink`, text `--ink-inv`, 3s, `role="status"`, ≤ 20 characters, verb past tense matching the button (存起來 → 「已存起來」).
- **Empty / locked**: say what it is and the next action (「還沒解鎖。完成信用線第 2 站就會解鎖。」) with a secondary button 「前往信用線」. No sad faces.
- **Error**: what happened and how to fix, in the interface's voice, no apology (「沒有送出。檢查網路後再按一次確定。」) with 「再試一次」.

### E7.16 Copy rules and the action vocabulary (`writing.md`)
- **Voice:** warm, plain, direct. Questions and key sentences are set in the voice font; labels and buttons are plain. Never cute (`writing.md`: "Send" beats "Let's do it!"). No 「哎呀」, no exclamation spam, no emoji.
- **Person:** address the student as 你 only where it separates their answer from the model answer (「你的答案」 / 「建議答案」). **Never 我 and never 我們** (HIG: sparing possessives, don't switch perspective, avoid "we"). Objects are named without a possessive: 工具箱, 決定, 答案, 路線. **Rename 「我的工具」 to 「工具箱」 in every UI string** (route stays `/tools`).
- **Action vocabulary (fixed; use these and only these for flow actions):**

| Meaning | Label | Where |
|---|---|---|
| Start a station | **上車** | 今天 card, map station sheet |
| Move forward | **繼續** | lesson cards, model answers, reveal, life-game steps where nothing is committed |
| Commit an answer or a choice | **確定** | hook, every task step |
| Finish a flow | **完成** | end of a turn, end of a station summary |
| Start the app | **出發** | end of the character creator only |
| Step-specific verbs | 收下, 存起來, 繳費, 決定 | the life-game steps (`01 §6.4`), each named for what it does |
| Back / close (icons) | aria-label **返回**, **關閉** | top bar |
| Cancel | **取消** | the exact word, always |

- **Errors** (`writing.md`): next to the problem, say what happened and what to do, no blame, no apology (「沒有送出。檢查網路後再按一次確定。」, 「請輸入 2 到 8 個字。」). **Empty states** give the next step with a button. **Hints** in fields show the format (name field: 「2 到 8 個字」).
- **Numbers:** `NT$` plus thousands separators (`NT$52,000`); scores as earned (`5.5 / 6`); percentages without space (`18%`).
- **Settings labels** describe what the switch does when on.

---

## E8. Screens (pixel positions are for a 390×844 phone; the layout is flex, the numbers are the reference render)

Common: status bar area 47px (safe-area), top bar 56 → rail at 103 → content from 127. Gutter 16.

### E8.1 今天 (home) (`screens.png`, left)
Scene = **the platform** (E9.2): you are waiting for today's train, and the sign names where it goes. 上車 rides to the station and the line's own world appears there (E9.4). Top to bottom:
1. Material top bar (E7.1): 「第 N 個月」 pill left, streak pill right. (The logo is not repeated here: `branding.md`: resist displaying your logo throughout the app. It appears on login and onboarding only.)
2. Station sign, centered, top 116.
3. Status bubble, top 190, anchored above the character's left shoulder (`left: 50%; translateX(-120px)`).
4. **Character** 182×265, left 104, top 217 (centered, feet at ~y473). Mood from the life state (calm, worried, stressed, proud; see E10).
5. Name plate top 490.
6. **Today's-stop card** (`.card`, `--e3`), left/right 16, top 552: label 「今日一站 · 約 8 分鐘」 (`--line-ink`), question in voice 22/32 (the station's hook question), primary 52px button **「上車」**.
7. Tab bar.

Flex behavior (so it fits phones that are not 844 high): the column is `[bar][sign][character region, flex:1, min-height 150px][name plate][card][tab bar]`. The character scales to the region (`height:100%`, aspect 240:330). Under 150px of region (landscape phones), the character is hidden and only sign + card show. At 375×667 the character region is about 156px (the character about 113px wide), which is tight but passes; the test must confirm it. **Test viewports: 390×844, 375×667, 360×740, 1440×900. No page scroll on any.**
Taps: the character is **not** a button (no hidden controls). Only 上車 and the four tabs act.

### E8.2 Hook (sheet) (`screens.png`, second)
- Scene: the line's interior at full bleed. Top bar material: ‹ · 「信用站」 / 「第 1 步，共 5 步」 · ✕. Rail at 20%.
- Character 150×219 at left 24, top 194, mood **thinking**. Bubble at left 170, top 166: 「先想一下，沒有標準答案。」 (15px).
- Sheet from top 410 to bottom: grabber, label 「想一想」, the question in voice 24/34, 2 to 4 `.opt` rows, primary **「確定」** pinned at bottom 34. The button is disabled until a row is selected, and the helper text 「選一個答案」 shows in `.fine` between the options and the button while disabled.
- The hook has **no right answer**; after 確定 it advances to step 2 and the choice is stored (it feeds the reveal in step 4).

### E8.3 Lesson cards
Full-screen on paper (flat bar). One card per screen: a visual first (diagram, two-person comparison, small table), ≤ 80 characters of text under it in Body (17/28), max 3 cards. Bottom: primary **「繼續」** on every card, including the last. Swipe left/right, ← →, and the button all move. The rail fills per card inside step 2 (2 of 5 steps, subdivided).

### E8.4 Task (`screens.png`, third; `desktop.png`)
- **Phone:** flat bar (title = task name, subtitle = 「第 3 位，共 6 位」 or 「第 2 題，共 4 題」), rail, context chip, document (E7.6), a 「你的決定」 label (13/18 600), the answer control (rating row, option rows, number field, sort list), and the primary 「確定」 at the bottom. One applicant or question per screen. If the document is tall, the document region scrolls (fade at the bottom) and the answer control and button stay fixed.
- **Desktop (Regular):** left pane 600 (chip, document, footnote), right pane 420 (label, the question in voice 24/34, options, 確定, keyboard hint). Gap 28, padding 0 40, top 104. Same content, never more.
- After 確定: the screen slides left (E12) to the next applicant or question. No per-answer feedback here (model answers come in step 4).
- Task types render per `03`: Choice → option rows; Rate → rating row (E7.5); Find → the document with tappable fields (each field becomes a ≥ 44 high tap target with the same look, selected = 2px ink outline + ✓, so Find stays fair); Number → one large input (inputmode decimal, 28/32, tabular, with unit label); Sort → a list with the drag handle (⋮⋮, 44×44) **and** up/down buttons for every row (gesture alternative: `accessibility.md`); Order → same as Sort with numbers.

### E8.5 Model answer and reveal (`screens.png`, right)
1. **Model answer, one screen per question:** top half your answer (label 「你的答案」), then the model answer (label 「建議答案」, `--good-soft` + ✓), then 「為什麼」 in Body. For Rate/Choice show both with words; if they match, one card with 「和建議答案一樣」. Button 「繼續」 on every one, including the last.
2. **Reveal** (flat bar, rail at 80%): the character (132×192) centered at top 140 in mood **proud** (only if the student did well; otherwise **thinking**); label 「你剛剛的選擇，背後是」 (13/18); the bias name in voice 34/44 (「最低應繳的錨定」); a 2 to 3 sentence explanation in Body 17/28 `--ink-2` (max 3 lines at 350px width; if longer, trim the copy, do not shrink the type); the takeaway card (`.card`, top 556): a 40×40 radius-12 `--line-soft` square with a number, label 「工具箱」, name 17/24 700 (「看帳單三步」), 12/18 summary. Buttons: primary **「繼續」**, secondary **「存到工具箱」**.

### E8.6 Life-game turn (full-screen; new, not in the prototype set; build from these rules and the reference components)
Steps (7 after Part B): **發薪日 → 先存錢 → 帳單 → 生活風格 → 行動 → 人生事件 → 記帳 or 小結**. Rail has 7 segments' worth (width = step/7).
- **Frame:** flat bar (title 「第 7 個月」, subtitle 「發薪日 · 第 1 步，共 7 步」). Under the rail a **money strip**, 40 high: two numbers only, 現金 and 緊急預備金 (15/22 600, tabular, labels 12/16 `--ink-3`); the rest live in 狀態. Below it, a 160px-high **world band** (the current line's scene cropped to a band, `object-position: bottom`) with the character (120×165) standing at left 24. The step card fills the rest.
- **Step card:** `.card`, one per screen, content per `01 §6.4` and Part B. Button at the bottom, one verb each: 收下, 存起來, 繳費, 決定, 確定, 繼續, 完成.
- **生活風格:** three `.opt` rows with name (省, 普通, 享受), monthly amount (NT$3,000 / 7,000 / 12,000 in tabular), and one example line (`05` Part B). Last choice is preselected. Footer line: 「這個月想要的花費：NT$7,000」 updates live.
- **行動:** unlocked moves as a **horizontal card row** (scroll-snap, card width 280, gap 12, peek 24px of the next card so swiping is obvious); each card: name, one-line effect, cost, one-line risk, and a stepper (− / amount / +, each 44×44) for the amount. Locked moves collapse under 「還沒解鎖的 (N)」 (secondary button, opens a medium sheet listing each with its unlock rule). Scroll indicator: dots under the row.
- **人生事件:** the event card flips (rotateY 0 → 180° over 380ms spring-soft; reduced motion: crossfade). Cost and protection in words and numbers. Character mood updates (**stressed** for a big cost, **happy** if insured, **worried** if short on cash).
- **End of turn:** the train ride (E11) to the next station (when a station is due) or back to 今天.
- Phone height budget: bar and rail to 111 (includes the 47 status area), money strip 40, world band 160, step card region at least 320, button zone 86 (52 + 34) = 717 minimum. On 844 the card region is 447. **Under 740px of viewport height the world band hides** (at 667 high the card region is 430).

### E8.7 狀態, 路線, 行動 tabs
- **狀態:** flat top bar title 「狀態」. A 2×2 grid of stat cards (現金, 存款 (活存 + 定存), 投資, 負債; each 16 radius 20, number 22/28 700 tabular, label 13/18 `--ink-3`, delta chip ▲/▼ for the month), then a full-width card for 緊急預備金 (months of expenses, with a segmented bar: filled `--info`, empty `--track`, and the words 「0.3 個月」; tap → sheet with the breakdown, Part A8.3), then 自由度 (freedom %), then rows to 工具箱, 證書, 設定. The page does not scroll: 4 stat cards + 2 cards + 3 rows fit in 844 only if rows are 44 high; if not, the rows live in a `List` that scrolls inside its region (allowed: it is a list region).
- **路線:** the metro map, full-bleed on paper `--paper`: 12 colored lines as 6px strokes with 20px station dots (done = filled, current = ring with `--signal-deep` outer 3px, next = open, locked = open + `--track` stroke and a lock icon at 14px), pinch and drag to pan if the map is larger than the screen; tap a line name chip at the bottom (horizontal chip row, 44 high) to focus it, tap a dot to open a sheet with the station card and 「上車」. Lines are also listed under the map as 44-high rows for screen readers and keyboard users (the map is `aria-hidden` and the list is the accessible version).
- **行動:** the same horizontal move cards as in the turn, 1 per screen width at 280, plus the 「還沒解鎖的 (N)」 row.

### E8.8 Character creator (onboarding)
One screen on the platform scene (E9.2). Preview character 182×250 center. Below it a **segmented control** (臉 / 髮型 / 衣服 / 顏色) 44 high, then a horizontal swatch/part row (each option 64×64 with the part drawn on it, ring `--ink` 2px when selected, ✓ icon), name field (44+ high, 2 to 8 characters, plain text), primary **「出發」** (disabled until a name is entered). Options from `01 §6.2` (6 skins, 6 faces, 8 hairs, 6 hair colors, 6 outfits, 8 outfit colors). Nothing is locked or sold.

### E8.9 Line page, results, certificate, passport, review
Restyle only, keep all data and behavior (as in `01 §6.6, 6.7`): flat bars, solid cards (E7.11), the line's 4px top border, station sign at the top of the line page, tap-through list of stations as 56-high rows with a dot (done ✓ / current / next / locked + lock icon + the unlock rule in words).


---

## E9. Worlds (the scenes)

### E9.1 Rules
1. **Every line is a place.** The world appears behind the hook sheet and in the life-game world band for that line (E8.2, E8.6). Task, model-answer and reveal screens are flat paper: documents need a calm ground, and Apple's rule is that the content layer stays clear (`materials.md`).
2. **The platform is home.** This amends `05` Part D4 ("the platform appears only on the map and the ride"): Ryan asked to keep the old metro look, so **今天, the character creator, and the train ride all happen on the platform.** You wait for today's train; 上車 rides to the station; the line's world appears there. This also makes the ride mean something.
3. **Scenes are art, not UI.** Flat shapes, no outlines, no gradients except one soft radial "stage light", no photos, no text except one sign. Pure inline SVG, `aria-hidden="true"`, `viewBox="0 0 390 844"`, `preserveAspectRatio="xMidYMax slice"`: it fills the screen and never changes aspect ratio (`layout.md`: scale background art to fill without changing its aspect ratio).
4. **The character must always pop.** The *character zone* is x 90 to 300, y 200 to 500 on the 390×844 canvas. Inside it: only the wall/floor fills and the **stage light**, no detailed or high-contrast prop. The stage light is `<radialGradient id="stage" cx="50%" cy="52%" r="38%">` white at .35 → 0 (warm `#FFE9B0` for night scenes), a rect covering the zone, drawn **last in the scene**. (The prototype scenes do not have it yet; add it.) The character's silhouette vs the scene behind it must stay ≥ 3:1 in luminance for all 8 outfit colors (checked in review, E18 screenshot gate).
5. **Dark mode.** Scenes get `filter: brightness(.5) saturate(.9)` (`.scene` in `tokens.css`). Scenes flagged **night** already are dark, so they use `.scene--night` (`brightness(.8)`) instead (rule is in `tokens.css`).
6. **Budget.** Each scene ≤ 20KB source, ≤ 60 elements, one `<text>` (the sign), no filters, no masks, no animation inside the SVG (ambient motion is CSS and off by default).
7. **Fictional names only**, no real company marks or lookalike logos: 星河銀行, 晨光儲蓄所, 穩健證券, 安心診所, 晴空科技, 星河大學, 稅務服務台, 暖陽夜市. Any scene sign is white 700 20px with letter-spacing 3 on `--line` at .92 opacity (the check in E2.5(c) covers the contrast).
8. **Regular width.** A scene is never stretched across a wide window. On Regular it renders as a **stage panel** 480px wide, full height of the content area, radius 28, `--e3`, centered (on 今天 the content card sits beside it); the rest of the page is `--paper`.

### E9.2 The platform (home, creator, ride)
Built in `scenes.js › platform`: wall `#D9E0E6` with a 28px tile grid `#C3CDD5` (to y250), door header `#2B3440` (y250 to 266), tunnel `#1B232B` with glass panels `#2E3B47` at .92 (y266 to 440), mullions `#8C99A3` 8px, **tactile strip** `#F2C200` y440 to 454 with `#D9A900` 2×14 ticks every 18px, floor `#AEB8C0` with a soft floor glow, floor seams, a route-map poster on the left wall, a bench at left (x14, y470). Keep these numbers. The `.sign` HTML overlay sits at top 116.

### E9.3 Scene component contract
```ts
// components/art/scenes/index.ts
export type SceneKind = 'platform' | LineSlug;           // slugs from lib/lines.ts
export function Scene(props: { kind: SceneKind; className?: string }): JSX.Element
```
One file per scene, default export a function returning `<svg class="scene" …>`. Mapping slug → scene lives in one table so adding a line is one line of code. Unknown slug → `platform`.

### E9.4 The 12 worlds (palettes are art colors; props are placed outside the character zone)

| Line | World (fictional name) | Time | Palette (wall/sky · floor/ground · accent · light) | Props (≤ 6; L = left, R = right, B = back wall) |
|---|---|---|---|---|
| 信用線 | Bank lobby (星河銀行) **built** | day | `#DDE9EE` · `#CBD6DC` · `#7D93A3` counter, `#3F8F6B` plant · `#fff` | B: 3 teller windows, sign bar in `--line`; counter; R: plant; L: rope stanchions; floor perspective lines |
| 消費線 | Night market (暖陽夜市) | **night** | `#1E2740` · `#3A3F52` · `#E8743B` + `#F2B134` awnings · `#FFD27A` lanterns | B: string lights across the top; L and R: two stalls with striped awnings; R: menu board with NT$ prices; steam puffs; light pool `#FFE9B0` |
| 存錢線 | Savings hall (晨光儲蓄所) | day | `#E7F0E4` · `#D9D2C3` · `#1E7D4F` green, `#B98B5A` wood · `#fff` | L: number-ticket machine; counter with passbook stack; R: brochure rack; B: wall clock and a pig-silhouette poster |
| 投資線 | Trading office (穩健證券) | **night** | `#14202E` · `#0E1823` · `#2B3A4D` desks · `#8FD3FF` screen glow | B: 3 monitors with **neutral white line charts**, ▲ ▼ glyphs and 漲 / 跌 (no red or green, E2.2); a ticker band; L: desk and chair |
| 保險線 | Clinic waiting room (安心診所) | day | `#E4F1F2` · `#CFE0E2` · `#5BA7B0` chairs, `#2A9D8F` cross · `#fff` | L: row of 3 chairs; B: reception desk with plant; white plus on a teal rounded square; wall clock |
| 詐騙線 | Alley of phone screens (巷口) | **night** | `#1A1F2B` · `#11151D` · `#7FE0FF` cyan + `#FFE27A` amber glows · `#9FDFFF` | B: alley perspective lines; 4 floating phone rectangles with "!" bubbles; L: street lamp; R: bins; overhead wires. Nothing graphic or frightening: it should feel uneasy, not scary |
| 職涯線 | Open office (晴空科技) | day | `#E9EDF2` · `#B7C4D1` · `#8FA6BD` partitions, `#CFE3F5` window · `#fff` | L: desk with monitor; B: window with skyline; R: whiteboard with 3 sticky notes; plant; wall clock |
| 學貸線 | Campus gate (星河大學) | day | `#D6E8F5` · `#9CCB8A` lawn · `#B9825F` brick, `#E6DCC8` path · `#fff` | B: gate arch with sign; R: clock tower; L: bench; two trees; a banner |
| 報稅線 | Service hall (稅務服務台) | day | `#EEEAD9` · `#C9C3AE` · `#1B1B1B` display, `#E5483B` digits · `#fff` | B: counter windows; queue-number display showing "A128"; L: ticket machine; R: form rack; waiting chairs. (Red digits are a physical object here, not a meaning.) |
| 租屋線 | Rental apartment | day | `#F1E6D8` · `#C9A27B` wood · `#7FB3D5` curtains, `#BFE0F5` window · `#fff` | B: window with curtains; L: three stacked moving boxes; R: floor lamp; a paper 「出租」 taped on the wall |
| 創業線 | Small shopfront (小店), morning | day | `#FFE3C2` sky · `#F4EBDD` wall, `#B8C0C8` shutter · `--line` + white awning stripes · `#fff` | B: half-open shutter; counter with 「營業中」 sign; R: crates of goods; hanging bulb; chalkboard menu |
| 財務決策線 | Rooftop at dusk | **night** | sky bands `#2B3A67` / `#6B5B95` / `#F4A261` (three flat bands, no gradient) · `#3B4660` roof · `#1E2A44` skyline · `#FFD27A` windows | B: skyline silhouettes with lit windows; R: signpost with two arrows (left, right) in `--line` and white; L: railing |

Review gate (E16): the platform and the bank are built; each of the other 10 is built from this table, rendered, and reviewed with the character standing in it (all 8 outfit colors) before the next. Screenshots go in `docs/design/screens/`.

---

## E10. Character

### E10.1 Direction
Ryan: "character design from simple games." Version 2 (after his feedback that v1 looked stiff). We borrow the genre's traits, not anyone's character: a big head (150 wide against a 76 wide torso, chibi proportions), chunky rounded limbs, a **3.5px dark outline** (`#1B2430`) on every body shape, flat fills with one soft shade strip, big dot eyes with two white highlights, blush, a visible hand and shoe. What made v1 read as stiff was no outline, small eyes and a thin body; the outline and the eye highlights do most of the work. Original geometry; nothing is traced from or modeled on any specific game's character, so the whole set can be used and modified freely.

**Free kits considered** (CC0 or free for commercial use): the DiceBear styles (Open Peeps, Notionists, Lorelei are CC0; Avataaars, Bottts free for commercial use; Big Smile, Adventurer, Micah and others CC BY) are all heads or busts, not full-body, and not game-styled, so they cannot stand in a scene or take our outfits. Kenney's **Toon Characters 1** (CC0, 6 characters x 45 poses, vector source, https://opengameart.org/content/toon-characters-1) is the closest free full-body game kit, but it is fixed characters, not mix-and-match, so the creator would lose most of its options. I could not download it from this workspace (the domain is blocked), so it was not evaluated visually. If Ryan and Oliver prefer it, they can download it and Claude Code can swap it in; the Character component's props (`mood`, `pose`, `facing`) would map to its poses.

### E10.2 Geometry (`character.js` v2; viewBox **0 -20 240 350**; the extra 20 at the top is head room for the bun and curls)
| Part | Spec |
|---|---|
| Outline | every body shape: `stroke #1B2430`, width 3.5, round joins and caps. Shade strips and details are drawn without outline |
| Shadow | ellipse cx120 cy318 rx62 ry8, `#15202B` at .18 |
| Legs | two rects 28×52 rx12 at x90 and x122, y236; the right leg gets a `#000` .1 overlay; shoes 42×28 rx13 at y278 (`#2A3340`) with a 5px `#F4F6F8` sole at y298 |
| Torso | `<rect x82 y160 w76 h84 rx28>`; outfit details on top; a `#000` .1 strip (x142, w16) clipped to the torso; a `#000` .07 hem strip at y232 |
| Arms | 24 wide, rx12, from y166, at x58 and x158; long sleeve 70 high, short sleeve 32 plus a skin forearm 18×50; hands r12.5; left arm rotated 4° about (82,172), right −4° about (158,172) |
| Neck | rect x104 y150 32×22 rx10, skin shaded 14% |
| Head | `<rect x45 y30 w150 h128 rx58>`; ears r12 at (46,102) and (194,102); a `#000` .07 strip at the right edge and .06 at the chin, clipped to the head |
| Face | eyes at (92,98) and (148,98), rx8.5 ry10.5, `#15202B`, with a white highlight r3.4 up-right and a small one r1.4 down-left; blush ellipses rx11 ry7 at (72,116) and (168,116), `#E5605A` at .28 |

Shading uses `color-mix(in oklab, c, #000 N%)`; no gradients, no filters. Every instance needs a unique clip-path id (`useId()` in React). On screen, size the SVG by width; height = width × 350/240.

### E10.3 Options (82,944 combinations; nothing locked)
Skin 6 (`#F3CDA6 #E8B88E #D9A27A #C68B62 #A86E4A #7E5236`) · face 6 (smile, grin, calm, glasses, freckles, wink) · hair style 8 (short, side, buzz, bob, long, ponytail, curly, bun) · hair color 6 (`#2A1E17 #4A3426 #7A5230 #B07A3C #1B1B1B #8E3B5C`) · outfit 6 (hoodie, uniform, tee, jacket, sweater, polo) · outfit color 8 (`#2F6FDB #13906B #C4471C #7A4FD0 #2B3440 #B8860B #C2185B #E9EEF2`). Stored on the profile as `{skin, face, hairStyle, hair, outfit, outfitColor, name}`.

### E10.4 Moods (they follow the game, not a button)
| Mood | Look | When |
|---|---|---|
| calm | soft smile, no brows | default |
| happy | open smile, raised brows | paid, goal met, a correct reasoning step |
| worried | flat brows slanting in, small frown | cash under one month of bills, or an event is due |
| stressed | zigzag mouth, steep brows, sweat drop | stress stat ≥ 70, or a big unexpected cost |
| thinking | flat mouth, eyes up-right, a 「?」 | hook and task screens |
| proud | closed arc eyes, grin, two yellow sparkles | reveal after a good answer, finishing a line |

Mood changes by **crossfading the `.fx-face` group** over 160ms (render both, fade). Never by tweening shapes.

### E10.5 Animation (CSS, all off under reduced motion, hidden tab, offscreen, or low-end)
- Idle: `.fx-body` `translateY(0 → −2px)` and `.fx-head` `rotate(0 → 1.2deg)` about (120,168), 3.2s `ease-in-out` infinite alternate.
- Blink: `.fx-eyes` `scaleY(1 → .1 → 1)` 140ms, every 5s, delay randomized per instance 0 to 3s.
- Wave (pose `wave`): right arm `rotate(−125 158 172)`, two swings of ±12° over 900ms, used at the end of the creator and at the train arrival.
- The character is **never a button** and never moves on tap.

### E10.6 Component
`components/art/Character.tsx`: `<Character {...look} mood pose facing="front"|"back" size />`, returns the SVG; `role="img"` and `aria-label` 「小宇，有點擔心」 (name, then mood in words). Port `character()` function bodies as-is; keep the helper names (`hairBack`, `hairFront`, `face`, `outfitParts`). `facing="back"` (for the train ride) is in the prototype: it replaces the face and hair front with a full-head hair cap. **Not built yet:** a `walk` pose.

### E10.7 Visual review gate
`sheet.mjs` prints the contact sheet (`sheet.png`: 6 skins, 8 hairs, 6 outfits, 6 faces, 6 moods). After porting, regenerate it from the React component and compare with `mockups/sheet.png`; then render the character in the platform and bank scenes with all 8 outfit colors and send Ryan and Oliver the screenshots **before** building the other 10 scenes. I reviewed the v2 sheet and the four screens and it reads clearly; expect one round of adjustment once it is in real scenes (outfit-vs-scene contrast and small hair silhouettes such as the bun are the likeliest).

---

## E11. Train transition (timing from `01 §7.3` stays; visuals follow this part)

| Time | What happens |
|---|---|
| 0.0 | Platform scene (E9.2). Doors open (panels slide 76px out, 290ms) |
| 0.5 | Character walks in: `translateY(−60px) scale(.8)`, opacity to 0, 700ms `--ease-in`, shown from behind (`facing="back"`) |
| 1.2 | Doors close, 500ms |
| 1.7 | Train leaves: `translateX(−130vw)` over `--dur-ride` (900ms) `--ease-in`; three speed lines fade in. The train body carries a stripe in the **destination line's color** |
| 2.3 | Arrival card fades up (opacity, translateY 14 → 0, 300ms): label 「下一站」, the station sign (E7.7) with the real destination name and code, one line of what is there |
| 2.6 | `onDone()`; the destination world fades in (290ms) and the hook sheet rises (380ms `--spring-soft`, 200ms later) |

- 「跳過」 button from 0s, 44×44 minimum, bottom right, secondary style. Skipping goes straight to the arrival card.
- After 3 full rides, rides become a 400ms crossfade to the arrival card. Reduced motion: 120ms crossfade, no ride.
- Every step has a **timeout fallback**; never rely on `requestAnimationFrame` or `transitionend` alone.
- `aria-live="polite"`: 「前往 信用站」. The ride never gates anything: it can be skipped, nothing times out (`accessibility.md`: limit time-boxed UI).
- The sign must show the destination (name, line color, code), fixing `05` A8.2.
- `mockups/Transition.dc.html` is the old visual. Use it only for timing.

---

## E12. Motion

Principles (`motion.md`): motion is purposeful, optional, brief, cancellable, and kept off frequent interactions. So: nothing bounces on a tap; selecting an option has a press scale and a border change only.

**Springs** (`spring.py` computes them; paste from `tokens.css`):

| Token | Damping ζ · ω | Settles | Overshoot | Use |
|---|---|---|---|---|
| `--spring-snappy` | 0.86 · 28 | 294ms | 0.5% | press, selection, rail fill, screen enter |
| `--spring-soft` | 0.72 · 20 | 384ms | 3.8% | sheet enter, card flip, arrival card |

Durations: press 100, quick 160, base 290, soft 380, ride 900 (ms). `linear()` easing needs Chrome 113, Safari 17.2, Firefox 112. `tokens.css` falls back to `--ease-out` where unsupported.

| Thing | Property | Timing | Reduced motion |
|---|---|---|---|
| Button, option press | `transform: scale(.97 / .985)` | 100ms snappy | no scale, color change only |
| Screen to screen | new screen `translateX(24px → 0)` + opacity 0 → 1; old screen opacity 1 → 0. Back reverses | 200ms `--ease-out` | opacity only, 120ms |
| Rail fill | `clip-path: inset(0 X% 0 0)` (keeps the dashes unstretched; no layout) | 290ms snappy | instant |
| Sheet in / out | `translateY(100% → 0)` | 380ms soft / 200ms `--ease-in` | opacity 120ms |
| Card flip (event) | `rotateY(0 → 180deg)` | 380ms soft | crossfade 120ms |
| Money counter | count old → new | 500ms | instant |
| Mood change | face crossfade | 160ms | 160ms (it is already a fade) |
| Train ride | E11 | 2.6s | 120ms crossfade |
| Idle breathing, blink | E10.5 | loops | **off** |

Rules: animate only `transform`, `opacity` and `clip-path` (UI UX Pro Max: no width/height animation). Tighten springs and replace x/y/z movement with fades under Reduce Motion, and never animate blur (`accessibility.md › Motion`). Everything is interruptible (no `pointer-events: none` for longer than 200ms). One orchestrated moment per screen at most. Global safety net: `@media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: 120ms !important; } }` plus the explicit rules above.

---

## E13. Sound and haptics
**None in v1.** No sound, no vibration. If added later: off by default, a single switch in 設定, never the only carrier of feedback. Nothing in the app depends on either.

---

## E14. Accessibility checklist (each has a test in E18, or is a review check)

1. **Text.** Body 17px, floor 12px, `rem` units, reflows at 200% (`accessibility.md`: text sizes; 11pt is Apple's minimum, we hold 12). No ellipsis on required reading.
2. **Contrast.** Text up to 17px ≥ 4.5:1, 18px or bold ≥ 3:1 (`accessibility.md › Color and effects`); measured table in E2.4; the script checks all 12 line colors.
3. **Targets.** ≥ 44×44 hit region, ≥ 8px between (`accessibility.md`, `buttons.md`). Inline links inside a paragraph are exempt.
4. **Not color alone** (`color.md › Inclusive color`): selected option (border + radio + ✓), meaning colors (icon or word), active tab (weight + `aria-current`), rating (number + label), tactile rail (position + `aria-valuenow`), charts (▲ ▼ and words), status bubble (dot + words).
5. **Keyboard.** Everything reachable and operable. Keys: Tab / Shift-Tab, Space and Enter on options and buttons, 1 / 2 / 3 on rating, ← → on carousels and lesson cards (and ← = back where allowed), Esc closes a sheet or alert. Visible focus ring everywhere. On every screen change, focus moves to that screen's title (`h1`, `tabindex="-1"`); a polite live region announces 「第 3 步，共 5 步」.
6. **Screen reader.** Real elements in reading order (documents are tables or definition lists); every icon button has `aria-label` (返回, 關閉, …); the character has a label; scenes are `aria-hidden`; the rail is a `progressbar`; the map has a list alternative (E8.7).
7. **Gestures have alternatives** (`accessibility.md`): swipe has buttons; drag-sort has up / down buttons; map pan has + / − buttons (44×44); no multi-finger or path gestures.
8. **Motion.** Reduced Motion rules in E12; nothing flashes more than 3 times a second; nothing auto-plays except the skippable ride.
9. **Time.** No timers on answers or screens; the ride is skippable.
10. **Language.** `<html lang="zh-Hant-TW">`; English fragments (sign line, 「NT$」) carry `lang="en"` where they are more than a symbol.
11. **Zoom.** Never `user-scalable=no` or `maximum-scale`.
12. **One interaction per screen** (`accessibility.md`): checked by review, E8.
13. **System settings:** dark appearance (follows system, no toggle: `dark-mode.md`), increased contrast (E2.3), reduced transparency (tokens), reduced motion (E12).

---

## E15. Files and components

```
app/globals.css                 tokens: paste mockups/tokens.css; add @theme inline mapping
app/layout.tsx                  next/font (E4.1), lang, viewport-fit=cover, theme color
components/ui/                  Button, IconButton, TopBar, Rail, OptionRow, RatingRow, Segmented,
                                Sheet, TabBar, Card, Chip, Sign, Bubble, NamePlate, Alert, Toast, icons.tsx
components/doc/                 Doc, DocGrid + the 11 documents from 01 §8 (restyled, same data)
components/art/Character.tsx    port of mockups/character.js
components/art/scenes/          index.ts (slug → scene), Platform.tsx, one file per line (E9.4)
components/flow/                StationFlow, Hook, LessonCards, TaskScreen, ModelAnswer, Reveal
components/game/                TurnFlow, StepCard, MoveCards, MoneyStrip
components/transition/Train.tsx E11
lib/design/motion.ts            durations, usePrefersReducedMotion, step timeouts
lib/design/lowend.ts            low-end flag (E17)
app/dev/ui/page.tsx             dev-only gallery of every component, light and dark (404 in production)
scripts/check-contrast.mjs      E18
tests/e2e/design.spec.ts        E18
docs/design/DESIGN.md           pointer to this part + the final tokens; docs/design/screens/ holds review shots
```

---

## E16. Build order (commit locally; **do not push**; at most 3 subagents at once)

1. **Foundation.** Tokens, fonts, icons, `globals.css`, `app/dev/ui` page. Run the contrast script. Commit.
2. **Primitives** (`components/ui`, `components/doc`): every component in E7 with all states. Check `/dev/ui` at 390×844 and 1440×900, light and dark. Commit.
3. **Character.** Port, contact sheet, then the character in platform and bank. **Stop and send screenshots to Ryan and Oliver.**
4. **Shell and 今天**, hook sheet, lesson cards, then the task screens for each task type (one commit each), model answer, reveal. **Stop after one full station (信用站) and send the 4 screens at 390×844 light and dark.** Part C's no-scroll test must pass.
5. **Life-game turn** (all 7 steps), the three tabs, creator, line page, results. Commit per screen.
6. **Train transition.**
7. **Scenes** for the other 10 lines, subagents, one scene per commit, each reviewed with the character standing in it (E9.4 gate).
8. **Motion and reduced-motion pass**, then the full acceptance suite (E18). Screenshots to `docs/design/screens/`.

Part A (content and logic), B (economy) and C (structure) ship first and are not blocked by this part; do them in the current visuals and let step 4 re-skin them.

---

## E17. Performance budgets (cheap phones are a stated requirement)

- Lighthouse mobile preset (slow 4G, 4× CPU slowdown): LCP < 2.5s, CLS < 0.1 (reserve space for the scene and the character with fixed aspect ratios), INP < 200ms. Report the numbers.
- First-load JS for the station route: not more than the current build + 30KB gzipped. Report the delta.
- Fonts per E4.1 (≤ 4 first-screen requests, no CJK preload). Images: **none** (everything is SVG). Each scene ≤ 20KB; the character markup ≤ 12KB.
- `backdrop-filter` only on the top bar and tab bar (2 elements, ever). `will-change` only on a sheet while it animates.
- **Low-end flag.** `lib/design/lowend.ts` sets `data-lowend` on `<html>` when `navigator.deviceMemory <= 2 || navigator.hardwareConcurrency <= 4`. CSS under `[data-lowend]`: `--material: var(--surface); --material-blur: none;`, idle animations off, springs replaced with `--ease-out`. Nothing else changes.
- Offscreen or hidden-tab characters pause their animations (`IntersectionObserver`, `visibilitychange`).

---

## E18. Acceptance tests (all run in `npm run check`; a failure blocks the commit)

| Test | Assertion |
|---|---|
| `scripts/check-contrast.mjs` | Recomputes every pair in E2.4 from `tokens.css`, light, dark and both increased-contrast sets; plus all 12 line colors (E2.5 a, b, c). Prints a table; exits 1 on any miss (disabled text exempt, listed) |
| No-scroll | At 390×844, 375×667, 360×740 and 1440×900, light and dark: 今天, hook, lesson card, every task type, model answer, reveal, every life-game step, the three tab screens: `document.scrollingElement.scrollHeight <= innerHeight + 1` (document viewers and list regions excluded) |
| Large text | With `html{font-size:200%}` at 390×844: no horizontal overflow, and the primary button's bounding box is inside the viewport on every screen |
| Targets | Every `button, a:not(p a), [role=radio], [role=tab], [role=checkbox]` has a bounding box ≥ 44×44 and ≥ 8px to its nearest neighbor |
| Type floor | No visible text node with computed `font-size` < 12px |
| Focus | Tab through each screen: every stop shows an outline ≥ 2px |
| Reduced motion | Emulate `prefers-reduced-motion: reduce`: `document.getAnimations()` has no transform animation; sheet and screen changes complete in ≤ 150ms |
| CLS | `PerformanceObserver('layout-shift')` total < 0.1 on 今天 and a task screen |
| Fonts | ≤ 4 font requests before first interaction; no CJK file preloaded |
| Glyph coverage | A script (fontTools) checks every character in `content/**` and UI strings against Huninn; reports the missing count. Missing glyphs fall back per-glyph to Noto Sans TC (no tofu), but report them |
| Tokens | `grep -E '#[0-9A-Fa-f]{3,8}\b' components/**/*.tsx app/**/*.tsx` outside `components/art/**` returns nothing |
| Copy | No emoji in strings; no 「我的工具」, 「提交」, 「下一張」, 「下一題」; every button label is in the E7.16 vocabulary or a task-specific verb; no 「我們」 |
| Art budgets | Each scene ≤ 20KB, character markup ≤ 12KB |
| Screenshots | `shot.py` or Playwright writes `docs/design/screens/<screen>-<viewport>-<scheme>.png` for each screen at 390×844 and 1440×900, light and dark. **Ryan reviews screenshots, not code.** |

---

## E19. HIG citation index
Format `file.md › heading` from Apple's pages at developer.apple.com/design/human-interface-guidelines, fetched live while writing this part. **Opened and read:** `tab-bars`, `sheets`, `layout`, `accessibility`, `typography`, `materials`, `motion`, `dark-mode`, `buttons`, `alerts`, `color`, `writing`, `modality`, `branding`.

| Rule used here | Source |
|---|---|
| Tab bar navigates, never acts; keep visible; few tabs; single-word labels; filled symbols | `tab-bars.md › Best practices` |
| One sheet at a time; grabber; medium detent; swipe to dismiss; pair Done with Cancel or Back; full-screen for complex or multistep | `sheets.md › Best practices`; `modality.md › Best practices` |
| Don't stack modals; obvious dismissal; no modal-in-a-modal hierarchy | `modality.md › Best practices` |
| Order by importance; progressive disclosure; size classes not devices; scale background art without changing its aspect ratio | `layout.md › Best practices` |
| 17pt body, 11pt floor; contrast 4.5 / 3; 44×44 targets; 200% text; gesture alternatives; limit time-boxed UI; Reduce Motion rules; one interaction per screen | `accessibility.md` |
| Type sizes and weights | `typography.md` (iOS Large table) |
| Blur and glass only in the functional layer | `materials.md › Best practices` |
| Purposeful, optional, brief, cancellable motion; not on frequent interactions | `motion.md › Best practices` |
| Follow the system appearance (no toggle); contrast 4.5, aim 7; base and elevated backgrounds | `dark-mode.md › Best practices` |
| 44×44 hit region; always a press state; one or two prominent buttons per view; style not size; verb labels; no destructive primary | `buttons.md › Best practices`, `Content` |
| Alerts sparingly; not just to inform; not for common undoable actions; not at launch; no default button when you want people to read; "Cancel" for cancel; action sheets for choices about an intentional action | `alerts.md › Best practices`, `Content`, `Buttons`, `Platform considerations` |
| One color one meaning; light, dark and increased-contrast variants; never color alone; cultural color meaning (red up in Chinese-language markets) | `color.md › Best practices`, `Inclusive color` |
| Verb labels; consistent flow language; sparing possessives; avoid "we"; empty states give next steps; errors near the problem, no blame, no "oops" | `writing.md › Best practices` |
| Accent color judiciously; brand defers to content; custom font for headlines with system-like body; don't repeat the logo | `branding.md › Best practices` |

Not cited because not opened: `designing-for-ios`, `playing-haptics`, `liquid-glass` (the skill's own guide, not an Apple page; we do not use Liquid Glass on content, per `materials.md`).

---

## E20. Limits, and what I decided so you don't have to

**Honest limits of this spec**
1. **Apple references.** The apple-design skill's `references/` folder was not synced here, so I fetched the 14 HIG pages above directly from Apple. Anything not in E19 is my judgment, not Apple's.
2. **UI UX Pro Max.** Only its `SKILL.md` was available (its search script and data were missing), so I applied its rules from the text. No database lookup backs any choice here.
3. **Fonts.** The prototypes rendered with the system's fallback CJK sans, not Huninn or Noto Sans TC as such, so **line breaks and text widths will shift** in the real build. Everything else (sizes, spacing, positions) is exact. Check Huninn's glyph coverage with the E18 script.
4. **Character.** Version 2, reviewed from renders only (v1 is kept as `mockups/character-v1.js`). The back-facing pose is in the prototype but I did not render it; the walk pose is not built. Expect one adjustment round after seeing it in real scenes.
5. **Scenes.** 2 of 12 are built; 10 are specified as palettes and props. The stage light (E9.1.4) is specified but not in the prototypes yet.
6. **Not tested on a real device.** The "taps did nothing" bug (`05` A8.6) and real-phone feel still need Ryan's phone.
7. **Contrast** was computed, not eyeballed, for everything in E2.4 and E2.3. The line colors in `lib/lines.ts` were not available to me, so the 12-line check is a script for Claude Code to run.

**Decisions taken (tell me to flip any)**
- 今天 lives on the **platform**; each line's world appears inside its stations.
- The logo shows on login and onboarding only; 今天's bar shows 「第 N 個月」 and the streak.
- 「我的工具」 becomes **「工具箱」** everywhere (HIG: use "my" sparingly; never mix 你 and 我).
- One word to move forward, everywhere: **「繼續」**. 「上車」 starts a station; 「確定」 commits an answer; 「完成」 finishes.
- Autosave drafts instead of a leave-confirm dialog; the only alert in the app is reset.
- Charts and markets use no red or green (Taiwan reads red as up).
- No sound, no haptics, no badges, no confetti.


---

# PART F. FORAGE: WHAT IT ACTUALLY DOES, AND WHAT WE TAKE

Written 2026-10-23 after reading Forage's public pages, a program landing page in a browser, Forage's help center, university career pages and student write-ups. **What I could not see:** the screens inside a program (tasks, submit, model answer). Those are behind sign-in, and Forage's robots rules block crawlers from them. I did not create an account or log in. Everything about the inside is from Forage's own descriptions and from students, not from my eyes. See F6 for how to close that gap.

---

## F1. How Forage works (verified from the sources in F7)

**The product.** Free, self-paced "job simulations" built with an employer. Over 250 simulations, 90+ employers. A simulation is 30 minutes to 5 hours or more. Each is a short chain of tasks that follows the real order of events in the job. One example from Forage's employer page: review a client voicemail, research and summarize, build an exposure model in a template Excel file, turn it into a client deck.

**The program page (what a student sees before starting).**
1. One-line promise: 「Help our Finance team manage business KPIs, financial risks, and predict credit card sales」.
2. A row of plain facts: Self-paced · 5-6 hours · **No grades** · **Optional assessment** · Intermediate.
3. Four tabs: Overview, Video, Tasks, Reviews.
4. **An intro video from the employer's own people.**
5. 「How it works」 in three bullets: tasks guided by pre-recorded videos and example answers; earn a certificate; stand out in applications.
6. **Achievements** listed up front: Certificate, Resume Snippet, Interview Tips, Skills.
7. The task list, **with a time estimate on each task** (「1-2 hours」).
8. Three short student reviews with a 4.6 rating.
9. An honest disclaimer: this is not employment, do not list it as work experience, list it as an extracurricular. The certificate requires you to confirm you read that policy.

**Each task.** Starts with **「What you'll learn」 and 「What you'll do」**, two short lists (some write-ups call them "To learn" and "To do"). The task opens with a scenario: a manager, a client, a meeting. Everything needed is provided inside the program (background readings, templates, pre-built models); no outside research. Formats vary: a slide, an email, a spreadsheet, a quiz.

**Submit, then compare.** You submit your work, which unlocks a **model answer**: "an example of what an industry professional would submit," and "one possible approach, not the only correct answer." You compare yourself against it. You may be able to resubmit. **There are no grades and no penalty;** Forage calls it "safe-space learning." There is no individual feedback from Forage (it points students to a subreddit and says it neither monitors it nor verifies answers).

**Trust machinery.** Real employees on video. The employer approves the content. Students can report a content error with the simulation name, task number and a screenshot. Programs get retired when stale (the Citi Finance page I opened in a browser said it was no longer available).

**Also:** **Shorts**, under 15 minutes. A quiz and filters to find a simulation. Employers see work only if the student opts in.

**What not to trust.** The headline numbers (「3.3x more likely to land a job」, 「twice as likely to get an interview」) come from Forage or its founder, with no data or method shown, and Forage is owned by EAB, a company that sells to universities. A reporter noted this. An EAB executive in the same article says simulations are **not a replacement for internships.**

---

## F2. What Finline already matches

| Forage | Finline today |
|---|---|
| Brief → materials → task → model answer | `03` section 1, same sequence ("Pattern from Forage") |
| Materials that look like the real thing, provided in the program | The 11 documents (`01 §8`) |
| Tasks in a real-work order | Mostly; F3.8 makes it a rule |
| Compare against a model answer, many answers can be fine | `accept` lists and per-step model answers |
| Certificate | Exists; F3.5 adds what Forage pairs with it |
| Time estimate | 「約 8 分鐘」 on today's stop; F3.6 spreads it |
| Self-paced, no due dates | Yes. Do not add deadlines |

Where we go beyond Forage: a hook before (prediction), a bias reveal after, a life game that makes every decision cost something, and a character. Forage has none of those, and Ryan's "game" feeling lives there. Keep them.

---

## F3. What we add (each item names the exact place it changes)

### F3.1 The brief becomes a screen: persona message plus learn, do and time
Forage's best move: before any work, you are told **who is asking, what you will learn, what you will do**.

- New screen at the start of step 3 (the task), full-screen, flat paper, before the first document. It is part of step 3, so the rail does not change.
- Layout: a **message card** (new component `MessageCard`, same visual family as the `ChatThread` document): a 40px avatar circle with the sender's initial in `--line-soft` / `--line-ink`, name (17/24 700), role and organization as a `.chip`, then the message in the voice font 22/32, at most 2 lines at 358px (about 40 Chinese characters). Below it two compact rows: label 「你會學到」 with one line, label 「你要做的」 with one line (15/22; each label 13/18 600 `--ink-3`). Then a `.chip` 「約 6 分鐘」. Primary button **「開始任務」**.
- Data (replaces `brief: { role, situation }` in `03`):
```ts
brief: {
  from: { name: string; role: string; org: string };   // fictional; org marked 名稱皆為虛構
  message: string;      // what they ask of you, one or two sentences, in their voice
  learn: string;        // one line
  do: string;           // one line
  minutes: number;
}
```
Migrate existing briefs: `role` → `from.role`, `situation` → `message`; Claude Code writes `learn` and `do` per task from the task's steps (list them in the report for Ryan to check).
- Add to the E7.16 vocabulary: **開始任務** starts a task. The brief screen is the one place 「繼續」 is not used.
- Test: every task set has a complete brief; `message` ≤ 60 Chinese characters.

### F3.2 Model answers use "compare" language, never "wrong"
- On every model-answer screen (E8.5) add one fixed line under the answers, in `.fine`: **「這是一種做法，不是唯一的答案。」** (Forage: "not the only correct answer").
- Two labels only: 「你的答案」 and 「建議答案」. A match shows 「和建議答案一樣」 with a ✓. A difference shows 「和建議答案不同」 with a neutral ◦ icon on `--surface-2`, **not** `--bad-soft`. Where the model answer is strictly correct (arithmetic), say 「正確答案」.
- Add a secondary button **「再做一次」** on the last model-answer screen (Forage allows resubmitting). A retry is stored as a new attempt; the first attempt is kept.
- Update E7.4 accordingly: the `--bad-soft` ✕ treatment is for arithmetic and fact items only.

### F3.3 A "write it" step with a self-check (Forage's email-to-the-manager)
Forage deliverables are real work products, including emails. Finline's step types are all pick-or-type-a-number. Add one:

```ts
type WriteStep = {
  type: 'write'; id: string;
  prompt: string;            // 「回覆小美：你要不要幫朋友作保？用 1 到 2 句話說明。」
  maxChars: number;          // default 80
  modelAnswer: string;       // one possible reply
  selfCheck: string[];       // 2 to 4 yes/no criteria: 「有說出風險」 「有給替代做法」
  scored: false;             // never scored, never gates
};
```
- UI: a text area (min height 112, 17/28, counter 「23 / 80」), button 「確定」. On the model-answer screen: the student's text, the model reply, then the self-check as checkboxes (44 high rows): 「我有說出風險」 etc. The tick count is private and shown only as 「你做到了 3 項中的 2 項」.
- **No AI grading, no free-text sent anywhere.** Text is stored on the student's own profile only, rendered as plain text, never HTML, never shown to other students or the class (minors). Counted as done on submit.
- Use sparingly: at most one per line, on the task where explaining is the real skill (你是銀行: 「用一句話告訴申請人你的決定」; the co-sign message task; the scam reply).

### F3.4 Ungraded by default, with an optional check (decision for Ryan: D1)
Forage: **No grades; optional assessment.** Our playtest already hit the cost of the opposite: a student scored 1.3 / 4 and the screen said the station was not done (`05` A6).
Recommended: a station counts as done **when the task is submitted** (not on a pass score). Points still show as 「和建議答案一致 3 / 4」, not as pass or fail. Each **line** ends with an **optional 5-question check** (「線末小測」); the certificate is issued on finishing the stations, and the check adds a 「通過小測」 line to the certificate. Until Ryan decides, keep the A6 behavior already sent to Claude Code.

### F3.5 Achievements panel on every line page (Forage's certificate, resume snippet, interview tips, skills)
On the line page (`01 §6.6`), above the stations, a row of four cards, each one tap to open a medium sheet:
1. **證書** (exists).
2. **學習歷程檔案用語** (the Taiwan version of the resume snippet): 2 to 3 sentences the student can adapt for 多元表現 or 學習歷程自述, generated from what they actually did (the line, the task names, the hours). Always ends with the honest label: 「線上自主學習，非實習或工作經驗」.
3. **面試小提示**: 3 questions an interviewer might ask about this topic and one sentence on how to answer from what they did.
4. **學到的技能**: 4 to 6 plain skills per line, e.g. 信用線: 讀信用報告, 比較風險, 解釋決定.
Facts about the system (checked in one March 2026 article, so confirm with a school counselor): 學習歷程檔案 still exists; a student can submit up to 3 件 課程學習成果 and 10 件 多元表現. **Add to the VERIFY list (section 4): whether and how an online self-study certificate can be used as a 多元表現 item, and what proof schools accept.** Do not tell students it counts until that is answered; until then the snippet is a draft they can adapt.
- Disclaimer on the certificate and snippet, mirroring Forage's CV policy: 「這是學習練習，不是真實銀行的經驗。」

### F3.6 A real program page for each line (Forage's overview)
Restructure the line page into: one-sentence promise (「學會看懂信用卡帳單、算利息、判斷借錢風險」); a fact row (免費 · 自學 · 約 N 分鐘 · 難度 · 不計分 if D1); the achievements row (F3.5); then the station list where **each station shows its 「你會學到」 and 「你要做的」 lines (the same `brief.learn` and `brief.do`) and its minutes**. No tabs: the page is one screen per section by the Part C rules (use a horizontal segmented control 「總覽」/「站點」 on phone). Reviews are not shown until real students exist (never fabricate).

### F3.7 Real people on video (optional slot)
Forage's trust engine is real employees. We cannot invent bankers, and our partner organisations are the people to ask. **Ask them for one 30-second intro per line** from a real practitioner (a banker for 信用線, an insurance agent for 保險線, and so on), with captions in Traditional Chinese. Build the slot now: `line.intro?: { videoUrl, captionsUrl, name, role, org }`; absent means the line page shows nothing there. Skippable, no autoplay, never gates anything, hosted where it does not break the 20KB scene budget. A real person's face on the page is also a protection against the "AI slop" feeling Ryan hates.

### F3.8 Content rule: every task follows read → decide → explain → compare
Forage orders tasks like the job (voicemail, research, model, deck). Add to the `04` content checks: each task set has (1) a document to read, (2) at least one decision, (3) where it fits, a short explanation (F3.3), (4) compare. A task that is only recall questions fails review.

### F3.9 Trust and upkeep, the cheap version of "programs get retired"
- **Report a mistake.** On every model-answer screen, a text button 「回報內容錯誤」. It opens a prefilled mail or form with the line, station, task id and step id (Forage asks for simulation, task number, description). This is a finance product for teenagers; it needs a fast way to hear about errors.
- **Last checked.** `TaskSet` gets `verifiedOn: 'YYYY-MM'` and `sources: { label: string; url?: string }[]`. The model-answer screen shows 「資料查證：2026-10」 in `.fine`. `npm run check` **warns** at 12 months and fails at 18 (rates, limits and rules go stale). The VERIFY list in section 4 feeds this.
- **No outcome claims.** Do not copy Forage's "3.3x more likely" style claims. Finline says what a student will do and learn, never what job outcome they will get, until we have our own data.

### F3.10 Shorts (later)
Forage Shorts are under 15 minutes. Finline's equivalent (the small cards in the P3 list) becomes **Finline Shorts**: one task step, no brief screen, 3 minutes, using the same engine (`steps.length === 1`). They sit on 今天 below the main card as a secondary button 「3 分鐘版」 for days with no time. Build after the main flow ships.

---

## F4. What we do not copy
- **Forage's outcome statistics and "get hired" framing.** Unproven, and wrong for 16-year-olds.
- **No individual feedback.** Forage has none and sends people to Reddit. Finline's feedback is the life game (consequences) plus the model answer. Do not add a public forum for minors.
- **Employer data sharing.** Finline is free for students and never shares student data or free text with anyone.
- **Long sessions.** Forage runs 5 to 8 hours. A Finline station stays under 10 minutes; a line stays under 2 hours.
- **A listing page of 250 programs.** We have 12 lines on one map.

---

## F5. Decisions for Ryan (my recommendation first)
- **D1. Ungraded stations with an optional line check** (F3.4). Recommended. Until you decide, the pass rule from A6 stays.
- **D2. Ask our partner organisations for 30-second line intros** (F3.7). Recommended; the slot is built either way.
- **D3. Learning-portfolio wording** (F3.5): confirm with a school counselor before promising it counts.
- **D4. Write steps** (F3.3): one per line, only where explaining is the skill. Recommended.

## F6. Closing the "what I could not see" gap
Ryan or Oliver can open any Forage simulation signed in, do Task 1, and send screenshots of: the task screen with its materials, the submit state, and the model-answer screen. With those I can match the exact pacing and layout instead of working from descriptions. (This is the same reference-screenshot request as `05` D3.)

## F7. Sources
- Forage home and program pages: [Forage](https://www.theforage.com/), [Citi Finance](https://www.theforage.com/simulations/citi/finance-qt4o) (opened in a browser), [Citi Investment Banking](https://www.theforage.com/simulations/citi/investment-banking-9wcw)
- Forage on how it works: [What is a virtual job simulation](https://www.theforage.com/blog/basics/virtual-work-experience), [employer-side description](https://employers.theforage.com/post/what-is-a-virtual-work-experience), [feedback and model answers (help center)](https://eabforage.zendesk.com/hc/en-us/articles/38227185105175-Requesting-Feedback-or-Assistance-with-Job-Simulations)
- Third parties: [Career Karma review](https://careerkarma.com/blog/forage-free-virtual-job-simulations-review/) (sponsored by Forage), [Hechinger Report](https://hechingerreport.org/unsure-about-a-career-try-one-in-a-job-simulation-program/), [Duke career page](https://careerhub.students.duke.edu/resources/forage-for-engineering-masters/), a student's [Citi Finance write-up](https://medium.com/@suman.sangeethm/citi-finance-job-simulation-the-forage-8759855abd7d)
- Taiwan: [學習歷程檔案現況 (2026-03)](https://www.gvm.com.tw/article/128491)


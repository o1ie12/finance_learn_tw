# STOP 3: JOB 3 engine changes and P1 tasks 1 to 5

Branch `feat/design-e`, pushed as its own branch for a Vercel preview. `main` is untouched.

**Two companion files:**
- `STOP-3-numbers.md`: every figure, formula, right answer and model answer for the five tasks, generated from the engine, so Ryan can check the math.
- `STOP-3-briefs.md`: every new brief line (sender, message, 你會學到, 你要做的) for you to check.

## Done

### JOB 3 engine (06 Part F)

- **F3.1 brief.**
  - Every task set now has `{ from: { name, role, org }, message, learn, do, minutes }`, shown as a message card before the first document, then 開始任務.
  - One fictional sender per line (`content/personas.ts`).
  - Migrated:
    - the 25 authored task sets and 詐騙線's 6 cases, by hand;
    - the 26 wrapped stations and the 2 after-simulation steps, from their module.
  - The validator and a test require a complete brief and a message of at most 60 characters.
- **F3.2 model answers.**
  - 你的答案 and 建議答案.
  - A match shows 「和建議答案一樣」; a difference shows 「和建議答案不同」 on a neutral ground.
  - Only arithmetic says 正確答案 and uses the red tint, with words beside it.
  - Every screen ends with 「這是一種做法，不是唯一的答案。」, and the last one offers 再做一次 (a new attempt; the first is kept).
  - The older answer view uses the same words now.
- **F3.3 write step.**
  - Never scored. Plain text, cut to the limit.
  - Kept out of the page until submit, and stored on the student's own profile only (`profile.writes`). The task result keeps only "written".
  - The answer screen shows the text, one possible reply and a private self-check with 「你做到了 3 項中的 N 項」.
  - At most one per line, none on a terminal.
  - First use: 你是銀行, 「挑一位你給 1 分的申請人，用一兩句話告訴他你的決定和原因。」
- **F3.9.** `verifiedOn` and `sources` on task sets; 「資料查證：2026-10」 on the model answers. The content check warns at 12 months and fails at 18.

### Engine figures

Lessons list their numbers as formulas, and `{{name}}` in any text is filled by the engine when content loads. No number in the P1 copy is typed by hand. The validator fails on an unknown name or a formula the engine can't compute.

New formulas:
- savings growth
- the rule of 72 and exact doubling time
- total ownership cost
- the year's budget gap
- a month-by-month debt payoff in any order
- sum, difference and division
- the repo's verified rates
- the 強制險 caps

### P1 tasks 1 to 5 (numbers in `STOP-3-numbers.md`)

| Task | Where | What the engine says |
|---|---|---|
| 預算缺口 | 消費線, 加碼任務 | Each month leaves NT$2,200 (NT$26,400 a year). The year's extra costs are NT$30,000, so the gap is **NT$3,600**, or **NT$300** a month. Changing phones a year later leaves NT$8,400 over. |
| 機車的真實成本 | 消費線, 加碼任務 | First year: new **NT$83,700**, used **NT$47,400**. Three years: new NT$107,100, used NT$87,200 (with NT$5,000 of repairs in year two). Used is cheaper by **NT$19,900** (option 「大約差 NT$2 萬」). |
| 複利與 72 法則 | 存錢線, **on 複利站** | NT$2,000 a month to age 60. From 18: NT$1,577,697 at 2%, **NT$4,540,320** at 6%. From 28: NT$1,074,565 at 2%, NT$2,315,362 at 6%. Starting late saves NT$240,000 less but ends **NT$2,224,958** lower. Rule of 72: card 15% → **4.8 years** (exact 5.0); 定存 1.7% → **42.4 years**. |
| 雪球還是雪崩 | 信用線, 加碼任務 | NT$12,000 a month. Highest rate first: **NT$11,265** interest over 31 months. Smallest first: NT$12,078 over 32 months (NT$813 more). Minimums only: **NT$35,853** over 104 months. Then 「還不出來時先做什麼？」 → contact the bank early (VERIFIED item 5). |
| 機車保險三層 | 保險線, 加碼任務 | One crash, six losses sorted into 強制險 / 第三人責任險 / 「他買的車險都不賠」. 強制險 pays NT$200,000 medical and NT$3,000,000 death per victim since 115/7/1 (VERIFIED item 6). |

### Placement decisions

The spec asked me to match each task to a station by topic.
- **複利站:** 複利與 72 法則 replaces 誰比較會存 there, since compound interest is that station's topic. 誰比較會存 becomes a 加碼任務, and station completions already earned stay.
- **The other four** have no free station on their line (each station already has its task), so they are 加碼任務. Adding new stations would change line completion for students who have finished a line.
- **New route:** `/line/[slug]/bonus/[taskSetId]` runs a 加碼任務 on the new flow. The line page still links to the older `/task/` page.

### Rates

Following rule 9, the tasks use the repo's verified rates, not the deck's:
- 學貸 **0.775%**, not the spec's example of 1.2%;
- the card cap of 15% (銀行法 §47-1);
- the 臺灣銀行 定存 rate of 1.7%.

The 信貸 7%, all balances, prices and costs are illustrative and labelled 示意. 6% is labelled as an illustration of a long-run return, never promised (06 section 3 item 2).

## E18 and checks

| Check | Result |
|---|---|
| All five P1 tasks end to end (`tests/e2e/task-e.mjs`) | 116 screens, light and dark: no page scroll, targets ≥ 44, nothing under 12px, no page errors |
| 信用站 with the write step (`tests/e2e/station-e.mjs`) | 46 screens, no failures |
| 信用線 retry walk, older pages | 12 of 12 checks pass |
| Part C screen check, older flow | 28 screens, no scroll |
| E18 browser checks on 今天, 信用站, 複利站 and two 加碼任務 | Pass at all four viewports, light and dark: 200% text (after a fix: the hook's question and options now scroll at large text, with 確定 fixed), targets, focus rings, reduced motion, layout shift. Fonts: 22 to 31 requests (the accepted miss) |
| `npm run check` | 157 tests pass, contract ALL PASS, content 0 errors, contrast 0 misses, design static 0 problems |
| Partner-name scan, `next build` | 0 hits; build passes |

**Content check warnings: 73** (60 before). The new ones are illustrative numbers inside documents whose titles say 示意, and the range options in the estimate questions. The check looks field by field, so a title's 示意 doesn't count for the rows inside it.

## Skipped, and why

- **Life-game 還卡債 move.** 06 asks for the 雪球/雪崩 choice there too; it belongs to the life-game turn rebuild (E8.6).
- **verifiedOn on older task sets.** Only the new tasks and their sources have it so far. The older ones don't, so they show no 資料查證 line.
- **Report a mistake (F3.9).** 「回報內容錯誤」 needs an address or form to send to. Who should receive the reports?
- **Write steps elsewhere.** Only 你是銀行 has one. F3.3 also suggests the co-sign task and a scam reply; D4 is yours to confirm.

## What in the spec was wrong or needed a call

- **Wrapped stations and F3.8.** F3.8 says a task that is only recall questions fails review. The 26 wrapped stations are exactly that, by the 05 design (their old quiz in the new flow). They pass the automated checks; F3.8 needs real tasks for them.
- **Placement.** Section 2 says 「預算缺口 (消費線 or 存錢線)」 and 「存錢線 Task C」 without station ids. I chose as above.
- **學貸 rate.** The spec's 1.2% 學貸 rate is not the repo's verified rate; I used 0.775%.

## Not decided here (TODO-VERIFY)

- **D1** ungraded stations: the A6 pass rule stays.
- **D2** practitioner intro videos: no slot built yet (F3.7 comes later).
- **D3** 學習歷程檔案 wording: VERIFY item 9 found nothing official on online certificates.
- **TISA** (VERIFY item 8) is partly verified, so the TISA deep station stays out.

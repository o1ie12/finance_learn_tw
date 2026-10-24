# 03. The Task Engine

> **Amended by 06-DECK-AUDIT.md Part F** (2026-10-23): new brief screen and shape, WriteStep, ungraded option, model-answer wording, verifiedOn/sources. Where this file and Part F disagree, Part F wins.

One engine runs every station's task in every line. Content is data; the engine renders, scores and stores it. Pattern from Forage: brief → materials → task → model answer. We add the why: hook before, bias reveal after.

Code: `lib/tasks/` (types, scoring, result kinds) and `components/tasks/` (UI). Content: `content/lines/<slug>.ts`.

---

## 1. Data model

```ts
// lib/tasks/types.ts
type LineSlug = (typeof LINES)[number]['slug']; // derive from lib/lines.ts; never write the list by hand (消費線 is the legacy 'qixin')

type StationLesson = {
  stationId: number;            // existing module number from lib/modules.ts
  hook: Hook;
  lessonCards: LessonCard[];    // 1 to 3
  task: TaskSet;
  reveal: BiasReveal;
  takeaway: Takeaway;
  minutes: number;              // shown on today's stop
  lifeGameTurn: boolean;        // run one turn after the station (default true)
};

type Hook = { question: string; options: { id: string; label: string }[] }; // no correct answer

type LessonCard =
  | { kind: 'text'; title: string; body: string }               // ≤ 80 chars body
  | { kind: 'compare'; title: string; left: Side; right: Side; note?: string }
  | { kind: 'flow'; title: string; steps: string[] }            // drawn as a flow
  | { kind: 'matrix'; title: string; xLabel: [string, string]; yLabel: [string, string]; cells: [string, string, string, string] }
  | { kind: 'formula'; title: string; formula: string; example: string };

type Side = { name: string; rows: { label: string; value: string }[] };

type TaskSet = {
  id: string;                   // stable, e.g. 'xinyong.bank.v1'
  brief: { role: string; situation: string };  // 1 to 2 sentences each
  materials: Material[];
  steps: TaskStep[];            // 1 to 6
  passScore: number;            // 0..1, default 0.6
};

type Material =
  | { kind: 'payslip'; data: PayslipData }
  | { kind: 'cardStatement'; data: CardStatementData }
  | { kind: 'creditReport'; data: CreditReportData }
  | { kind: 'chat'; data: ChatData }
  | { kind: 'billSheet'; data: BillSheetData }
  | { kind: 'ledger'; data: LedgerData }
  | { kind: 'policy'; data: PolicyData }
  | { kind: 'lease'; data: LeaseData }   // existing
  | { kind: 'snapshot'; data: { name: string; rows: { label: string; value: string }[] } } // a person's money at a glance
  | { kind: 'priceChart'; data: { title: string; series: { month: string; close: number }[]; markMonth?: string } } // drawn from historical_prices
  | { kind: 'newsCard'; data: { headline: string; body: string; dateLabel: string } }; // fictional news, labelled 示意

type TaskStep =
  | ChoiceStep | RateStep | FindStep | NumberStep | SortStep | OrderStep;

type BiasReveal = {
  bias: string;                 // e.g. '錨定效應'
  byHookOption?: Record<string, string>;  // reveal text keyed by the hook option id
  outcomeFrom?: { stepId: string; map: Record<string, string> }; // option id in that step → outcome id
  byOutcome?: Record<string, string>;     // reveal text keyed by outcome id
  default: string;              // required, ≤ 2 sentences; used when nothing else matches
};
// Pick order: byOutcome (via outcomeFrom) → byHookOption → default.

type Takeaway = { name: string; lines: string[] }; // saved to 我的工具
```

---

## 2. Task step types

Every type works by mouse, touch and keyboard. Every type has a model answer and an explanation per item.

| Type | What the student does | Keyboard | Scoring |
|---|---|---|---|
| `ChoiceStep` | Picks one option, then picks one reason from 3 (the reason matters as much as the choice). Reasons are optional: if the content gives none, or only the correct one, the step has no reason part | Arrow keys in a radio group, Enter to confirm | 0.5 choice + 0.5 reason; 1.0 on the choice when there is no reason part |
| `RateStep` | Rates each item 1, 2 or 3 (used by You Are the Bank) | Tab to item, 1/2/3 keys or radio buttons | Full point if exact, half if off by one |
| `FindStep` | Clicks the spots in a document that answer the prompt ("找出最低應繳金額"). Targets are document fields | Each document field is a toggle button | Hits − false clicks, floor 0, out of targets |
| `NumberStep` | Types a number (ledger cells, monthly saving needed) | Normal input | Exact, or within a stated tolerance |
| `SortStep` | Drags items into 2 to 6 boxes (risk matrix, ETF types). With 5 or 6 boxes, use the select-menu layout as the main layout on phones | Each item has a select menu of boxes | Per item |
| `OrderStep` | Puts steps in order (scam response, planning loop) | Move up / move down buttons | Kendall distance to the answer, normalised |

Drag and drop always has the select-menu fallback. Never make drag the only way.

Two fields every step type supports:

- `scored?: boolean` (default `true`). `false` makes a reflection step: no right answer, no score, the answer is saved and may feed the profile (e.g. `careerPriority`). Reflection steps show "沒有標準答案" instead of a model answer.
- `accept`: for `ChoiceStep` and `SortStep`, a list of extra answers that also get full credit (or `{ option, credit }` pairs for partial credit, e.g. 0.5). Use it where the content says "`accept`".

---

## 3. Flow and UI

Matches `01` section 6.5.

1. Hook (student answers; no score).
2. Lesson cards.
3. Task: brief at the top, materials on the left (top on phone), steps on the right. One step at a time. "送出" per step.
4. After the last step: score, then each step's model answer beside the student's answer, with the explanation.
5. Bias reveal: picked by hook answer, else by outcome, else default.
6. Takeaway card with "存到我的工具".
7. Life-game turn, then the train transition.

Materials can be opened large (a modal with focus trap, Escape closes, focus returns).

---

## 4. Storage and contracts

- Each line's new task set is a new result `kind`, named `<line>_<task>_v1` (e.g. `xinyong_bank_v1`). Register every new kind in the same places existing kinds are registered (stamp, coach, certificate, `readStoredResult`, contract script). The type system should force this; if it does not, add the exhaustive switch.
- Stored result: `{ kind, taskSetId, score, total, steps: [{ stepId, answer, correct }], hookAnswer, revealShown, provenance }`. `provenance` keeps the existing `known` flags for any profile value the task used.
- Station quiz progress and `line_completions` keep working as today. A station counts as done when its task is submitted with score ≥ `passScore`, or after two attempts (we do not lock students out). A task set where every step is `scored: false` counts as done on the first submit.
- The coach: add a deterministic coach branch per new kind (same pattern as the existing line stubs). It references the student's actual answers and the bias named in the reveal.
- `check-sim-contract.ts` must cover every new kind and fail if one is missing.

---

## 5. Tests

1. Every task type: keyboard-only completion (Playwright, real key presses).
2. Scoring: one unit test per type with full, partial and zero answers.
3. Contract: removing a kind's registration fails the contract script.
4. Old results: a stored result of every old kind still renders on the result, certificate and coach.
5. Content validation: a script loads every `content/lines/*.ts` and checks: every step has a model answer and an explanation per item; every hook has 2 to 4 options; lesson card bodies ≤ 80 characters; every figure in content either appears in the sources list or carries a `示意` flag; no partner organisation names appear.

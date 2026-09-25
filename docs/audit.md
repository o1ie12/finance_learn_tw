# Audits

## Content-alignment audit — the six applied lines (2026-09-25)

Method: for each line, read its course stations and its terminal simulation,
then ask the question 信用線's original mismatch was found by — does the
simulation require the student to do what the course just taught?

| Line | Core stations | Result |
|---|---|---|
| 詐騙線 | 9 假投資群組, 11 假客服, 12 殺豬盤 | **Audited, no mismatch.** The 20 判讀 cards cover each core station directly (c1 假投資群組, c3 ATM 解除分期, c5 殺豬盤, c6 釣魚簡訊), and the student judges every one. |
| 學貸線 | 14 四年總價, 15 就學貸款, 16 住宿比較 | **Audited, no mismatch.** The simulation's three inputs — school, housing, loan coverage — are exactly its three core stations. |
| 報稅線 | 19 薪資單, 20 免稅額/扣除額/級距 | **Mismatch found and fixed.** See below. |
| 租屋線 | 25 無效條款, 27 修繕責任, 28 退租押金 | **Audited, no mismatch.** The lease carries clauses for all three: c5/c11/c12/c13 invalid terms, c6/c7 repair liability, c3/c8 deposit. |
| 保險線 | 29 健保, 31 商業保險, 32 儲蓄險 | **Audited, no mismatch.** The three pitches are 儲蓄險, 意外險 and 醫療實支實付; the last is framed explicitly against what 健保 does not cover. |
| 創業線 | 34 成本, 35 定價毛利, 36 損益兩平 | **Audited, no mismatch.** The outcome computes gross margin per cup and break-even cups from the student's own price and prep choices. |

"Audited, no mismatch" is a result, not a skip. Each of the five was read
against its stations before being recorded here.

### 報稅線 — what was wrong

The simulation asked the student to pick one of three characters and then
computed the whole return for them. That is a selection, not a decision: the
course teaches what comes out of a payslip and how 免稅額/扣除額/級距 work,
and the student exercised neither. The clearest symptom was the stamp, which
named *which character had been chosen* — there was nothing else to grade.

A second, quieter problem sat underneath it. With the standard deductions
applied, two of the three characters owed no tax at all and the third fell in
the lowest bracket, so module 20's headline point — that a higher rate applies
only to the portion above the threshold — could not be demonstrated by any
path through the simulation. The content was fine; nothing could reach it.

### What changed

Replaced with a three-step filing under a new kind, `baoshui_tax_filing_v1`.
`baoshui_tax_v1` is retired, and its rows still read and still stamp.

1. Guess the take-home pay from a monthly salary, then see what was withheld.
2. Choose which amounts come off before tax.
3. Choose how the tax is calculated.

Each step is committed before its answer is revealed. A fourth character
(阿豪, income above the first bracket) was added so step three's wrong answers
actually produce a wrong number — verified at NT$91,800 against a correct
NT$50,500. Where a wrong method coincidentally gives the right figure, the
result says so explicitly rather than marking it correct.

No course content was expanded or rewritten.

---

## Note on the Phase 0 audit

The Phase 0 repo-discovery audit (commit `08aa287`, 461 lines) was written to
`docs/audit.md` on the `feature/credit-card-simulation` branch and never
merged. It is not on `main`, which is why this file had to be created rather
than appended to. Whether to bring that inventory forward is a separate
decision — parts of it describe a pre-rebuild codebase and would need
re-checking before being trusted.

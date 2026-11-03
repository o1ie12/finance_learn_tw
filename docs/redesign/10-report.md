# Spec 10 report: stop after step 4 (2026-11-02)

- **Branch:** `feat/spec-v2`, from `main` (b96a15a). Not merged; Ryan merges.
- **Preview:** https://finance-learn-pp34opunu-olivers-projects-1298c00d.vercel.app (behind the Vercel login). The preview build passed, which is the `next build` check.
- **Screens at 390 × 844:** `docs/design/screens/stop10/` (gitignored; remake them with `node tests/e2e/stop10-shots.mjs`). One full-page and one viewport shot each of:
  - a station start (IN01);
  - the compare screen, passed (CR03);
  - the compare screen, failed (CR03);
  - the compare screen, unscored (CA01);
  - the 行動 step.

D1, D2 and D3 are untouched; today's behaviour is kept.

## IDs

| ID | Status | Commit | Test |
|---|---|---|---|
| PERF-1 | Fixed in code. Preview timing not measured (see below) | 73428e2, e9c02c8 | `perf-e` |
| DATA-1 | Fixed | 49591d3 | `consistency-e` (54 stations, 147 checks) |
| DATA-2 | Fixed | 49591d3 | `consistency-e` |
| DATA-3 | Fixed | 49591d3 | `next-e` (unit, 7 tests) |
| PROG-1 | Fixed | cced658 | `progress-e` A, B |
| PROG-2 | Covered by the PROG-1 test | cced658 | `progress-e` B |
| PROG-3 | Fixed | cced658 | `progress-e` C |
| CMP-1 | Fixed on screen; content rewrites open (4 warnings) | 1dbe1a6 | `compare-e` |
| CMP-2 | Fixed | 1dbe1a6 | `compare-e` |
| CMP-3 | Fixed | 1dbe1a6 | `compare-e` |
| CMP-4 | Fixed | 1dbe1a6 | `compare-e` |
| CMP-5 | Fixed | 1dbe1a6 | `compare-e` |
| CMP-6 | Fixed | 1dbe1a6 | `compare-e` |
| UI-2 | Fixed: one-question compare screens are at most 3 screens at 390 (CR03 failed: 2.3) | 1dbe1a6 | `compare-e` |
| UI-3 | Partly fixed: station and compare screens have one bar with one primary button. The month is not done | 1dbe1a6 | `workspace-e` |
| A11Y-1 | Fixed: focus moves to the result heading, and the bar's live line reads the count | 1dbe1a6 | `workspace-e` |
| COPY-4 | Partly fixed: 「送出失敗，答案還在。再按一次。」 only | 73428e2 | — |
| LIFE-1 | Fixed. The record box shows the ledger's own six rows (帳單 with 「含生活風格的想要花費」); only 月底現金 is hidden. The 帳單 hint starts 「帳單 = 固定帳單 + 這個月想要的花費」 | 8c87ddd | \`ledger-e\` (each 生活風格 level) |
| LIFE-2 | Fixed. 花掉 with indented parts 固定帳單, 想要的花費, 事件和其他; they add up to it (new \`billSpend\` on the turn record; older records show the total alone) | 8c87ddd | \`ledger-e\` |
| LIFE-4 | Fixed as written: shown when nothing was allocated and the unallocated cash is more than 3 months of bills | 8c87ddd | \`ledger-e\` |
| Everything in P1/P2 not listed above | Not started | — | — |

## PERF-1

**Cause, confirmed:**
- The Vercel functions ran in **iad1** (Washington; `x-vercel-id: hkg1::iad1::…` on production).
- The database is in **Seoul**: its address `2406:da12:…` is AWS ap-northeast-2.
- So every query crossed the Pacific twice (about 180 ms or more per round trip).
- A station submit chained about 8 of them: session, reads, the attempt row, then progress → line completion (3 more) → points → streak.

**Fix:**
- `vercel.json` pins the functions to **icn1** (Seoul).
- `Server-Timing` on both submit routes, one entry per await.
- After the response (`after()`): progress, line completion, points, streak and profile writes. The attempt row stays awaited, because 再做一次 counts attempts.
- The button shows a spinner at once, and 「還在算，馬上好」 after 2 s.

**Numbers:**
- **Before:** the file's own (3.6–13 s).
- **After, locally** (dev store, 20 submits): p50 53 ms, p75 64 ms, p95 93 ms. Server: session 8, attempts 13, reveal 18, progress 22, write 15.
- **Not measured on the preview.**
  - The preview is behind the Vercel login.
  - A run creates one test student in that deployment's database, which may be production. That is for Ryan to decide.
  - Command: `BASE_URL=<preview> PERF_REMOTE=1 node tests/e2e/perf-e.mjs`.
  - After merging, confirm `x-vercel-id` shows `icn1`.

**Also fixed:** the local dev store's writes are now atomic. A read during a deferred write saw an empty store ("no session").

## DATA-1 minutes

Minutes are now computed from each station's content (2 + 2 per question + 1 per document) in one place (`lib/tasks/minutes.ts`, applied by the registry). 今天, the line page, the map, the station page and the line totals all read `lib/stationFacts.ts`.

The typed `minutes` fields in the content files are no longer read, and can be removed in a cleanup.

**40 of 54 stations changed.** "Old" is what 今天 showed / what the station page showed. Last stations that are original simulations keep 10.

| Station | Name | Old (今天 / station page) | New | Questions |
|---|---|---|---|---|
| CA01 | 興趣站 | 5 / 5 | 6 | 2 |
| CA02 | 職涯站 | 7 / 7 | 14 | 4 |
| CA03 | 抉擇站 | 15 / 10 | 10 | simulation |
| SA01 | 複利站 | 10 / 10 | 11 | 4 |
| SA02 | 習慣站 | 9 / 9 | 10 | 4 |
| SA03 | 目標站 | 15 / 10 | 10 | simulation |
| SP01 | 心理站 | 9 / 9 | 6 | 2 |
| SP02 | 記帳站 | 10 / 10 | 14 | 5 |
| SP03 | 分配站 | 15 / 10 | 10 | simulation |
| CR01 | 信用站 | 10 / 10 | 24 | 2 |
| CR02 | 卡片站 | 9 / 9 | 11 | 4 |
| CR03 | 護卡站 | 15 / 6 | 4 | 1 |
| IN01 | 投資站 | 12 / 6 | 7 | 1 |
| IN02 | 策略站 | 9 / 6 | 6 | 1 |
| IN03 | 新聞站 | 7 / 7 | 8 | 3 |
| IN04 | 進場站 | 15 / 8 | 8 | 3 |
| FR01 | 假投資站 | 8 / 8 | 9 | 3 |
| FR02 | 人頭站 | 8 / 8 | 8 | 3 |
| FR03 | 客服站 | 7 / 7 | 9 | 3 |
| FR04 | 交友站 | 8 / 8 | 9 | 3 |
| FR05 | 個資站 | 7 / 7 | 8 | 3 |
| FR06 | 165 判讀中心 | 15 / 10 | 10 | simulation |
| ST01 | 學費站 | 8 / 8 | 6 | 2 |
| ST02 | 貸款站 | 8 / 8 | 9 | 3 |
| ST03 | 住宿站 | 7 / 7 | 6 | 2 |
| ST04 | 打工站 | 7 / 7 | 6 | 2 |
| ST05 | 獎學金站 | 6 / 6 | 6 | 2 |
| ST06 | 選校站 | 15 / 10 | 10 | simulation |
| T01 | 薪資單站 | 7 / 7 | 6 | 2 |
| T02 | 級距站 | 8 / 8 | 6 | 2 |
| T03 | 憑單站 | 6 / 6 | 6 | 2 |
| T04 | 扶養站 | 6 / 6 | 6 | 2 |
| T05 | 補充保費站 | 6 / 6 | 6 | 2 |
| T06 | 申報站 | 15 / 10 | 10 | simulation |
| R01 | 看房站 | 6 / 6 | 6 | 2 |
| R02 | 契約站 | 8 / 8 | 6 | 2 |
| R03 | 報稅爭議站 | 6 / 6 | 6 | 2 |
| R04 | 修繕站 | 6 / 6 | 6 | 2 |
| R05 | 退租站 | 6 / 6 | 6 | 2 |
| R06 | 找碴站 | 15 / 10 | 10 | simulation |
| IS01 | 健保站 | 6 / 6 | 4 | 1 |
| IS02 | 職災站 | 6 / 6 | 6 | 2 |
| IS03 | 商保站 | 7 / 7 | 6 | 2 |
| IS04 | 儲蓄險站 | 6 / 6 | 6 | 2 |
| IS05 | 團保站 | 5 / 5 | 6 | 2 |
| IS06 | 推銷站 | 15 / 10 | 10 | simulation |
| E01 | 成本站 | 6 / 6 | 6 | 2 |
| E02 | 定價站 | 6 / 6 | 6 | 2 |
| E03 | 兩平站 | 7 / 7 | 6 | 2 |
| E04 | 現金流站 | 6 / 6 | 6 | 2 |
| E05 | 登記站 | 5 / 5 | 6 | 2 |
| E06 | 攤位站 | 15 / 10 | 10 | simulation |
| FI01 | 決策站 | 6 / 6 | 8 | 3 |
| FI02 | 決策站 | 15 / 10 | 10 | simulation |

## PROG-1 reproduction

- **Reproduced in code:** `buildStamps` gave a stamp whenever the line's last-station run existed.
- **Reproduced on a fresh dev-store account:** `progress-e` A did only 信用線's last station.
- **Now:** no stamp, no certificate, no 已走完.
- **The rule:**
  - The stamp, the certificate, 已走完 and the map's 已完成 all need every station of the line.
  - In one mode, every station counts; the core/deep split is gone.
  - A completion already on record is kept.

## CONT-1 and CONT-2

Not started (after the stop).

## From section 0, tested here

- **Certificates page:** the not-earned state lists the stations left; `progress-e` B checks earned vs not earned.
- **The 6-applicant 你是銀行 task with its write step:** `workspace-e` bank, 26 checks at 1440 and 390.
- **Widths:** 390 and 1440 on every station walker.
- **Not tested:** 320, 768, a keyboard-only walk, a screen reader, a real phone.

## Where this file was wrong or needs a decision

1. **DATA-3's example.** 投資線 had a station done (IN04), so under the file's own rule 1 it is a started line and 今天 continues it.
   - The real bug was the order: 消費 came before 存錢.
   - Fixed: 職涯, 存錢, 消費, 信用, 投資, then the map's order. A started line continues where the student touched it last.
   - A failed attempt now counts as touching the line (PROG-3's 做到一半).
2. **CMP-1's "80% word overlap".** Chinese has no word breaks.
   - On character pairs, a note that only restates its card scores about 0.6.
   - The screen hides a block over 0.55 against everything already shown.
   - The content check warns at 0.8. Four explanations repeat their card word for word: xinyong statement s1 and s2, xinyong protect s1, zhiya interest s1.
3. **The minutes formula gives CR01 (6 applicants × 3 documents) 24 minutes**, over the old 20-minute cap. Kept as the formula says; the cap test now checks that minutes equal the formula.
4. **財務決策線's two stations are both 決策站** (FI01 and the last station). One needs a new name; that's a content call.
5. **"consistency-e runs in CI".** The repo has no CI that runs a server. It is a fetch script against a dev server (`npx tsx tests/e2e/consistency-e.mts`).
6. **PERF-1's targets are "measured on the production build".** Production has real students, so measuring there means a test account in production. That is Ryan's call.

7. **LIFE-4's example doesn't meet its own rule.** NT$32,915 unallocated against NT$22,199 of bills is about 1.5 months, not more than 3, so that month would show no line. Built as the rule says. If the line should show in a month like that, the threshold needs to come down (to 1 month of bills, say).
8. **LIFE-1 leaves 月底現金 easy to find.** The month's header strip shows 現金, which is the same number as 月底現金 during 記帳 (COPY-2 territory). Not changed: the spec doesn't name it.

## Tests added

| Test | Covers |
|---|---|
| `perf-e` | PERF-1 |
| `consistency-e.mts` | DATA-1, DATA-2 |
| `tests/next-e.test.ts` | DATA-3 |
| `progress-e` | PROG-1 to PROG-3 |
| `compare-e.mts` | CMP-1 to CMP-6, UI-2 (with `/dev/compare` fixtures, dev only) |

Updated:
- `workspace-e`: the new compare screen, one button, focus.
- `briefs.test.ts`: minutes equal the formula.
- `answersPrivate.test.ts`: the PROG-3 copy.

**Full check:** `npm run check` 183 tests pass, contract ALL PASS, content 0 errors (92 warnings), contrast 0 misses, design-static 0. `tsc` clean, `eslint` 0 errors, `check-names` 0 hits.

**Run on the dev store, not the preview:**
- workspace-e (帳單, 銀行, 詐騙 case3), 0 failing;
- consistency-e: 1 warning, the duplicate name;
- progress-e, 15 / 15;
- compare-e, 702 / 702.

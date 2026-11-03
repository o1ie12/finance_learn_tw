# Spec 11 report: finlinetw.org launch fixes (2026-11-03)

- **Branch:** `feat/spec-v2`. Not merged to main.
- **Order:** section 1's.
- **Tested:** on a local dev server.
- **Not tested:** a real LINE or Facebook share. Those need the live domain.

## IDs

| ID | Status | What changed | Check |
|---|---|---|---|
| DOM-1 | Done in code; two steps are yours in Vercel (below) | `SITE_URL` (`lib/site.ts`) feeds `metadataBase`, canonical, og:url, the sitemap and robots: `NEXT_PUBLIC_SITE_URL` when it is a real domain, else `https://www.finlinetw.org` in production. `next.config.ts` 308s `finance-learn-tw.vercel.app` and `finlinetw.org` to www, keeping path and query; preview hosts are untouched. Every public page has a canonical. The sitemap lists the public pages, the 12 lines and their articles; robots keeps out the signed-in app. | `public-e` (redirects by Host header, canonical per page) |
| META-1 | Done | The new description and og strings, `og:locale` zh_TW, a 1200 × 630 `/og.png` (logo and 「理財，一站一站學。」, rendered by `scripts/render-share-images.mjs`), `summary_large_image`, `theme-color` #f2f3f4. Each public page has its own title and description (`lib/pageMeta.ts`); a line page describes its goal. The site title lost its em dash. | `public-e` (unique titles; og tags on every public route) |
| COPY-1 | Done (D6: the station has 4 stops, 想一想, 任務, 對答案, 人生; 先懂 no longer exists) | `content/flow.ts` `FLOW_STEPS` feeds the landing, /lines and the station stepper. The landing says 「一站約 4 到 24 分鐘，4 個停靠」 and that 看提示 and 延伸閱讀 are optional extras. | `tests/flow-copy.test.ts` |
| COPY-2 | Done | The range is the min and max of every station's computed minutes (`lib/stationFacts.ts`). | `public-e` |
| COPY-3 | Done, one change of rule (below) | 完成證書 → 完成紀錄 everywhere in the product (line page, certificate page, older homes). 「三、使用資格」 in the terms is now 「三、誰可以使用」. check-content errors on the four words in the product's UI and on 證書 or 認證 anywhere. | check-content |
| COPY-4 | Done | The 404's title is 「找不到這一頁 \| 錢途」. An unknown station says 「這條線沒有這一站」 and links back to its line. Signed-out 今天 307s to `/signup?next=/today`. | `public-e`; manual |
| CONT-1 | Listed | Over 15 minutes: **CR01 信用站, 24 minutes** (2 questions, 6 applicants with 3 documents each). Oliver decides: split, trim, or keep. | — |
| LEGAL-1 | Done (the line); legal review not done | On /signup: 「未滿 18 歲請讓家長或老師知道你在使用。」 No compliance claim anywhere. D5: no guardian field. | — |
| LEGAL-2 | Done | `lib/legal.ts` holds `LEGAL_UPDATED_AT` (2026 年 11 月 3 日) and a change list, shown on both pages. Privacy still lists nickname, school (optional), grade and the six-digit code: checked against the sign-up form. | — |
| LEGAL-3 | Kept, with a link | The 歷史回放投資模擬 exists (`/invest-replay` serves the replay on real TWSE closes). The terms now link to it. | — |
| ABOUT-1 | Waiting on the advisor | Nothing changed: the advisor's name and title stay until a written OK arrives, then the text moves to `content/team.ts`. /partnerships unchanged. | — |
| UI-1 | Done | 「全部 12 條路線 →」, the header logo and the footer links are 44px or more. | `public-e` |
| UI-2 | Done | `format-detection: telephone=no`, `apple-touch-icon.png` (180), `icon-512.png`. | — |
| VERIFY-1 | Done | `content/sources.ts`: every figure on the landing cites its primary source on 全國法規資料庫, shown under the figure with the date checked. | `tests/flow-copy.test.ts` (claims) |

## VERIFY-1 findings

| Claim | Source | Change |
|---|---|---|
| ETF 證交稅 0.1%, stock 0.3% | 證券交易稅條例 §2 | Kept. The note records the bond-ETF suspension, which runs to 2026-12-31. |
| 賣股不課資本利得稅 | 所得稅法 §4-1 (證券交易所得停止課徵) | The title is now 「股票價差不課所得稅」; the body says the tax is suspended (停徵) for individuals trading listed shares and ETFs. |
| 雇主勞退 6% | 勞工退休金條例 §14 (不得低於百分之六) | Now 「至少 6%」. |
| 健保 three-way split | 全民健康保險法 §27 | Now 「上班族的保費…分攤」, since the split applies to employees. |
| 循環利率上限 15% | 銀行法 §47-1 II (since 2015-09-01) | Kept: a primary source exists, so D7 doesn't apply. |

## For you in Vercel (I can't change project settings)

1. Make `www.finlinetw.org` the primary domain. Point `finlinetw.org` (apex) at the project too, so the redirect in code can run.
2. Set `NEXT_PUBLIC_SITE_URL=https://www.finlinetw.org` for Production. The code already falls back to it.
   - **Note:** that variable also makes the contact address on /privacy, /terms and /about read `hello@finlinetw.org`.
   - Only set it once that mailbox receives mail.
   - Until then the code still uses www.finlinetw.org for canonical links.
3. **Logins:** a student signed in on the vercel.app address arrives signed out after the redirect, because cookies belong to a hostname. Their six-digit code logs them back in.

## Where this file was wrong or needs a decision

1. **COPY-3's four-word ban.** 證照 and 資格 appear correctly in lesson content about the real world: a benefit's 資格, a job that needs 證照, 失業給付的資格.
   - Banning them there would make the lessons wrong.
   - The rule now covers the product's own UI (all four words) and all content (證書, 認證).
2. **COPY-1's "five stops".** The station screen has had four stops since 2026-11-02. 先懂 became the inline 看提示.
3. **COPY-2's suggested over-15 split.** CR01 is long because it shows 6 applicants' documents. Splitting it changes the task design, which is a content decision.
4. **META-1's "/og.png".** It is a static file; rerun `scripts/render-share-images.mjs` after a logo change.
5. **D5, D6, D7:** all resolved by their defaults.
   - D5: no guardian field.
   - D6: 4 stops.
   - D7: the 15% cap has a primary source, so it stays.

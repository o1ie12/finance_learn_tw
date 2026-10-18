/**
 * Trading costs shared by 投資線 and the life game. A leaf module on purpose:
 * it imports nothing, so client components can use it without pulling in the
 * historical price seed.
 */

/**
 * 證交稅 rates by instrument. Taiwan taxes the SALE, not the gain, and the
 * rate depends on what is sold: 股票 at 0.3%, ETF (受益憑證) at 0.1%. The rate
 * lives on each choice in the simulation, so a future non-ETF option cannot
 * silently inherit the wrong one.
 *
 * Source (verified 2026-10-06): 證券交易稅條例 §2 (law.moj.gov.tw pcode
 * G0340078) — 股票 千分之三; ETF 受益憑證 千分之一 per 財政部稅務入口網 FAQ
 * (etax.nat.gov.tw, 證券交易稅 Q&A). Student-facing copy that names these
 * rates is pinned by tests/regressions.test.ts ("投資線 copy").
 */
export const STOCK_TAX_RATE = 0.003;
export const ETF_TAX_RATE = 0.001;

/**
 * 券商手續費, charged on BOTH the buy and the sale: 0.1425% is the reference
 * rate; brokers have set their own discounts since 2008, and the old NT$20
 * minimum rule 不再援用 since 2021-10-01 (twse-regulation FE064320, verified
 * 2026-10-06, same source as station 5). Shown as the reference rate, with
 * the discount stated beside it.
 */
export const BROKER_FEE_RATE = 0.001425;
export const BROKER_FEE_LABEL = "0.1425%";

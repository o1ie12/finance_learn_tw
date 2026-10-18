# VERIFY results (Stage A)

Every `VERIFY` figure in the redesign package, checked against its primary
source on 2026-10-17. Fact-checkers opened each page; a search snippet was
never accepted as a source. Full quotes and notes follow the summary.

| # | Figure | Result | Value used | Primary source |
|---|---|---|---|---|
| 1 | 2026 最低工資 (monthly) | Verified | NT$29,500 from 2026-01-01. 2027 rate NT$30,900 reported to 行政院 on 2026-10-01, not yet in force | 勞動部 歷年最低工資調整 |
| 2 | 勞退自提 up to 6%, not taxed that year | Verified | 0 to 6%; excluded from that year's salary income | 勞工退休金條例 §14 III |
| 3 | TPASS 基北北桃 monthly | Verified | NT$1,200; no student price | 臺北捷運 / 悠遊卡 |
| 4 | 定存 early break | Verified (lesson only) | 80% of the posted rate on the deposit day for the period held; under one month earns nothing | 臺灣銀行 開戶總約定書 共同約定事項 四 |
| 5 | 0050 cash dividend yield | Corrected | 1.47% trailing (NT$1.60 over 12 months, close NT$109.00 on 2026-10-16), paid twice a year (Jan, Jul) | TWSE TWT49U + STOCK_DAY |
| 6 | 0056 cash dividend yield | Corrected | 6.95% trailing (NT$4.082 over 4 quarters, close NT$58.75 on 2026-10-16), quarterly | TWSE TWT49U + STOCK_DAY |
| 7a | 定期定額 minimum | Verified | NT$1,000 (元大, 富邦); some brokers allow NT$100 | broker pages |
| 7b | Fee minimum NT$20 | Verified for board-lot trades | NT$20 per trade; not applied to 零股 or 定期定額 orders | 永豐金證券 fee page |
| 8 | 失業給付 | Verified | 60% of average insured salary, up to 6 months (9 months for 45+ or with a disability) | 就業保險法 §16 |
| 9 | 零利率分期 wording | Verified | 「分期0利率」, no other fees on merchant installments | 台新銀行 |
| 10 | JCIC score range | Verified | 200 to 800; 「此次暫時無法評分」 when data is thin | 金融聯合徵信中心 |
| 11 | Unsecured debt cap | Verified | Unsecured debt ÷ average monthly income 「不宜超過22倍」 | 金管會 FE052046 |
| 12 | ETF code examples | 4 verified, 1 corrected | 00980A, 00631L, 00632R, 00642U as stated. 00982B holds USD bonds, so the bond example is **00679B 元大美債20年** | TWSE product pages |
| 13 | Lease deposit cap and model contract | Verified | ≤ 2 months' rent; 「住宅租賃契約書範本」 | 租賃住宅市場發展及管理條例 §7; 內政部地政司 |
| 14 | 雙北 single-room rent median | Not found | Rent stays 示意 | 內政部 (national median only) |
| 15 | 健保 bracket table | Not in repo | Game uses gross pay (no cap in its salary range), labelled | 02 §3.2 asks for this to be listed |

How the game uses these: `lib/lifeGame/constants.ts` cites this file by item
number. A figure with no source here stays labelled 示意 on screen.

---

## Batch 1 (items 1, 2, 3, 4, 8, 9, 13)


## Batch 2 (items 5, 6, 7, 10, 11, 12, 14)

## Batch 1 (items 1, 2, 3, 4, 8, 9, 13)


Checked: 2026-10-17. Every quote below comes from the primary page or document, opened directly with WebFetch or the in-app browser. Search snippets were used only to locate pages.

---

### Item 1 — 2026 (民國115年) minimum wage

- **Claimed:** NT$29,500/month, effective 2026-01-01
- **Status:** VERIFIED (with a forward-looking caveat)
- **Quote (勞動部, 歷年最低工資/基本工資調整):** 「民國114年10月21日發布，自115年1月1日起實施，訂定每月最低工資為29,500元，每小時最低工資為196元。」
- **URL:** https://www.mol.gov.tw/1607/28162/28166/28180/70460/76761/76833/ (corroborated by MOL press release 2025-09-26: https://www.mol.gov.tw/1607/1632/1633/84947/)
- **Date checked:** 2026-10-17
- **Note:** The hourly minimum is NT$196. **Caveat:** on 2026-10-01 the Executive Yuan heard MOL's report on the 116年 rate, set at 「自116年1月1日起，每月最低工資由29,500元調整至30,900元」, hourly NT$205 (https://www.ey.gov.tw/Page/448DE008087A1971/f56b115b-b12c-4ccd-b15f-816c42bfb1d7 ; MOL press release PDF https://www.ey.gov.tw/File/FC13612587EA80A0?A=C). That page does not explicitly say it has been 核定 (approved). Any copy that says 「今年」 or 「現行」 with 29,500 will be out of date from 2027-01-01.

### Item 2 — 勞退自提 up to 6%, tax treatment

- **Claimed:** voluntary self-contribution up to 6% of wage, deductible from that year's taxable salary income
- **Status:** VERIFIED (one wording nuance)
- **Quote (勞工退休金條例 第14條第3項):** 「第七條規定之人員，得在其每月工資百分之六範圍內，自願提繳退休金；其自願提繳之退休金，不計入提繳年度薪資所得課稅。」
- **URL:** https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=N0030020&flno=14 (corroborated by 勞保局 press release 2023-12-29: https://www.mol.gov.tw/1607/1632/1640/65630/)
- **Date checked:** 2026-10-17
- **Note:** The statute's wording is 「不計入提繳年度薪資所得課稅」: the amount is left out of that year's taxable salary income, not taken as a separate deduction. The safest copy is 「自提的錢不算進當年度的薪資所得課稅」. A NT$108,000/yr cap (150,000 × 6% × 12) appears only in search snippets. I did not confirm it on a primary page, so do not cite it.

### Item 3 — TPASS 基北北桃 monthly pass price

- **Claimed:** NT$1,200
- **Status:** VERIFIED. No student or youth price exists.
- **Quote (臺北捷運公司 press release 112-06-15):** 「基北北桃1200都會通定期票售價為1200元，購買時由悠遊卡扣除1200元並完成預購設定」
- **URL:** https://www.metro.taipei/News_Content.aspx?n=30CCEFD2A45592BF&sms=72544237BBE4C5F6&s=6BB5C02BE0D86292 (current issuer page also shows 「1200元」 with validity 「自啟用當日(含)起算【連續30日】」: https://www.easycard.com.tw/easycard?cls=1682492497&id=1683186954)
- **Date checked:** 2026-10-17
- **Note:** Neither official page gives a student or youth price. 學生卡 and 數位學生證 are only listed as cards you can load the pass onto. tpass.gov.tw now redirects to the 「綠色運輸服務平臺」 (TPASS 2.0 常客優惠回饋) and shows no regional prices. The metro.taipei price is from the 2023 launch release. The EasyCard page, which carries a ©2026 footer, still shows 1200元.

### Item 4 — 臺灣銀行 定期存款 early termination

- **Claimed:** interest at 80% of the posted rate for the term actually held
- **Status:** VERIFIED (with additional conditions)
- **Quote (臺灣銀行 開戶總約定書【自然人適用】 編號 總約001-11504-01, 共同約定事項 第四點):** 「中途解約者，應將該筆定期性存款一次結清，並依實際存款期間(包括不足月零星日數)以存入當日貴行各幣別期別定期存款牌告利率八折計息…惟未存滿一個月者，不予計息。」
- **URL:** https://www.bot.com.tw/Images/File/GetFileId/11a475fc-6b6e-47ef-a79b-c6f12b91a16e (linked as 「開戶總約定書-自然人」 from https://www.bot.com.tw/tw/footer/information-disclosure/canalization-contract)
- **Date checked:** 2026-10-17
- **Note:** Four details matter here:
  - The rate is the posted rate **on the deposit date** (存入當日) for the tier matching the period actually held.
  - Floating-rate deposits are recalculated in segments (分段計息) at each new rate × 80%.
  - **Under one month earns zero interest.**
  - Customers should give 7 days' notice (於七日以前通知).

### Item 8 — 失業給付

- **Claimed:** 60% of the average monthly insured salary for the 6 months before leaving; up to 6 months (longer for 45+ or disabled)
- **Status:** VERIFIED
- **Quote (勞保局 給付標準及期限):** 「失業給付最長發給6個月。但申請人離職辦理本保險退保時已年滿45歲或領有社政主管機關核發之身心障礙證明者，最長發給9個月。」
- **URL:** https://www.bli.gov.tw/0005071.html (page updated 2023-01-17); statute: 就業保險法 第16條 https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=N0050021&flno=16 (「前六個月平均月投保薪資百分之六十」「最長發給六個月」)
- **Date checked:** 2026-10-17
- **Note:** "Longer" means **9 months**. Payment counts from the 15th day after 求職登記. Art. 16 also lets the authority extend payment in an economic downturn, to a total of at most 12 months. Dependents' supplement (10% per dependent, max 20%) is under a separate article. The 10%/20% figures come from the 勞保局 page, as seen in the search summary; I did not quote them from the primary page.

### Item 9 — 信用卡零利率分期 wording and fees (台新銀行)

- **Claimed:** (asked) how one bank describes 「零利率分期」 and whether a 手續費 applies
- **Status:** VERIFIED, bank = **台新國際商業銀行 (Taishin)**
- **Quote (台新 「分期0利率/特約商店」):** 「分期特約商店刷台新信用卡享分期0利率」; 「特店分期廣告已揭露各項相關費用總金額且無其他應繳費用，各期分期利率換算總費用年百分率為0%」
- **URL:** https://www.taishinbank.com.tw/TSB/personal/credit/discount/special-store/
- **Date checked:** 2026-10-17
- **Note:** 台新 calls it 「分期0利率」, not 「零利率分期」. For 特約商店 installments, the APR is 0% and there are no other charges. 單筆分期 (single-transaction) runs 「0%-15%」 APR depending on the offer. Since 2023-03-01, 0% installment transactions earn **no** cash back, points or miles. The general installment terms page (2022-05-25) says 「無其他手續費」 and waives the early-settlement fee for 0% promos: https://www.taishinbank.com.tw/TSB/personal/common/legal-disclaimers/TSBankPublicDisclosure-000117/ . For comparison, 國泰世華 單筆消費分期 offers 「115/12/31前，享前12期0利率」 with 「總費用年百分率即為年利率」: https://www.cathay-cube.com.tw/cathaybk/personal/product/credit-card//loan/card-staging-single/ .

### Item 13 — Lease deposit cap and official document names

- **Claimed:** 租賃住宅市場發展及管理條例 第7條: deposit ≤ 2 months' rent; model contract 「住宅租賃契約書範本」; plus 應記載及不得記載事項
- **Status:** VERIFIED
- **Quote (條例 第7條第1項):** 「押金之金額，不得逾二個月之租金總額。」
- **URL:** https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=D0060125&flno=7
- **Date checked:** 2026-10-17
- **Note on names:**
  - 地政司 lists 「住宅租賃契約書範本」 among its 9 契約書範本 (https://www.land.moi.gov.tw/chhtml/content/78).
  - The companion rule is 「住宅租賃定型化契約應記載及不得記載事項」 (公發布 105-06-23, latest 修正 114-04-18, 台內地字第1140113583號), at https://glrs.moi.gov.tw/LawContent.aspx?id=GL000907 . Its 第五點 says 「最高不得超過二個月租金之總額」.
  - The current template file on 地政司 is labelled 「109年新版住宅租賃契約書」 (https://www.land.moi.gov.tw/chhtml/content/89?mcid=4054).
  - MOI also lists a separate 「住宅租賃契約應約定及不得約定事項」 (https://www.moi.gov.tw/cl.aspx?n=81). I did not confirm from the statute which kinds of landlord it covers.

## Batch 2 (items 5, 6, 7, 10, 11, 12, 14)


Every figure below was read from the primary source itself: TWSE JSON endpoints or ISIN listings fetched with curl, or official pages opened with WebFetch. Search snippets were used only to find the URLs.

---

### Item 5: 元大台灣50 (0050) trailing cash yield

- **Claim:** 0050 pays semi-annually or quarterly. Dividends per unit after the June 2025 1:4 split are about 1/4 of the earlier ones.
- **Status:** VERIFIED. 0050 pays **semi-annually** (January and July ex-dates), not quarterly.
- **Distributions from TWSE 除權除息計算結果表 (TWT49U):**

| Ex-date | Cash / unit | Close before ex-date |
|---|---|---|
| 2025-01-17 (114/01/17, before the split) | 2.70 | 198.05 |
| 2025-07-21 (114/07/21, after the split) | 0.36 | 51.45 |
| **2026-01-22 (115/01/22)** | **1.00** | 71.85 |
| **2026-07-21 (115/07/21)** | **0.60** | 99.20 |

- **Last 12 months (2025-10-17 to 2026-10-17):** 1.00 + 0.60 = **NT$1.60 per unit**.
- **Price used:** TWSE STOCK_DAY close of **NT$109.00 on 2026-10-16** (115/10/16), the last trading day before the check date.
- **Trailing 12-month cash yield:** 1.60 / 109.00 = **1.47%**. Computed against the 2025-10-31 close of 64.75 instead, it would be 2.47%. The price nearly doubled during the year, so the yield depends heavily on which price you divide by.
- **Exact quote (TWSE TWT49U row):** `'115年07月21日', '0050', '元大台灣50', '99.20', '98.60', '0.600000', '息'`. The 115年01月22日 row reads `'71.85', '70.85', '1.000000', '息'`.
- **URLs:**
  - https://www.twse.com.tw/rwd/zh/exRight/TWT49U?startDate=20250901&endDate=20261017&response=json
  - https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?date=20261001&stockNo=0050&response=json
- **Date checked:** 2026-10-17
- **Note:** TWT48U (upcoming ex-dividend notices) lists no pending 0050 distribution. The split ratio is consistent with the data: 2.70 before the split and 0.36 / 1.00 / 0.60 after it. The 元大投信 site (yuantaetfs.com) is rendered by JavaScript and returned no dividend data through WebFetch, so TWSE is the only source opened for this item.

---

### Item 6: 元大高股息 (0056) trailing cash yield

- **Claim:** 0056 pays quarterly.
- **Status:** VERIFIED. 0056 pays quarterly, with ex-dates in January, April, July and October.
- **Last 4 distributions from TWSE TWT49U:**

| Ex-date | Cash / unit | Close before ex-date |
|---|---|---|
| 2025-10-23 (114/10/23) | 0.866 | 37.75 |
| 2026-01-22 (115/01/22) | 0.866 | 38.21 |
| 2026-04-23 (115/04/23) | 1.00 | 42.61 |
| 2026-07-21 (115/07/21) | 1.35 | 49.95 |

- **Sum:** **NT$4.082 per unit**.
- **Price used:** TWSE close of **NT$58.75 on 2026-10-16**.
- **Trailing 12-month cash yield:** 4.082 / 58.75 = **6.95%**.
- **Exact quote (TWSE TWT49U row):** `'115年07月21日', '0056', '元大高股息', '49.95', '48.60', '1.350000', '息'`
- **URLs:**
  - https://www.twse.com.tw/rwd/zh/exRight/TWT49U?startDate=20250901&endDate=20261017&response=json
  - https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?date=20261001&stockNo=0056&response=json
  - https://www.twse.com.tw/rwd/zh/exRight/TWT48U?response=json
- **Date checked:** 2026-10-17
- **Note:** The next ex-date is **2026-10-22**, and TWT48U still shows 「待公告實際收益分配金額」. Once it goes ex, the October 2025 payment of 0.866 drops out of the 12-month window. Any figure written now will be out of date within a week, so state it with an as-of date.

---

### Item 7(a): 定期定額 minimums at major brokers

- **Claim:** NT$1,000 per deduction at some brokers and NT$3,000 at others.
- **Status:** CORRECTED, partly. NT$1,000 is right for 元大 and 富邦. Two other large brokers now start at **NT$100**. None of the brokers I opened uses NT$3,000 for Taiwan stocks or ETFs. NT$3,000 shows up only for 富邦's 投資組合 option and for 元大's mutual-fund 定期定額.

| Broker | Minimum | Exact quote | URL |
|---|---|---|---|
| 富邦證券 | NT$1,000, in NT$100 steps | 「台股、ETF每筆最低1,000元」「扣款金額皆以100元為級距」 | https://www.fbs.com.tw/DomesticStocks/TaiwanStocksRegularQuota |
| 元大證券 | NT$1,000 per month | 「台股(個股、ETF)每月最低1,000元即可存」 | https://www.yuanta.com.tw/file-repository/content/GuideAndTips/index.html |
| 國泰證券 | NT$100, fee included, in NT$100 steps | 「每筆最低100元(已含手續費)，以百元為單位增減。」 | https://istockapp.cathaysec.com.tw/Marketing/DCA/ |
| 兆豐證券 | NT$1,000, in NT$1,000 steps | 「每筆最低投資金額為新台幣1,000元，並以千元為級距增加」 | https://www.emega.com.tw/emegaTran/faqList.do?layer1_name=定期定額 |
| 永豐金 豐存股 | NT$100 per month | 「每月用 100 元」 (豐雲學堂 article, updated 2026.09.01) | sinotrade.com.tw (豐雲學堂 article on 永豐金定期定額) |

- **Date checked:** 2026-10-17
- **Note:** Suggested copy: 「各券商不同，常見每筆 100 元～1,000 元起」. Per 富邦's page, if one deduction cannot buy a single share at that day's price, the order fails. 國泰 also advertises a flat 1-元 fee on 定期定額 through 2026/12/31.

### Item 7(b): Minimum brokerage fee NT$20 (0.1425%)

- **Claim:** 手續費 is 0.1425%, with a minimum of NT$20.
- **Status:** VERIFIED for ordinary board-lot trades of listed and OTC stocks.
- **Exact quotes:**
  - 永豐金 fee page: 牌告費率 「1.425‰」; 「上市(櫃)股票 20 元/興櫃 50 元每筆不足 20 元以 20 元計」
  - 富邦 定期定額 page: 「手續費為成交價之千分之1.425」
  - Historical rule (財政部 函, 民國80年6月28日): 「依上述費率計算手續費未滿二十元者，按二十元計收。」
- **URLs:**
  - https://www.sinotrade.com.tw/newweb/Fee_Rate/?market=S
  - https://twse-regulation.twse.com.tw/TW/int/DAT01_print.aspx?FLCODE=FE064320
- **Date checked:** 2026-10-17
- **Note:** The TWSE regulation page says this 函釋 has not been used as a basis for penalties since 110/10/1, so cite the broker's posted rate rather than the 函. The NT$20 minimum does **not** apply to 零股 or 定期定額 orders. 永豐 lists 定期定額 at 「每筆 1 元」, and 國泰 charges a flat 1 元 under a promotion. In copy aimed at students who buy through 定期定額, say the NT$20 minimum applies to 整股 trades.

---

### Item 10: JCIC credit score range

- **Claim:** Scores run from 200 to 800, and people with too little credit data get 「此次暫時無法評分」.
- **Status:** VERIFIED.
- **Exact quotes (JCIC 個人信用評分判讀):**
  - 「揭露實際分數(分數介於200分至800分)，並提供分數之百分位區間」
  - 「如該當事人為暫時無法評分者，則揭露「此次暫時無法評分」。」
  - 「如該當事人為給予固定評分者，則揭露「200分」。」
- **URL:** https://www.jcic.org.tw/main_ch/List.aspx?uid=1556&pid=1556
- **Date checked:** 2026-10-17
- **Note:** There are three possible outcomes: a real score between 200 and 800, 「此次暫時無法評分」, or a fixed 200. The fixed 200 is for people with some negative records who still have normal credit activity. Per section 4-3 of the same page, being unscorable does not necessarily mean bad credit.

---

### Item 11: FSC DBR22 rule

- **Claim:** Total unsecured debt across all banks should not exceed 22 times average monthly income.
- **Status:** VERIFIED.
- **Exact quote (FSC regulation database, title of 金管銀(四)字第09600523370號, 民國97年01月07日):** 「金融機構對於債務人於全體金融機構之無擔保債務歸戶後之總餘額（包括信用卡、現金卡及信用貸款）除以平均月收入，不宜超過22倍」（以下簡稱DBR22倍）
- **Corroborating FSC page (金融智慧網):** 「金管會要求各銀行對於個人於全體銀行無擔保債務（含信用卡／信用貸款／現金卡）總餘額不得超過個人平均月收入的22 倍」
- **URLs:**
  - https://law.fsc.gov.tw/LawContent.aspx?id=FE052046
  - https://moneywise.fsc.gov.tw/tabf/FW/FW2_page_C.html
- **Date checked:** 2026-10-17
- **Note:** The official wording is 「不宜超過」 (should not exceed), and the rule covers credit cards, cash cards and personal loans. Mortgages are not included. The 2008 函 cited above clarifies which loans the rule covers. The rule itself predates it.

---

### Item 12: ETF code suffixes and examples

**Status:** Four of the five example codes are VERIFIED. 00982B is CORRECTED: it is a real, listed bond ETF, but its holdings are **USD** corporate bonds, not 新台幣 bonds.

Codes checked against the TWSE ISIN listing (on 2026-10-17):

| Code | 證券簡稱 (ISIN) | Market | Listing date | Verdict |
|---|---|---|---|---|
| 00980A | 主動野村臺灣優選 | 上市 | 2025/05/05 | VERIFIED: active equity ETF |
| 00982B | FT投資級債20+ | 上櫃 | 2025/04/28 | Exists and is a bond ETF. Its holdings are 20+ year BBB **USD** corporate bonds, so it is **not** a 新台幣-bond ETF. |
| 00631L | 元大台灣50正2 | 上市 | 2014/10/31 | VERIFIED: leveraged |
| 00632R | 元大台灣50反1 | 上市 | 2014/10/31 | VERIFIED: inverse |
| 00642U | 期元大S&P石油 | 上市 | 2015/09/07 | VERIFIED: futures ETF |
| 00679B | 元大美債20年 | 上櫃 | 2017/01/17 | First B-suffix ETF; the suggested alternative to 00982B |

- **Full names, from e添富 and other sources:**
  - 00980A: 「野村臺灣智慧優選主動式ETF證券投資信託基金」 (TWSE e添富).
  - 00642U: 「元大標普高盛原油ER指數股票型期貨信託基金」 (TWSE e添富).
  - 00982B: 「富蘭克林華美20年期以上BBB投資級美元公司債ETF」. This name comes from secondary sources only; e添富 has no page for OTC ETFs.
- **Recommendation:** In the "B = bond" example, either keep 00982B and describe it as a USD investment-grade corporate-bond ETF, or use **00679B 元大美債20年**, the best-known one, which holds 20+ year US Treasuries. Neither is a NT$-denominated bond fund.

**Suffix meanings, quoted from official TWSE product pages:**

| Letter | Meaning | Source quote |
|---|---|---|
| L | Leveraged | 「槓桿型ETF證券代號第六碼為L；反向型ETF第六碼為R。」 |
| R | Inverse | Same quote as L |
| U | Futures ETF (plain, non-leveraged) | 「原型期貨ETF證券代號第六碼為U，證券簡稱第一個字為「期」。」 |
| B / C | Bond ETF / bond ETF with a foreign-currency listing added | 「證券代號第六碼為B者係債券ETF；第六碼C係債券ETF加掛外幣受益憑證。」 |
| A / D | Active equity ETF / active bond ETF | 「證券代號第六碼為A者係股票ETF；第六碼D係債券ETF。」 |
| K | Equity ETF with a foreign-currency listing added | 「證券代號第六碼為K者係股票ETF加掛外幣受益憑證。」 |
| T | Balanced ETF | 宅在家學習網 (TWSE): 「第6碼英文字母T」 |

- **URLs for the table:**
  - L / R: https://www.twse.com.tw/zh/products/securities/etf/products/li.html
  - U: https://www.twse.com.tw/zh/products/securities/etf/products/vanilla-futures.html
  - B / C: https://www.twse.com.tw/zh/products/securities/etf/products/bfIncome.html
  - A / D: https://www.twse.com.tw/zh/products/securities/etf/products/active-list.html
  - K: https://www.twse.com.tw/zh/products/securities/etf/products/foreign.html
  - T: https://shl.twse.com.tw/newsArticle/detail/8a8221129854c8e70198dfd4f8b3000c?type=HotKnowledge
- **Correcting the claim "K = 外幣計價":** K means a stock ETF with a foreign-currency 加掛 listing under the dual-currency mechanism, for example 00625K 富邦上証+R. It does not mean a fund that is simply priced in a foreign currency. A leveraged or futures ETF can also carry L or R, for example 00715L 期街口S&P布蘭特油正2.
- **First 主動式 ETF:** TWSE e添富 article (2025.06.06): 「首檔主動式ETF「野村臺灣智慧優選主動式ETF」（00980A）於5月5日正式掛牌」. The article places this in 2025, which it calls 「主動式ETF元年」. The ISIN listing date of 2025/05/05 is the earliest of all 34 A-suffix codes.
  - URL: https://www.twse.com.tw/zh/ETFortune/hotetf/8a8216d696fb094001973399e65c00a9
  - TWSE press release (not opened, PDF): https://www.twse.com.tw/staticFiles/news/news/tsecnews/8a8216d6969512ca01969f8a3725000c.pdf
- **ISIN data URLs:**
  - https://isin.twse.com.tw/isin/C_public.jsp?strMode=2
  - https://isin.twse.com.tw/isin/C_public.jsp?strMode=4
  - https://isin.twse.com.tw/isin/single_main.jsp?owncode=00982B
- **Date checked:** 2026-10-17
- **Note:** The first active bond ETF (D suffix) was 00980D 主動聯博投等入息, listed 2025/08/04 on 上櫃. The 6-digit code rules took effect 113年11月18日.

---

### Item 14 (optional): 雙北 雅房 rent median

- **Status:** NOT FOUND as a clean official figure.
- **Exact quote (內政部 press release, 115-08-13, data as of end-March 2026 rent-subsidy leases):** 「全國租金總價中位數為8,600元」. The release gives no 臺北市 or 新北市 figure for 分租套(雅)房. It also says 分租套(雅)房 are 「未納入租金單價統計類型」.
- **URL:** https://www.moi.gov.tw/News_Content.aspx?n=4&s=340252
- **Date checked:** 2026-10-17
- **Note:** Per-district quartiles by rental type (整戶 / 獨立套房 / 分租套(雅)房) are published as downloads on pip.moi.gov.tw and in the 內政部租金查詢系統 (https://moisagis.moi.gov.tw/rent/). I did not open those downloads, so I am not giving a 雙北 figure. The data comes from rent-subsidy leases, not the whole market.

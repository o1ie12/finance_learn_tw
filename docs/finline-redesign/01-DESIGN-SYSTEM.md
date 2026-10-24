# 01. Design System and Screens

Everything visual for the game shell (every page after login). The landing page keeps its current design.

Implement tokens as CSS custom properties in one file (`app/(game)/game.css` or the Tailwind v4 `@theme` block, whichever the repo's Tailwind setup uses) and use only tokens in components. No literal hex values in components except inside SVG art parts.

---

## 1. Principles

1. **The station is the world.** One lit metro platform behind every screen. Cards float over it.
2. **The character is the student.** Center of the home screen. Shows security and options, never stuff.
3. **Documents look like documents.** A payslip looks like a payslip. A card statement looks like a statement.
4. **Short text, big numbers.** Numbers carry the story. Words explain one thing at a time.
5. **Line color means place.** Each line's color appears on its sign, its map segment and its task headers. Nowhere else.

---

## 2. Color tokens

### 2.1 Station (background scene)

| Token | Hex | Use |
|---|---|---|
| `--station-wall` | `#D5DDE3` | Wall behind everything, page background |
| `--station-tile-line` | `#C3CDD5` | 1px tile grid on the wall, 56×28 tiles |
| `--station-tunnel` | `#1B232B` | Dark area behind the platform doors |
| `--station-glass` | `#2E3B47` | Platform door glass, opacity 0.92 |
| `--station-glass-shine` | `rgba(255,255,255,0.06)` | Reflection bands on glass |
| `--station-mullion` | `#8C99A3` | Metal frames between glass panels, 8px wide every 228px |
| `--station-door-header` | `#2B3440` | 16px bar on top of the platform doors |
| `--station-floor` | `#AEB8C0` | Platform floor |
| `--station-floor-seam` | `rgba(22,32,42,0.05)` | 2px floor seams every 140px |
| `--station-edge` | `#F2C200` | Yellow tactile strip at the platform edge |
| `--station-edge-dark` | `#DDB100` | 2px dividers in the tactile strip every 18px |

Layout of the scene (percent of viewport height): wall 0 to 60%, platform doors 30% to 60% (door header at 30%), floor 60% to 100%, tactile strip 14px at 60%.

### 2.2 Surfaces and text

| Token | Value | Use |
|---|---|---|
| `--card` | `rgba(255,255,255,0.88)` | Floating cards |
| `--card-strong` | `rgba(255,255,255,0.94)` | Today's stop card, modals, documents |
| `--card-border` | `rgba(255,255,255,0.70)` | 1px card border |
| `--card-blur` | `10px` | `backdrop-filter: blur()` on cards. Fallback to `--card-strong` when unsupported |
| `--ink` | `#16202A` | Main text, sign background, name plate |
| `--ink-muted` | `#4E5B66` | Labels, captions (passes 4.5:1 on `--card`) |
| `--ink-inverse` | `#FFFFFF` | Text on `--ink` |
| `--ink-inverse-muted` | `#C9D3DB` | Secondary text on `--ink` |
| `--track` | `#DDE3E8` | Empty part of progress bars, dividers |
| `--chip-off` | `#EEF1F4` | Locked chips |
| `--focus` | `#1F5FB8` | Focus ring, 3px, offset 2px |

### 2.3 Meaning colors (separate from line colors)

| Token | Hex | Meaning |
|---|---|---|
| `--good` | `#13906B` | Calm, safe, done, correct |
| `--good-ink` | `#0E6B50` | Text on `--good-soft` |
| `--good-soft` | `#E3F3EC` | Unlocked chip background |
| `--warn` | `#E07A00` | Attention, streak flame |
| `--warn-soft` | `#FFF1DE` | Warning banner background |
| `--bad` | `#C62828` | Debt, danger, wrong |
| `--bad-soft` | `#FDE7E7` | Danger banner background |
| `--money` | `#B8860B` | Freedom bar, gold numbers |
| `--info` | `#1F6FD1` | Emergency fund bar, neutral highlights |

Never use red and green alone to tell states apart. Always pair with an icon or a word.

### 2.4 Line colors

`lib/lines.ts` is the source of truth for line colors. Do not change them. Read them from there. The mockups use placeholder line colors; replace them with the real ones.

### 2.5 Shadows and radius

| Token | Value |
|---|---|
| `--shadow-card` | `0 14px 32px rgba(22,32,42,0.18)` |
| `--shadow-float` | `0 16px 36px rgba(22,32,42,0.22)` |
| `--shadow-pill` | `0 8px 20px rgba(22,32,42,0.14)` |
| `--radius-card` | `18px` |
| `--radius-inner` | `10px` |
| `--radius-pill` | `999px` |
| `--radius-sign` | `8px` |

---

## 3. Type

| Token | Font | Use |
|---|---|---|
| `--font-body` | Noto Sans TC 400/500/700, fallback PingFang TC, Microsoft JhengHei, sans-serif | All text |
| `--font-sign` | Barlow Condensed 600/700, fallback Arial Narrow, sans-serif | Numbers, money, English on signs, line codes |

Load both with `next/font/google`, `display: swap`. Numbers always `font-variant-numeric: tabular-nums`.

| Style | Size / line height | Weight | Notes |
|---|---|---|---|
| Hero number | 34 / 1.1 | Sign 700 | Freedom %, big money |
| Card number | 26 / 1.1 | Sign 700 | Stat card values |
| Title | 22 / 1.3 | Body 700 | Station sign name, screen titles |
| Question | 20 / 1.4 | Body 700 | Hook questions, task prompts |
| Body | 15 / 1.6 | Body 400 | Lesson text |
| Label | 13 / 1.4 | Body 700, letter-spacing 0.08em | Card titles |
| Caption | 12 / 1.4 | Body 400 | Source lines, hints |

Minimum text size 12px. On phones, Hero 28 and Question 18.

---

## 4. Spacing, layout, motion

**Spacing scale:** 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32 px. Card padding 18. Gap between cards 14. Gap between columns 24.

**Breakpoints:** phone < 720px (one column), tablet 720 to 1099 (two columns: character + one side stacked), desktop ≥ 1100 (three columns).

**Motion tokens:**

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Cards arriving, reveals |
| `--ease-in-fast` | `cubic-bezier(0.55, 0, 1, 0.45)` | Train leaving |
| `--dur-quick` | `160ms` | Hover, press |
| `--dur-base` | `280ms` | Card in, chip select |
| `--dur-slow` | `600ms` | Doors |
| `--dur-ride` | `900ms` | Train leaving |

Under `prefers-reduced-motion: reduce`: all durations become 0 except fades, which become 120ms. No movement at all.

**Hover and press:** cards lift 2px on hover (`translateY(-2px)`), buttons scale 0.98 on press. Nothing bounces.

---

## 5. Components

| Component | Spec |
|---|---|
| `StationScene` | The background in 2.1. Pure CSS, `aria-hidden`, `pointer-events: none`, fixed behind content |
| `FloatCard` | `--card`, blur, border, `--radius-card`, `--shadow-card`, padding 18. Title uses Label style |
| `StationSign` | `--ink` box, 12px line-color bars both sides, station name (Title, letter-spacing 0.1em), English line + station code below (sign font 14, `--ink-inverse-muted`, letter-spacing 0.14em) |
| `StatBar` | Label left, value right (bold), 10px bar on `--track`, fill color by meaning, optional caption |
| `MoneyStat` | Caption label, Card number, "來自 X線" caption. If the value is a stand-in, caption reads "預設值，完成 X線 後更新" |
| `Chip` | Pill, 13px/500, padding 6×12. Unlocked: `--good-soft` / `--good-ink`. Locked: `--chip-off` / `--ink-muted` + 12px lock icon |
| `PrimaryButton` | `--ink` or line color background, white 17px/700, radius 12, min height 48, padding 14×28 |
| `NamePlate` | `--ink` box, radius 10, name 17/700, subtitle 12 `--ink-inverse-muted` |
| `MoodBubble` | `--card-strong`, radius 14, 10px dot in meaning color + short text |
| `MiniMap` | SVG schematic, line segments in line colors, stations as white dots with ink stroke, current station larger, train marker. Selected line full opacity, others 0.3 |
| `LineChip` | Button, 44px min height, color dot + name + status. Selected: 2px border in line color |
| `Document` | See section 8 |
| `TrainTransition` | See section 7.3 |

Icons: inline stroke SVG, 2px stroke, round caps. No emoji anywhere.

---

## 6. Screens

All game-shell screens: `StationScene` behind, no site header, no footer. Top-left: Finline wordmark pill (link to dashboard). Top-right: streak pill and settings button (44×44). On phones these two pills stay, everything else stacks.

### 6.1 Dashboard (`/dashboard`, and `/simulate` renders the same home)

Three columns on desktop, per the mockup `Main.dc.html`:

**Left column (max 330px), three floating cards:**
1. **角色狀態:** 壓力 bar (low/medium/high, from `02` section 5), one-line reason ("有存款，沒有卡債"). 緊急預備金 bar in months ("1.2 / 3 個月").
2. **我的錢:** 月收入 and 已存下 as `MoneyStat` with their source line. Divider. 財務自由進度 bar (`--money`) with % and the caption "被動收入 ÷ 月薪。到 100% 就是財務自由。"
3. **已解鎖的行動:** chips for every life-game move, unlocked first. Divider. "已完成 N / 12 條線" and "證書進度 N%".

**Center column:**
1. `StationSign` for the station the character stands at.
2. `MoodBubble` above the character: dot + reason ("安心：有緊急預備金" / "有點緊張：卡費還沒繳清" / "壓力很大：欠款在變多").
3. The avatar, about 210×306 on desktop, 160×233 on phone, feet on the platform floor.
4. `NamePlate` under the feet: name, then "N 歲 · 人生階段".
5. **Today's stop** card (`--card-strong`, `--shadow-float`, max 640px): label "今日一站 · 約 N 分鐘" in the line color's dark text, the station's hook question (Question style), one line of what they'll do, `PrimaryButton` "上車" in the line color.

**Right column (max 370px):**
1. **路線圖** card: `MiniMap` then a 2-column grid of 12 `LineChip`s. Clicking a chip highlights its line on the map and fills the card below.
2. **Line detail** card: color dot, line name, status, next station text, what it unlocks. Button "看全部站點" to the line page.

**Phone (< 720px):** order is sign, character, today's stop, then left cards, then map. The character stays above the fold.

**Data sources:** money stats from `financialSnapshot()` and the life-game save; completion from `lineStatus` (mode-aware) plus `line_completions`; today's stop from `02` section 7.2; streak from Stage K.

### 6.2 Character creator (`/onboarding/character`)

One screen. Left: big avatar preview on the platform. Right: a `FloatCard` with tabs: 臉, 髮型, 衣服, 顏色. Each tab shows 6 to 8 options as 64×64 buttons with the part drawn on them. Name field (2 to 8 characters, required, plain text only, no links, stored as entered and rendered as text). "完成" button.

Parts (SVG layer components, same 220×320 viewBox as the mockup):

| Layer | Options |
|---|---|
| Skin | 6 tones: `#F3CDA6`, `#E8B88E`, `#D9A27A`, `#C68B62`, `#A86E4A`, `#7E5236` |
| Face | 6: smile, grin, calm, glasses + smile, freckles + smile, wink |
| Hair | 8: short, side part, buzz, bob, long straight, ponytail, curly, bun |
| Hair color | 6: `#2A1E17`, `#4A3426`, `#7A5230`, `#B07A3C`, `#1B1B1B`, `#8E3B5C` |
| Outfit | 6: hoodie, school uniform shirt, T-shirt, jacket, sweater, polo |
| Outfit color | 8: `#2F6FDB`, `#13906B`, `#C4471C`, `#7A4FD0`, `#2B3440`, `#B8860B`, `#C2185B`, `#E9EEF2` |

No outfit, accessory or color is ever locked behind money, progress or purchase.

### 6.3 Onboarding flow

1. Character creator (6.2).
2. **Set your goal** (`04` section 1.3): pick a goal card or write your own, then amount and months. Live SMART check shows 5 small ticks (具體, 可衡量, 做得到, 相關, 有期限) and turns each green as it's met. "做得到" checks the monthly amount against the starter budget and says plainly if it's not reachable yet.
3. **First ride:** `TrainTransition` from 起點站 to the first line, then the dashboard with a 3-step guided highlight (the existing tour, restyled): your character, today's stop, the map.

Existing students: steps 1 and 2 once on next login, both skippable, then dashboard.

### 6.4 Life game turn screen (`/play`)

Top bar inside the shell: month counter ("第 7 個月"), the four key numbers as pills (現金, 存款, 投資, 負債), freedom % pill.

The turn is a horizontal step strip with 6 steps (`02` section 4): 發薪日 → 先存錢 → 帳單 → 行動 → 人生事件 → 記帳. Current step highlighted. Each step is one `FloatCard` in the center:

1. **發薪日:** payslip `Document` (gross, 勞保, 健保, net). Button "收下".
2. **先存錢:** a slider or number input for how much to save first (default: the student's plan). Shows the formula live: 收入 − 存錢 = 可以花的錢, and below it this month's bill total so the student can see whether what's left covers it. Button "存起來".
3. **帳單:** the bill sheet `Document` with this month's fixed bills. Total at the bottom. Button "繳費".
4. **行動:** cards for unlocked moves (`02` section 3.4). Each card: name, what it does, cost, one-line risk. Locked moves show a lock and "完成 X線 解鎖". Student allocates leftover money. Button "確定".
5. **人生事件:** one event card flips over (rotateY under 400ms, no flip under reduced motion). Shows what happened, the cost, and what protected them if anything ("你有醫療險，只付了 NT$2,000"). Button "繼續".
6. **記帳 (every 3rd turn):** a ledger `Document` with blank cells. The student fills in end-of-month balances. Wrong cells turn `--bad-soft` with a hint. Two tries, then the answer shows. Other turns: a summary card with the month's changes.

The character (small, 120px) stands at the bottom left of the scene on every step, mood updating live.

### 6.5 Station page (daily lesson)

One flow, five panels, one at a time, progress dots at the top:

1. **Hook:** sign, the hook question (Question style), 2 to 4 answer buttons. No right answer is shown yet.
2. **Lesson:** one framework from `04`, as a visual (a diagram, a short table or a comparison of two people). At most 80 characters of text per card, up to 3 cards. "下一步".
3. **Task:** the task engine (`03`). Documents on the left (or top on phone), the task on the right.
4. **Model answer + bias reveal:** the student's answer beside the model answer. Then the reveal card: "你剛剛的選擇，背後是「錨定效應」" with a 2-sentence explanation tied to what they chose. Then the takeaway framework as a small card they can save to 我的工具.
5. **Life game turn:** "回到你的人生" button runs one turn (6.4), then the train transition to the next station.

The old lesson text stays available behind a "看完整課文" link on panel 2.

### 6.6 Line page (`/line/[slug]`)

Station-sign header in the line color, a vertical route with station dots (done / current / next / locked), what the line unlocks, the certificate tile. Same floating card style. Keep the current data; restyle only.

### 6.7 Results, certificate, passport, review

Restyle into the shell (floating cards on the station). Keep all current data and behavior, including stand-in labels and the certificate's real-progress ticks.

---

## 7. Animation specs

### 7.1 Card arrival

Cards enter with `opacity 0 → 1` and `translateY(8px → 0)`, `--dur-base`, `--ease-out`, staggered 40ms. Never start a card at opacity 0 waiting for an observer: content must be readable if the animation never runs.

### 7.2 Number changes

Money numbers count from old to new over 500ms (not under reduced motion). Gains flash `--good` text color for 600ms, losses `--bad`.

### 7.3 Train transition (product timing, total 2.6s)

Match `mockups/Transition.dc.html`. Layers back to front: tunnel, train, speed lines, glass walls, door header, door panels, door label, floor, tactile strip, character, station sign, next-station card, skip button.

| Time | What happens |
|---|---|
| 0.0s | Train is stopped behind the doors. Doors open (each panel slides 76px outward, `--dur-slow`) |
| 0.5s | Character walks into the door: `translateY(-60px) scale(0.8)`, opacity to 0, 700ms ease-in. Character is drawn from behind (hair covers the face) |
| 1.2s | Doors close, 500ms |
| 1.7s | Train leaves: `translateX(-130vw)`, `--dur-ride`, `--ease-in-fast`. Three speed lines fade in for the ride |
| 2.3s | Next-station card fades up (opacity, translateY 14px → 0), 300ms. Text: "下一站" / line + station / one line of what's there |
| 2.6s | `onDone()` |

- "跳過" button visible from 0s (44×44, bottom right).
- After a student has watched 3 full rides, later rides are a 400ms crossfade to the next-station card.
- Reduced motion: no ride, 120ms crossfade to the next-station card.
- Every step uses a timeout fallback, never rAF or `transitionend` alone.
- The train body uses the destination line's color for its stripe.

---

## 8. Documents (materials)

Documents are the heart of the tasks. Each one is a component that takes data and renders like the real thing, on `--card-strong` with a 1px `#D3DBE2` border and radius 10. Font: body font, with numbers in tabular figures. Fields are real elements so screen readers can read them in order.

| Document | Looks like | Fields |
|---|---|---|
| `Payslip` 薪資單 | Company payslip | 公司, 月份, 本薪, 加班費, 應發合計, 勞保自付, 健保自付, 勞退自提, 實發金額 |
| `CardStatement` 信用卡帳單 | Bank statement | 銀行, 帳單月份, 結帳日, 繳款截止日, 本期應繳總額, 最低應繳金額, 交易明細 (入帳日, 消費日, 說明, 金額), 循環利息, 信用額度 |
| `CreditReport` 信用報告 | Credit bureau summary (generic, no real logos) | 姓名 (fictional), 年齡, 職業, 月收入, 年資, 信用卡 (張數, 額度使用率, 近 12 個月遲繳次數), 貸款 (餘額, 月付), 近 3 個月被查詢次數, 擔任保證人, 呆帳/強制停卡紀錄, 信用評分 (示意) |
| `ChatThread` LINE 對話 | A chat app (generic, not LINE's real UI or logo) | Contact name, avatar initial, messages with time, links shown as text, images as gray placeholders with captions |
| `BillSheet` 帳單表 | Household bill sheet | Rows: 項目, 金額, 繳費日; total row |
| `Ledger` 記帳表 | Accounting sheet with blanks | Rows: 月初現金, 收入, 存錢, 帳單, 行動, 事件, 月底現金; editable blank cells |
| `Policy` 保單摘要 | Insurance policy summary | 保險公司 (fictional), 險種, 保費, 繳費年期, 保障內容, 除外責任 |
| `LeaseClause` | Keep the existing lease component | |
| `Snapshot` | A small card about one person | Name, then label/value rows |
| `PriceChart` | Simple line chart | Monthly closes from `historical_prices`, one marked month, axis labels in NT$, drawn in SVG with tokens |
| `NewsCard` | A news clip (generic, no real outlet) | Headline, date label, 2-line body, small "示意" tag |

All company, bank and person names are fictional and marked as such in a footnote on the document: "名稱皆為虛構".

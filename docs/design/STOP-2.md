# STOP 2: the first full station on the new design

Branch `feat/design-e`, pushed as its own branch for a Vercel preview. `main` is untouched.

- **Try it:** sign in on the preview, open 今天, press 上車. Stations now open at `/line/[slug]/station/[n]`.
- **Screenshots** (`docs/design/screens/`):
  - `review-stop2-390x844-light.png` and `-dark.png`: 今天, hook, task, reveal.
  - `station-NN-*.png`: every screen of 信用站 at 390×844, 375×667 and 1440×900, light and dark.

## Done since STOP 1

1. **Your STOP 1 defaults:**
   - The station sign and name plate stay dark in dark mode (new `--sign` tokens that never flip).
   - A 1px white rim on the character on the platform, off on low-end devices.
   - Font budget miss accepted; line stripes kept as they are.
2. **The station flow (E8.2 to E8.5)** at `/line/[slug]/station/[n]`, full screen with no tab bar. Scoring, the server-side answer key, the shuffled order, the A6 pass rule and the retry are the same code as before. Only the screens are new:
   - **Hook:** a sheet over the line's world, with the character thinking beside 「先想一下，沒有標準答案。」. The options are real radio buttons in a form, so a tap before the page's script loads still counts (the 05 A8.6 fix).
   - **Lesson cards:** one card per screen, each with 繼續.
   - **Brief:** the current task brief with 開始任務. The new message-style brief (F3.1) comes in JOB 3.
   - **你是銀行:**
     - one applicant per screen, with its own six-step rail
     - the credit report scrolls in its own region above a fixed 1 / 2 / 3 row and 確定
     - keys 1, 2, 3 and Enter
     - desktop: report left, question right
   - **Score:** the A6 wording and 再試一次.
   - **Model answers:** one per screen.
   - **Reveal:** the character (proud after a pass), 「你剛剛的選擇，背後是」, the bias, the explanation and the takeaway card, with 繼續 and 存到工具箱.
   - **Desktop:** the world is a 480px stage panel. Buttons sit under their pane, never across the whole window.
3. **Documents:** all 11 now read the Part E tokens, dark mode included, through the older names mapped in `app/tokens.css`. Their layout is not rebuilt to E7.6 yet.
4. **今天's 上車** opens stations on the new flow. The older `/course/` pages still work.

## E18 results

| Test | Result |
|---|---|
| 信用站 end to end (`tests/e2e/station-e.mjs`): hook, 2 cards, brief, 6 applicants, score, 6 model answers, reveal | 40 screens at 390×844, 40 at 375×667, 40 at 1440×900, light and dark: no page scroll, every target ≥ 44×44, no text under 12px, no page errors |
| E18 browser checks (`scripts/check-design.mjs`) on 今天 and the station's first screen | Pass at 390×844, 375×667, 360×740 and 1440×900, light and dark. Covered: 200% text, targets, focus rings, reduced motion, layout shift 0.000. Fonts: 28 requests, the accepted miss |
| Part C screen check (older flow, life-game month, reader) | 27 screens, 0 scroll, 0 errors |
| Contrast, static design checks, `npm run check` | 144 tests pass, contract ALL PASS, content 0 errors, contrast 0 misses, design static 0 problems |
| Partner-name scan, `next build` | 0 hits; build passes |

## Skipped, and why

- **Older task views.** Find, sort and order still use the older step views inside the new frame (信用站 has none). They get rebuilt to E8.4 with 卡片站 (find and choice), next.
- **Model answer wording.** The model-answer screens still use the older ModelAnswer body. F3.2's new wording (「這是一種做法，不是唯一的答案。」, 「和建議答案不同」, 再做一次) is JOB 3.
- **Draft autosave on leaving a station (E6.2).** Not built yet. Leaving with ‹ or ✕ goes to 今天, and the station reopens at the hook.
- **Swipe.** No swipe-down on the hook sheet and no swipe between lesson cards yet. Buttons and keys do the same.
- **Life game and ride.** After the reveal, 繼續 still goes to the older life-game month and train ride. E8.6 and E11 are E16 steps 5 and 6.
- **Lesson cards.** They are text-only because the existing card data has no visuals. E8.3 asks for a visual first; that needs art or diagrams per card.

## For you to know

- **Desktop sheet.** On desktop the hook sheet sits at the bottom of the 480px stage panel. E7.12's separate centered dialog with a dimmed backdrop would cover the same 480px; tell me if you want the backdrop.
- **The 22x card.** The lesson card on 信用站 says 「原則上不超過月收入的 22 倍」. VERIFIED.md confirms the rule is the FSC's 「不宜超過」, so 「原則上」 is accurate.

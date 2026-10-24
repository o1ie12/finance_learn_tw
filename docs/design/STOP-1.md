# STOP 1: tokens, character and shell

Branch `feat/design-e`, built on `fix/playtest-05`, pushed as its own branch for a Vercel preview. `main` is untouched. Screenshots are in `docs/design/screens/` (390×844, light and dark; desktop where noted).

## Done

1. **Specs in the repo.** `docs/finline-redesign/` holds 00 to 06 from your paste, with partner organisation names removed (the repo is public). 06 is renamed `06-DECK-AUDIT.md`. `scripts/check-names.ts` (`npm run check:names`) scans every changed file and commit message with the content check's hashed deny list.
2. **VERIFY, all nine items** (`docs/finline-redesign/VERIFIED.md`, official sources only, quotes and URLs):
   - **VERIFIED:**
     - deposit insurance
     - free credit report
     - DBR22: an FSC rule (「不宜超過」), not a law
     - joint vs general guarantor
     - debt negotiation: the deck's "only above 22x" condition is refuted
     - insurance roles
     - scooter insurance: the mandatory amounts rose on 2026-07-01, so NT$2,000,000 is out of date
   - **PARTLY VERIFIED:** TISA. Its rules are on the central depository's FAQ, not an FSC page.
   - **UNVERIFIED:** whether an online certificate counts in 學習歷程檔案 (D3 stays open).
3. **Tokens (E2):** `app/tokens.css` has every value Part E states: light, dark, both increased-contrast sets, reduced transparency, the low-end flag. Both springs are computed from ζ and ω; their overshoot matches the spec (0.5%, 3.8%). Tailwind gets the new names.
4. **Fonts (E4):** Inter (one variable file) and Barlow Condensed via `next/font`. Noto Sans TC and Huninn load at runtime from Google, with nothing CJK preloaded.
5. **Icons and primitives (E5, E7):**
   - Every component in E7 with all its states: button, top bar, rail, option row, rating row, segmented control, document, sign, name plate, bubble, chip, card, sheet, the one alert, toast, tab bar.
   - `/dev/ui` shows them all and 404s in production.
6. **Character (E10)** with every E10.3 option and the six moods, front and back. Idle and blink stop under reduced motion, the low-end flag, offscreen and a hidden tab. `/dev/character` shows the contact sheet and the character in each scene.
7. **Scenes (E9):** the platform to E9.2's numbers, and 信用線's bank lobby. Both have the stage light.
8. **Shell (E6.1, E8.1):**
   - The four tabs, which become a left rail on Regular width.
   - 今天 on the platform: pill bar, sign, mood bubble, character, name plate, today's stop and 上車.
   - On desktop, a 480px stage panel with the card beside it.
   - The stored avatar is read as an E10 look; the stored data is unchanged.

## Skipped, and why

- **狀態, 路線, 行動** are placeholders that point to the current home. They are E16 step 5, after STOP 2.
- **Login still lands on the old home.** `/today` exists, but sign-in still goes to `/dashboard` until the shell has all four tabs and the station flow, so students never land on a half-built home. Switching it is one line, `homeFor()`.
- **Other screens are only partly restyled.** The older screens now read the new tokens: solid cards, new colors. They are not rebuilt yet, and in dark mode they can look rough until their step.
- **No first-load JS delta (E17).** Next 16's build output no longer prints per-route sizes.

## What in the spec was wrong, missing or impossible

1. **The mockups folder is not available** (tokens.css, character.js, scenes.js, screens.mjs, the PNGs). Everything here is built from the values written in Part E.
   - **Hair, outfit and face details** are my own geometry, drawn to E10's descriptions. Please review them against `mockups/sheet.png` if you have it.
   - **Values Part E does not state** are marked `TODO-SPEC` in `app/tokens.css`:
     - the light material
     - the `--line-ink` and `--line-soft` mix percentages
     - `--ease-out` and `--ease-in` (I reused the shell's existing curves)
     - dark hairlines, dark soft backgrounds and the dark focus color
     - dark increased-contrast hairlines
2. **Line colors (E2.5):**
   - **Chip text.** 存錢線, 詐騙線 and 保險線 missed 4.5:1 by a hair. They now have a darker `lineInk` (only for those three; base colors unchanged).
   - **Text on the line color.** 信用線 (yellow) and 創業線 (orange) are too light for white text (2.08 and 2.82). Text on a line color now uses whichever of white or ink reads better.
   - **Stripes and borders.** Those same two colors are under 3:1 on white as a stripe or border. The spec forbids changing base colors, so this needs your decision.
3. **E18 asks for 8px between targets, but E7.13 asks for four equal tabs edge to edge** (about 97×49 each). The check now treats tabs in one bar, and segments of one control, as one group.
4. **E18 "≤ 4 font requests" cannot be met with Chinese web fonts.** Google serves Chinese fonts in small character slices. 今天 loads:
   - 2 Latin files for the shell
   - 4 files of the public site's fonts, which the root layout preloads on every page
   - about 16 CJK slices (Noto Sans TC 9, Huninn 7)

   Nothing is render-blocking and layout shift is 0.000. Options:
   - (a) Accept the budget miss.
   - (b) Drop the Noto Sans TC web font for UI text and use the system Chinese face (PingFang TC, Microsoft JhengHei), which the spec already names as the fallback. Keep Huninn for the voice text.
   - (c) Move the public site's fonts out of the root layout.
5. **Character contrast on the platform (E9.1.4, the review gate).** The character's head and body overlap the dark tunnel band. There the dark outline is about 1.0 to 1.3:1 against the tunnel, so dark hair and the charcoal outfit lose their edge. Against the wall and floor the outline separates every outfit. E9.2 says to keep the platform's numbers, so this is not changed. Options:
   - (a) A light rim (2px white at 0.6) outside the outline, on the platform only.
   - (b) A lighter glass tone behind the character.
   - (c) Move the character down so the head sits below the tunnel.
6. **Station sign and name plate in dark mode.** They use `--ink`, which flips to light in dark mode, so the sign becomes a light plate with dark text. It follows the tokens, but real station signs stay dark. Keep it, or pin both to a dark color?
7. **Bubble length.** The spec's own example 「緊張：下個月帳單要到了」 wraps to two lines at the 210px max width.
8. **Sign codes:**
   - **Collisions.** Several lines share a first letter: Career and Credit, Savings, Spending and Student Loans, Investing and Insurance, Fraud and Financial. Those get two letters (CA, CR, SA, SP, ST, IN, IS, FR, FI).
   - **Station numbers.** I numbered stations within each line (信用站 is CR01), not as C03.

## E18 results

| Test | Result |
|---|---|
| Contrast (`check-contrast.mjs`, in `npm run check`) | 88 pairs, 0 misses, 1 exempt (disabled label 4.15, as E2.4 says). Two line stripes reported for a decision |
| No-scroll, 今天 at 390×844, 375×667, 360×740, 1440×900, light and dark | All 8 pass |
| 200% text, 今天 | No horizontal overflow; 上車 stays inside the view |
| Targets ≥ 44×44 and ≥ 8px apart | Pass (tab bar treated as one group, see above) |
| Type floor 12px | Pass |
| Focus outline ≥ 2px on every tab stop | Pass |
| Reduced motion: no transform animations | Pass |
| Layout shift on 今天 | 0.000 |
| Fonts ≤ 4 | **Fail**, see item 4 above |
| No CJK preload | Pass |
| Tokens: no raw hex in Part E component code | Pass (`check-design-static.mjs`, in `npm run check`) |
| Copy: no emoji, 我們, 我的工具, 提交, 下一張, 下一題 | Pass, for the Part E code |
| Art budgets | Platform 3.4KB, bank 3.0KB (≤ 20KB) |
| Glyph coverage (Huninn) | Not run yet |
| `npm run check` | 144 tests pass, contract ALL PASS, content 0 errors |
| `next build` | Passes |

Only the shell exists so far, so the station and turn screens are not in the no-scroll run yet.

## Not decided here (as asked)

- **D1** ungraded stations: the A6 pass rule stays.
- **D2** practitioner intro videos.
- **D3** 學習歷程檔案 wording. VERIFY item 9 found nothing official on online certificates.

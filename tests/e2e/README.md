# Browser checks (Playwright, not a repo dependency)

Plain Node scripts for the browser parts of the gate (00 §3.3 item 6,
02 §9 test 13, 03 §5.1). Run them against a local dev server only (dev
file store), with Playwright installed outside the repo:

```bash
NODE_PATH=/path/to/folder/node_modules E2E_BASE=http://localhost:3210 node tests/e2e/journey.mjs
```

| Script | Checks |
|---|---|
| `journey.mjs` | signup → character → goal → first ride → home, keyboard only |
| `station.mjs` | 信用線 station 4 (statement task) and 7 (你是銀行) keyboard only, then one month and the ride |
| `play5.mjs` | five life-game months keyboard only, ledger with a wrong try, resume after reload |
| `hiddenTab.mjs` | a turn and the train ride complete in a background tab (02 §9 test 13) |
| `playDriver.mjs`, `lib.mjs` | shared helpers |

Status (2026-10-18): written during the build; the full run was stopped
before it finished, so these have not all passed end to end yet.

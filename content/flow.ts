/**
 * 11 COPY-1: the stops of a station, the one list every page reads (the
 * landing, /lines, the station's own stepper). It matches what the station
 * screen does (components/flow/StationWorkspace.tsx). Nothing else types
 * these names: tests/flow-copy.test.ts fails if a page under app/ does.
 *
 * 看提示 and 延伸閱讀 are optional extras, not stops (11 D6).
 */
export const FLOW_STEPS = [
  { id: "hook", label: "想一想", meaning: "一個沒有標準答案的問題，先說出你的直覺。" },
  { id: "task", label: "任務", meaning: "讀真實格式的帳單、契約、薪資單，做決定。卡住了可以看提示。" },
  { id: "compare", label: "對答案", meaning: "你的答案和建議答案並排，看差在哪，再看專家怎麼想。" },
  { id: "life", label: "人生", meaning: "結果帶進人生模擬，這個月的錢跟著變。" },
] as const;

/** Said once where the stops are listed. */
export const FLOW_EXTRAS = "看提示和延伸閱讀都是選讀，不是停靠站。";

/**
 * Server-Timing for the submit routes (10 PERF-1): one entry per await, so a
 * slow submit can be read straight off the response in the browser's network
 * panel or a test. Names only, never data.
 */
export interface Timer {
  time<T>(name: string, work: Promise<T> | (() => Promise<T>)): Promise<T>;
  header(): string;
}

export function startTimer(): Timer {
  const entries: string[] = [];
  const t0 = performance.now();
  return {
    async time(name, work) {
      const start = performance.now();
      try {
        return await (typeof work === "function" ? work() : work);
      } finally {
        entries.push(`${name};dur=${(performance.now() - start).toFixed(1)}`);
      }
    },
    header() {
      return [...entries, `total;dur=${(performance.now() - t0).toFixed(1)}`].join(", ");
    },
  };
}

/** Runs the work now (tests, scripts) when there is no `after()`. */
export type Defer = (work: () => Promise<unknown>) => void;
export const runNow: Defer = (work) => {
  void work().catch((e) => console.error("deferred write failed", e));
};

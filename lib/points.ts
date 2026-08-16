/**
 * 起點護照 progress points — a flat completion counter, not a currency and
 * not tied to which choices a student made (that's lib/outcomeTitle.ts).
 * Deliberately simple: two flat values, larger for a full simulation.
 *
 * The brief calls for separate awards for "finishing a station's article"
 * and "passing a station's quiz" — but this app only ever records those as
 * one atomic event (the quiz submission IS the completion write; there's no
 * "read but hasn't quizzed yet" state to hook into without adding new
 * tracking, which the brief's own non-functional requirements rule out).
 * STATION_POINTS therefore covers both together, awarded once per station.
 */
export const STATION_POINTS = 10;
export const SIMULATION_POINTS = 30;

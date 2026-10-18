/**
 * Seeded randomness for the life game.
 *
 * Every random draw in the game comes from here, keyed by the save's seed,
 * the turn number and a stream label. Replaying a turn therefore gives the
 * same result, and class teams that share a seed face the same months.
 * Math.random is never used by the engine.
 */

/** mulberry32: a small, fast 32-bit PRNG. Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a hash of a string to uint32, for stream labels. */
function hashLabel(label: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < label.length; i++) {
    h ^= label.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * An independent stream for (seed, turn, label). Different labels never
 * share draws, so adding a new random event cannot shift the draws of the
 * existing ones.
 */
export function streamFor(seed: number, turn: number, label: string): () => number {
  const mixed =
    (Math.imul(seed >>> 0, 0x9e3779b1) ^ Math.imul(turn + 1, 0x85ebca6b) ^ hashLabel(label)) >>> 0;
  return mulberry32(mixed);
}

/** One float in [0, 1) for (seed, turn, label). */
export function draw(seed: number, turn: number, label: string): number {
  return streamFor(seed, turn, label)();
}

/** Integer in [min, max], inclusive. */
export function drawInt(seed: number, turn: number, label: string, min: number, max: number): number {
  return min + Math.floor(draw(seed, turn, label) * (max - min + 1));
}

/** Standard normal via Box-Muller, from one stream. */
export function drawNormal(seed: number, turn: number, label: string): number {
  const next = streamFor(seed, turn, label);
  const u1 = Math.max(next(), 1e-12);
  const u2 = next();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** A fresh uint32 seed. Only used when a save is created, never in a turn. */
export function newSeed(): number {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0] >>> 0;
}

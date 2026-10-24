/**
 * The low-end flag (06 E17): data-lowend on <html> when the device reports
 * 2GB of memory or less, or 4 cores or fewer. CSS under [data-lowend] drops
 * the material blur, idle animations and springs; nothing else changes.
 */
export function isLowEnd(nav: Navigator): boolean {
  const memory = (nav as Navigator & { deviceMemory?: number }).deviceMemory;
  return (memory !== undefined && memory <= 2) || (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4);
}

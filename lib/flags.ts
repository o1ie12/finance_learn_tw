/**
 * 06 G4: the one-mode flow (Part G). Inlined at build time from
 * NEXT_PUBLIC_FLOW_V2, which next.config.ts derives (on for preview builds,
 * off for production, an explicit value wins). Read it, never the env var.
 */
export const FLOW_V2 = process.env.NEXT_PUBLIC_FLOW_V2 === "1";

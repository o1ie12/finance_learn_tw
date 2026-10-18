// Shared helpers for the browser checks in tests/e2e.
//
// The repo has no Playwright dependency. Point NODE_PATH at a folder whose
// node_modules holds playwright (ESM ignores NODE_PATH, so this file resolves
// it by hand):
//
//   NODE_PATH=/path/to/pw/node_modules E2E_BASE=http://localhost:3210 node tests/e2e/<file>.mjs
//
// Only ever run against a local dev server (dev file store). Test students
// are created through POST /api/signup on that server.

import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const dirs = (process.env.NODE_PATH ?? "").split(path.delimiter).filter(Boolean);
    for (const d of dirs) {
      try {
        const req = createRequire(path.join(d, "noop.js"));
        return req("playwright");
      } catch {
        /* try next */
      }
    }
    throw new Error("playwright not found: set NODE_PATH to a node_modules folder that contains it");
  }
}

export const pw = await loadPlaywright();
export const { chromium } = pw;

export const BASE = (process.env.E2E_BASE ?? "http://localhost:3210").replace(/\/$/, "");
{
  const host = new URL(BASE).hostname;
  if (!["localhost", "127.0.0.1", "[::1]"].includes(host) && !host.endsWith(".localhost")) {
    throw new Error(`E2E_BASE must be a local dev server, got ${BASE}`);
  }
}
export const SHOTS = process.env.E2E_SHOTS ?? path.join(tmpdir(), "finline-e2e-shots");
mkdirSync(SHOTS, { recursive: true });

export async function signup(name = "測試生") {
  const res = await fetch(BASE + "/api/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, school: "測試高中", grade: "高二" }),
  });
  if (!res.ok) throw new Error(`signup ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.access_code;
}

export async function signIn(ctx, code) {
  await ctx.addCookies([
    { name: "fs_access_code", value: code, domain: "localhost", path: "/" },
    { name: "fs_signed_in", value: "1", domain: "localhost", path: "/" },
  ]);
}

/** Collects console errors and page errors for a page. */
export function watch(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 300)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console: " + m.text().slice(0, 300));
  });
  return errors;
}

export async function newPage(browser, { code, viewport = { width: 1280, height: 860 }, ...opts } = {}) {
  const ctx = await browser.newContext({ viewport, ...opts });
  if (code) await signIn(ctx, code);
  const page = await ctx.newPage();
  page.setDefaultTimeout(60_000);
  page.setDefaultNavigationTimeout(150_000);
  const errors = watch(page);
  return { ctx, page, errors };
}

/** Description of document.activeElement: role, tag, accessible-ish name. */
export async function active(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { tag: "body", name: "", role: "" };
    const lab = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
    const wrap = el.closest("label");
    const name = (
      el.getAttribute("aria-label") ||
      lab?.textContent ||
      (el.tagName === "INPUT" ? wrap?.textContent : "") ||
      el.textContent ||
      el.getAttribute("title") ||
      ""
    )
      .replace(/\s+/g, " ")
      .trim();
    return {
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute("type") ?? "",
      role: el.getAttribute("role") ?? "",
      name,
      checked: el instanceof HTMLInputElement ? el.checked : undefined,
      pressed: el.getAttribute("aria-pressed"),
      group: el.closest('[role="group"],[role="radiogroup"],fieldset')?.getAttribute("aria-label") ?? "",
      field: el.getAttribute("data-field") ?? "",
      heading: el.matches("h1,h2,h3,h4,[data-step-heading],[data-panel-heading]"),
    };
  });
}

/**
 * Presses Tab (or Shift+Tab) until the focused element matches `match`
 * (a function of the `active()` description, a RegExp on its name, or a string
 * contained in its name). Throws after `max` presses.
 */
export async function tabTo(page, match, { max = 60, back = false } = {}) {
  const test =
    typeof match === "function"
      ? match
      : match instanceof RegExp
        ? (a) => match.test(a.name)
        : (a) => a.name.includes(match);
  const seen = [];
  for (let i = 0; i < max; i++) {
    const a = await active(page);
    if (i > 0 || a.tag !== "body") {
      if (test(a)) return a;
    }
    seen.push(`${a.tag}${a.role ? "[" + a.role + "]" : ""}:${a.name.slice(0, 24)}`);
    await page.keyboard.press(back ? "Shift+Tab" : "Tab");
  }
  throw new Error(`tabTo(${match}) not reached in ${max} presses. Path: ${seen.slice(-25).join(" > ")}`);
}

/** Simple pass/fail ledger printed as a table at the end. */
export function ledger(suite) {
  const rows = [];
  return {
    rows,
    check(name, ok, detail = "") {
      rows.push({ suite, name, ok: !!ok, detail: String(detail).slice(0, 400) });
      console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  :: " + String(detail).slice(0, 400) : ""}`);
      return ok;
    },
    async step(name, fn) {
      try {
        const r = await fn();
        rows.push({ suite, name, ok: true, detail: typeof r === "string" ? r : "" });
        console.log(`PASS  ${name}${typeof r === "string" ? "  :: " + r : ""}`);
        return r;
      } catch (e) {
        rows.push({ suite, name, ok: false, detail: String(e?.message ?? e).slice(0, 600) });
        console.log(`FAIL  ${name}  :: ${String(e?.message ?? e).slice(0, 600)}`);
        return undefined;
      }
    },
    summary() {
      const fail = rows.filter((r) => !r.ok).length;
      console.log(`\n== ${suite}: ${rows.length - fail}/${rows.length} passed`);
      if (fail) process.exitCode = 1;
    },
  };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function shot(page, name, opts = {}) {
  const p = path.join(SHOTS, name.replace(/[^\w.-]+/g, "_") + ".png");
  await page.screenshot({ path: p, ...opts }).catch(() => {});
  return p;
}

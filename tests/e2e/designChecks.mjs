/**
 * The per-screen E18 checks the Part E walkers share: no page scroll,
 * targets ≥ 44 (inline links in a paragraph exempt), nothing under 12px.
 * Returns { ok, why }.
 */
export async function measureScreen(page) {
  const m = await page.evaluate(() => {
    const vis = (e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && !e.closest(".sr-only, [aria-hidden='true']");
    };
    const small = [...document.querySelectorAll('button, a, [role="radio"], [role="tab"], label:has(input), select, input:not([type="radio"]):not([type="checkbox"])')]
      .filter((e) => vis(e) && !e.closest("p") && !e.matches(".sr-only"))
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width < 43.5 || r.height < 43.5;
      })
      .map((e) => (e.textContent || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 10));
    const tiny = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const el = w.currentNode.parentElement;
      if (!w.currentNode.textContent.trim() || !el || !vis(el) || el.closest("svg")) continue;
      if (parseFloat(getComputedStyle(el).fontSize) < 12) tiny.push(w.currentNode.textContent.trim().slice(0, 10));
    }
    return { sh: document.scrollingElement.scrollHeight, ih: innerHeight, sw: document.scrollingElement.scrollWidth, iw: innerWidth, small, tiny };
  });
  const scroll = m.sh > m.ih + 1 || m.sw > m.iw + 1;
  const ok = !scroll && !m.small.length && !m.tiny.length;
  const why = [scroll ? `scroll ${m.sw}x${m.sh}` : "", m.small.length ? `small: ${m.small.join(" / ")}` : "", m.tiny.length ? `tiny: ${m.tiny.join(" / ")}` : ""]
    .filter(Boolean)
    .join("; ");
  return { ok, why };
}

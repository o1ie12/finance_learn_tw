"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * 看完整課文 as a reader that pages, not scrolls (05 Part C): each top-level
 * block of the article (a section, an info board, a scenario) is one page.
 * A long block scrolls inside the reader; the page around it does not.
 * Before the script loads every block shows, so the text is never lost.
 */
export function PagedReader({
  title,
  backHref,
  backLabel,
  children,
}: {
  title: string;
  backHref: string;
  backLabel: string;
  children: ReactNode;
}) {
  const flow = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [i, setI] = useState(0);

  useEffect(() => {
    setCount(flow.current?.children.length ?? 0);
  }, []);

  useEffect(() => {
    const kids = flow.current ? Array.from(flow.current.children) : [];
    kids.forEach((el, k) => {
      (el as HTMLElement).hidden = k !== i;
    });
    flow.current?.scrollTo({ top: 0 });
  }, [i, count]);

  const go = useCallback((d: 1 | -1) => setI((x) => Math.min(Math.max(x + d, 0), Math.max(count - 1, 0))), [count]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const last = count > 0 && i >= count - 1;
  return (
    <div className="g-reader">
      <header className="g-reader-head">
        <p className="g-label">看完整課文</p>
        <h1 className="g-reader-title">{title}</h1>
      </header>
      <div className="g-reader-page g-legacy" aria-live="polite">
        <div ref={flow} className="station-content-flow">
          {children}
        </div>
      </div>
      <nav className="g-reader-nav" aria-label="翻頁">
        <button type="button" className="g-reader-btn" onClick={() => go(-1)} disabled={i === 0}>
          上一頁
        </button>
        <span className="g-reader-count">{count ? `${i + 1} / ${count}` : ""}</span>
        {last ? (
          <Link className="g-reader-btn g-reader-btn--go" href={backHref}>
            {backLabel}
          </Link>
        ) : (
          <button type="button" className="g-reader-btn g-reader-btn--go" onClick={() => go(1)}>
            下一頁
          </button>
        )}
      </nav>
    </div>
  );
}

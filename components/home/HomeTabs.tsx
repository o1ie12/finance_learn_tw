"use client";

import { useState, type ReactNode } from "react";

const TABS = [
  { id: "today", label: "今天" },
  { id: "status", label: "狀態" },
  { id: "map", label: "路線圖" },
  { id: "moves", label: "行動" },
] as const;
type Tab = (typeof TABS)[number]["id"];

/**
 * Phone dashboard (05 Part C): one screen at a time. 今天 is the character and
 * today's stop; 狀態, 路線圖 and 行動 each get their own screen from the tab
 * bar at the bottom. At 720px and up every pane shows and the bar hides
 * (home.css), so the desktop layout is unchanged.
 */
export function HomeTabs({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<Tab>("today");
  return (
    <div className="gh-tabs" data-tab={tab}>
      {children}
      <nav className="gh-tabbar" aria-label="首頁分頁">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="gh-tab"
            aria-current={tab === t.id ? "page" : undefined}
            onClick={() => {
              setTab(t.id);
              window.scrollTo({ top: 0 });
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

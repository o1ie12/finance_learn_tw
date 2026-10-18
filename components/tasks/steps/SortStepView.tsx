"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from "react";
import type { SortStep } from "@/lib/tasks/types";
import type { SortDraft } from "../answers";
import s from "../tasks.module.css";
import type { StepViewProps } from "./types";

const PHONE_QUERY = "(max-width: 719px)";

function subscribePhone(cb: () => void) {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** True under 720px. False on the server. */
function useIsPhone(): boolean {
  return useSyncExternalStore(
    subscribePhone,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );
}

interface Drag {
  itemId: string;
  pointerId: number;
  startX: number;
  startY: number;
  active: boolean;
}

/** Tray id: the 「還沒分類」 area. */
const TRAY = "";
const DRAG_THRESHOLD = 4;

/**
 * Sort items into 2 to 6 boxes. Two ways, always both: drag a card by its
 * handle (pointer events, so mouse, pen and touch), or pick a box in the
 * card's select menu (keyboard and screen readers). With 5 or 6 boxes on a
 * phone, the select list is the layout.
 */
export function SortStepView({ step, value, onChange, disabled, promptId }: StepViewProps<SortStep, SortDraft>) {
  const uid = useId();
  const isPhone = useIsPhone();
  const listLayout = step.boxes.length >= 5 && isPhone;
  const [announce, setAnnounce] = useState("");
  const [ghost, setGhost] = useState<{ itemId: string; x: number; y: number } | null>(null);
  const [overBox, setOverBox] = useState<string | null>(null);
  const drag = useRef<Drag | null>(null);
  const selects = useRef(new Map<string, HTMLSelectElement | null>());
  const refocus = useRef<string | null>(null);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const boxLabel = (id: string) => step.boxes.find((b) => b.id === id)?.label ?? "還沒分類";
  const itemLabel = (id: string) => step.items.find((i) => i.id === id)?.label ?? "";

  function place(itemId: string, boxId: string) {
    const placements = { ...valueRef.current.placements };
    if (boxId === TRAY) delete placements[itemId];
    else placements[itemId] = boxId;
    onChange({ placements });
    setAnnounce(`「${itemLabel(itemId)}」放進「${boxLabel(boxId)}」`);
  }

  function boxAt(x: number, y: number): string | null {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-sort-box]");
    if (!el || !el.closest(`[data-sort-root="${uid}"]`)) return null;
    return el.dataset.sortBox ?? null;
  }

  function endDrag() {
    drag.current = null;
    setGhost(null);
    setOverBox(null);
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>, itemId: string) {
    if (disabled || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag.current = { itemId, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, active: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Not an active pointer (synthetic event); moves still arrive on this element.
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    if (!d.active) {
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < DRAG_THRESHOLD) return;
      d.active = true;
    }
    setGhost({ itemId: d.itemId, x: e.clientX, y: e.clientY });
    setOverBox(boxAt(e.clientX, e.clientY));
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    if (d.active) {
      const target = boxAt(e.clientX, e.clientY);
      if (target !== null && target !== (valueRef.current.placements[d.itemId] ?? TRAY)) place(d.itemId, target);
    }
    endDrag();
  }

  // A select change moves the card to another list, which remounts its
  // select; put keyboard focus back on it.
  useEffect(() => {
    const id = refocus.current;
    if (!id) return;
    refocus.current = null;
    selects.current.get(id)?.focus();
  }, [value.placements]);

  // Escape cancels a drag in progress.
  useEffect(() => {
    if (!ghost) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") endDrag();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ghost]);

  function selectFor(itemId: string, label: string) {
    return (
      <select
        ref={(el) => {
          selects.current.set(itemId, el);
        }}
        className={s.sortSelect}
        aria-label={`「${label}」放到哪一格`}
        value={value.placements[itemId] ?? TRAY}
        disabled={disabled}
        onChange={(e) => {
          refocus.current = itemId;
          place(itemId, e.target.value);
        }}
      >
        <option value={TRAY}>{listLayout ? "選一格" : "還沒分類"}</option>
        {step.boxes.map((b) => (
          <option key={b.id} value={b.id}>
            {b.label}
          </option>
        ))}
      </select>
    );
  }

  function card(item: SortStep["items"][number]) {
    const dragging = ghost?.itemId === item.id;
    return (
      <li key={item.id} className={s.sortCard} data-dragging={dragging || undefined}>
        <div
          className={s.sortGrab}
          onPointerDown={(e) => onPointerDown(e, item.id)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={endDrag}
        >
          <svg
            className={s.sortGrip}
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />
          </svg>
          <span className={s.sortCardLabel}>{item.label}</span>
        </div>
        {selectFor(item.id, item.label)}
      </li>
    );
  }

  const live = (
    <p className="sr-only" aria-live="polite">
      {announce}
    </p>
  );

  if (listLayout) {
    return (
      <div className={s.stepBody}>
        <p className="g-caption">每一項選一格。</p>
        <ul className={s.sortListLayout} aria-labelledby={promptId}>
          {step.items.map((item) => (
            <li key={item.id} className={s.sortListRow}>
              <span className={s.sortCardLabel}>{item.label}</span>
              {selectFor(item.id, item.label)}
            </li>
          ))}
        </ul>
        {live}
      </div>
    );
  }

  const unplaced = step.items.filter((i) => !value.placements[i.id]);
  return (
    <div className={s.stepBody} data-sort-root={uid}>
      <p className="g-caption">拖拉卡片左邊的把手放進格子，或用每張卡片的選單選一格。</p>
      <section
        className={s.sortTray}
        data-sort-box={TRAY}
        data-over={overBox === TRAY || undefined}
        aria-labelledby={`${uid}-tray`}
      >
        <h4 id={`${uid}-tray`} className={`g-label ${s.sortBoxTitle}`}>
          還沒分類（{unplaced.length}）
        </h4>
        {unplaced.length > 0 ? <ul className={s.sortCards}>{unplaced.map(card)}</ul> : <p className="g-caption">全部分好了。</p>}
      </section>
      <div className={s.sortBoxes} role="group" aria-labelledby={promptId} data-count={step.boxes.length}>
        {step.boxes.map((b) => {
          const inBox = step.items.filter((i) => value.placements[i.id] === b.id);
          return (
            <section
              key={b.id}
              className={s.sortBox}
              data-sort-box={b.id}
              data-over={overBox === b.id || undefined}
              aria-labelledby={`${uid}-box-${b.id}`}
            >
              <h4 id={`${uid}-box-${b.id}`} className={s.sortBoxTitle}>
                {b.label}
                <span className="g-caption g-num">（{inBox.length}）</span>
              </h4>
              {inBox.length > 0 ? <ul className={s.sortCards}>{inBox.map(card)}</ul> : null}
            </section>
          );
        })}
      </div>
      {ghost ? (
        <div
          className={s.sortGhost}
          aria-hidden="true"
          style={{ transform: `translate(${ghost.x}px, ${ghost.y}px)` }}
        >
          {itemLabel(ghost.itemId)}
        </div>
      ) : null}
      {live}
    </div>
  );
}

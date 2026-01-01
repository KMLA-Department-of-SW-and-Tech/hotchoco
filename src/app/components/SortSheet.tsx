import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SORT_OPTIONS = [
  { value: "recent_activity", label: "최근 활동", icon: "/icons/recent-activity.png" },
  { value: "newest", label: "새 게시물", icon: "/icons/new-post.png" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const MAX_EXPANSION = 160;
const MAX_COLLAPSE_DRAG = 160;
const CLOSE_THRESHOLD = 90;
const TOGGLE_THRESHOLD = 50;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

interface SortSheetProps {
  open: boolean;
  value: SortOption;
  onSelect: (next: SortOption) => void;
  onClose: () => void;
  onVisibleHeightChange?: (height: number) => void;
}

export function SortSheet({ open, value, onSelect, onClose, onVisibleHeightChange }: SortSheetProps) {
  const [restOffset, setRestOffset] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const restOffsetRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    restOffsetRef.current = restOffset;
  }, [restOffset]);

  useEffect(() => {
    dragOffsetRef.current = dragOffset;
  }, [dragOffset]);

  useEffect(() => {
    if (open) {
      setRestOffset(0);
      setDragOffset(0);
    } else {
      setIsDragging(false);
      setRestOffset(0);
      setDragOffset(0);
      pointerIdRef.current = null;
    }
  }, [open]);

  const finishDrag = useCallback(() => {
    const currentRest = restOffsetRef.current;
    const delta = dragOffsetRef.current;
    let nextRest = currentRest;

    if (delta > CLOSE_THRESHOLD) {
      nextRest = 0;
      setRestOffset(nextRest);
      setDragOffset(0);
      setIsDragging(false);
      pointerIdRef.current = null;
      if (onClose) onClose();
      return;
    }

    if (currentRest < 0 && delta > TOGGLE_THRESHOLD) {
      nextRest = 0;
    } else if (delta < -TOGGLE_THRESHOLD) {
      nextRest = -MAX_EXPANSION;
    }

    setRestOffset(nextRest);
    setDragOffset(0);
    setIsDragging(false);
    pointerIdRef.current = null;
  }, [onClose]);

  useEffect(() => {
    if (!isDragging) return undefined;

    function handleMove(event: PointerEvent) {
      if (pointerIdRef.current != null && event.pointerId !== pointerIdRef.current) return;
      event.preventDefault();
      const delta = event.clientY - startYRef.current;
      setDragOffset(clamp(delta, -MAX_EXPANSION, MAX_COLLAPSE_DRAG));
    }

    function handleEnd(event: PointerEvent) {
      if (pointerIdRef.current != null && event.pointerId !== pointerIdRef.current) return;
      event.preventDefault();
      finishDrag();
    }

    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleEnd);
    window.addEventListener("pointercancel", handleEnd);
    return () => {
      window.removeEventListener("pointermove", handleMove, { passive: false });
      window.removeEventListener("pointerup", handleEnd);
      window.removeEventListener("pointercancel", handleEnd);
    };
  }, [isDragging, finishDrag]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (isDragging) return;
      if (event.pointerType === "mouse" && event.buttons !== 1) return;
      pointerIdRef.current = event.pointerId;
      startYRef.current = event.clientY;
      setDragOffset(0);
      setIsDragging(true);
    },
    [isDragging],
  );

  const currentOffset = useMemo(
    () => restOffset + dragOffset,
    [restOffset, dragOffset],
  );

  useEffect(() => {
    if (!open) {
      if (onVisibleHeightChange) onVisibleHeightChange(0);
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;
    const height = panel.offsetHeight;
    const visibleHeight = Math.max(0, height - currentOffset);
    if (onVisibleHeightChange) onVisibleHeightChange(visibleHeight);
  }, [open, currentOffset, onVisibleHeightChange]);

  if (!open) return null;

  const panelStyle = {
    transform: `translateY(${currentOffset}px)`,
    transition: isDragging ? "none" : "transform 0.24s ease",
  };

  return (
    <div className="sort-sheet" role="dialog" aria-modal="true" aria-label="정렬 기준 선택">
      <button type="button" className="sort-sheet__backdrop" onClick={onClose} aria-label="정렬 메뉴 닫기" />
      <div className="sort-sheet__panel" ref={panelRef} style={panelStyle}>
        <button
          type="button"
          className="sort-sheet__handle"
          aria-label="정렬 메뉴 드래그 핸들"
          onPointerDown={handlePointerDown}
        >
          <span aria-hidden="true" />
        </button>
        <ul className="sort-sheet__list">
          {SORT_OPTIONS.map((option) => {
            const isActive = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  className={`sort-sheet__item${isActive ? " sort-sheet__item--active" : ""}`}
                  aria-pressed={isActive}
                  onClick={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                >
                  <img className="sort-sheet__icon" src={option.icon} alt="" aria-hidden="true" />
                  <span>{option.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

import { useRef, useState } from "react";
import { VIEW_START, VIEW_END } from "../constants";
import { pxToSlot } from "../utils/time";

export function useDrag(sched, setSched, slotPx, colRefs) {
  const dragRef = useRef(null);
  const [activeDay, setActiveDay] = useState(null);

  function startDrag(e, day, mode) {
    e.preventDefault();
    e.stopPropagation();
    if (!sched[day]) return;
    const rect = colRefs.current[day]?.getBoundingClientRect();
    if (!rect) return;
    const offsetSlots = mode === "move"
      ? pxToSlot(e.clientY - rect.top, slotPx) - sched[day].start
      : 0;
    dragRef.current = { mode, day, offsetSlots, rect };
    setActiveDay(day);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", endDrag, { once: true });
  }

  function onMove(e) {
    e.preventDefault();
    const { mode, day, offsetSlots, rect } = dragRef.current;
    const s = sched[day];
    if (!s) return;
    const slot = pxToSlot(e.clientY - rect.top, slotPx);
    const MIN = VIEW_START * 4, MAX = VIEW_END * 4;
    if (mode === "move") {
      const dur = s.end - s.start;
      const start = Math.max(MIN, Math.min(MAX - dur, slot - offsetSlots));
      setSched(p => ({ ...p, [day]: { start, end: start + dur } }));
    } else if (mode === "resize-end") {
      const end = Math.max(s.start + 1, Math.min(MAX, slot));
      setSched(p => ({ ...p, [day]: { ...s, end } }));
    } else if (mode === "resize-start") {
      const start = Math.max(MIN, Math.min(s.end - 1, slot));
      setSched(p => ({ ...p, [day]: { ...s, start } }));
    }
  }

  function endDrag() {
    dragRef.current = null;
    setActiveDay(null);
    window.removeEventListener("pointermove", onMove);
  }

  return { startDrag, activeDay };
}

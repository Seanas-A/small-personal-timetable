import { useRef, useState } from "react";
import { VIEW_START, VIEW_END } from "../constants";
import { pxToSlot } from "../utils/time";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function useDrag(sched, setSched, slotPx, colRefs) {
  const dragRef = useRef(null);
  const [activeDay, setActiveDay] = useState(null);

  function startDrag(e, day, mode) {
    e.preventDefault();
    e.stopPropagation();
    const d = sched.get(day);
    if (!d?.block || d.off) return;
    const rect = colRefs.current[day]?.getBoundingClientRect();
    if (!rect) return;
    const offsetSlots = mode === "move"
      ? pxToSlot(e.clientY - rect.top, slotPx) - d.block.start
      : 0;
    dragRef.current = { mode, day, offsetSlots, rect };
    setActiveDay(day);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", endDrag, { once: true });
  }

  function onMove(e) {
    e.preventDefault();
    const { mode, day, offsetSlots, rect } = dragRef.current;
    const slot = pxToSlot(e.clientY - rect.top, slotPx);
    const MIN = VIEW_START * 4, MAX = VIEW_END * 4;

    setSched(p => p.update(day, wd => {
      if (mode === "move") return wd.movedTo(clamp(slot - offsetSlots, MIN, MAX - wd.duration));
      if (mode === "resize-end") return wd.withEnd(clamp(slot, wd.start + 1, MAX));
      return wd.withStart(clamp(slot, MIN, wd.end - 1));
    }));
  }

  function endDrag() {
    dragRef.current = null;
    setActiveDay(null);
    window.removeEventListener("pointermove", onMove);
  }

  return { startDrag, activeDay };
}

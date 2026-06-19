import { SLOT_MIN, VIEW_START } from "../constants";

export const pad2 = n => String(n).padStart(2, "0");

export function fmtSlot(s) {
  const m = s * SLOT_MIN, h = Math.floor(m / 60), mn = m % 60;
  return mn === 0 ? `${h}h` : `${h}h${pad2(mn)}`;
}

export function fmtMin(m) {
  if (m <= 0) return "0h";
  const h = Math.floor(m / 60), mn = m % 60;
  return mn === 0 ? `${h}h` : `${h}h${pad2(mn)}`;
}

export function slotToPx(slot, slotPx) {
  return (slot - VIEW_START * 4) * slotPx;
}

export function pxToSlot(px, slotPx) {
  return Math.round(px / slotPx) + VIEW_START * 4;
}

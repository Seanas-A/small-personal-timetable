import { SLOT_MIN, VIEW_START, BREAK_START, BREAK_END, BREAK_MIN } from "../constants";

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

export function coversBreak(s) {
  return s && s.start <= BREAK_START && s.end >= BREAK_END;
}

export function gross(s) {
  return s ? (s.end - s.start) * SLOT_MIN : 0;
}

export function net(s) {
  return s ? Math.max(0, gross(s) - (coversBreak(s) ? BREAK_MIN : 0)) : 0;
}

export function slotToPx(slot, slotPx) {
  return (slot - VIEW_START * 4) * slotPx;
}

export function pxToSlot(px, slotPx) {
  return Math.round(px / slotPx) + VIEW_START * 4;
}

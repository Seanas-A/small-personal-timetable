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

// Minutes signées -> "+1h30" / "-0h45" / "0h".
export function fmtMinSigned(m) {
  if (!m) return "0h";
  return (m < 0 ? "-" : "+") + fmtMin(Math.abs(m));
}

// "1h30", "-0:45", "+2", "0h", "" -> minutes signées ; null si invalide.
export function parseHM(str) {
  const s = str.trim().toLowerCase();
  if (!s) return 0;
  const m = s.match(/^([+-]?)(\d{1,2})(?:[h:](\d{1,2})?)?$/);
  if (!m) return null;
  const mn = m[3] ? parseInt(m[3], 10) : 0;
  if (mn >= 60) return null;
  const total = parseInt(m[2], 10) * 60 + mn;
  return m[1] === "-" ? -total : total;
}

export function slotToPx(slot, slotPx) {
  return (slot - VIEW_START * 4) * slotPx;
}

export function pxToSlot(px, slotPx) {
  return Math.round(px / slotPx) + VIEW_START * 4;
}

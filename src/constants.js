export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
export const SLOT_MIN = 15;
export const VIEW_START = 6;
export const VIEW_END = 22;
export const VIEW_SLOTS = (VIEW_END - VIEW_START) * 4;

export const BREAK_START = 48;
export const BREAK_END = 52;
export const BREAK_MIN = 60;

export function makeEmpty() {
  return {
    Lundi:    { start: 32, end: 76 },
    Mardi:    { start: 36, end: 68 },
    Mercredi: { start: 36, end: 68 },
    Jeudi:    { start: 36, end: 76 },
    Vendredi: { start: 36, end: 64 },
  };
}

const STORAGE_KEY = "timetable_v2";

export function loadSched() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const hasAnySlot = DAYS.some(d => parsed[d] !== null && parsed[d] !== undefined);
      if (hasAnySlot) return parsed;
    }
  } catch {}
  return makeEmpty();
}

export function saveSched(sched) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sched));
}

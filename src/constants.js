export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
export const SLOT_MIN = 15;
export const VIEW_START = 6;
export const VIEW_END = 22;
export const VIEW_SLOTS = (VIEW_END - VIEW_START) * 4;

export const BREAK_START = 48;
export const BREAK_END = 52;
export const BREAK_MIN = 60;

export function makeEmpty() {
  return { Lundi: null, Mardi: null, Mercredi: null, Jeudi: null, Vendredi: null };
}

const STORAGE_KEY = "timetable";

export function loadSched() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return makeEmpty();
}

export function saveSched(sched) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sched));
}

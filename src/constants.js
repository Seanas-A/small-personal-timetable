export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
export const SLOT_MIN = 15;
export const VIEW_START = 6;
export const VIEW_END = 22;
export const VIEW_SLOTS = (VIEW_END - VIEW_START) * 4;

export const BREAK_START = 48;
export const BREAK_END = 52;
export const BREAK_MIN = 60;

export function makeDefault() {
  return {
    Lundi:    { start: 32, end: 76 },
    Mardi:    { start: 36, end: 68 },
    Mercredi: { start: 36, end: 68 },
    Jeudi:    { start: 36, end: 76 },
    Vendredi: { start: 36, end: 64 },
  };
}

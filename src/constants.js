export const WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
export const WEEKEND = ["Samedi", "Dimanche"];
export const DAYS = [...WEEKDAYS, ...WEEKEND];

export const SLOT_MIN = 15;
export const VIEW_START = 6;
export const VIEW_END = 22;
export const VIEW_SLOTS = (VIEW_END - VIEW_START) * 4;

// Fenêtre de la pause déjeuner, en slots de 15 min (48 -> 12h, 52 -> 13h).
// Sa durée se déduit de SLOT_MIN, pas besoin d'une constante séparée.
export const LUNCH = { start: 48, end: 52 };

// Cible hebdomadaire, au prorata des jours ouvrés actifs (1 jour off = -1/5).
export const WEEK_TARGET_MIN = 39 * 60;

// Semaine par défaut d'usine ; modifiable ensuite via les réglages (engrenage).
// lunch : minutes de pause déduites.
export const DEFAULT_WEEK = {
  Lundi:    { start: 36, end: 68, lunch: 30 }, // 9h–17h
  Mardi:    { start: 36, end: 68, lunch: 30 }, // 9h–17h
  Mercredi: { start: 32, end: 76, lunch: 60 }, // 8h–19h
  Jeudi:    { start: 36, end: 68, lunch: 30 }, // 9h–17h
  Vendredi: { start: 36, end: 64, lunch: 30 }, // 9h–16h
};

// Bloc donné à un jour réactivé qui n'en avait pas (ex. samedi), pour qu'il
// soit immédiatement éditable.
export const NEW_DAY_BLOCK = { start: 36, end: 68, lunch: 30 };

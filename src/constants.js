export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
export const SLOT_MIN = 15;
export const VIEW_START = 6;
export const VIEW_END = 22;
export const VIEW_SLOTS = (VIEW_END - VIEW_START) * 4;

// Fenêtre de la pause déjeuner, en slots de 15 min (48 -> 12h, 52 -> 13h).
// Sa durée se déduit de SLOT_MIN, pas besoin d'une constante séparée.
export const LUNCH = { start: 48, end: 52 };

// Cible hebdomadaire, ajustée au prorata des jours actifs (1 jour off = -1/5).
export const WEEK_TARGET_MIN = 39 * 60;

export const DEFAULT_SCHEDULE = {
  Lundi:    { start: 32, end: 76 },
  Mardi:    { start: 36, end: 68 },
  Mercredi: { start: 36, end: 68 },
  Jeudi:    { start: 36, end: 76 },
  Vendredi: { start: 36, end: 64 },
};

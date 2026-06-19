import { DAYS, DEFAULT_SCHEDULE, STORAGE_KEY } from "../constants";
import { fmtMin } from "../utils/time";
import { WorkDay } from "./WorkDay";

/**
 * La semaine entière : un WorkDay (ou null) par jour.
 * Immuable : set / update renvoient un nouveau Schedule.
 */
export class Schedule {
  constructor(days) {
    this.days = days;
  }

  static from(raw) {
    const days = {};
    for (const name of DAYS) days[name] = WorkDay.from(raw?.[name] ?? null);
    return new Schedule(days);
  }

  static default() {
    return Schedule.from(DEFAULT_SCHEDULE);
  }

  static load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (raw && DAYS.some(d => raw[d])) return Schedule.from(raw);
    } catch { /* stockage illisible -> on repart du défaut */ }
    return Schedule.default();
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.days));
  }

  // --- Lecture / mise à jour ---

  get(day) {
    return this.days[day];
  }

  set(day, workDay) {
    return new Schedule({ ...this.days, [day]: workDay });
  }

  // Applique une transition à un jour donné (no-op si le jour est vide).
  update(day, fn) {
    const wd = this.days[day];
    return wd ? this.set(day, fn(wd)) : this;
  }

  // --- Dérivés ---

  get totals() {
    const perDay = DAYS.map(d => this.days[d]?.netMinutes ?? 0);
    return {
      perDay,
      week: perDay.reduce((a, x) => a + x, 0),
      max: perDay.reduce((m, x) => Math.max(m, x), 0),
    };
  }

  get text() {
    return DAYS.map(d => {
      const wd = this.days[d];
      return wd ? `${d} : ${wd.label} (${fmtMin(wd.netMinutes)})` : `${d} : — (0h)`;
    }).join("\n");
  }
}

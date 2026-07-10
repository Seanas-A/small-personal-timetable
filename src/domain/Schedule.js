import { DAYS, WEEK_TARGET_MIN } from "../constants";
import { fmtMin } from "../utils/time";
import { Day } from "./Day";

/**
 * La semaine entière : un Day par jour + le report de la semaine précédente.
 * carryMinutes : minutes faites en trop la semaine dernière (négatif = retard) ;
 * elles se déduisent de (s'ajoutent à) la cible de cette semaine.
 * Immuable : les transitions renvoient un nouveau Schedule.
 */
export class Schedule {
  constructor(days, carryMinutes = 0) {
    this.days = days;
    this.carryMinutes = carryMinutes;
  }

  static from(raw) {
    const days = {};
    for (const name of DAYS) days[name] = Day.from(raw?.days?.[name]);
    return new Schedule(days, raw?.carryMinutes ?? 0);
  }

  // --- Lecture / mise à jour ---

  get(day) {
    return this.days[day];
  }

  set(day, d) {
    return new Schedule({ ...this.days, [day]: d }, this.carryMinutes);
  }

  // Applique une transition au bloc d'un jour donné (no-op si le jour est vide).
  update(day, fn) {
    return this.set(day, this.days[day].updateBlock(fn));
  }

  toggleOff(day) {
    return this.set(day, this.days[day].toggleOff());
  }

  withCarry(minutes) {
    return new Schedule(this.days, minutes);
  }

  // --- Dérivés ---

  get activeDayCount() {
    return DAYS.filter(d => !this.days[d].off).length;
  }

  // Cible de la semaine : 39h au prorata des jours actifs, corrigée du report.
  get targetMinutes() {
    const base = Math.round(WEEK_TARGET_MIN * this.activeDayCount / DAYS.length);
    return base - this.carryMinutes;
  }

  get totals() {
    const perDay = DAYS.map(d => this.days[d].netMinutes);
    const week = perDay.reduce((a, x) => a + x, 0);
    const target = this.targetMinutes;
    return {
      perDay,
      week,
      max: perDay.reduce((m, x) => Math.max(m, x), 0),
      target,
      remaining: target - week,
    };
  }

  get text() {
    return DAYS.map(name => {
      const d = this.days[name];
      if (d.off) return `${name} : OFF`;
      const wd = d.block;
      return wd ? `${name} : ${wd.label} (${fmtMin(wd.netMinutes)})` : `${name} : — (0h)`;
    }).join("\n");
  }
}

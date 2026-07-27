import { DAYS, WEEKDAYS, WEEKEND, WEEK_TARGET_MIN, NEW_DAY_BLOCK } from "../constants";
import { fmtMin } from "../utils/time";
import { Day } from "./Day";
import { WorkDay } from "./WorkDay";

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

  // Construit une semaine depuis un template { jour: {start, end, lunch} } :
  // jours ouvrés actifs, week-end off.
  static fromTemplate(template, carryMinutes = 0) {
    const days = {};
    for (const name of WEEKDAYS) {
      days[name] = new Day({ block: WorkDay.from(template?.[name] ?? null), off: false });
    }
    for (const name of WEEKEND) days[name] = new Day({ block: null, off: true });
    return new Schedule(days, carryMinutes);
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
    const next = this.days[day].toggleOff();
    // Un jour réactivé sans bloc en reçoit un standard, pour être éditable.
    return this.set(day, !next.off && !next.block
      ? new Day({ off: false, block: WorkDay.from(NEW_DAY_BLOCK) })
      : next);
  }

  withCarry(minutes) {
    return new Schedule(this.days, minutes);
  }

  // Redémarre une semaine : le delta de celle-ci (fait - cible) devient le
  // report de la nouvelle, et le planning repart du template.
  newWeek(template) {
    const { week, target } = this.totals;
    return Schedule.fromTemplate(template, week - target);
  }

  // Écrase le planning avec le template, en conservant le report.
  resetDays(template) {
    return Schedule.fromTemplate(template, this.carryMinutes);
  }

  // Photographie des jours ouvrés courants, réutilisable comme semaine par défaut.
  get weekdayTemplate() {
    return Object.fromEntries(WEEKDAYS.map(name => {
      const b = this.days[name].block;
      return [name, b ? { start: b.start, end: b.end, lunch: b.lunch.minutes } : null];
    }));
  }

  // --- Dérivés ---

  get activeWeekdayCount() {
    return WEEKDAYS.filter(d => !this.days[d].off).length;
  }

  // Cible : 39h au prorata des jours ouvrés actifs, corrigée du report.
  // Un week-end travaillé remplit la cible mais ne l'augmente pas.
  get targetMinutes() {
    const base = Math.round(WEEK_TARGET_MIN * this.activeWeekdayCount / WEEKDAYS.length);
    return base - this.carryMinutes;
  }

  get totals() {
    const perDay = Object.fromEntries(DAYS.map(d => [d, this.days[d].netMinutes]));
    const week = DAYS.reduce((sum, d) => sum + perDay[d], 0);
    const target = this.targetMinutes;
    return {
      perDay,
      week,
      max: Math.max(...DAYS.map(d => perDay[d])),
      target,
      remaining: target - week,
    };
  }

  text(days = DAYS) {
    return days.map(name => {
      const d = this.days[name];
      if (d.off) return `${name} : OFF`;
      const wd = d.block;
      return wd ? `${name} : ${wd.label} (${fmtMin(wd.netMinutes)})` : `${name} : — (0h)`;
    }).join("\n");
  }
}

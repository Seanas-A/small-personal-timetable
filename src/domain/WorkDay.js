import { SLOT_MIN, LUNCH } from "../constants";
import { fmtSlot } from "../utils/time";
import { LunchBreak } from "./LunchBreak";

/**
 * Le travail d'une journée : un intervalle [start, end[ en slots de 15 min,
 * et la pause déjeuner (durée déduite, par pas de 15 min).
 * Immuable : les transitions renvoient un nouveau WorkDay.
 */
export class WorkDay {
  constructor({ start, end, lunch = LunchBreak.full() }) {
    this.start = start;
    this.end = end;
    this.lunch = lunch;
  }

  // null -> null, sinon hydrate depuis des données brutes (localStorage, défaut...).
  static from(data) {
    return data ? new WorkDay({ ...data, lunch: LunchBreak.from(data.lunch) }) : null;
  }

  // --- Calcul, dans l'ordre logique ---

  get duration() {
    return this.end - this.start;
  }

  get grossMinutes() {
    return this.duration * SLOT_MIN;
  }

  // Le bloc recouvre-t-il toute la fenêtre du déjeuner ?
  get spansLunch() {
    return this.start <= LUNCH.start && this.end >= LUNCH.end;
  }

  // La déduction est portée par la pause ; rien à déduire si la fenêtre
  // n'est pas recouverte.
  get lunchDeduction() {
    return this.spansLunch ? this.lunch.deduction : 0;
  }

  get netMinutes() {
    return Math.max(0, this.grossMinutes - this.lunchDeduction);
  }

  get label() {
    return `${fmtSlot(this.start)}–${fmtSlot(this.end)}`;
  }

  // --- Transitions (immuables) ---

  movedTo(start) {
    return new WorkDay({ ...this, start, end: start + this.duration });
  }

  withStart(start) {
    return new WorkDay({ ...this, start });
  }

  withEnd(end) {
    return new WorkDay({ ...this, end });
  }

  cycleLunch() {
    return new WorkDay({ ...this, lunch: this.lunch.next });
  }
}

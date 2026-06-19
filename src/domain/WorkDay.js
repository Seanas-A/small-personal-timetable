import { SLOT_MIN, LUNCH } from "../constants";
import { fmtSlot } from "../utils/time";

// Durée de la pause déjeuner, déduite de la fenêtre (1 source de vérité).
const LUNCH_MIN = (LUNCH.end - LUNCH.start) * SLOT_MIN;

/**
 * Le travail d'une journée : un intervalle [start, end[ en slots de 15 min,
 * et le fait d'avoir travaillé pendant la pause déjeuner ou non.
 * Immuable : les transitions renvoient un nouveau WorkDay.
 */
export class WorkDay {
  constructor({ start, end, worksThroughLunch = false }) {
    this.start = start;
    this.end = end;
    this.worksThroughLunch = worksThroughLunch;
  }

  // null -> null, sinon hydrate depuis des données brutes (localStorage, défaut...).
  static from(data) {
    return data ? new WorkDay(data) : null;
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

  // On ne retire le déjeuner que s'il est recouvert ET non travaillé.
  get lunchDeduction() {
    return this.spansLunch && !this.worksThroughLunch ? LUNCH_MIN : 0;
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

  toggleLunch() {
    return new WorkDay({ ...this, worksThroughLunch: !this.worksThroughLunch });
  }
}

import { SLOT_MIN, LUNCH } from "../constants";

// Durée de la fenêtre du déjeuner, déduite de la fenêtre (1 source de vérité).
const FULL_MIN = (LUNCH.end - LUNCH.start) * SLOT_MIN;

/**
 * La pause déjeuner : une durée déduite, par pas de 15 min entre 1h (pause
 * entière) et 0 (pause travaillée). Un clic sur la zone descend d'un cran :
 * -1h -> -45 -> -30 -> -15 -> travaillée -> -1h -> ...
 * Immuable ; sérialisée par ses minutes.
 */
export class LunchBreak {
  constructor(minutes) {
    this.minutes = minutes;
  }

  static full() {
    return new LunchBreak(FULL_MIN);
  }

  // Hydrate depuis des minutes brutes ; toute valeur douteuse retombe sur la
  // pause entière, et on aligne sur le pas de 15 min.
  static from(raw) {
    if (!Number.isInteger(raw) || raw < 0 || raw > FULL_MIN) return LunchBreak.full();
    return new LunchBreak(raw - (raw % SLOT_MIN));
  }

  get deduction() {
    return this.minutes;
  }

  // Part de la fenêtre réellement en pause (pilote le visuel hachures/vert).
  get ratio() {
    return this.minutes / FULL_MIN;
  }

  get next() {
    return new LunchBreak(this.minutes === 0 ? FULL_MIN : this.minutes - SLOT_MIN);
  }

  get badge() {
    if (this.minutes === 0) return "12–13 ✓";
    return `12–13 −${this.minutes === FULL_MIN ? "1h" : `${this.minutes}min`}`;
  }

  get hint() {
    if (this.minutes === 0) return "Pause travaillée (comptée). Cliquer : pause entière (1h).";
    const nextLabel = this.next.minutes === 0 ? "pause travaillée" : `pause de ${this.next.minutes} min`;
    return `Pause de ${this.minutes} min déduite. Cliquer : ${nextLabel}.`;
  }

  toJSON() {
    return this.minutes;
  }
}

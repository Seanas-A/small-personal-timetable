import { WorkDay } from "./WorkDay";

/**
 * Une journée du planning : un bloc de travail (ou null) + le fait d'être
 * off (congé, absence...). Un jour off garde son bloc en mémoire mais ne
 * compte ni dans les heures faites, ni dans la cible de la semaine.
 * Immuable : les transitions renvoient un nouveau Day.
 */
export class Day {
  constructor({ block = null, off = false }) {
    this.block = block;
    this.off = off;
  }

  static from(raw) {
    if (!raw) return new Day({});
    return new Day({ block: WorkDay.from(raw.block), off: !!raw.off });
  }

  get netMinutes() {
    return this.off ? 0 : (this.block?.netMinutes ?? 0);
  }

  // --- Transitions (immuables) ---

  // Applique une transition au bloc (no-op si le jour est vide).
  updateBlock(fn) {
    return this.block ? new Day({ ...this, block: fn(this.block) }) : this;
  }

  toggleOff() {
    return new Day({ ...this, off: !this.off });
  }
}

import { SLOT_MIN, LUNCH } from "../constants";

// Durée de la fenêtre du déjeuner, déduite de la fenêtre (1 source de vérité).
const FULL_MIN = (LUNCH.end - LUNCH.start) * SLOT_MIN;

/**
 * Le mode de pause déjeuner. Chaque mode sait ce qu'il déduit et comment
 * s'afficher ; un clic sur la zone fait tourner le cycle :
 * pause entière (-1h) -> pause rapide (-30 min) -> travaillée (0) -> ...
 * Sérialisé par sa clé ("break" | "fast" | "worked").
 */
export class LunchMode {
  constructor(key, { deduction, badge, hint }) {
    this.key = key;
    this.deduction = deduction;
    this.badge = badge;
    this.hint = hint;
  }

  static from(key) {
    return BY_KEY[key] ?? LunchMode.BREAK;
  }

  get next() {
    return CYCLE[(CYCLE.indexOf(this) + 1) % CYCLE.length];
  }

  toJSON() {
    return this.key;
  }
}

LunchMode.BREAK = new LunchMode("break", {
  deduction: FULL_MIN,
  badge: "12–13 −1h",
  hint: "Pause entière déduite (1h). Cliquer : pause rapide (30 min).",
});

LunchMode.FAST = new LunchMode("fast", {
  deduction: FULL_MIN / 2,
  badge: "12–13 −30min",
  hint: "Pause rapide : 30 min déduites. Cliquer : pause travaillée.",
});

LunchMode.WORKED = new LunchMode("worked", {
  deduction: 0,
  badge: "12–13 ✓",
  hint: "Pause travaillée (comptée). Cliquer : pause entière déduite.",
});

const CYCLE = [LunchMode.BREAK, LunchMode.FAST, LunchMode.WORKED];
const BY_KEY = Object.fromEntries(CYCLE.map(m => [m.key, m]));

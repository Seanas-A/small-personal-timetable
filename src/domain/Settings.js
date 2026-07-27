import { DEFAULT_WEEK } from "../constants";

/**
 * Les réglages de l'app : la semaine par défaut (appliquée par « Nouvelle
 * semaine » et « Réinitialiser », redéfinissable depuis l'état courant) et
 * l'affichage du week-end. Immuable.
 */
export class Settings {
  constructor({ showWeekend = false, defaultWeek = DEFAULT_WEEK }) {
    this.showWeekend = showWeekend;
    this.defaultWeek = defaultWeek;
  }

  static from(raw) {
    return new Settings(raw ?? {});
  }

  withShowWeekend(showWeekend) {
    return new Settings({ ...this, showWeekend });
  }

  withDefaultWeek(defaultWeek) {
    return new Settings({ ...this, defaultWeek });
  }
}

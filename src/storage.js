import { DAYS, WEEKDAYS, WEEKEND, DEFAULT_WEEK } from "./constants";
import { Schedule } from "./domain/Schedule";
import { Settings } from "./domain/Settings";

const KEY = "timetable_v3"; // clé physique historique ; la version logique vit dans l'enveloppe
const LEGACY_KEY = "timetable_v2"; // ancien format : { Lundi: {start, end, ...}, ... }

const VERSION = 5;

// v2 -> v3 : chaque jour devient { block, off }, et le report hebdo apparaît.
function migrateV2(raw) {
  const days = {};
  for (const name of WEEKDAYS) days[name] = { block: raw?.[name] ?? null, off: false };
  return { days, carryMinutes: 0 };
}

// v3 -> v4 : le booléen worksThroughLunch du bloc devient un mode `lunch` à 3 états.
function migrateV3(raw) {
  const days = {};
  for (const [name, day] of Object.entries(raw.days)) {
    const { worksThroughLunch, ...block } = day.block ?? {};
    days[name] = {
      ...day,
      block: day.block ? { ...block, lunch: worksThroughLunch ? "worked" : "break" } : null,
    };
  }
  return { ...raw, days };
}

// v4 -> v5 : le mode de pause devient des minutes, le week-end (off) et les
// réglages apparaissent.
function migrateV4(raw) {
  const MODE_TO_MIN = { break: 60, fast: 30, worked: 0 };
  const days = {};
  for (const name of WEEKDAYS) {
    const day = raw.days?.[name] ?? { block: null, off: false };
    days[name] = day.block
      ? { ...day, block: { ...day.block, lunch: MODE_TO_MIN[day.block.lunch] ?? 60 } }
      : day;
  }
  for (const name of WEEKEND) days[name] = { block: null, off: true };
  return { days, carryMinutes: raw.carryMinutes ?? 0, settings: undefined };
}

function toStore(raw) {
  return {
    schedule: Schedule.from(raw),
    settings: Settings.from(raw.settings),
  };
}

export function loadStore() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (stored?.version === VERSION) return toStore(stored);
    if (stored?.version === 4) return toStore(migrateV4(stored));
    if (stored?.version === 3) return toStore(migrateV4(migrateV3(stored)));
  } catch { /* stockage illisible -> on tente le legacy */ }

  try {
    const v2 = JSON.parse(localStorage.getItem(LEGACY_KEY));
    if (v2 && DAYS.some(d => v2[d])) return toStore(migrateV4(migrateV3(migrateV2(v2))));
  } catch { /* stockage illisible -> on repart du défaut */ }

  return { schedule: Schedule.fromTemplate(DEFAULT_WEEK), settings: Settings.from(null) };
}

export function saveStore(schedule, settings) {
  localStorage.setItem(KEY, JSON.stringify({
    version: VERSION,
    days: schedule.days,
    carryMinutes: schedule.carryMinutes,
    settings,
  }));
}

import { DAYS, DEFAULT_SCHEDULE } from "./constants";
import { Schedule } from "./domain/Schedule";

const KEY = "timetable_v3"; // clé physique historique ; la version logique vit dans l'enveloppe
const LEGACY_KEY = "timetable_v2"; // ancien format : { Lundi: {start, end, ...}, ... }

const VERSION = 4;

// v2 -> v3 : chaque jour devient { block, off }, et le report hebdo apparaît.
function migrateV2(raw) {
  const days = {};
  for (const name of DAYS) days[name] = { block: raw?.[name] ?? null, off: false };
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

export function loadSchedule() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (stored?.version === VERSION) return Schedule.from(stored);
    if (stored?.version === 3) return Schedule.from(migrateV3(stored));
  } catch { /* stockage illisible -> on tente le legacy */ }

  try {
    const v2 = JSON.parse(localStorage.getItem(LEGACY_KEY));
    if (v2 && DAYS.some(d => v2[d])) return Schedule.from(migrateV3(migrateV2(v2)));
  } catch { /* stockage illisible -> on repart du défaut */ }

  return Schedule.from(migrateV3(migrateV2(DEFAULT_SCHEDULE)));
}

export function saveSchedule(sched) {
  localStorage.setItem(KEY, JSON.stringify({
    version: VERSION,
    days: sched.days,
    carryMinutes: sched.carryMinutes,
  }));
}

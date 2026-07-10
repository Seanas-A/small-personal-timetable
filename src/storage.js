import { DAYS, DEFAULT_SCHEDULE } from "./constants";
import { Schedule } from "./domain/Schedule";

const KEY = "timetable_v3";
const LEGACY_KEY = "timetable_v2"; // ancien format : { Lundi: {start, end, ...}, ... }

const VERSION = 3;

// v2 -> v3 : chaque jour devient { block, off }, et le report hebdo apparaît.
function migrateV2(raw) {
  const days = {};
  for (const name of DAYS) days[name] = { block: raw?.[name] ?? null, off: false };
  return { days, carryMinutes: 0 };
}

export function loadSchedule() {
  try {
    const v3 = JSON.parse(localStorage.getItem(KEY));
    if (v3?.version === VERSION) return Schedule.from(v3);
  } catch { /* stockage illisible -> on tente le legacy */ }

  try {
    const v2 = JSON.parse(localStorage.getItem(LEGACY_KEY));
    if (v2 && DAYS.some(d => v2[d])) return Schedule.from(migrateV2(v2));
  } catch { /* stockage illisible -> on repart du défaut */ }

  return Schedule.from(migrateV2(DEFAULT_SCHEDULE));
}

export function saveSchedule(sched) {
  localStorage.setItem(KEY, JSON.stringify({
    version: VERSION,
    days: sched.days,
    carryMinutes: sched.carryMinutes,
  }));
}

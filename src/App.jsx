import { useMemo, useRef, useState, useEffect } from "react";
import { DAYS, WEEKDAYS } from "./constants";
import { loadStore, saveStore } from "./storage";
import { fmtMinSigned } from "./utils/time";
import { useDrag } from "./hooks/useDrag";
import { useSlotPx } from "./hooks/useSlotPx";
import { Toast } from "./components/Toast";
import { TopBar } from "./components/TopBar";
import { Calendar } from "./components/Calendar";

export default function App() {
  const [sched, setSched] = useState(() => loadStore().schedule);
  const [settings, setSettings] = useState(() => loadStore().settings);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const colRefs = useRef({});
  const calBodyRef = useRef(null);

  const slotPx = useSlotPx(calBodyRef);

  useEffect(() => { saveStore(sched, settings); }, [sched, settings]);

  const { startDrag, activeDay } = useDrag(sched, setSched, slotPx, colRefs);

  function showToast(type, text) {
    setToast({ type, text });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2200);
  }

  function cycleLunch(day) {
    setSched(p => p.update(day, wd => wd.cycleLunch()));
  }

  function toggleOff(day) {
    setSched(p => p.toggleOff(day));
  }

  function setCarry(minutes) {
    setSched(p => p.withCarry(minutes));
  }

  const visibleDays = settings.showWeekend ? DAYS : WEEKDAYS;
  const totals = useMemo(() => sched.totals, [sched]);
  const output = useMemo(() => sched.text(visibleDays), [sched, visibleDays]);
  const dayStats = visibleDays.map(d => ({
    name: d,
    minutes: totals.perDay[d],
    off: sched.get(d).off,
  }));

  function handleCopy() {
    try { navigator.clipboard.writeText(output); showToast("ok", "Copié ✓"); }
    catch { showToast("err", "Impossible de copier."); }
  }

  function handleNewWeek() {
    const delta = totals.week - totals.target;
    const ok = window.confirm(
      `Redébuter la semaine ?\n\n` +
      `· report : ${fmtMinSigned(delta)} (${delta < 0 ? "retard" : "avance"})\n` +
      `· horaires remis au défaut, jours ouvrés réactivés`
    );
    if (!ok) return;
    setSched(p => p.newWeek(settings.defaultWeek));
    showToast("ok", "Nouvelle semaine ✓");
  }

  function handleSaveDefault() {
    setSettings(s => s.withDefaultWeek(sched.weekdayTemplate));
    showToast("ok", "Défaut enregistré ✓");
  }

  function handleResetToDefault() {
    if (!window.confirm("Écraser le planning actuel avec le défaut ?")) return;
    setSched(p => p.resetDays(settings.defaultWeek));
    showToast("ok", "Planning réinitialisé ✓");
  }

  function handleToggleWeekend() {
    setSettings(s => s.withShowWeekend(!s.showWeekend));
  }

  return (
    <div className="app-viewport">
      <div className="app-shell">
        <Toast toast={toast} />
        <TopBar
          totals={totals}
          dayStats={dayStats}
          carryMinutes={sched.carryMinutes}
          onCarryChange={setCarry}
          onCopy={handleCopy}
          onNewWeek={handleNewWeek}
          showWeekend={settings.showWeekend}
          onToggleWeekend={handleToggleWeekend}
          onSaveDefault={handleSaveDefault}
          onResetToDefault={handleResetToDefault}
        />
        <Calendar
          calBodyRef={calBodyRef}
          colRefs={colRefs}
          days={visibleDays}
          sched={sched}
          slotPx={slotPx}
          activeDay={activeDay}
          startDrag={startDrag}
          onCycleLunch={cycleLunch}
          onToggleOff={toggleOff}
        />
      </div>
    </div>
  );
}

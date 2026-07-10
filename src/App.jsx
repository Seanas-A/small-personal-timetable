import { useMemo, useRef, useState, useEffect } from "react";
import { DAYS } from "./constants";
import { loadSchedule, saveSchedule } from "./storage";
import { useDrag } from "./hooks/useDrag";
import { useSlotPx } from "./hooks/useSlotPx";
import { Toast } from "./components/Toast";
import { TopBar } from "./components/TopBar";
import { Calendar } from "./components/Calendar";

export default function App() {
  const [sched, setSched] = useState(loadSchedule);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const colRefs = useRef({});
  const calBodyRef = useRef(null);

  const slotPx = useSlotPx(calBodyRef);

  useEffect(() => { saveSchedule(sched); }, [sched]);

  const { startDrag, activeDay } = useDrag(sched, setSched, slotPx, colRefs);

  function showToast(type, text) {
    setToast({ type, text });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2200);
  }

  function toggleLunch(day) {
    setSched(p => p.update(day, wd => wd.toggleLunch()));
  }

  function toggleOff(day) {
    setSched(p => p.toggleOff(day));
  }

  function setCarry(minutes) {
    setSched(p => p.withCarry(minutes));
  }

  const totals = useMemo(() => sched.totals, [sched]);
  const output = useMemo(() => sched.text, [sched]);
  const offs = DAYS.map(d => sched.get(d).off);

  function handleCopy() {
    try { navigator.clipboard.writeText(output); showToast("ok", "Copié ✓"); }
    catch { showToast("err", "Impossible de copier."); }
  }

  return (
    <div className="app-viewport">
      <div className="app-shell">
        <Toast toast={toast} />
        <TopBar
          totals={totals}
          offs={offs}
          carryMinutes={sched.carryMinutes}
          onCarryChange={setCarry}
          output={output}
          onCopy={handleCopy}
        />
        <Calendar
          calBodyRef={calBodyRef}
          colRefs={colRefs}
          sched={sched}
          slotPx={slotPx}
          activeDay={activeDay}
          startDrag={startDrag}
          onToggleLunch={toggleLunch}
          onToggleOff={toggleOff}
        />
      </div>
    </div>
  );
}

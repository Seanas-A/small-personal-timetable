import { useMemo, useRef, useState, useEffect } from "react";
import { Schedule } from "./domain/Schedule";
import { useDrag } from "./hooks/useDrag";
import { useSlotPx } from "./hooks/useSlotPx";
import { Toast } from "./components/Toast";
import { TopBar } from "./components/TopBar";
import { Calendar } from "./components/Calendar";

export default function App() {
  const [sched, setSched] = useState(Schedule.load);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const colRefs = useRef({});
  const calBodyRef = useRef(null);

  const slotPx = useSlotPx(calBodyRef);

  useEffect(() => { sched.save(); }, [sched]);

  const { startDrag, activeDay } = useDrag(sched, setSched, slotPx, colRefs);

  function showToast(type, text) {
    setToast({ type, text });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2200);
  }

  function toggleLunch(day) {
    setSched(p => p.update(day, wd => wd.toggleLunch()));
  }

  const totals = useMemo(() => sched.totals, [sched]);
  const output = useMemo(() => sched.text, [sched]);

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
        />
      </div>
    </div>
  );
}

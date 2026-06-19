import { useMemo, useRef, useState, useEffect } from "react";
import { VIEW_SLOTS } from "./constants";
import { Schedule } from "./domain/Schedule";
import { useDrag } from "./hooks/useDrag";
import { Toast } from "./components/Toast";
import { TopBar } from "./components/TopBar";
import { Calendar } from "./components/Calendar";

export default function App() {
  const [sched, setSched] = useState(Schedule.load);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const colRefs = useRef({});
  const topBarRef = useRef(null);
  const calHeaderRef = useRef(null);

  const [slotPx, setSlotPx] = useState(10);

  useEffect(() => {
    function compute() {
      const totalH = window.innerHeight;
      const topBarH = topBarRef.current?.offsetHeight ?? 90;
      const calHeaderH = calHeaderRef.current?.offsetHeight ?? 28;
      const padding = 70 + 8 + 18 + 4; // outer padding + gap + cal padding + header margin
      const available = totalH - topBarH - calHeaderH - padding;
      setSlotPx(Math.max(5, Math.floor(available / VIEW_SLOTS)));
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

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
    <div style={{
      height: "100vh", overflow: "hidden",
      background: "#f1f5f9",
      fontFamily: "system-ui,sans-serif", color: "#0f172a",
      display: "flex", justifyContent: "center",
    }}>
    <div style={{
      width: "70%", height: "100vh", overflow: "hidden",
      padding: "10px 10px 60px", display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box",
    }}>
      <Toast toast={toast} />
      <TopBar
        topBarRef={topBarRef}
        totals={totals}
        output={output}
        onCopy={handleCopy}
      />
      <Calendar
        calHeaderRef={calHeaderRef}
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

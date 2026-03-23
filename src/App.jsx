import { useMemo, useRef, useState, useEffect } from "react";
import { DAYS, VIEW_SLOTS, loadSched, saveSched } from "./constants";
import { net, fmtSlot, fmtMin } from "./utils/time";
import { useDrag } from "./hooks/useDrag";
import { Toast } from "./components/Toast";
import { TopBar } from "./components/TopBar";
import { Calendar } from "./components/Calendar";

export default function App() {
  const [sched, setSched] = useState(loadSched);
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
      const padding = 12 * 3 + 4;
      const available = totalH - topBarH - calHeaderH - padding;
      setSlotPx(Math.max(5, Math.floor(available / VIEW_SLOTS)));
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => { saveSched(sched); }, [sched]);

  const { startDrag, activeDay } = useDrag(sched, setSched, slotPx, colRefs);

  function showToast(type, text) {
    setToast({ type, text });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2200);
  }

  const totals = useMemo(() => {
    const perDay = DAYS.map(k => net(sched[k]));
    const week = perDay.reduce((a, x) => a + x, 0);
    const max = perDay.reduce((m, x) => Math.max(m, x), 0);
    return { perDay, week, max };
  }, [sched]);

  const output = useMemo(() =>
    DAYS.map(k => {
      const s = sched[k];
      if (!s) return `${k} : — (0h)`;
      return `${k} : ${fmtSlot(s.start)}-${fmtSlot(s.end)} (${fmtMin(net(s))})`;
    }).join("\n"),
  [sched]);

  function handleCopy() {
    try { navigator.clipboard.writeText(output); showToast("ok", "Copié ✓"); }
    catch { showToast("err", "Impossible de copier."); }
  }

return (
    <div style={{
      height: "100vh", overflow: "hidden",
      background: "#f1f5f9", padding: 10,
      fontFamily: "system-ui,sans-serif", color: "#0f172a",
      display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box",
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
        setSched={setSched}
        slotPx={slotPx}
        activeDay={activeDay}
        startDrag={startDrag}
      />
    </div>
  );
}

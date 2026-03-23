import { useMemo, useRef, useState, useEffect } from "react";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const SLOT_MIN = 15;
const VIEW_START = 6;
const VIEW_END = 22;
const VIEW_SLOTS = (VIEW_END - VIEW_START) * 4;

const BREAK_START = 48;
const BREAK_END = 52;
const BREAK_MIN = 60;

const pad2 = n => String(n).padStart(2, "0");
function fmtSlot(s) {
  const m = s * SLOT_MIN, h = Math.floor(m / 60), mn = m % 60;
  return mn === 0 ? `${h}h` : `${h}h${pad2(mn)}`;
}
function fmtMin(m) {
  if (m <= 0) return "0h";
  const h = Math.floor(m / 60), mn = m % 60;
  return mn === 0 ? `${h}h` : `${h}h${pad2(mn)}`;
}
function coversBreak(s) { return s && s.start <= BREAK_START && s.end >= BREAK_END; }
function gross(s) { return s ? (s.end - s.start) * SLOT_MIN : 0; }
function net(s) { return s ? Math.max(0, gross(s) - (coversBreak(s) ? BREAK_MIN : 0)) : 0; }
function slotToPx(slot, slotPx) { return (slot - VIEW_START * 4) * slotPx; }
function pxToSlot(px, slotPx) { return Math.round(px / slotPx) + VIEW_START * 4; }

function makeDefault() {
  return {
    Lundi:    { start: 32, end: 76 },
    Mardi:    { start: 36, end: 68 },
    Mercredi: { start: 36, end: 68 },
    Jeudi:    { start: 36, end: 76 },
    Vendredi: { start: 36, end: 64 },
  };
}

export default function App() {
  const [sched, setSched] = useState(makeDefault);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const dragRef = useRef(null);
  const [activeDay, setActiveDay] = useState(null);
  const colRefs = useRef({});

  const [slotPx, setSlotPx] = useState(10);
  const topBarRef = useRef(null);
  const calHeaderRef = useRef(null);

  useEffect(() => {
    function compute() {
      const totalH = window.innerHeight;
      const topBarH = topBarRef.current?.offsetHeight ?? 90;
      const calHeaderH = calHeaderRef.current?.offsetHeight ?? 28;
      const padding = 12 * 3 + 4;
      const available = totalH - topBarH - calHeaderH - padding;
      const px = Math.max(5, Math.floor(available / VIEW_SLOTS));
      setSlotPx(px);
    }
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const HOUR_PX = slotPx * 4;
  const COL_H = VIEW_SLOTS * slotPx;

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

  function copy() {
    try { navigator.clipboard.writeText(output); showToast("ok", "Copié ✓"); }
    catch { showToast("err", "Impossible de copier."); }
  }

  function startDrag(e, day, mode) {
    e.preventDefault(); e.stopPropagation();
    if (!sched[day]) return;
    const rect = colRefs.current[day]?.getBoundingClientRect();
    if (!rect) return;
    const offsetSlots = mode === "move" ? pxToSlot(e.clientY - rect.top, slotPx) - sched[day].start : 0;
    dragRef.current = { mode, day, offsetSlots, rect };
    setActiveDay(day);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", endDrag, { once: true });
  }

  function onMove(e) {
    e.preventDefault();
    const { mode, day, offsetSlots, rect } = dragRef.current;
    const s = sched[day];
    if (!s) return;
    const slot = pxToSlot(e.clientY - rect.top, slotPx);
    const MIN = VIEW_START * 4, MAX = VIEW_END * 4;
    if (mode === "move") {
      const dur = s.end - s.start;
      const start = Math.max(MIN, Math.min(MAX - dur, slot - offsetSlots));
      setSched(p => ({ ...p, [day]: { start, end: start + dur } }));
    } else if (mode === "resize-end") {
      const end = Math.max(s.start + 1, Math.min(MAX, slot));
      setSched(p => ({ ...p, [day]: { ...s, end } }));
    } else if (mode === "resize-start") {
      const start = Math.max(MIN, Math.min(s.end - 1, slot));
      setSched(p => ({ ...p, [day]: { ...s, start } }));
    }
  }

  function endDrag() {
    dragRef.current = null; setActiveDay(null);
    window.removeEventListener("pointermove", onMove);
  }

  return (
    <div style={{
      height: "100vh", overflow: "hidden",
      background: "#f1f5f9", padding: 10,
      fontFamily: "system-ui,sans-serif", color: "#0f172a",
      display: "flex", flexDirection: "column", gap: 8, boxSizing: "border-box"
    }}>

      {toast && (
        <div style={{
          position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 99,
          background: toast.type === "err" ? "#fef2f2" : "#f0fdf4",
          border: `1px solid ${toast.type === "err" ? "#fca5a5" : "#86efac"}`,
          color: toast.type === "err" ? "#991b1b" : "#166534",
          padding: "7px 16px", borderRadius: 9, fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>{toast.text}</div>
      )}

      {/* BARRE HAUTE */}
      <div ref={topBarRef} style={{
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
        padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "stretch", flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Semaine</div>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{fmtMin(totals.week)}</div>
          </div>

          <div style={{ width: 1, height: 36, background: "#e2e8f0", flexShrink: 0 }} />

          {DAYS.map((d, i) => {
            const m = totals.perDay[i];
            const pct = totals.max > 0 ? Math.round(m / totals.max * 100) : 0;
            return (
              <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 40 }}>
                <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{d.slice(0, 3)}</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{fmtMin(m)}</span>
                <div style={{ width: 32, height: 4, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#0f172a", width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ width: 1, height: "auto", background: "#e2e8f0", flexShrink: 0, alignSelf: "stretch" }} />

        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Output</div>
          <pre style={{
            margin: 0, fontSize: 11, lineHeight: 1.5,
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: 7, padding: "5px 8px", whiteSpace: "pre-wrap"
          }}>{output}</pre>
        </div>

        <div style={{ width: 1, height: "auto", background: "#e2e8f0", flexShrink: 0, alignSelf: "stretch" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
          <button onClick={copy} style={btnStyle}>Copier output</button>
          <button onClick={() => { setSched(makeDefault()); showToast("ok", "Remis par défaut."); }} style={btnStyle}>Reset défaut</button>
        </div>
      </div>

      {/* CALENDRIER */}
      <div style={{
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
        padding: "10px 10px 8px", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column"
      }}>
        <div style={{ overflowX: "auto", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ minWidth: 400, flex: 1, display: "flex", flexDirection: "column" }}>

            <div ref={calHeaderRef} style={{ display: "grid", gridTemplateColumns: "34px repeat(5,1fr)", gap: 4, marginBottom: 4 }}>
              <div />
              {DAYS.map(d => (
                <div key={d} style={{ fontSize: 12, fontWeight: 700, textAlign: "center", paddingBottom: 4, borderBottom: "2px solid #e2e8f0" }}>{d}</div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "34px repeat(5,1fr)", gap: 4 }}>
              <div style={{ position: "relative", height: COL_H }}>
                {Array.from({ length: VIEW_END - VIEW_START + 1 }, (_, i) => (
                  <div key={i} style={{ position: "absolute", top: i * HOUR_PX - 7, right: 2, fontSize: 9, color: "#94a3b8", textAlign: "right" }}>
                    {pad2(VIEW_START + i)}h
                  </div>
                ))}
              </div>

              {DAYS.map(day => {
                const s = sched[day];
                const isActive = activeDay === day;
                return (
                  <div
                    key={day}
                    ref={el => colRefs.current[day] = el}
                    style={{ position: "relative", height: COL_H, borderRadius: 7, border: "1px solid #e2e8f0", overflow: "hidden", background: "#fafafa" }}
                  >
                    {Array.from({ length: VIEW_END - VIEW_START }, (_, i) => (
                      <div key={i} style={{
                        position: "absolute", left: 0, right: 0,
                        top: i * HOUR_PX, height: HOUR_PX,
                        background: (VIEW_START + i) % 2 === 0 ? "#f8fafc" : "#fff",
                        borderBottom: "1px solid rgba(148,163,184,0.2)",
                      }} />
                    ))}
                    {Array.from({ length: VIEW_END - VIEW_START }, (_, i) => (
                      <div key={i} style={{
                        position: "absolute", left: 0, right: 0,
                        top: i * HOUR_PX + HOUR_PX / 2,
                        borderBottom: "1px dashed rgba(148,163,184,0.18)",
                      }} />
                    ))}

                    {s && (() => {
                      const top = slotToPx(s.start, slotPx);
                      const h = (s.end - s.start) * slotPx;
                      const breakTop = slotToPx(BREAK_START, slotPx) - slotToPx(s.start, slotPx);
                      const breakH = (BREAK_END - BREAK_START) * slotPx;
                      return (
                        <div
                          onPointerDown={e => startDrag(e, day, "move")}
                          style={{
                            position: "absolute", left: 3, right: 3,
                            top, height: h,
                            background: isActive ? "#334155" : "#1e293b",
                            borderRadius: 6, cursor: "grab", touchAction: "none", userSelect: "none",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                          }}
                        >
                          <div onPointerDown={e => startDrag(e, day, "resize-start")}
                            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 7, cursor: "ns-resize", background: "rgba(255,255,255,0.07)", borderRadius: "6px 6px 0 0" }} />
                          <div onPointerDown={e => startDrag(e, day, "resize-end")}
                            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 7, cursor: "ns-resize", background: "rgba(255,255,255,0.07)", borderRadius: "0 0 6px 6px" }} />

                          {coversBreak(s) && (
                            <div style={{
                              position: "absolute", left: 0, right: 0,
                              top: breakTop, height: breakH,
                              backgroundImage: "repeating-linear-gradient(45deg,rgba(255,255,255,0.22) 0,rgba(255,255,255,0.22) 4px,transparent 4px,transparent 8px)",
                              borderTop: "1px solid rgba(255,255,255,0.15)",
                              borderBottom: "1px solid rgba(255,255,255,0.15)",
                              pointerEvents: "none",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}>12–13</span>
                            </div>
                          )}

                          <div style={{ padding: "9px 6px 4px", color: "#fff" }}>
                            <div style={{ fontSize: 11, fontWeight: 700 }}>{fmtSlot(s.start)}–{fmtSlot(s.end)}</div>
                            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 1 }}>{fmtMin(net(s))} net</div>
                          </div>

                          <button
                            onPointerDown={e => { e.preventDefault(); e.stopPropagation(); }}
                            onClick={e => { e.stopPropagation(); setSched(p => ({ ...p, [day]: null })); }}
                            style={{ position: "absolute", top: 4, right: 4, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 4, width: 15, height: 15, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                          >×</button>
                        </div>
                      );
                    })()}

                    {!s && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontSize: 13 }}>—</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "6px 14px", fontSize: 12, fontWeight: 500,
  border: "1px solid #cbd5e1", background: "#fff",
  borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap",
};

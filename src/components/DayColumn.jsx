import { VIEW_START, VIEW_END, BREAK_START, BREAK_END } from "../constants";
import { slotToPx, fmtSlot, fmtMin, net, coversBreak } from "../utils/time";

export function DayColumn({ day, slot: s, isActive, slotPx, setRef, onDragStart }) {
  const HOUR_PX = slotPx * 4;
  const COL_H = (VIEW_END - VIEW_START) * 4 * slotPx;

  return (
    <div
      ref={setRef}
      style={{
        position: "relative", height: COL_H,
        borderRadius: 7, border: "1px solid #e2e8f0",
        overflow: "hidden", background: "#fafafa",
      }}
    >
      {/* Bandes horaires alternées */}
      {Array.from({ length: VIEW_END - VIEW_START }, (_, i) => (
        <div key={i} style={{
          position: "absolute", left: 0, right: 0,
          top: i * HOUR_PX, height: HOUR_PX,
          background: (VIEW_START + i) % 2 === 0 ? "#f8fafc" : "#fff",
          borderBottom: "1px solid rgba(148,163,184,0.2)",
        }} />
      ))}

      {/* Demi-heures */}
      {Array.from({ length: VIEW_END - VIEW_START }, (_, i) => (
        <div key={i} style={{
          position: "absolute", left: 0, right: 0,
          top: i * HOUR_PX + HOUR_PX / 2,
          borderBottom: "1px dashed rgba(148,163,184,0.18)",
        }} />
      ))}

      {/* Bloc travail */}
      {s && (() => {
        const top = slotToPx(s.start, slotPx);
        const h = (s.end - s.start) * slotPx;
        const breakTop = slotToPx(BREAK_START, slotPx) - slotToPx(s.start, slotPx);
        const breakH = (BREAK_END - BREAK_START) * slotPx;
        return (
          <div
            onPointerDown={e => onDragStart(e, day, "move")}
            style={{
              position: "absolute", left: 3, right: 3,
              top, height: h,
              background: isActive ? "#334155" : "#1e293b",
              borderRadius: 6, cursor: "grab", touchAction: "none", userSelect: "none",
              boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
            }}
          >
            <div
              onPointerDown={e => onDragStart(e, day, "resize-start")}
              style={{ position: "absolute", top: 0, left: 0, right: 0, height: 7, cursor: "ns-resize", background: "rgba(255,255,255,0.07)", borderRadius: "6px 6px 0 0" }}
            />
            <div
              onPointerDown={e => onDragStart(e, day, "resize-end")}
              style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 7, cursor: "ns-resize", background: "rgba(255,255,255,0.07)", borderRadius: "0 0 6px 6px" }}
            />

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

          </div>
        );
      })()}

      {!s && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontSize: 13 }}>—</div>
      )}
    </div>
  );
}

import { DAYS, VIEW_START, VIEW_END } from "../constants";
import { pad2 } from "../utils/time";
import { DayColumn } from "./DayColumn";

export function Calendar({ calHeaderRef, colRefs, sched, slotPx, activeDay, startDrag }) {
  const HOUR_PX = slotPx * 4;
  const COL_H = (VIEW_END - VIEW_START) * 4 * slotPx;

  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
      padding: "10px 10px 8px", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column",
    }}>
      <div style={{ overflowX: "auto", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ minWidth: 400, flex: 1, display: "flex", flexDirection: "column" }}>

          {/* En-têtes des jours */}
          <div ref={calHeaderRef} style={{ display: "grid", gridTemplateColumns: "34px repeat(5,1fr)", gap: 4, marginBottom: 4 }}>
            <div />
            {DAYS.map(d => (
              <div key={d} style={{ fontSize: 12, fontWeight: 700, textAlign: "center", paddingBottom: 4, borderBottom: "2px solid #e2e8f0" }}>{d}</div>
            ))}
          </div>

          {/* Grille */}
          <div style={{ display: "grid", gridTemplateColumns: "34px repeat(5,1fr)", gap: 4 }}>

            {/* Colonne heures */}
            <div style={{ position: "relative", height: COL_H }}>
              {Array.from({ length: VIEW_END - VIEW_START + 1 }, (_, i) => (
                <div key={i} style={{ position: "absolute", top: i * HOUR_PX - 7, right: 2, fontSize: 9, color: "#94a3b8", textAlign: "right" }}>
                  {pad2(VIEW_START + i)}h
                </div>
              ))}
            </div>

            {/* Colonnes jours */}
            {DAYS.map(day => (
              <DayColumn
                key={day}
                day={day}
                slot={sched[day]}
                isActive={activeDay === day}
                slotPx={slotPx}
                setRef={el => colRefs.current[day] = el}
                onDragStart={startDrag}
              />
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}

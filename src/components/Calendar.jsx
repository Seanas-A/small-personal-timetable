import { DAYS, VIEW_START, VIEW_END } from "../constants";
import { pad2 } from "../utils/time";
import { DayColumn } from "./DayColumn";

export function Calendar({ calBodyRef, colRefs, sched, slotPx, activeDay, startDrag, onToggleLunch }) {
  const HOUR_PX = slotPx * 4;
  const COL_H = (VIEW_END - VIEW_START) * 4 * slotPx;

  return (
    <div className="card calendar">
      <div className="calendar-scroll">
        <div className="calendar-inner">

          {/* En-têtes des jours */}
          <div className="calendar-header">
            <div />
            {DAYS.map(d => (
              <div key={d} className="calendar-day-head">{d}</div>
            ))}
          </div>

          {/* Grille — calBodyRef mesure la hauteur disponible pour dimensionner les slots */}
          <div className="calendar-body" ref={calBodyRef}>
            <div className="calendar-grid">

              {/* Colonne heures */}
              <div className="hours-col" style={{ height: COL_H }}>
                {Array.from({ length: VIEW_END - VIEW_START + 1 }, (_, i) => (
                  <div key={i} className="hour-label" style={{ top: i * HOUR_PX - 7 }}>
                    {pad2(VIEW_START + i)}h
                  </div>
                ))}
              </div>

              {/* Colonnes jours */}
              {DAYS.map(day => (
                <DayColumn
                  key={day}
                  day={day}
                  slot={sched.get(day)}
                  isActive={activeDay === day}
                  slotPx={slotPx}
                  setRef={el => colRefs.current[day] = el}
                  onDragStart={startDrag}
                  onToggleLunch={onToggleLunch}
                />
              ))}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

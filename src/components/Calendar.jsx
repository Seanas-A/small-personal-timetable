import { VIEW_START, VIEW_END } from "../constants";
import { pad2 } from "../utils/time";
import { DayColumn } from "./DayColumn";

export function Calendar({ calBodyRef, colRefs, days, sched, slotPx, activeDay, startDrag, onCycleLunch, onToggleOff }) {
  const HOUR_PX = slotPx * 4;
  const COL_H = (VIEW_END - VIEW_START) * 4 * slotPx;
  const gridCols = { gridTemplateColumns: `34px repeat(${days.length}, 1fr)` };

  return (
    <div className="card calendar">
      <div className="calendar-scroll">
        <div className="calendar-inner">

          {/* En-têtes des jours — cliquer active/désactive le jour */}
          <div className="calendar-header" style={gridCols}>
            <div />
            {days.map(d => {
              const off = sched.get(d).off;
              return (
                <button
                  key={d}
                  className={`calendar-day-head${off ? " calendar-day-head--off" : ""}`}
                  onClick={() => onToggleOff(d)}
                  title={off
                    ? "Jour off (non compté). Cliquer pour le réactiver."
                    : "Cliquer pour marquer ce jour off."}
                >
                  {d}{off ? " · OFF" : ""}
                </button>
              );
            })}
          </div>

          {/* Grille — calBodyRef mesure la hauteur disponible pour dimensionner les slots */}
          <div className="calendar-body" ref={calBodyRef}>
            <div className="calendar-grid" style={gridCols}>

              {/* Colonne heures */}
              <div className="hours-col" style={{ height: COL_H }}>
                {Array.from({ length: VIEW_END - VIEW_START + 1 }, (_, i) => (
                  <div key={i} className="hour-label" style={{ top: i * HOUR_PX - 7 }}>
                    {pad2(VIEW_START + i)}h
                  </div>
                ))}
              </div>

              {/* Colonnes jours */}
              {days.map(day => (
                <DayColumn
                  key={day}
                  day={day}
                  data={sched.get(day)}
                  isActive={activeDay === day}
                  slotPx={slotPx}
                  setRef={el => colRefs.current[day] = el}
                  onDragStart={startDrag}
                  onCycleLunch={onCycleLunch}
                />
              ))}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

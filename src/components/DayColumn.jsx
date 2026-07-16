import { VIEW_START, VIEW_END, LUNCH } from "../constants";
import { slotToPx, fmtMin } from "../utils/time";

export function DayColumn({ day, data, isActive, slotPx, setRef, onDragStart, onCycleLunch }) {
  const HOUR_PX = slotPx * 4;
  const COL_H = (VIEW_END - VIEW_START) * 4 * slotPx;
  const s = data.block;
  const off = data.off;

  return (
    <div ref={setRef} className="day-col" style={{ height: COL_H }}>
      {/* Bandes horaires alternées */}
      {Array.from({ length: VIEW_END - VIEW_START }, (_, i) => (
        <div
          key={i}
          className={`hour-band ${(VIEW_START + i) % 2 === 0 ? "hour-band--even" : "hour-band--odd"}`}
          style={{ top: i * HOUR_PX, height: HOUR_PX }}
        />
      ))}

      {/* Demi-heures */}
      {Array.from({ length: VIEW_END - VIEW_START }, (_, i) => (
        <div key={i} className="half-hour-line" style={{ top: i * HOUR_PX + HOUR_PX / 2 }} />
      ))}

      {/* Bloc travail (masqué si jour off) */}
      {!off && s && (() => {
        const top = slotToPx(s.start, slotPx);
        const h = (s.end - s.start) * slotPx;
        const breakTop = (LUNCH.start - s.start) * slotPx;
        const breakH = (LUNCH.end - LUNCH.start) * slotPx;
        return (
          <div
            onPointerDown={e => onDragStart(e, day, "move")}
            className={`work-block${isActive ? " work-block--active" : ""}`}
            style={{ top, height: h }}
          >
            <div
              onPointerDown={e => onDragStart(e, day, "resize-start")}
              className="resize-handle resize-handle--start"
            />
            <div
              onPointerDown={e => onDragStart(e, day, "resize-end")}
              className="resize-handle resize-handle--end"
            />

            {s.spansLunch && (
              <div
                onPointerDown={e => e.stopPropagation()}
                onClick={() => onCycleLunch(day)}
                title={s.lunch.hint}
                className={`lunch-zone lunch-zone--${s.lunch.key}`}
                style={{ top: breakTop, height: breakH }}
              >
                <span className="lunch-zone-label">{s.lunch.badge}</span>
              </div>
            )}

            <div className="work-block-info">
              <div className="work-block-title">{s.label}</div>
              <div className="work-block-sub">{fmtMin(s.netMinutes)} net</div>
            </div>

          </div>
        );
      })()}

      {!off && !s && <div className="day-empty">—</div>}

      {off && <div className="day-off-overlay">OFF</div>}
    </div>
  );
}

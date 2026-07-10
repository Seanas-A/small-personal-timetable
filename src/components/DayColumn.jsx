import { VIEW_START, VIEW_END, LUNCH } from "../constants";
import { slotToPx, fmtMin } from "../utils/time";

export function DayColumn({ day, slot: s, isActive, slotPx, setRef, onDragStart, onToggleLunch }) {
  const HOUR_PX = slotPx * 4;
  const COL_H = (VIEW_END - VIEW_START) * 4 * slotPx;

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

      {/* Bloc travail */}
      {s && (() => {
        const top = slotToPx(s.start, slotPx);
        const h = (s.end - s.start) * slotPx;
        const breakTop = (LUNCH.start - s.start) * slotPx;
        const breakH = (LUNCH.end - LUNCH.start) * slotPx;
        const worked = s.worksThroughLunch;
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
                onClick={() => onToggleLunch(day)}
                title={worked
                  ? "Pause travaillée (comptée). Cliquer pour la déduire."
                  : "Pause déduite (1h). Cliquer si vous avez travaillé."}
                className={`lunch-zone ${worked ? "lunch-zone--worked" : "lunch-zone--deducted"}`}
                style={{ top: breakTop, height: breakH }}
              >
                <span className="lunch-zone-label">
                  {worked ? "12–13 ✓" : "12–13 −1h"}
                </span>
              </div>
            )}

            <div className="work-block-info">
              <div className="work-block-title">{s.label}</div>
              <div className="work-block-sub">{fmtMin(s.netMinutes)} net</div>
            </div>

          </div>
        );
      })()}

      {!s && <div className="day-empty">—</div>}
    </div>
  );
}

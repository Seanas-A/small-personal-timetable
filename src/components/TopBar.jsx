import { useState } from "react";
import { DAYS } from "../constants";
import { fmtMin, fmtMinSigned, parseHM } from "../utils/time";

// Saisie du report de la semaine passée : "+1h30" = fait en trop (cible réduite),
// "-0h45" = retard à rattraper (cible augmentée). Validation au blur / Entrée.
function CarryInput({ carryMinutes, onChange }) {
  const [text, setText] = useState(fmtMinSigned(carryMinutes));

  function commit() {
    const minutes = parseHM(text);
    if (minutes === null) { setText(fmtMinSigned(carryMinutes)); return; }
    onChange(minutes);
    setText(fmtMinSigned(minutes));
  }

  return (
    <input
      className="carry-input"
      value={text}
      onChange={e => setText(e.target.value)}
      onFocus={e => e.target.select()}
      onBlur={commit}
      onKeyDown={e => e.key === "Enter" && e.currentTarget.blur()}
      title='Heures faites en trop la semaine passée ("+1h30") ou retard ("-0h45")'
    />
  );
}

export function TopBar({ totals, offs, carryMinutes, onCarryChange, output, onCopy }) {
  const { week, target, remaining } = totals;
  const done = remaining <= 0;
  const pct = target > 0 ? Math.min(100, Math.round(week / target * 100)) : 100;

  return (
    <div className="card topbar">

      {/* Total semaine (jauge vers la cible) + récap jours */}
      <div className="topbar-group">
        <div>
          <div className="stat-label">Semaine</div>
          <div className="week-value">
            {fmtMin(week)}<span className="week-target"> / {fmtMin(Math.max(0, target))}</span>
          </div>
          <div className="gauge">
            <div className={`gauge-fill${done ? " gauge-fill--done" : ""}`} style={{ width: `${pct}%` }} />
          </div>
          <div className={`week-remaining${done ? " week-remaining--done" : ""}`}>
            {done ? `objectif atteint ✓ ${remaining < 0 ? `(${fmtMinSigned(-remaining)})` : ""}` : `reste ${fmtMin(remaining)}`}
          </div>
        </div>

        <div className="vdivider" />

        {DAYS.map((d, i) => {
          const m = totals.perDay[i];
          const pctDay = totals.max > 0 ? Math.round(m / totals.max * 100) : 0;
          const off = offs[i];
          return (
            <div key={d} className={`day-stat${off ? " day-stat--off" : ""}`}>
              <span className="day-stat-name">{d.slice(0, 3)}</span>
              <span className="day-stat-value">{off ? "OFF" : fmtMin(m)}</span>
              <div className="meter">
                <div className="meter-fill" style={{ width: `${off ? 0 : pctDay}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="vdivider" />

      {/* Report de la semaine passée */}
      <div className="carry-box">
        <div className="stat-label">Report sem. passée</div>
        <CarryInput key={carryMinutes} carryMinutes={carryMinutes} onChange={onCarryChange} />
        <div className="carry-hint">+ fait en trop · − retard</div>
      </div>

      <div className="vdivider" />

      {/* Output */}
      <div style={{ flexShrink: 0 }}>
        <div className="stat-label" style={{ fontSize: 10, marginBottom: 4 }}>Output</div>
        <pre className="output-pre">{output}</pre>
      </div>

      <div className="vdivider" />

      {/* Boutons */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <button onClick={onCopy} className="btn">Copier output</button>
      </div>

    </div>
  );
}

import { useState } from "react";
import { fmtMin, parseHM } from "../utils/time";
import { SettingsMenu } from "./SettingsMenu";

// Saisie du report : la valeur absolue dans le champ, le sens via le toggle
// Avance (fait en trop -> cible réduite) / Retard (à rattraper -> cible augmentée).
function CarrySection({ carryMinutes, onChange }) {
  const [sign, setSign] = useState(carryMinutes < 0 ? -1 : 1);
  const [text, setText] = useState(fmtMin(Math.abs(carryMinutes)));

  function commit() {
    const abs = parseHM(text.replace(/^[+-]\s*/, ""));
    if (abs === null) { setText(fmtMin(Math.abs(carryMinutes))); return; }
    onChange(sign * abs);
    setText(fmtMin(abs));
  }

  function pick(nextSign) {
    setSign(nextSign);
    const abs = Math.abs(carryMinutes);
    if (abs > 0) onChange(nextSign * abs);
  }

  const tone = Math.abs(carryMinutes) === 0 ? "" : sign > 0 ? " carry-input--ahead" : " carry-input--behind";

  return (
    <div className="carry-box">
      <div className="stat-label">Report sem. passée</div>
      <div className="carry-row">
        <input
          className={`carry-input${tone}`}
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={e => e.target.select()}
          onBlur={commit}
          onKeyDown={e => e.key === "Enter" && e.currentTarget.blur()}
          title='Valeur absolue du report (ex. "1h30")'
        />
        <div className="carry-toggle">
          <button
            className={`carry-toggle-btn${sign > 0 ? " carry-toggle-btn--ahead" : ""}`}
            onClick={() => pick(1)}
          >
            Avance
          </button>
          <button
            className={`carry-toggle-btn${sign < 0 ? " carry-toggle-btn--behind" : ""}`}
            onClick={() => pick(-1)}
          >
            Retard
          </button>
        </div>
      </div>
      <div className="carry-hint">{sign > 0 ? "déduite de la cible" : "ajouté à la cible"}</div>
    </div>
  );
}

export function TopBar({
  totals, dayStats, carryMinutes, onCarryChange, onCopy, onNewWeek,
  showWeekend, onToggleWeekend, onSaveDefault, onResetToDefault,
}) {
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
            {done ? `objectif atteint ✓ ${remaining < 0 ? `(+${fmtMin(-remaining)})` : ""}` : `reste ${fmtMin(remaining)}`}
          </div>
        </div>

        <div className="vdivider" />

        {dayStats.map(({ name, minutes, off }) => {
          const pctDay = totals.max > 0 ? Math.round(minutes / totals.max * 100) : 0;
          return (
            <div key={name} className={`day-stat${off ? " day-stat--off" : ""}`}>
              <span className="day-stat-name">{name.slice(0, 3)}</span>
              <span className="day-stat-value">{off ? "OFF" : fmtMin(minutes)}</span>
              <div className="meter">
                <div className="meter-fill" style={{ width: `${off ? 0 : pctDay}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="vdivider" />

      {/* Report de la semaine passée */}
      <CarrySection key={carryMinutes} carryMinutes={carryMinutes} onChange={onCarryChange} />

      <div className="vdivider" />

      {/* Actions — l'output ne s'affiche plus, il se copie */}
      <div className="topbar-actions">
        <button onClick={onNewWeek} className="btn btn--primary">↻&nbsp; Nouvelle semaine</button>
        <button onClick={onCopy} className="btn">Copier l'output</button>
      </div>

      <SettingsMenu
        showWeekend={showWeekend}
        onToggleWeekend={onToggleWeekend}
        onSaveDefault={onSaveDefault}
        onResetToDefault={onResetToDefault}
        onCopy={onCopy}
      />

    </div>
  );
}

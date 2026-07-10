import { DAYS } from "../constants";
import { fmtMin } from "../utils/time";

export function TopBar({ totals, output, onCopy }) {
  return (
    <div className="card topbar">

      {/* Total semaine + récap jours */}
      <div className="topbar-group">
        <div>
          <div className="stat-label">Semaine</div>
          <div className="week-value">{fmtMin(totals.week)}</div>
        </div>

        <div className="vdivider" />

        {DAYS.map((d, i) => {
          const m = totals.perDay[i];
          const pct = totals.max > 0 ? Math.round(m / totals.max * 100) : 0;
          return (
            <div key={d} className="day-stat">
              <span className="day-stat-name">{d.slice(0, 3)}</span>
              <span className="day-stat-value">{fmtMin(m)}</span>
              <div className="meter">
                <div className="meter-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
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

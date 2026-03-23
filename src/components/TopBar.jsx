import { DAYS } from "../constants";
import { fmtMin } from "../utils/time";

const btnStyle = {
  padding: "6px 14px", fontSize: 12, fontWeight: 500,
  border: "1px solid #cbd5e1", background: "#fff",
  borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap",
};

const divider = (
  <div style={{ width: 1, height: "auto", background: "#e2e8f0", flexShrink: 0, alignSelf: "stretch" }} />
);

export function TopBar({ topBarRef, totals, output, onCopy, onReset }) {
  return (
    <div ref={topBarRef} style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
      padding: "10px 32px", display: "flex", flexWrap: "wrap", gap: 36,
      alignItems: "stretch", justifyContent: "center", flexShrink: 0,
    }}>

      {/* Total semaine + récap jours */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Semaine</div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{fmtMin(totals.week)}</div>
        </div>

        <div style={{ width: 1, height: 48, background: "#e2e8f0", flexShrink: 0 }} />

        {DAYS.map((d, i) => {
          const m = totals.perDay[i];
          const pct = totals.max > 0 ? Math.round(m / totals.max * 100) : 0;
          return (
            <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 64 }}>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{d.slice(0, 3)}</span>
              <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{fmtMin(m)}</span>
              <div style={{ width: 52, height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#0f172a", width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {divider}

      {/* Output */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Output</div>
        <pre style={{
          margin: 0, fontSize: 11, lineHeight: 1.5,
          background: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: 7, padding: "5px 8px", whiteSpace: "pre",
        }}>{output}</pre>
      </div>

      {divider}

      {/* Boutons */}
      <div style={{ flex: 1, minWidth: 120, maxWidth: 180, display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
        <button onClick={onCopy} style={btnStyle}>Copier output</button>
        <button onClick={onReset} style={btnStyle}>Reset défaut</button>
      </div>

    </div>
  );
}

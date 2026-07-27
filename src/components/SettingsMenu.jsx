import { useState } from "react";

// Engrenage en haut à droite : gestion de la semaine par défaut et du week-end.
export function SettingsMenu({ showWeekend, onToggleWeekend, onSaveDefault, onResetToDefault }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="settings">
      <button className="gear-btn" title="Réglages" onClick={() => setOpen(o => !o)}>⚙</button>
      {open && (
        <div className="settings-panel">
          <div className="stat-label">Réglages</div>
          <button className="btn settings-action" onClick={onSaveDefault}>
            Définir l'état actuel comme défaut
          </button>
          <button className="btn settings-action" onClick={onResetToDefault}>
            Réinitialiser au défaut
          </button>
          <label className="settings-check">
            <input type="checkbox" checked={showWeekend} onChange={onToggleWeekend} />
            Afficher samedi / dimanche
          </label>
        </div>
      )}
    </div>
  );
}

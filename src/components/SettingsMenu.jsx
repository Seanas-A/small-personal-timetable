import { useState } from "react";

// Engrenage en haut à droite : semaine par défaut, affichage du week-end, output.
export function SettingsMenu({ showWeekend, onToggleWeekend, onSaveDefault, onResetToDefault, onCopy }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="settings">
      <button className="gear-btn" title="Réglages" onClick={() => setOpen(o => !o)}>⚙</button>
      {open && (
        <div className="settings-panel">
          <div className="stat-label">Semaine par défaut</div>
          <button className="btn settings-action" onClick={onSaveDefault}>
            Définir l'état actuel comme défaut
          </button>
          <button className="btn settings-action" onClick={onResetToDefault}>
            Réinitialiser au défaut
          </button>

          <div className="settings-sep" />

          <div className="stat-label">Affichage</div>
          <label className="settings-check">
            <input type="checkbox" checked={showWeekend} onChange={onToggleWeekend} />
            Afficher samedi / dimanche
          </label>

          <div className="settings-sep" />

          <button className="btn settings-action" onClick={onCopy}>
            Copier l'output
          </button>
        </div>
      )}
    </div>
  );
}

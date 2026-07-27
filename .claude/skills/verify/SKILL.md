---
name: verify
description: Vérifier l'app timetable en la pilotant dans Chrome headless (build, lancement, drive, captures)
---

# Vérifier small-personal-timetable

App React/Vite sans backend, état persisté dans `localStorage` (clé `timetable_v3`).

## Lancer

```bash
npm run dev -- --port 5199 --strictPort   # en arrière-plan
```

## Piloter (Chrome headless via puppeteer-core)

Pas de Playwright installé ; utiliser le Chrome local :

```bash
# dans un dossier scratch :
npm i puppeteer-core
```

```js
import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
});
```

## Flows utiles

- État vierge : `localStorage.clear()` puis reload → planning par défaut (39h pile).
- Sélecteurs : `.week-value`, `.week-remaining`, `.gauge-fill`, `.output-pre`,
  `.carry-input`, `.calendar-day-head` (boutons toggle off), `.day-col`,
  `.work-block`, `.lunch-zone`, `.day-off-overlay`, `.day-stat-value`.
- Drag/resize : `page.mouse.move/down/move/up` sur `.work-block` (les pointer
  events marchent en headless) ; `slotPx = hauteur .day-col / ((22-6)*4)`.
- Saisie report : cliquer `.carry-input` (select-all au focus), taper `+1h30`,
  puis Entrée. Ne PAS compter sur le triple-clic (sélection KO en headless).
- Migration : seeder `timetable_v2` (ancien format `{ Lundi: {start,end}, ... }`),
  vider `timetable_v3`, reload.

## Gotchas

- « Nouvelle semaine » et « Réinitialiser au défaut » ouvrent un `window.confirm` :
  brancher `page.on("dialog", d => d.accept())` avant de cliquer.

- `page.click(sel, { clickCount: 3 })` ne sélectionne PAS le texte en headless.
- Attendre ~300 ms après reload : `slotPx` est mesuré par ResizeObserver.

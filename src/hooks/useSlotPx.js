import { useEffect, useState } from "react";
import { VIEW_SLOTS } from "../constants";

/**
 * Taille d'un slot (px), déduite de la hauteur réellement disponible pour la
 * grille — mesurée sur l'élément lui-même, donc robuste à tout changement de
 * layout (TopBar qui grandit, nouvel élément, redimensionnement...).
 */
export function useSlotPx(bodyRef) {
  const [slotPx, setSlotPx] = useState(10);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSlotPx(Math.max(4, Math.floor(entry.contentRect.height / VIEW_SLOTS)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [bodyRef]);

  return slotPx;
}

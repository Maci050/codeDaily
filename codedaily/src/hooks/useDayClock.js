import { useEffect, useState } from 'react';
import { getDaySeed } from '../services/challengeService';

const TICK_MS = 15000;

// El día del juego es el día UTC: el reto cambia para todo el mundo a la vez (00:00 UTC).
function readClock() {
  const now = new Date();
  const nextMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return { today: getDaySeed(now), msUntilNext: nextMidnight - now.getTime() };
}

// Devuelve el día actual y el tiempo hasta el próximo reto, y se actualiza solo.
export function useDayClock() {
  const [clock, setClock] = useState(readClock);

  useEffect(() => {
    const tick = () => setClock(readClock());
    const interval = window.setInterval(tick, TICK_MS);
    // Al volver a la pestaña tras un rato, actualiza al momento
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);

  return clock;
}

export function formatCountdown(ms, language) {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (language === 'es') {
    if (totalMinutes <= 1) return 'Próximo reto en menos de 1 min';
    return hours > 0 ? `Próximo reto en ${hours} h ${minutes} min` : `Próximo reto en ${minutes} min`;
  }
  if (totalMinutes <= 1) return 'Next challenge in under 1 min';
  return hours > 0 ? `Next challenge in ${hours}h ${minutes}m` : `Next challenge in ${minutes}m`;
}

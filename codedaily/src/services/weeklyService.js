// Desafío semanal: cambia cada lunes a las 00:00 UTC, igual para todo el mundo.
// La semana #1 es la que empezó el lunes 5 de octubre de 2026.

const DAY_MS = 86400000;
const WEEK_MS = 7 * DAY_MS;
const WEEKLY_EPOCH_MS = Date.UTC(2026, 9, 5);

function startOfUTCDay(date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function toYMD(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function getWeekNumber(date = new Date()) {
  return Math.floor((startOfUTCDay(date) - WEEKLY_EPOCH_MS) / WEEK_MS) + 1;
}

export function getWeekStart(week) {
  return toYMD(WEEKLY_EPOCH_MS + (week - 1) * WEEK_MS);
}

export function getWeekEnd(week) {
  return toYMD(WEEKLY_EPOCH_MS + (week - 1) * WEEK_MS + 6 * DAY_MS);
}

export function getMsUntilNextWeek(now = new Date()) {
  return WEEKLY_EPOCH_MS + getWeekNumber(now) * WEEK_MS - now.getTime();
}

let poolPromise = null;

export function loadWeeklyPool() {
  if (!poolPromise) {
    poolPromise = import('../data/challenges/weekly_python.json').then((module) => module.default);
    poolPromise.catch(() => {
      poolPromise = null;
    });
  }
  return poolPromise;
}

// Los desafíos se publican en orden y, al acabarse, vuelven a empezar
export function pickWeekly(pool, week) {
  if (!pool?.length || week < 1) return null;
  return pool[(week - 1) % pool.length];
}

export function getWeeklyText(challenge, language = 'es') {
  if (!challenge) return null;
  const pick = (field) => challenge[field]?.[language] ?? challenge[field]?.es;
  return {
    ...challenge,
    localizedTitle: pick('title'),
    localizedDescription: pick('description'),
    localizedInstructions: pick('instructions'),
    localizedRules: pick('rules') || [],
    localizedHints: pick('hints') || [],
    localizedReferenceTitle: pick('referenceTitle'),
  };
}

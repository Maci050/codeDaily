// Rutas de la app sobre la History API. Vercel reescribe cualquier ruta a index.html.
// Los nombres de ruta coinciden con los que ya anuncia public/sitemap.xml.

import { getWeekNumber } from './services/weeklyService';

export const ARCHIVE_START_DATE = '2026-03-22';

const PAGE_PATHS = {
  home: '/',
  daily: '/daily',
  weekly: '/weekly',
  archive: '/archive',
  profile: '/progress',
  modes: '/modes',
};

const MODE_SLUGS = {
  guess_output: 'guess-output',
  find_bug: 'find-bug',
  guess_complexity: 'complexity',
};

const SLUG_TO_MODE = Object.fromEntries(Object.entries(MODE_SLUGS).map(([mode, slug]) => [slug, mode]));
const PATH_TO_PAGE = Object.fromEntries(Object.entries(PAGE_PATHS).map(([page, path]) => [path, page]));
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function todaySeed() {
  return new Date().toISOString().split('T')[0];
}

function isValidArchiveDate(date) {
  if (!DATE_PATTERN.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  // Descarta fechas imposibles como 2026-02-31
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return false;
  return date >= ARCHIVE_START_DATE && date <= todaySeed();
}

// Convierte una ruta en { page, mode, date, week }. Una ruta desconocida o inválida
// devuelve la página más cercana con valid: false para corregir la URL.
export function parsePath(pathname) {
  const segments = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const base = `/${segments[0] || ''}`;
  const page = PATH_TO_PAGE[base];

  if (!page) return { page: 'home', mode: null, date: null, valid: false };

  if (page === 'weekly') {
    if (segments.length === 1) return { page, mode: null, date: null, week: null, valid: true };
    const week = /^\d+$/.test(segments[1]) ? Number(segments[1]) : NaN;
    const ok = segments.length === 2 && week >= 1 && week <= getWeekNumber();
    return { page, mode: null, date: null, week: ok ? week : null, valid: ok };
  }

  if (page === 'modes') {
    if (segments.length === 1) return { page, mode: null, date: null, valid: true };
    const mode = SLUG_TO_MODE[segments[1]];
    return { page, mode: mode || null, date: null, valid: Boolean(mode) && segments.length === 2 };
  }

  if (page === 'archive') {
    if (segments.length === 1) return { page, mode: null, date: null, valid: true };
    const date = segments[1];
    const ok = isValidArchiveDate(date) && segments.length === 2;
    return { page, mode: null, date: ok ? date : null, valid: ok };
  }

  return { page, mode: null, date: null, valid: segments.length === 1 || page === 'home' };
}

export function buildPath({ page, mode = null, date = null, week = null }) {
  const base = PAGE_PATHS[page] || '/';
  if (page === 'weekly' && week) return `${base}/${week}`;
  if (page === 'modes' && mode && MODE_SLUGS[mode]) return `${base}/${MODE_SLUGS[mode]}`;
  if (page === 'archive' && date) return `${base}/${date}`;
  return base;
}

// Deja que el navegador gestione Ctrl/Cmd+clic, clic central, etc. (abrir en pestaña nueva)
export function isPlainLeftClick(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

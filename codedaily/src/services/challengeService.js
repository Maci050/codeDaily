// Cada banco de retos se descarga solo cuando hace falta: la portada necesita uno,
// el reto diario los tres de su lenguaje.
const POOL_LOADERS = {
  python: {
    novato: () => import('../data/challenges/python_novato.json'),
    intermedio: () => import('../data/challenges/python_intermedio.json'),
    pro: () => import('../data/challenges/python_pro.json'),
  },
  java: {
    novato: () => import('../data/challenges/java_novato.json'),
    intermedio: () => import('../data/challenges/java_intermedio.json'),
    pro: () => import('../data/challenges/java_pro.json'),
  },
};

const DIFFICULTIES = ['novato', 'intermedio', 'pro'];
const poolCache = new Map();
const resolvedPools = new Map();
const languagePoolsCache = new Map();

function loadChallengePool(language = 'python', difficulty = 'novato') {
  const key = `${language}_${difficulty}`;
  if (!poolCache.has(key)) {
    const loader = POOL_LOADERS[language]?.[difficulty];
    const promise = (loader ? loader().then((module) => module.default) : Promise.resolve([]))
      .then((pool) => {
        resolvedPools.set(key, pool);
        return pool;
      });
    // Si la descarga falla, se olvida para poder reintentar
    promise.catch(() => poolCache.delete(key));
    poolCache.set(key, promise);
  }
  return poolCache.get(key);
}

// Bancos ya descargados de un lenguaje, sin esperar (null si falta alguno)
function getCachedLanguagePools(language = 'python') {
  if (languagePoolsCache.has(language)) return languagePoolsCache.get(language);
  if (!DIFFICULTIES.every((difficulty) => resolvedPools.has(`${language}_${difficulty}`))) return null;
  // Siempre el mismo objeto, para que los useMemo/useCallback que dependen de él no se recalculen
  const pools = Object.fromEntries(DIFFICULTIES.map((difficulty) => [difficulty, resolvedPools.get(`${language}_${difficulty}`)]));
  languagePoolsCache.set(language, pools);
  return pools;
}

async function loadLanguagePools(language = 'python') {
  await Promise.all(DIFFICULTIES.map((difficulty) => loadChallengePool(language, difficulty)));
  return getCachedLanguagePools(language);
}

function normalizeDateToUTC(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getDaySeed(date = new Date()) {
  const utcDate = normalizeDateToUTC(date);
  const year = utcDate.getUTCFullYear();
  const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utcDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayNumber(date = new Date()) {
  const utcDate = normalizeDateToUTC(date);
  const epoch = new Date(Date.UTC(2026, 2, 22)); // 22 marzo 2026 — fecha de inicio
  return Math.floor((utcDate - epoch) / 86400000);
}

// Elige el reto del día dentro de un banco ya cargado
function pickDailyChallenge(pool, { date = new Date(), language = 'python', difficulty = 'novato' } = {}) {
  const availableChallenges = (pool || []).filter(
    (challenge) => challenge.language === language && challenge.difficulty === difficulty
  );
  if (availableChallenges.length === 0) return null;
  const dayNum = getDayNumber(date);
  const diffOffset = { novato: 0, intermedio: 1000, pro: 2000 }[difficulty] || 0;
  const index = (dayNum + diffOffset) % availableChallenges.length;
  return availableChallenges[index];
}

async function loadDailyChallenge({ date = new Date(), language = 'python', difficulty = 'novato' } = {}) {
  const pool = await loadChallengePool(language, difficulty);
  return pickDailyChallenge(pool, { date, language, difficulty });
}

function getChallengeText(challenge, contentLanguage = 'es') {
  if (!challenge) return null;
  return {
    ...challenge,
    localizedTitle: challenge.title?.[contentLanguage] || challenge.title?.es || '',
    localizedDescription: challenge.description?.[contentLanguage] || challenge.description?.es || '',
    localizedInstructions: challenge.instructions?.[contentLanguage] || challenge.instructions?.es || '',
    localizedRestrictions: challenge.restrictions?.[contentLanguage] || challenge.restrictions?.es || [],
    localizedHints: challenge.hints?.[contentLanguage] || challenge.hints?.es || [],
  };
}

function getChallengeStats(pools) {
  const counts = Object.fromEntries(DIFFICULTIES.map((difficulty) => [difficulty, pools?.[difficulty]?.length || 0]));
  return {
    total: counts.novato + counts.intermedio + counts.pro,
    ...counts,
  };
}

export {
  loadChallengePool,
  loadLanguagePools,
  getCachedLanguagePools,
  loadDailyChallenge,
  pickDailyChallenge,
  getChallengeText,
  getChallengeStats,
  getDaySeed,
  getDayNumber,
};

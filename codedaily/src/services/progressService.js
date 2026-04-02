const STORAGE_KEY = 'codedaily_progress';

function getInitialState() {
  return {
    dailyProgress: {},
    streak: 0,
    maxStreak: 0,
    lastCompletedDate: null,
    normalCompleted: 0,
    hackerCompleted: 0,
  };
}

function loadProgress() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return data || getInitialState();
  } catch {
    return getInitialState();
  }
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDayKey(date = new Date()) {
  return date.toISOString().split('T')[0];
}

function buildProgressKey({ date = new Date(), challengeId = 'unknown', mode = 'normal' }) {
  return `${getDayKey(date)}::${challengeId}::${mode}`;
}

function getProgressEntry({ date = new Date(), challengeId = 'unknown', mode = 'normal' }) {
  const data = loadProgress();
  const key = buildProgressKey({ date, challengeId, mode });
  return data.dailyProgress[key] || {
    completed: false,
    attempts: 0,
    code: '',
    revealedHints: 0,
    locked: false,
  };
}

function updateProgressEntry({ date = new Date(), challengeId = 'unknown', mode = 'normal', update = {} }) {
  const data = loadProgress();
  const key = buildProgressKey({ date, challengeId, mode });
  data.dailyProgress[key] = {
    ...getProgressEntry({ date, challengeId, mode }),
    ...update,
  };
  saveProgress(data);
}

function markTodayCompleted({ date = new Date(), challengeId = 'unknown', mode = 'normal' }) {
  const data = loadProgress();
  const today = getDayKey(date);
  const key = buildProgressKey({ date, challengeId, mode });

  const previousEntry = data.dailyProgress[key] || {
    completed: false, attempts: 0, code: '', revealedHints: 0, locked: false,
  };

  data.dailyProgress[key] = { ...previousEntry, completed: true, locked: false };

  if (!previousEntry.completed) {
    if (mode === 'hacker') {
      data.hackerCompleted += 1;
    } else {
      data.normalCompleted += 1;
    }
  }

  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDayKey(yesterday);

  if (data.lastCompletedDate === yesterdayKey) {
    data.streak += 1;
  } else if (data.lastCompletedDate !== today) {
    data.streak = 1;
  }

  data.lastCompletedDate = today;
  data.maxStreak = Math.max(data.maxStreak || 0, data.streak);

  saveProgress(data);
}

function getStats() {
  const data = loadProgress();
  const entries = Object.entries(data.dailyProgress);

  // Días únicos con algún reto completado
  const completedDates = new Set();

  // Por dificultad (daily)
  let byDifficulty = { novato: 0, intermedio: 0, pro: 0 };

  // Por lenguaje (daily)
  let byLanguage = { python: 0, java: 0 };

  // Modos extra
  let modeStats = { guess_output: 0, find_bug: 0, guess_complexity: 0 };

  // Distribución de intentos (1, 2, 3, 4+)
  let attemptsDist = { 1: 0, 2: 0, 3: 0, '4+': 0 };

  // Actividad por día (últimos 60 días)
  let activityByDay = {};

  entries.forEach(([key, entry]) => {
    if (!entry.completed) return;

    const [datePart, challengeId, mode] = key.split('::');
    completedDates.add(datePart);

    // Actividad
    activityByDay[datePart] = (activityByDay[datePart] || 0) + 1;

    // Distribución de intentos
    if (entry.attempts) {
      const bucket = entry.attempts <= 3 ? String(entry.attempts) : '4+';
      attemptsDist[bucket] = (attemptsDist[bucket] || 0) + 1;
    }

    // Modos extra
    if (challengeId?.startsWith('go_')) {
      modeStats.guess_output += 1;
      return;
    }
    if (challengeId?.startsWith('fb_')) {
      modeStats.find_bug += 1;
      return;
    }
    if (challengeId?.startsWith('gc_')) {
      modeStats.guess_complexity += 1;
      return;
    }

    // Daily — extraer lenguaje y dificultad del challengeId
    // challengeId format: python_sum_list o java_two_sum_indices
    const langMatch = challengeId?.match(/^(python|java)_/);
    if (langMatch) {
      byLanguage[langMatch[1]] = (byLanguage[langMatch[1]] || 0) + 1;
    }

    // Dificultad la inferimos del modo (hacker = pro) o del challengeId buscando en los JSONs
    // Como aproximación usamos hackerCompleted para pro hacker
    if (mode === 'hacker') {
      byDifficulty.pro += 1;
    }
  });

  // Para dificultad en modo normal, usamos los contadores existentes
  // normalCompleted y hackerCompleted son los más fiables
  return {
    streak: data.streak || 0,
    maxStreak: data.maxStreak || 0,
    completedDays: completedDates.size,
    normalCompleted: data.normalCompleted || 0,
    hackerCompleted: data.hackerCompleted || 0,
    byLanguage,
    modeStats,
    attemptsDist,
    activityByDay,
  };
}

function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

export {
  loadProgress,
  saveProgress,
  getDayKey,
  getProgressEntry,
  updateProgressEntry,
  markTodayCompleted,
  getStats,
  clearProgress,
};
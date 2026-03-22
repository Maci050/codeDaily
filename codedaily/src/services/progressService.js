const STORAGE_KEY = 'codedaily_progress';

function getInitialState() {
  return {
    dailyProgress: {},
    streak: 0,
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

function updateProgressEntry({
  date = new Date(),
  challengeId = 'unknown',
  mode = 'normal',
  update = {},
}) {
  const data = loadProgress();
  const key = buildProgressKey({ date, challengeId, mode });

  data.dailyProgress[key] = {
    ...getProgressEntry({ date, challengeId, mode }),
    ...update,
  };

  saveProgress(data);
}

function markTodayCompleted({
  date = new Date(),
  challengeId = 'unknown',
  mode = 'normal',
}) {
  const data = loadProgress();
  const today = getDayKey(date);
  const key = buildProgressKey({ date, challengeId, mode });

  const previousEntry = data.dailyProgress[key] || {
    completed: false,
    attempts: 0,
    code: '',
    revealedHints: 0,
    locked: false,
  };

  data.dailyProgress[key] = {
    ...previousEntry,
    completed: true,
    locked: false,
  };

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

  saveProgress(data);
}

function getStats() {
  const data = loadProgress();

  const completedDates = new Set();

  Object.entries(data.dailyProgress).forEach(([key, entry]) => {
    if (!entry.completed) {
      return;
    }

    const datePart = key.split('::')[0];
    completedDates.add(datePart);
  });

  return {
    streak: data.streak,
    completedDays: completedDates.size,
    normalCompleted: data.normalCompleted || 0,
    hackerCompleted: data.hackerCompleted || 0,
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
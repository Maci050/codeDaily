const STORAGE_KEY = 'codedaily_progress';

function getInitialState() {
  return {
    dailyProgress: {},
    streak: 0,
    lastCompletedDate: null,
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

function getTodayProgress() {
  const data = loadProgress();
  const today = getDayKey();

  return data.dailyProgress[today] || {
    completed: false,
    attempts: 0,
    code: '',
    revealedHints: 0,
  };
}

function updateTodayProgress(update) {
  const data = loadProgress();
  const today = getDayKey();

  data.dailyProgress[today] = {
    ...getTodayProgress(),
    ...update,
  };

  saveProgress(data);
}

function markTodayCompleted() {
  const data = loadProgress();
  const today = getDayKey();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDayKey(yesterday);

  if (data.lastCompletedDate === yesterdayKey) {
    data.streak += 1;
  } else if (data.lastCompletedDate !== today) {
    data.streak = 1;
  }

  data.lastCompletedDate = today;

  if (!data.dailyProgress[today]) {
    data.dailyProgress[today] = {};
  }

  data.dailyProgress[today].completed = true;

  saveProgress(data);
}

function getStats() {
  const data = loadProgress();

  const completedDays = Object.values(data.dailyProgress).filter(
    (day) => day.completed
  ).length;

  return {
    streak: data.streak,
    completedDays,
  };
}

export {
  loadProgress,
  updateTodayProgress,
  getTodayProgress,
  markTodayCompleted,
  getStats,
};
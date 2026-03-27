const STORAGE_KEY = 'codedaily_ui';

function getUIState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function setUIState(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function shouldShowTutorial() {
  const state = getUIState();
  return !state.hasSeenTutorial;
}

function markTutorialSeen() {
  const state = getUIState();
  state.hasSeenTutorial = true;
  setUIState(state);
}

function getPreferences() {
  const state = getUIState();
  return {
    difficulty: state.difficulty || 'novato',
    playMode: state.playMode || 'normal',
  };
}

function savePreferences({ difficulty, playMode }) {
  const state = getUIState();
  if (difficulty !== undefined) state.difficulty = difficulty;
  if (playMode !== undefined) state.playMode = playMode;
  setUIState(state);
}

export {
  shouldShowTutorial,
  markTutorialSeen,
  getPreferences,
  savePreferences,
};
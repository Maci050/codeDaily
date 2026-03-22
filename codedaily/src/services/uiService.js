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

export {
  shouldShowTutorial,
  markTutorialSeen,
};
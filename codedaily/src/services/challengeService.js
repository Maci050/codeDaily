import novatoChallenges from '../data/challenges/python_novato.json';
import intermedioChallenges from '../data/challenges/python_intermedio.json';
import proChallenges from '../data/challenges/python_pro.json';

const ALL_CHALLENGES = [
  ...novatoChallenges,
  ...intermedioChallenges,
  ...proChallenges,
];

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

function hashStringToNumber(value) {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }

  return hash;
}

function getChallengesByLanguage(language = 'python') {
  return ALL_CHALLENGES.filter((challenge) => challenge.language === language);
}

function getChallengesByDifficulty(difficulty, language = 'python') {
  const base = getChallengesByLanguage(language);

  if (!difficulty || difficulty === 'all') {
    return base;
  }

  return base.filter((challenge) => challenge.difficulty === difficulty);
}

function getDailyChallenge({
  date = new Date(),
  language = 'python',
  difficulty = 'novato',
} = {}) {
  const availableChallenges = getChallengesByDifficulty(difficulty, language);

  if (availableChallenges.length === 0) {
    return null;
  }

  const seed = getDaySeed(date);
  const index = hashStringToNumber(`${seed}-${language}-${difficulty}`) % availableChallenges.length;

  return availableChallenges[index];
}

function getChallengeText(challenge, contentLanguage = 'es') {
  if (!challenge) {
    return null;
  }

  return {
    ...challenge,
    localizedTitle: challenge.title?.[contentLanguage] || challenge.title?.es || '',
    localizedDescription:
      challenge.description?.[contentLanguage] || challenge.description?.es || '',
    localizedInstructions:
      challenge.instructions?.[contentLanguage] || challenge.instructions?.es || '',
    localizedRestrictions:
      challenge.restrictions?.[contentLanguage] || challenge.restrictions?.es || [],
    localizedHints: challenge.hints?.[contentLanguage] || challenge.hints?.es || [],
  };
}

function getChallengeStats(language = 'python') {
  const challenges = getChallengesByLanguage(language);

  return {
    total: challenges.length,
    novato: challenges.filter((challenge) => challenge.difficulty === 'novato').length,
    intermedio: challenges.filter((challenge) => challenge.difficulty === 'intermedio').length,
    pro: challenges.filter((challenge) => challenge.difficulty === 'pro').length,
  };
}

export {
  getChallengesByLanguage,
  getChallengesByDifficulty,
  getDailyChallenge,
  getChallengeText,
  getChallengeStats,
  getDaySeed,
};
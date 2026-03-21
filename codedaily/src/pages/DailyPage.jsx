import { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  getChallengeStats,
  getChallengeText,
  getDailyChallenge,
  getDaySeed,
} from '../services/challengeService';

function DailyPage() {
  const { language } = useLanguage();
  const [difficulty, setDifficulty] = useState('all');

  const text = useMemo(() => {
    return {
      es: {
        title: 'Daily Challenge',
        subtitle:
          'Cada día se selecciona un reto de forma determinista según la fecha.',
        difficultyLabel: 'Dificultad',
        difficultyAll: 'Todas',
        difficultyNovato: 'Novato',
        difficultyIntermedio: 'Intermedio',
        difficultyPro: 'Pro',
        selectedDate: 'Fecha del reto',
        challengeId: 'ID del reto',
        languageLabel: 'Lenguaje',
        functionLabel: 'Función esperada',
        instructions: 'Instrucciones',
        restrictions: 'Restricciones',
        hintsPreview: 'Pistas disponibles',
        testsCount: 'Número de tests',
        emptyTitle: 'No hay retos disponibles',
        emptyText: 'No existe ningún reto para esa selección.',
        statsTitle: 'Banco actual de retos',
        total: 'Total',
      },
      en: {
        title: 'Daily Challenge',
        subtitle:
          'A challenge is selected every day in a deterministic way based on the date.',
        difficultyLabel: 'Difficulty',
        difficultyAll: 'All',
        difficultyNovato: 'Beginner',
        difficultyIntermedio: 'Intermediate',
        difficultyPro: 'Pro',
        selectedDate: 'Challenge date',
        challengeId: 'Challenge ID',
        languageLabel: 'Language',
        functionLabel: 'Expected function',
        instructions: 'Instructions',
        restrictions: 'Restrictions',
        hintsPreview: 'Available hints',
        testsCount: 'Number of tests',
        emptyTitle: 'No challenges available',
        emptyText: 'There is no challenge for that selection.',
        statsTitle: 'Current challenge pool',
        total: 'Total',
      },
    }[language];
  }, [language]);

  const stats = useMemo(() => getChallengeStats('python'), []);
  const dailyChallenge = useMemo(() => {
    const challenge = getDailyChallenge({
      date: new Date(),
      language: 'python',
      difficulty,
    });

    return getChallengeText(challenge, language);
  }, [difficulty, language]);

  const difficulties = [
    { value: 'all', label: text.difficultyAll },
    { value: 'novato', label: text.difficultyNovato },
    { value: 'intermedio', label: text.difficultyIntermedio },
    { value: 'pro', label: text.difficultyPro },
  ];

  return (
    <section className="page-section">
      <div className="content-card">
        <div className="page-top-row">
          <div>
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>

          <div className="filter-box">
            <label htmlFor="daily-difficulty-select">{text.difficultyLabel}</label>
            <select
              id="daily-difficulty-select"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              {difficulties.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!dailyChallenge ? (
          <div className="status-box">
            <h2>{text.emptyTitle}</h2>
            <p>{text.emptyText}</p>
          </div>
        ) : (
          <div className="challenge-card">
            <div className="challenge-card-header">
              <div>
                <span className="difficulty-pill">{dailyChallenge.difficulty}</span>
                <h2>{dailyChallenge.localizedTitle}</h2>
              </div>
            </div>

            <p className="challenge-description">{dailyChallenge.localizedDescription}</p>

            <div className="challenge-meta-grid">
              <div className="meta-item">
                <span>{text.selectedDate}</span>
                <strong>{getDaySeed(new Date())}</strong>
              </div>
              <div className="meta-item">
                <span>{text.challengeId}</span>
                <strong>{dailyChallenge.id}</strong>
              </div>
              <div className="meta-item">
                <span>{text.languageLabel}</span>
                <strong>{dailyChallenge.language}</strong>
              </div>
              <div className="meta-item">
                <span>{text.functionLabel}</span>
                <strong>{dailyChallenge.functionName}</strong>
              </div>
              <div className="meta-item">
                <span>{text.hintsPreview}</span>
                <strong>{dailyChallenge.localizedHints.length}</strong>
              </div>
              <div className="meta-item">
                <span>{text.testsCount}</span>
                <strong>{dailyChallenge.tests.length}</strong>
              </div>
            </div>

            <div className="challenge-section">
              <h3>{text.instructions}</h3>
              <p>{dailyChallenge.localizedInstructions}</p>
            </div>

            <div className="challenge-section">
              <h3>{text.restrictions}</h3>
              <ul className="challenge-list">
                {dailyChallenge.localizedRestrictions.map((restriction) => (
                  <li key={restriction}>{restriction}</li>
                ))}
              </ul>
            </div>

            <div className="challenge-section">
              <h3>Starter code</h3>
              <pre className="code-block">
                <code>{dailyChallenge.starterCode}</code>
              </pre>
            </div>
          </div>
        )}

        <div className="status-box">
          <h2>{text.statsTitle}</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span>{text.total}</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="stat-card">
              <span>{text.difficultyNovato}</span>
              <strong>{stats.novato}</strong>
            </div>
            <div className="stat-card">
              <span>{text.difficultyIntermedio}</span>
              <strong>{stats.intermedio}</strong>
            </div>
            <div className="stat-card">
              <span>{text.difficultyPro}</span>
              <strong>{stats.pro}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DailyPage;
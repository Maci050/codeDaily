import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getChallengeText, getRandomChallenge } from '../services/challengeService';

function UnlimitedPage() {
  const { language } = useLanguage();
  const [difficulty, setDifficulty] = useState('all');
  const [currentChallenge, setCurrentChallenge] = useState(null);

  const text = useMemo(() => {
    return {
      es: {
        title: 'Unlimited',
        subtitle:
          'Practica con retos aleatorios del banco disponible.',
        difficultyLabel: 'Dificultad',
        difficultyAll: 'Todas',
        difficultyNovato: 'Novato',
        difficultyIntermedio: 'Intermedio',
        difficultyPro: 'Pro',
        randomButton: 'Nuevo reto aleatorio',
        challengeId: 'ID del reto',
        languageLabel: 'Lenguaje',
        functionLabel: 'Función esperada',
        instructions: 'Instrucciones',
        restrictions: 'Restricciones',
        emptyTitle: 'No hay retos disponibles',
        emptyText: 'No existe ningún reto para esa dificultad.',
      },
      en: {
        title: 'Unlimited',
        subtitle:
          'Practice with random challenges from the available pool.',
        difficultyLabel: 'Difficulty',
        difficultyAll: 'All',
        difficultyNovato: 'Beginner',
        difficultyIntermedio: 'Intermediate',
        difficultyPro: 'Pro',
        randomButton: 'New random challenge',
        challengeId: 'Challenge ID',
        languageLabel: 'Language',
        functionLabel: 'Expected function',
        instructions: 'Instructions',
        restrictions: 'Restrictions',
        emptyTitle: 'No challenges available',
        emptyText: 'There is no challenge for that difficulty.',
      },
    }[language];
  }, [language]);

  const difficulties = [
    { value: 'all', label: text.difficultyAll },
    { value: 'novato', label: text.difficultyNovato },
    { value: 'intermedio', label: text.difficultyIntermedio },
    { value: 'pro', label: text.difficultyPro },
  ];

  const loadRandomChallenge = (excludeId = null) => {
    const challenge = getRandomChallenge({
      language: 'python',
      difficulty,
      excludeId,
    });

    setCurrentChallenge(challenge);
  };

  useEffect(() => {
    loadRandomChallenge();
  }, [difficulty]);

  const localizedChallenge = useMemo(() => {
    return getChallengeText(currentChallenge, language);
  }, [currentChallenge, language]);

  return (
    <section className="page-section">
      <div className="content-card">
        <div className="page-top-row">
          <div>
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>

          <div className="filter-box">
            <label htmlFor="unlimited-difficulty-select">{text.difficultyLabel}</label>
            <select
              id="unlimited-difficulty-select"
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

        <div className="page-actions">
          <button
            className="primary-button"
            onClick={() => loadRandomChallenge(localizedChallenge?.id || null)}
          >
            {text.randomButton}
          </button>
        </div>

        {!localizedChallenge ? (
          <div className="status-box">
            <h2>{text.emptyTitle}</h2>
            <p>{text.emptyText}</p>
          </div>
        ) : (
          <div className="challenge-card">
            <div className="challenge-card-header">
              <div>
                <span className="difficulty-pill">{localizedChallenge.difficulty}</span>
                <h2>{localizedChallenge.localizedTitle}</h2>
              </div>
            </div>

            <p className="challenge-description">{localizedChallenge.localizedDescription}</p>

            <div className="challenge-meta-grid">
              <div className="meta-item">
                <span>{text.challengeId}</span>
                <strong>{localizedChallenge.id}</strong>
              </div>
              <div className="meta-item">
                <span>{text.languageLabel}</span>
                <strong>{localizedChallenge.language}</strong>
              </div>
              <div className="meta-item">
                <span>{text.functionLabel}</span>
                <strong>{localizedChallenge.functionName}</strong>
              </div>
              <div className="meta-item">
                <span>Hints</span>
                <strong>{localizedChallenge.localizedHints.length}</strong>
              </div>
              <div className="meta-item">
                <span>Tests</span>
                <strong>{localizedChallenge.tests.length}</strong>
              </div>
            </div>

            <div className="challenge-section">
              <h3>{text.instructions}</h3>
              <p>{localizedChallenge.localizedInstructions}</p>
            </div>

            <div className="challenge-section">
              <h3>{text.restrictions}</h3>
              <ul className="challenge-list">
                {localizedChallenge.localizedRestrictions.map((restriction) => (
                  <li key={restriction}>{restriction}</li>
                ))}
              </ul>
            </div>

            <div className="challenge-section">
              <h3>Starter code</h3>
              <pre className="code-block">
                <code>{localizedChallenge.starterCode}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default UnlimitedPage;
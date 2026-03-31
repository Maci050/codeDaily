import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getDaySeed } from '../../services/challengeService';
import { getProgressEntry, updateProgressEntry, markTodayCompleted } from '../../services/progressService';
import challenges from '../../data/challenges/guess_complexity.json';

const MAX_ATTEMPTS = 2;

function parseYMDToUTCDate(ymd) {
  const [year, month, day] = ymd.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function hashStringToNumber(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return hash;
}

function getDailyComplexityChallenge(date, difficulty) {
  const pool = challenges.filter(c => c.difficulty === difficulty);
  if (pool.length === 0) return null;
  const seed = getDaySeed(date);
  const index = hashStringToNumber(`${seed}-${difficulty}-gc`) % pool.length;
  return pool[index];
}

function GuessComplexityPlayer({ selectedDate }) {
  const { language } = useLanguage();
  const [difficulty, setDifficulty] = useState('novato');
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [wrongOptions, setWrongOptions] = useState([]); // opciones ya intentadas y erróneas

  const challengeDate = useMemo(() => parseYMDToUTCDate(selectedDate), [selectedDate]);
  const challenge = useMemo(() => getDailyComplexityChallenge(challengeDate, difficulty), [challengeDate, difficulty]);

  const attemptsLeft = MAX_ATTEMPTS - attemptCount;
  const isOver = completed || locked;

  const text = useMemo(() => ({
    es: {
      title: '¿Cuál es la complejidad?',
      subtitle: 'Analiza el algoritmo y elige su complejidad temporal en notación Big O.',
      difficultyLabel: 'Dificultad',
      difficultyNovato: 'Novato',
      difficultyIntermedio: 'Intermedio',
      difficultyPro: 'Pro',
      codeLabel: 'Algoritmo',
      chooseLabel: 'Elige la complejidad temporal',
      checkButton: 'Comprobar',
      correctTitle: '¡Correcto!',
      wrongTitle: 'Incorrecto',
      lockedTitle: 'Sin más intentos',
      lockedText: 'Has agotado los intentos.',
      explanation: 'Explicación',
      expectedLabel: 'Respuesta correcta',
      attemptsLeft: 'Intentos restantes',
      completedBadge: 'Completado',
      tryAgain: 'Intentar de nuevo',
    },
    en: {
      title: "What's the complexity?",
      subtitle: 'Analyze the algorithm and choose its time complexity in Big O notation.',
      difficultyLabel: 'Difficulty',
      difficultyNovato: 'Beginner',
      difficultyIntermedio: 'Intermediate',
      difficultyPro: 'Pro',
      codeLabel: 'Algorithm',
      chooseLabel: 'Choose the time complexity',
      checkButton: 'Check',
      correctTitle: 'Correct!',
      wrongTitle: 'Incorrect',
      lockedTitle: 'No more attempts',
      lockedText: 'You have used all attempts.',
      explanation: 'Explanation',
      expectedLabel: 'Correct answer',
      attemptsLeft: 'Attempts left',
      completedBadge: 'Completed',
      tryAgain: 'Try again',
    },
  }[language]), [language]);

  // Cargar progreso
  useEffect(() => {
    if (!challenge) return;
    const progress = getProgressEntry({
      date: challengeDate,
      challengeId: `gc_${challenge.id}_${difficulty}`,
      mode: 'normal',
    });
    setAttemptCount(progress.attempts || 0);
    setCompleted(progress.completed || false);
    setLocked(progress.locked || false);
    setWrongOptions(JSON.parse(progress.code || '[]'));
    setSelected(null);
    setSubmitted(progress.completed || progress.locked || false);
    setCorrect(progress.completed || false);
  }, [challenge?.id, difficulty, challengeDate]);

  // Guardar progreso
  useEffect(() => {
    if (!challenge) return;
    updateProgressEntry({
      date: challengeDate,
      challengeId: `gc_${challenge.id}_${difficulty}`,
      mode: 'normal',
      update: { attempts: attemptCount, completed, locked, code: JSON.stringify(wrongOptions) },
    });
  }, [attemptCount, completed, locked, wrongOptions, challenge, difficulty, challengeDate]);

  function handleSubmit() {
    if (!challenge || isOver || !selected) return;
    const isCorrect = selected === challenge.expected;
    const newAttempts = attemptCount + 1;
    setAttemptCount(newAttempts);
    setSubmitted(true);
    setCorrect(isCorrect);

    if (isCorrect) {
      setCompleted(true);
      markTodayCompleted({
        date: challengeDate,
        challengeId: `gc_${challenge.id}_${difficulty}`,
        mode: 'normal',
      });
    } else {
      setWrongOptions(prev => [...prev, selected]);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true);
      }
    }
  }

  function handleTryAgain() {
    setSubmitted(false);
    setSelected(null);
  }

  if (!challenge) return null;

  const localizedExplanation = challenge.explanation?.[language] || challenge.explanation?.es || '';
  const showResult = submitted && (correct || locked);

  return (
    <section className="page-section">
      <div className="content-card">
        <div className="page-top-row">
          <div>
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>
          <div className="filters-stack">
            <div className="filter-box">
              <label htmlFor="gc-difficulty">{text.difficultyLabel}</label>
              <select id="gc-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="novato">{text.difficultyNovato}</option>
                <option value="intermedio">{text.difficultyIntermedio}</option>
                <option value="pro">{text.difficultyPro}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="badge-row" style={{ marginBottom: '20px' }}>
          <span className="difficulty-pill">{difficulty}</span>
          {completed && <span className="completed-pill">{text.completedBadge}</span>}
          <span className="difficulty-pill">{text.attemptsLeft}: {Math.max(0, attemptsLeft)}</span>
        </div>

        {/* Código */}
        <div className="challenge-card">
          <div className="challenge-section" style={{ marginTop: 0 }}>
            <h3>{text.codeLabel}</h3>
            <pre className="code-block">
              <code>{challenge.code}</code>
            </pre>
          </div>
        </div>

        {/* Opciones */}
        <div className="editor-card">
          <div className="challenge-section" style={{ marginTop: 0 }}>
            <h3>{text.chooseLabel}</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginTop: '14px',
            }}>
              {challenge.options.map((option) => {
                const isWrong = wrongOptions.includes(option);
                const isSelected = selected === option;
                const isCorrectOption = option === challenge.expected;

                let borderColor = 'var(--border-strong)';
                let bg = 'var(--bg)';
                let color = 'var(--text)';
                let opacity = 1;

                if (isWrong) {
                  bg = 'var(--red-soft)';
                  borderColor = 'rgba(255,123,114,0.3)';
                  color = 'var(--red)';
                  opacity = 0.6;
                } else if (showResult && isCorrectOption) {
                  bg = 'var(--green-dim)';
                  borderColor = 'rgba(63,185,80,0.3)';
                  color = 'var(--green)';
                } else if (isSelected && !isWrong) {
                  borderColor = 'rgba(88,166,255,0.5)';
                  bg = 'var(--blue-soft)';
                }

                return (
                  <button
                    key={option}
                    onClick={() => {
                      if (isOver || isWrong || submitted) return;
                      setSelected(option);
                    }}
                    disabled={isOver || isWrong}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${borderColor}`,
                      background: bg,
                      color,
                      fontFamily: 'var(--mono)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      cursor: isOver || isWrong ? 'not-allowed' : 'pointer',
                      opacity,
                      transition: '0.15s ease',
                      textAlign: 'center',
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="editor-actions" style={{ marginTop: '16px' }}>
            {!submitted && !isOver && (
              <button
                className="primary-button"
                onClick={handleSubmit}
                disabled={!selected}
              >
                {text.checkButton}
              </button>
            )}
            {submitted && !correct && !locked && (
              <button className="secondary-button" onClick={handleTryAgain}>
                {text.tryAgain}
              </button>
            )}
          </div>

          {/* Feedback tras intento fallido (sin revelar solución) */}
          {submitted && !correct && !locked && (
            <div className="feedback-box error-box" style={{ marginTop: '20px' }}>
              <h4>{text.wrongTitle}</h4>
              <p>{text.attemptsLeft}: {attemptsLeft}</p>
            </div>
          )}

          {/* Bloqueado — ahora sí se muestra la solución */}
          {locked && !correct && (
            <div className="feedback-box error-box" style={{ marginTop: '20px' }}>
              <h4>{text.lockedTitle}</h4>
              <p>{text.lockedText}</p>
              <p style={{ marginTop: '8px' }}>
                {text.expectedLabel}:{' '}
                <code style={{ fontFamily: 'var(--mono)', color: 'var(--green)', fontWeight: 700 }}>
                  {challenge.expected}
                </code>
              </p>
              <div style={{ marginTop: '10px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{text.explanation}</strong>
                <p style={{ marginTop: '4px' }}>{localizedExplanation}</p>
              </div>
            </div>
          )}

          {/* Correcto */}
          {correct && (
            <div className="feedback-box success-box" style={{ marginTop: '20px' }}>
              <h4>{text.correctTitle}</h4>
              <div style={{ marginTop: '10px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{text.explanation}</strong>
                <p style={{ marginTop: '4px' }}>{localizedExplanation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default GuessComplexityPlayer;
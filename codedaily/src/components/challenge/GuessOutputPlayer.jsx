import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getDaySeed } from '../../services/challengeService';
import { getProgressEntry, updateProgressEntry, markTodayCompleted } from '../../services/progressService';
import challenges from '../../data/challenges/guess_output.json';

const MAX_ATTEMPTS = 3;

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

function getDailyGuessChallenge(date, difficulty) {
  const pool = challenges.filter(c => c.difficulty === difficulty);
  if (pool.length === 0) return null;
  const seed = getDaySeed(date);
  const index = hashStringToNumber(`${seed}-${difficulty}-go`) % pool.length;
  return pool[index];
}

/**
 * Normaliza una respuesta para comparación flexible:
 * - Elimina espacios dentro de listas/tuplas: [4, 16] → [4,16]
 * - Normaliza booleanos: true/false → True/False
 * - Trim de espacios exteriores
 */
function normalize(value) {
  return value
    .trim()
    .replace(/,\s+/g, ',')        // [4, 16] → [4,16]
    .replace(/\[\s+/g, '[')       // [ 4 → [4
    .replace(/\s+\]/g, ']')       // 4 ] → 4]
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/^true$/i, 'True')   // true → True
    .replace(/^false$/i, 'False') // false → False
    .replace(/^none$/i, 'None');  // none → None
}

function GuessOutputPlayer({ selectedDate, allowDateSelection = false, onDateChange = null, minSelectableDate = null }) {
  const { language } = useLanguage();
  const [difficulty, setDifficulty] = useState('novato');
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [locked, setLocked] = useState(false); // agotó intentos sin acertar

  const challengeDate = useMemo(() => parseYMDToUTCDate(selectedDate), [selectedDate]);
  const challenge = useMemo(() => getDailyGuessChallenge(challengeDate, difficulty), [challengeDate, difficulty]);

  const attemptsLeft = MAX_ATTEMPTS - attemptCount;
  const isOver = completed || locked;

  const text = useMemo(() => ({
    es: {
      title: '¿Qué devuelve?',
      subtitle: 'Lee el código y predice el valor de retorno para la entrada dada.',
      difficultyLabel: 'Dificultad',
      difficultyNovato: 'Novato',
      difficultyIntermedio: 'Intermedio',
      difficultyPro: 'Pro',
      inputLabel: 'Entrada',
      outputLabel: 'Tu respuesta',
      placeholder: 'Escribe el valor de retorno...',
      submitButton: 'Comprobar',
      correctTitle: '¡Correcto!',
      wrongTitle: 'Incorrecto',
      lockedTitle: 'Sin más intentos',
      lockedText: 'Has agotado los 3 intentos.',
      explanation: 'Explicación',
      expectedLabel: 'Respuesta correcta',
      attempts: 'Intentos',
      attemptsLeft: 'Intentos restantes',
      completedBadge: 'Completado',
      dateLabel: 'Fecha',
      tryAgain: 'Intentar de nuevo',
      hint: 'Python imprime True/False (mayúscula), listas con corchetes y comas sin espacios.',
    },
    en: {
      title: 'What does it return?',
      subtitle: 'Read the code and predict the return value for the given input.',
      difficultyLabel: 'Difficulty',
      difficultyNovato: 'Beginner',
      difficultyIntermedio: 'Intermediate',
      difficultyPro: 'Pro',
      inputLabel: 'Input',
      outputLabel: 'Your answer',
      placeholder: 'Write the return value...',
      submitButton: 'Check',
      correctTitle: 'Correct!',
      wrongTitle: 'Incorrect',
      lockedTitle: 'No more attempts',
      lockedText: 'You have used all 3 attempts.',
      explanation: 'Explanation',
      expectedLabel: 'Correct answer',
      attempts: 'Attempts',
      attemptsLeft: 'Attempts left',
      completedBadge: 'Completed',
      dateLabel: 'Date',
      tryAgain: 'Try again',
      hint: 'Python prints True/False (capitalized), lists with brackets and no spaces after commas.',
    },
  }[language]), [language]);

  // Cargar progreso al cambiar reto
  useEffect(() => {
    if (!challenge) return;
    const progress = getProgressEntry({
      date: challengeDate,
      challengeId: `go_${challenge.id}_${difficulty}`,
      mode: 'normal',
    });
    const attempts = progress.attempts || 0;
    setAttemptCount(attempts);
    setCompleted(progress.completed || false);
    setLocked(progress.locked || false);
    setSubmitted(progress.completed || progress.locked || false);
    setCorrect(progress.completed || false);
    setAnswer('');
  }, [challenge?.id, difficulty, challengeDate]);

  // Guardar progreso
  useEffect(() => {
    if (!challenge) return;
    updateProgressEntry({
      date: challengeDate,
      challengeId: `go_${challenge.id}_${difficulty}`,
      mode: 'normal',
      update: { attempts: attemptCount, completed, locked },
    });
  }, [attemptCount, completed, locked, challenge, difficulty, challengeDate]);

  function handleSubmit() {
    if (!challenge || isOver) return;
    const isCorrect = normalize(answer) === normalize(challenge.expected);
    const newAttempts = attemptCount + 1;
    setAttemptCount(newAttempts);
    setSubmitted(true);
    setCorrect(isCorrect);

    if (isCorrect) {
      setCompleted(true);
      markTodayCompleted({
        date: challengeDate,
        challengeId: `go_${challenge.id}_${difficulty}`,
        mode: 'normal',
      });
    } else if (newAttempts >= MAX_ATTEMPTS) {
      setLocked(true);
    }
  }

  function handleTryAgain() {
    setSubmitted(false);
    setAnswer('');
  }

  if (!challenge) return null;

  const localizedExplanation = challenge.explanation?.[language] || challenge.explanation?.es || '';

  return (
    <section className="page-section">
      <div className="content-card">
        <div className="page-top-row">
          <div>
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>
          <div className="filters-stack">
            {allowDateSelection && (
              <div className="filter-box">
                <label htmlFor="go-date-select">{text.dateLabel}</label>
                <input
                  id="go-date-select"
                  type="date"
                  value={selectedDate}
                  min={minSelectableDate || undefined}
                  max={getDaySeed(new Date())}
                  onChange={(e) => onDateChange?.(e.target.value)}
                />
              </div>
            )}
            <div className="filter-box">
              <label htmlFor="go-difficulty">{text.difficultyLabel}</label>
              <select
                id="go-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="novato">{text.difficultyNovato}</option>
                <option value="intermedio">{text.difficultyIntermedio}</option>
                <option value="pro">{text.difficultyPro}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Badge row */}
        <div className="badge-row" style={{ marginBottom: '20px' }}>
          <span className="difficulty-pill">{difficulty}</span>
          {completed && <span className="completed-pill">{text.completedBadge}</span>}
          <span className="difficulty-pill">{text.attemptsLeft}: {Math.max(0, attemptsLeft)}</span>
        </div>

        {/* Código */}
        <div className="challenge-card">
          <div className="challenge-section" style={{ marginTop: 0 }}>
            <h3>{text.inputLabel}</h3>
            <pre className="code-block">
              <code>{`solve(${challenge.input.map(v => JSON.stringify(v)).join(', ')})`}</code>
            </pre>
          </div>

          <div className="challenge-section">
            <h3>Code</h3>
            <pre className="code-block">
              <code>{challenge.code}</code>
            </pre>
          </div>

          <p className="muted-text" style={{ marginTop: '12px', fontSize: '0.82rem' }}>{text.hint}</p>
        </div>

        {/* Input de respuesta */}
        <div className="editor-card">
          <div className="challenge-section" style={{ marginTop: 0 }}>
            <h3>{text.outputLabel}</h3>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !submitted && !isOver) handleSubmit();
              }}
              placeholder={text.placeholder}
              disabled={isOver}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg)',
                color: 'var(--cyan)',
                border: '1px solid var(--border-strong)',
                fontFamily: 'var(--mono)',
                fontSize: '1rem',
                marginTop: '8px',
              }}
            />
          </div>

          <div className="editor-actions">
            {!submitted && !isOver && (
              <button
                className="primary-button"
                onClick={handleSubmit}
                disabled={!answer.trim()}
              >
                {text.submitButton}
              </button>
            )}
            {submitted && !correct && !locked && (
              <button className="secondary-button" onClick={handleTryAgain}>
                {text.tryAgain}
              </button>
            )}
          </div>

          {/* Resultado tras cada intento fallido (sin mostrar solución) */}
          {submitted && !correct && !locked && (
            <div className="feedback-box error-box" style={{ marginTop: '20px' }}>
              <h4>{text.wrongTitle}</h4>
              <p>{text.attemptsLeft}: {attemptsLeft}</p>
            </div>
          )}

          {/* Bloqueado — agotó intentos, ahora sí se muestra la solución */}
          {locked && (
            <div className="feedback-box error-box" style={{ marginTop: '20px' }}>
              <h4>{text.lockedTitle}</h4>
              <p>{text.lockedText}</p>
              <p style={{ marginTop: '8px' }}>
                {text.expectedLabel}:{' '}
                <code style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>
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

export default GuessOutputPlayer;
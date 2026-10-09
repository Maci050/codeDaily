import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Window from '../ui/Window';
import PixelIcon from '../ui/PixelIcon';
import RichText from '../ui/RichText';
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

  const difficultyLabel = { novato: text.difficultyNovato, intermedio: text.difficultyIntermedio, pro: text.difficultyPro }[difficulty];

  return (
    <section className="page-section">
      <div className="page-head">
        <div className="page-head-text">
          <h2 className="page-title">{text.title}</h2>
          <p className="lede">{text.subtitle}</p>
        </div>
        <div className="toolbar">
          <div className="field">
            <label htmlFor="gc-difficulty">{text.difficultyLabel}</label>
            <select id="gc-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="novato">{text.difficultyNovato}</option>
              <option value="intermedio">{text.difficultyIntermedio}</option>
              <option value="pro">{text.difficultyPro}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="workspace">
        <Window
          title={text.codeLabel}
          icon="clock"
          status={
            <>
              <span>{difficultyLabel}</span>
              <span>{text.attemptsLeft}: {Math.max(0, attemptsLeft)}</span>
            </>
          }
        >
          <div className="brief-body">
            <div className="badge-row">
              <span className="pill">{difficultyLabel}</span>
              {completed && (
                <span className="pill inverse">
                  <PixelIcon name="check" size={14} />
                  {text.completedBadge}
                </span>
              )}
            </div>
            <pre className="code-block">
              <code>{challenge.code}</code>
            </pre>
          </div>
        </Window>

        <Window title={text.chooseLabel} icon="doc" style={{ '--zoom-delay': '0.1s' }}>
          <div className="editor-body">
            <div className="options-grid" role="group" aria-label={text.chooseLabel}>
              {challenge.options.map((option) => {
                const isWrong = wrongOptions.includes(option);
                const isSelected = selected === option;
                const isCorrectOption = showResult && option === challenge.expected;
                const stateClass = isWrong ? 'is-wrong' : isCorrectOption ? 'is-correct' : '';

                return (
                  <button
                    key={option}
                    className={`option-button ${stateClass}`}
                    onClick={() => {
                      if (isOver || isWrong || submitted) return;
                      setSelected(option);
                    }}
                    disabled={isOver || isWrong}
                    aria-pressed={isSelected}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="button-row">
              {!submitted && !isOver && (
                <button className="primary-button" onClick={handleSubmit} disabled={!selected}>
                  {text.checkButton}
                </button>
              )}
              {submitted && !correct && !locked && (
                <button className="secondary-button" onClick={handleTryAgain}>
                  {text.tryAgain}
                </button>
              )}
            </div>

            <div aria-live="polite" className="result-stack">
              {submitted && !correct && !locked && (
                <div className="feedback-box error-box">
                  <PixelIcon name="cross" size={32} />
                  <h4>{text.wrongTitle}</h4>
                  <p>{text.attemptsLeft}: {attemptsLeft}</p>
                </div>
              )}

              {locked && !correct && (
                <div className="feedback-box error-box">
                  <PixelIcon name="alert" size={32} />
                  <h4>{text.lockedTitle}</h4>
                  <p>{text.lockedText}</p>
                  <p>
                    {text.expectedLabel}: <code>{challenge.expected}</code>
                  </p>
                  <p><strong>{text.explanation}:</strong> <RichText text={localizedExplanation} /></p>
                </div>
              )}

              {correct && (
                <div className="feedback-box success-box">
                  <PixelIcon name="check" size={32} />
                  <h4>{text.correctTitle}</h4>
                  <p><strong>{text.explanation}:</strong> <RichText text={localizedExplanation} /></p>
                </div>
              )}
            </div>
          </div>
        </Window>
      </div>
    </section>
  );
}

export default GuessComplexityPlayer;

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Window from '../ui/Window';
import PixelIcon from '../ui/PixelIcon';
import RichText from '../ui/RichText';
import { getDaySeed } from '../../services/challengeService';
import { getProgressEntry, updateProgressEntry, markTodayCompleted } from '../../services/progressService';
import { ensurePyodideLoaded, runPythonChallengeTests } from '../../services/pythonRunnerService';
import challenges from '../../data/challenges/find_bug.json';

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

function getDailyFindBugChallenge(date, difficulty) {
  const pool = challenges.filter(c => c.difficulty === difficulty);
  if (pool.length === 0) return null;
  const seed = getDaySeed(date);
  const index = hashStringToNumber(`${seed}-${difficulty}-fb`) % pool.length;
  return pool[index];
}

function FindBugPlayer({ selectedDate, allowDateSelection = false, onDateChange = null, minSelectableDate = null }) {
  const { language } = useLanguage();
  const [difficulty, setDifficulty] = useState('novato');
  const [code, setCode] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);
  const [result, setResult] = useState(null); // { success, errorMessage }
  const [revealedHints, setRevealedHints] = useState(0);

  const challengeDate = useMemo(() => parseYMDToUTCDate(selectedDate), [selectedDate]);
  const challenge = useMemo(() => getDailyFindBugChallenge(challengeDate, difficulty), [challengeDate, difficulty]);

  const attemptsLeft = MAX_ATTEMPTS - attemptCount;
  const isOver = completed || locked;

  const text = useMemo(() => ({
    es: {
      title: 'Encuentra el bug',
      subtitle: 'El código tiene un error. Corrígelo para que pase todos los tests.',
      difficultyLabel: 'Dificultad',
      difficultyNovato: 'Novato',
      difficultyIntermedio: 'Intermedio',
      difficultyPro: 'Pro',
      buggyCodeLabel: 'Código con el bug',
      yourFixLabel: 'Tu corrección',
      checkButton: 'Comprobar',
      checkingButton: 'Comprobando...',
      resetButton: 'Restablecer código',
      correctTitle: '¡Bug corregido!',
      correctText: 'Todos los tests pasan con tu corrección.',
      wrongTitle: 'Todavía no',
      lockedTitle: 'Sin más intentos',
      lockedText: 'Has agotado los 3 intentos.',
      solutionLabel: 'Código corregido',
      attemptsLeft: 'Intentos restantes',
      completedBadge: 'Completado',
      hintsLabel: 'Pistas',
      noHints: 'Falla un intento para desbloquear pistas.',
      pyodideLoading: 'Cargando entorno Python...',
      pyodideReady: 'Python listo',
      testsLabel: 'Tests',
      testPassed: 'OK',
      testFailed: 'Fallo',
      dateLabel: 'Fecha',
      runtimeError: 'Error de Python',
      timeout: 'Tu código tardó demasiado y se detuvo. ¿Hay un bucle infinito?',
      noResultYet: 'Todavía no has comprobado tu corrección.',
    },
    en: {
      title: 'Find the bug',
      subtitle: 'The code has an error. Fix it so all tests pass.',
      difficultyLabel: 'Difficulty',
      difficultyNovato: 'Beginner',
      difficultyIntermedio: 'Intermediate',
      difficultyPro: 'Pro',
      buggyCodeLabel: 'Buggy code',
      yourFixLabel: 'Your fix',
      checkButton: 'Check',
      checkingButton: 'Checking...',
      resetButton: 'Reset code',
      correctTitle: 'Bug fixed!',
      correctText: 'All tests pass with your fix.',
      wrongTitle: 'Not yet',
      lockedTitle: 'No more attempts',
      lockedText: 'You have used all 3 attempts.',
      solutionLabel: 'Fixed code',
      attemptsLeft: 'Attempts left',
      completedBadge: 'Completed',
      hintsLabel: 'Hints',
      noHints: 'Fail an attempt to unlock hints.',
      pyodideLoading: 'Loading Python runtime...',
      pyodideReady: 'Python ready',
      testsLabel: 'Tests',
      testPassed: 'OK',
      testFailed: 'Failed',
      dateLabel: 'Date',
      runtimeError: 'Python error',
      timeout: 'Your code took too long and was stopped. Is there an infinite loop?',
      noResultYet: 'You have not checked your fix yet.',
    },
  }[language]), [language]);

  // Cargar Pyodide
  useEffect(() => {
    ensurePyodideLoaded()
      .then(() => setIsPyodideLoading(false))
      .catch(() => setIsPyodideLoading(false));
  }, []);

  // Cargar progreso al cambiar reto
  useEffect(() => {
    if (!challenge) return;
    const progress = getProgressEntry({
      date: challengeDate,
      challengeId: `fb_${challenge.id}_${difficulty}`,
      mode: 'normal',
    });
    setAttemptCount(progress.attempts || 0);
    setCompleted(progress.completed || false);
    setLocked(progress.locked || false);
    setRevealedHints(progress.revealedHints || 0);
    setCode(progress.code || challenge.starterCode);
    setResult(null);
  }, [challenge?.id, difficulty, challengeDate]);

  // Guardar progreso
  useEffect(() => {
    if (!challenge) return;
    updateProgressEntry({
      date: challengeDate,
      challengeId: `fb_${challenge.id}_${difficulty}`,
      mode: 'normal',
      update: { attempts: attemptCount, completed, locked, code, revealedHints },
    });
  }, [attemptCount, completed, locked, code, revealedHints, challenge, difficulty, challengeDate]);

  async function handleCheck() {
    if (!challenge || isOver || isChecking || isPyodideLoading) return;
    setIsChecking(true);

    const pyResult = await runPythonChallengeTests(challenge, code);
    const newAttempts = attemptCount + 1;
    setAttemptCount(newAttempts);

    if (pyResult.success) {
      setCompleted(true);
      setResult({ success: true, testResults: pyResult.testResults });
      markTodayCompleted({
        date: challengeDate,
        challengeId: `fb_${challenge.id}_${difficulty}`,
        mode: 'normal',
      });
    } else {
      const newHints = Math.min(revealedHints + 1, (challenge.hints?.[language] || challenge.hints?.es || []).length);
      setRevealedHints(newHints);
      if (newAttempts >= MAX_ATTEMPTS) setLocked(true);
      setResult({
        success: false,
        testResults: pyResult.testResults,
        pythonError: pyResult.errorCodes?.includes('PYTHON_TIMEOUT') ? text.timeout : pyResult.pythonError,
      });
    }

    setIsChecking(false);
  }

  function handleReset() {
    if (!challenge || isOver) return;
    setCode(challenge.starterCode);
    setResult(null);
  }

  if (!challenge) return null;

  const hints = challenge.hints?.[language] || challenge.hints?.es || [];
  const localizedDescription = challenge.description?.[language] || challenge.description?.es || '';

  const difficultyLabel = { novato: text.difficultyNovato, intermedio: text.difficultyIntermedio, pro: text.difficultyPro }[difficulty];

  return (
    <section className="page-section">
      <div className="page-head">
        <div className="page-head-text">
          <h2 className="page-title">{text.title}</h2>
          <p className="lede">{text.subtitle}</p>
        </div>
        <div className="toolbar">
          {allowDateSelection && (
            <div className="field">
              <label htmlFor="fb-date-select">{text.dateLabel}</label>
              <input
                id="fb-date-select"
                type="date"
                value={selectedDate}
                min={minSelectableDate || undefined}
                max={getDaySeed(new Date())}
                onChange={(e) => onDateChange?.(e.target.value)}
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="fb-difficulty">{text.difficultyLabel}</label>
            <select id="fb-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="novato">{text.difficultyNovato}</option>
              <option value="intermedio">{text.difficultyIntermedio}</option>
              <option value="pro">{text.difficultyPro}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="workspace">
        <Window
          title={text.buggyCodeLabel}
          icon="bug"
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
            <p className="challenge-description"><RichText text={localizedDescription} /></p>
            <pre className="code-block">
              <code>{challenge.buggyCode}</code>
            </pre>
          </div>
        </Window>

        <Window
          className={`editor-window ${isChecking ? 'is-busy' : ''}`}
          title={text.yourFixLabel}
          icon="doc"
          style={{ '--zoom-delay': '0.1s' }}
          status={
            <>
              <span className={isPyodideLoading || isChecking ? 'busy-dots' : undefined}>
                {isChecking
                  ? text.checkingButton.replace(/\.+$/, '')
                  : isPyodideLoading
                  ? text.pyodideLoading.replace(/\.+$/, '')
                  : text.pyodideReady}
              </span>
              <span>{text.attemptsLeft}: {Math.max(0, attemptsLeft)}</span>
            </>
          }
        >
          <div className="editor-body">
            <label className="sr-only" htmlFor="fb-editor">{text.yourFixLabel}</label>
            <textarea
              id="fb-editor"
              className="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const start = e.target.selectionStart;
                  const end = e.target.selectionEnd;
                  const newCode = code.substring(0, start) + '    ' + code.substring(end);
                  setCode(newCode);
                  setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 4; }, 0);
                }
              }}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              disabled={isOver || isChecking || isPyodideLoading}
            />

            <div className="button-row">
              <button
                className="primary-button"
                onClick={handleCheck}
                disabled={isOver || isChecking || isPyodideLoading}
              >
                {isChecking ? text.checkingButton : text.checkButton}
              </button>
              {!isOver && (
                <button className="secondary-button" onClick={handleReset} disabled={isChecking}>
                  {text.resetButton}
                </button>
              )}
            </div>
          </div>
        </Window>
      </div>

      <div className="results-grid">
        <Window title={text.testsLabel} icon="check" style={{ '--zoom-delay': '0.16s' }}>
          <div className="result-stack" aria-live="polite">
            {completed && (
              <div className="feedback-box success-box">
                <PixelIcon name="check" size={32} />
                <h4>{text.correctTitle}</h4>
                <p>{text.correctText}</p>
              </div>
            )}

            {locked && !completed && (
              <div className="feedback-box error-box">
                <PixelIcon name="alert" size={32} />
                <h4>{text.lockedTitle}</h4>
                <p>{text.lockedText}</p>
                {challenge.solution && (
                  <div>
                    <p className="tutorial-label">{text.solutionLabel}</p>
                    <pre className="code-block">
                      <code>{challenge.solution}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}

            {result?.pythonError && (
              <div className="result-subsection">
                <h4>{text.runtimeError}</h4>
                <pre className="code-block"><code>{result.pythonError}</code></pre>
              </div>
            )}

            {result?.testResults?.length > 0 && (
              <div className="tests-list">
                {result.testResults.map((t, row) => (
                  <div
                    key={`${attemptCount}-${t.index}`}
                    className={`test-item ${t.passed ? 'passed' : 'failed'}`}
                    style={{ '--row': row }}
                  >
                    <span className="test-mark">
                      <PixelIcon name={t.passed ? 'check' : 'cross'} size={18} />
                    </span>
                    <span className="test-name">Test {t.index + 1}: {t.passed ? text.testPassed : text.testFailed}</span>
                    <code>input: {JSON.stringify(t.input)} | expected: {JSON.stringify(t.expected)}{t.actual !== undefined ? ` | actual: ${JSON.stringify(t.actual)}` : ''}</code>
                  </div>
                ))}
              </div>
            )}

            {!result && !isOver && (
              <div className="empty-note">
                <PixelIcon name="doc" size={28} />
                <span>{text.noResultYet}</span>
              </div>
            )}
          </div>
        </Window>

        <Window title={text.hintsLabel} icon="bulb" style={{ '--zoom-delay': '0.2s' }}>
          {revealedHints === 0 ? (
            <div className="empty-note">
              <PixelIcon name="bulb" size={28} />
              <span>{text.noHints}</span>
            </div>
          ) : (
            <ol className="hint-list">
              {hints.slice(0, revealedHints).map((hint, i) => (
                <li key={i}>
                  <span className="hint-num">{i + 1}</span>
                  <span><RichText text={hint} /></span>
                </li>
              ))}
            </ol>
          )}
        </Window>
      </div>
    </section>
  );
}

export default FindBugPlayer;

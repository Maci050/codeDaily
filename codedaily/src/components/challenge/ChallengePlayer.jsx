import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  getChallengeStats,
  getChallengeText,
  getDailyChallenge,
  getDaySeed,
} from '../../services/challengeService';
import { validateChallengeSolution } from '../../services/solutionValidationService';
import {
  getProgressEntry,
  updateProgressEntry,
  markTodayCompleted,
} from '../../services/progressService';
import { ensurePyodideLoaded } from '../../services/pythonRunnerService';

function parseYMDToUTCDate(ymd) {
  const [year, month, day] = ymd.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function ChallengePlayer({
  pageTitle,
  pageSubtitle,
  selectedDate,
  onDateChange = null,
  allowDateSelection = false,
  allowHackerMode = true,
  minSelectableDate = null,
}) {
  const { language } = useLanguage();

  const [difficulty, setDifficulty] = useState('all');
  const [playMode, setPlayMode] = useState('normal');
  const [code, setCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [revealedHints, setRevealedHints] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isPythonLoading, setIsPythonLoading] = useState(true);
  const [pythonLoadError, setPythonLoadError] = useState(null);

  const effectivePlayMode = allowHackerMode ? playMode : 'normal';
  const isHackerMode = effectivePlayMode === 'hacker';
  const effectiveDifficulty = isHackerMode ? 'pro' : difficulty;
  const maxHackerAttempts = 3;
  const challengeDate = useMemo(() => parseYMDToUTCDate(selectedDate), [selectedDate]);

  const text = useMemo(() => {
    return {
      es: {
        modeLabel: 'Modo',
        modeNormal: 'Normal',
        modeHacker: 'Hacker',
        hackerDescription:
          'El modo Hacker usa retos Pro, no muestra pistas y solo permite 3 intentos al día.',
        dateLabel: 'Fecha',
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
        hintsPreview: 'Pistas totales',
        visibleHints: 'Pistas desbloqueadas',
        testsCount: 'Número de tests',
        emptyTitle: 'No hay retos disponibles',
        emptyText: 'No existe ningún reto para esa selección.',
        statsTitle: 'Banco actual de retos',
        total: 'Total',
        starterCode: 'Código base',
        editorTitle: 'Tu solución',
        editorPlaceholder: 'Escribe aquí tu solución en Python...',
        checkButton: 'Comprobar solución',
        checkingButton: 'Comprobando...',
        resetButton: 'Restablecer código',
        attempts: 'Intentos',
        attemptsLeft: 'Intentos restantes',
        resultTitle: 'Resultado',
        passedTitle: '¡Reto superado!',
        passedText: 'Tu solución ha pasado las comprobaciones con Python real.',
        failedTitle: 'La solución todavía no es válida',
        testsSection: 'Tests',
        errorsSection: 'Detalles',
        hintsSection: 'Pistas',
        noHintsYet: 'Todavía no has desbloqueado pistas.',
        noHintsInHacker: 'El modo Hacker no ofrece pistas.',
        prototypeNote:
          'La validación ejecuta Python real en el navegador con Pyodide.',
        difficultyNovatoShort: 'Novato',
        difficultyIntermedioShort: 'Intermedio',
        difficultyProShort: 'Pro',
        testPassed: 'OK',
        testFailed: 'Fallo',
        completedBadge: 'Completado',
        testsPassedText: 'tests superados',
        waitingResult: 'Todavía no has comprobado tu solución.',
        pythonLoading: 'Cargando entorno Python...',
        pythonReady: 'Python listo',
        pythonLoadError: 'No se pudo cargar el entorno Python.',
        runtimeTitle: 'Error de Python',
        hackerBadge: 'Modo Hacker',
        hackerLockedTitle: 'Reto bloqueado',
        hackerLockedText:
          'Has agotado los 3 intentos disponibles del modo Hacker para esta fecha.',
      },
      en: {
        modeLabel: 'Mode',
        modeNormal: 'Normal',
        modeHacker: 'Hacker',
        hackerDescription:
          'Hacker mode uses Pro challenges, shows no hints, and only allows 3 attempts per day.',
        dateLabel: 'Date',
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
        hintsPreview: 'Total hints',
        visibleHints: 'Unlocked hints',
        testsCount: 'Number of tests',
        emptyTitle: 'No challenges available',
        emptyText: 'There is no challenge for that selection.',
        statsTitle: 'Current challenge pool',
        total: 'Total',
        starterCode: 'Starter code',
        editorTitle: 'Your solution',
        editorPlaceholder: 'Write your Python solution here...',
        checkButton: 'Check solution',
        checkingButton: 'Checking...',
        resetButton: 'Reset code',
        attempts: 'Attempts',
        attemptsLeft: 'Attempts left',
        resultTitle: 'Result',
        passedTitle: 'Challenge solved!',
        passedText: 'Your solution passed the checks with real Python execution.',
        failedTitle: 'The solution is not valid yet',
        testsSection: 'Tests',
        errorsSection: 'Details',
        hintsSection: 'Hints',
        noHintsYet: 'You have not unlocked hints yet.',
        noHintsInHacker: 'Hacker mode does not provide hints.',
        prototypeNote:
          'Validation runs real Python in the browser with Pyodide.',
        difficultyNovatoShort: 'Beginner',
        difficultyIntermedioShort: 'Intermediate',
        difficultyProShort: 'Pro',
        testPassed: 'OK',
        testFailed: 'Failed',
        completedBadge: 'Completed',
        testsPassedText: 'tests passed',
        waitingResult: 'You have not checked your solution yet.',
        pythonLoading: 'Loading Python runtime...',
        pythonReady: 'Python ready',
        pythonLoadError: 'Could not load the Python runtime.',
        runtimeTitle: 'Python error',
        hackerBadge: 'Hacker mode',
        hackerLockedTitle: 'Challenge locked',
        hackerLockedText:
          'You used all 3 available attempts for this Hacker challenge date.',
      },
    }[language];
  }, [language]);

  const errorMessages = useMemo(() => {
    return {
      es: {
        EMPTY_CODE: 'El código está vacío.',
        MISSING_FUNCTION_DEFINITION:
          'No se ha encontrado una definición de función válida con `def ...:`.',
        WRONG_FUNCTION_NAME: 'La función debe llamarse `solve`.',
        PASS_LEFT_IN_CODE: 'Todavía tienes `pass` en el código.',
        MISSING_RETURN: 'La solución debe usar `return`.',
        TESTS_FAILED: 'Los tests no se han superado correctamente.',
        FUNCTION_NOT_CALLABLE: 'No se ha podido encontrar una función ejecutable llamada `solve`.',
        PYTHON_SYNTAX_ERROR: 'Python ha detectado un error de sintaxis en tu código.',
        PYTHON_RUNTIME_ERROR: 'Tu código lanzó un error al ejecutarse.',
        PYODIDE_LOAD_ERROR: 'No se pudo inicializar Pyodide para ejecutar Python.',
      },
      en: {
        EMPTY_CODE: 'The code is empty.',
        MISSING_FUNCTION_DEFINITION:
          'No valid function definition using `def ...:` was found.',
        WRONG_FUNCTION_NAME: 'The function must be named `solve`.',
        PASS_LEFT_IN_CODE: 'You still have `pass` in the code.',
        MISSING_RETURN: 'The solution must use `return`.',
        TESTS_FAILED: 'The tests were not passed correctly.',
        FUNCTION_NOT_CALLABLE: 'No callable function named `solve` was found.',
        PYTHON_SYNTAX_ERROR: 'Python found a syntax error in your code.',
        PYTHON_RUNTIME_ERROR: 'Your code raised an error while running.',
        PYODIDE_LOAD_ERROR: 'Pyodide could not be initialized to run Python.',
      },
    }[language];
  }, [language]);

  const stats = useMemo(() => getChallengeStats('python'), []);
  const baseChallenge = useMemo(() => {
    return getDailyChallenge({
      date: challengeDate,
      language: 'python',
      difficulty: effectiveDifficulty,
    });
  }, [challengeDate, effectiveDifficulty]);

  const dailyChallenge = useMemo(() => {
    return getChallengeText(baseChallenge, language);
  }, [baseChallenge, language]);

  useEffect(() => {
    let isMounted = true;

    async function loadPython() {
      setIsPythonLoading(true);
      setPythonLoadError(null);

      try {
        await ensurePyodideLoaded();

        if (isMounted) {
          setIsPythonLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setIsPythonLoading(false);
          setPythonLoadError(error?.message || 'Pyodide failed to load');
        }
      }
    }

    loadPython();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!baseChallenge) {
      setCode('');
      setValidationResult(null);
      setAttemptCount(0);
      setRevealedHints(0);
      setCompleted(false);
      setLocked(false);
      return;
    }

    const progress = getProgressEntry({
      date: challengeDate,
      challengeId: baseChallenge.id,
      mode: effectivePlayMode,
    });

    setCode(progress.code || baseChallenge.starterCode);
    setValidationResult(null);
    setAttemptCount(progress.attempts || 0);
    setRevealedHints(progress.revealedHints || 0);
    setCompleted(progress.completed || false);
    setLocked(progress.locked || false);
  }, [baseChallenge?.id, effectivePlayMode, challengeDate]);

  useEffect(() => {
    if (!baseChallenge) {
      return;
    }

    updateProgressEntry({
      date: challengeDate,
      challengeId: baseChallenge.id,
      mode: effectivePlayMode,
      update: {
        code,
        attempts: attemptCount,
        revealedHints,
        completed,
        locked,
      },
    });
  }, [
    code,
    attemptCount,
    revealedHints,
    completed,
    locked,
    baseChallenge,
    effectivePlayMode,
    challengeDate,
  ]);

  const difficulties = [
    { value: 'all', label: text.difficultyAll },
    { value: 'novato', label: text.difficultyNovato },
    { value: 'intermedio', label: text.difficultyIntermedio },
    { value: 'pro', label: text.difficultyPro },
  ];

  const difficultyLabelMap = {
    novato: text.difficultyNovatoShort,
    intermedio: text.difficultyIntermedioShort,
    pro: text.difficultyProShort,
  };

  const translatedErrors = (validationResult?.errorCodes || []).map((codeValue) => {
    if (codeValue.startsWith('MISSING_REQUIRED_TOKEN:')) {
      const token = codeValue.split(':')[1];
      return language === 'es'
        ? `Falta el token requerido \`${token}\`.`
        : `The required token \`${token}\` is missing.`;
    }

    if (codeValue.startsWith('FORBIDDEN_TOKEN_USED:')) {
      const token = codeValue.split(':')[1];
      return language === 'es'
        ? `Se ha usado un token no permitido: \`${token}\`.`
        : `A forbidden token was used: \`${token}\`.`;
    }

    return errorMessages[codeValue] || codeValue;
  });

  const hackerAttemptsLeft = Math.max(0, maxHackerAttempts - attemptCount);

  const handleValidate = async () => {
    if (!baseChallenge || completed || locked || isChecking || isPythonLoading) {
      return;
    }

    setIsChecking(true);

    const result = await validateChallengeSolution(baseChallenge, code);
    setValidationResult(result);

    const newAttempts = attemptCount + 1;
    setAttemptCount(newAttempts);

    if (!result.success) {
      if (!isHackerMode) {
        setRevealedHints((previous) =>
          Math.min(previous + 1, dailyChallenge.localizedHints.length)
        );
      }

      if (isHackerMode && newAttempts >= maxHackerAttempts) {
        setLocked(true);
      }

      setIsChecking(false);
      return;
    }

    setCompleted(true);
    setLocked(false);
    markTodayCompleted({
      date: challengeDate,
      challengeId: baseChallenge.id,
      mode: effectivePlayMode,
    });
    setIsChecking(false);
  };

  const handleResetCode = () => {
    if (!baseChallenge || completed || isChecking || isHackerMode) {
      return;
    }

    setCode(baseChallenge.starterCode);
    setValidationResult(null);
  };

  return (
    <section className="page-section">
      <div className="content-card">
        <div className="page-top-row">
          <div>
            <h1>{pageTitle}</h1>
            <p>{pageSubtitle}</p>
          </div>

          <div className="filters-stack">
            {allowHackerMode && (
              <div className="mode-switch">
                <span className="mode-switch-label">{text.modeLabel}</span>
                <div className="mode-switch-buttons">
                  <button
                    className={`mode-button ${playMode === 'normal' ? 'active' : ''}`}
                    onClick={() => setPlayMode('normal')}
                  >
                    {text.modeNormal}
                  </button>
                  <button
                    className={`mode-button hacker ${playMode === 'hacker' ? 'active' : ''}`}
                    onClick={() => setPlayMode('hacker')}
                  >
                    {text.modeHacker}
                  </button>
                </div>
              </div>
            )}

            {allowDateSelection && (
              <div className="filter-box">
                <label htmlFor="archive-date-select">{text.dateLabel}</label>
                <input
                  id="archive-date-select"
                  type="date"
                  value={selectedDate}
                  min={minSelectableDate || undefined}
                  max={getDaySeed(new Date())}
                  onChange={(event) => onDateChange?.(event.target.value)}
                />
              </div>
            )}

            {!isHackerMode && (
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
            )}
          </div>
        </div>

        {isHackerMode && (
          <div className="status-box hacker-info-box">
            <h2>{text.hackerBadge}</h2>
            <p>{text.hackerDescription}</p>
          </div>
        )}

        {!dailyChallenge ? (
          <div className="status-box">
            <h2>{text.emptyTitle}</h2>
            <p>{text.emptyText}</p>
          </div>
        ) : (
          <>
            <div className="challenge-card">
              <div className="challenge-card-header">
                <div>
                  <div className="badge-row">
                    <span className="difficulty-pill">
                      {difficultyLabelMap[dailyChallenge.difficulty] || dailyChallenge.difficulty}
                    </span>

                    {isHackerMode && (
                      <span className="hacker-pill">{text.hackerBadge}</span>
                    )}

                    {completed && (
                      <span className="completed-pill">{text.completedBadge}</span>
                    )}

                    <span className="difficulty-pill">
                      {isPythonLoading ? text.pythonLoading : text.pythonReady}
                    </span>
                  </div>

                  <h2>{dailyChallenge.localizedTitle}</h2>
                </div>
              </div>

              <p className="challenge-description">{dailyChallenge.localizedDescription}</p>

              <div className="challenge-meta-grid">
                <div className="meta-item">
                  <span>{text.selectedDate}</span>
                  <strong>{getDaySeed(challengeDate)}</strong>
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
                  <strong>{isHackerMode ? 0 : dailyChallenge.localizedHints.length}</strong>
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
                  {isHackerMode && (
                    <>
                      <li>{language === 'es' ? 'Sin pistas.' : 'No hints.'}</li>
                      <li>
                        {language === 'es'
                          ? 'Máximo 3 intentos para esta fecha.'
                          : 'Maximum 3 attempts for this date.'}
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {!isHackerMode && (
                <div className="challenge-section">
                  <h3>{text.starterCode}</h3>
                  <pre className="code-block">
                    <code>{dailyChallenge.starterCode}</code>
                  </pre>
                </div>
              )}
            </div>

            <div className="editor-card">
              <div className="editor-card-header">
                <div>
                  <h2>{text.editorTitle}</h2>
                  <p>{text.prototypeNote}</p>
                  {pythonLoadError && (
                    <p className="muted-text">
                      {text.pythonLoadError}: {pythonLoadError}
                    </p>
                  )}
                </div>

                <div className="editor-stats">
                  <div className="mini-stat">
                    <span>{text.attempts}</span>
                    <strong>{attemptCount}</strong>
                  </div>

                  {isHackerMode ? (
                    <div className="mini-stat hacker-stat">
                      <span>{text.attemptsLeft}</span>
                      <strong>{hackerAttemptsLeft}</strong>
                    </div>
                  ) : (
                    <div className="mini-stat">
                      <span>{text.visibleHints}</span>
                      <strong>{revealedHints}</strong>
                    </div>
                  )}
                </div>
              </div>

              {locked && !completed && (
                <div className="feedback-box error-box">
                  <h4>{text.hackerLockedTitle}</h4>
                  <p>{text.hackerLockedText}</p>
                </div>
              )}

              <textarea
                className="code-editor"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Tab'){
                    event.preventDefault();

                    const textarea = event.target;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;

                    const tab = '    ';

                    const newValue = code.substring(0, start) + tab + code.substring(end);

                    setCode(newValue);
                    setTimeout(() => {
                      textarea.selectionStart = textarea.selectionEnd = start + tab.length;
                    }, 0);
                  }
                }}
                spellCheck={false}
                placeholder={text.editorPlaceholder}
                disabled={completed || locked || isChecking || isPythonLoading}
              />

              <div className="editor-actions">
                <button
                  className="primary-button"
                  onClick={handleValidate}
                  disabled={completed || locked || isChecking || isPythonLoading}
                >
                  {completed
                    ? text.completedBadge
                    : isChecking
                    ? text.checkingButton
                    : text.checkButton}
                </button>

                {!isHackerMode && (
                  <button
                    className="secondary-button"
                    onClick={handleResetCode}
                    disabled={completed || isChecking}
                  >
                    {text.resetButton}
                  </button>
                )}
              </div>

              <div className="editor-grid">
                <div className="result-panel">
                  <h3>{text.resultTitle}</h3>

                  {!validationResult ? (
                    <p className="muted-text">{text.waitingResult}</p>
                  ) : validationResult.success ? (
                    <div className="feedback-box success-box">
                      <h4>{text.passedTitle}</h4>
                      <p>{text.passedText}</p>
                      <p>
                        {validationResult.passedCount} / {validationResult.totalTests}{' '}
                        {text.testsPassedText}
                      </p>
                    </div>
                  ) : (
                    <div className="feedback-box error-box">
                      <h4>{text.failedTitle}</h4>
                      <p>
                        {validationResult.passedCount} / {validationResult.totalTests}{' '}
                        {text.testsPassedText}
                      </p>
                    </div>
                  )}

                  {validationResult?.pythonError && (
                    <div className="result-subsection">
                      <h4>{text.runtimeTitle}</h4>
                      <pre className="code-block">
                        <code>{validationResult.pythonError}</code>
                      </pre>
                    </div>
                  )}

                  {validationResult && translatedErrors.length > 0 && (
                    <div className="result-subsection">
                      <h4>{text.errorsSection}</h4>
                      <ul className="challenge-list compact-list">
                        {translatedErrors.map((error) => (
                          <li key={error}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResult && validationResult.testResults.length > 0 && (
                    <div className="result-subsection">
                      <h4>{text.testsSection}</h4>
                      <div className="tests-list">
                        {validationResult.testResults.map((test) => (
                          <div
                            key={test.index}
                            className={`test-item ${test.passed ? 'passed' : 'failed'}`}
                          >
                            <span>
                              Test {test.index + 1}: {test.passed ? text.testPassed : text.testFailed}
                            </span>
                            <code>
                              input: {JSON.stringify(test.input)} | expected:{' '}
                              {JSON.stringify(test.expected)}
                              {test.actual !== undefined
                                ? ` | actual: ${JSON.stringify(test.actual)}`
                                : ''}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="result-panel">
                  <h3>{text.hintsSection}</h3>

                  {isHackerMode ? (
                    <p className="muted-text">{text.noHintsInHacker}</p>
                  ) : revealedHints === 0 ? (
                    <p className="muted-text">{text.noHintsYet}</p>
                  ) : (
                    <ul className="challenge-list compact-list">
                      {dailyChallenge.localizedHints
                        .slice(0, revealedHints)
                        .map((hint, index) => (
                          <li key={`${index}-${hint}`}>{hint}</li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </>
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

export default ChallengePlayer;
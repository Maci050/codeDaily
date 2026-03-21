import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  getChallengeStats,
  getChallengeText,
  getDailyChallenge,
  getDaySeed,
} from '../services/challengeService';
import { validateChallengeSolution } from '../services/solutionValidationService';
import {
  getTodayProgress,
  updateTodayProgress,
  markTodayCompleted,
} from '../services/progressService';

function DailyPage() {
  const { language } = useLanguage();
  const [difficulty, setDifficulty] = useState('all');
  const [code, setCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [revealedHints, setRevealedHints] = useState(0);
  const [completed, setCompleted] = useState(false);

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
        resetButton: 'Restablecer código',
        attempts: 'Intentos',
        resultTitle: 'Resultado',
        passedTitle: '¡Reto superado!',
        passedText: 'Tu solución ha pasado todas las comprobaciones de esta V1.',
        failedTitle: 'La solución todavía no es válida',
        testsSection: 'Tests',
        errorsSection: 'Detalles',
        hintsSection: 'Pistas',
        noHintsYet: 'Todavía no has desbloqueado pistas.',
        prototypeNote:
          'Esta V1 valida estructura, restricciones y patrones de solución compatibles.',
        difficultyNovatoShort: 'Novato',
        difficultyIntermedioShort: 'Intermedio',
        difficultyProShort: 'Pro',
        testPassed: 'OK',
        testFailed: 'Fallo',
        completedBadge: 'Completado hoy',
        testsPassedText: 'tests superados',
        waitingResult: 'Todavía no has comprobado tu solución.',
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
        resetButton: 'Reset code',
        attempts: 'Attempts',
        resultTitle: 'Result',
        passedTitle: 'Challenge solved!',
        passedText: 'Your solution passed all checks in this V1.',
        failedTitle: 'The solution is not valid yet',
        testsSection: 'Tests',
        errorsSection: 'Details',
        hintsSection: 'Hints',
        noHintsYet: 'You have not unlocked hints yet.',
        prototypeNote:
          'This V1 validates structure, restrictions, and supported solution patterns.',
        difficultyNovatoShort: 'Beginner',
        difficultyIntermedioShort: 'Intermediate',
        difficultyProShort: 'Pro',
        testPassed: 'OK',
        testFailed: 'Failed',
        completedBadge: 'Completed today',
        testsPassedText: 'tests passed',
        waitingResult: 'You have not checked your solution yet.',
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
        UNSUPPORTED_LOGIC_PATTERN:
          'La estructura general es correcta, pero esta V1 todavía no reconoce esa forma concreta de resolver el reto.',
        TESTS_FAILED: 'Los tests no se han superado correctamente.',
        NO_VALIDATOR_FOR_CHALLENGE:
          'Todavía no existe un validador configurado para este reto.',
      },
      en: {
        EMPTY_CODE: 'The code is empty.',
        MISSING_FUNCTION_DEFINITION:
          'No valid function definition using `def ...:` was found.',
        WRONG_FUNCTION_NAME: 'The function must be named `solve`.',
        PASS_LEFT_IN_CODE: 'You still have `pass` in the code.',
        MISSING_RETURN: 'The solution must use `return`.',
        UNSUPPORTED_LOGIC_PATTERN:
          'The overall structure is correct, but this V1 does not yet recognize that specific solution style.',
        TESTS_FAILED: 'The tests were not passed correctly.',
        NO_VALIDATOR_FOR_CHALLENGE:
          'There is not a configured validator for this challenge yet.',
      },
    }[language];
  }, [language]);

  const stats = useMemo(() => getChallengeStats('python'), []);
  const baseChallenge = useMemo(() => {
    return getDailyChallenge({
      date: new Date(),
      language: 'python',
      difficulty,
    });
  }, [difficulty]);

  const dailyChallenge = useMemo(() => {
    return getChallengeText(baseChallenge, language);
  }, [baseChallenge, language]);

  useEffect(() => {
    if (!baseChallenge) {
      setCode('');
      setValidationResult(null);
      setAttemptCount(0);
      setRevealedHints(0);
      setCompleted(false);
      return;
    }

    const progress = getTodayProgress();
    setCode(progress.code || baseChallenge.starterCode);
    setValidationResult(null);
    setAttemptCount(progress.attempts || 0);
    setRevealedHints(progress.revealedHints || 0);
    setCompleted(progress.completed || false);
  }, [baseChallenge?.id]);

  useEffect(() => {
    if (!baseChallenge) {
      return;
    }

    updateTodayProgress({
      code,
      attempts: attemptCount,
      revealedHints,
      completed,
    });
  }, [code, attemptCount, revealedHints, completed, baseChallenge]);

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

  const handleValidate = () => {
    if (!baseChallenge || completed) {
      return;
    }

    const result = validateChallengeSolution(baseChallenge, code);
    setValidationResult(result);

    const newAttempts = attemptCount + 1;
    setAttemptCount(newAttempts);

    if (!result.success) {
      setRevealedHints((previous) =>
        Math.min(previous + 1, dailyChallenge.localizedHints.length)
      );
      return;
    }

    setCompleted(true);
    markTodayCompleted();
  };

  const handleResetCode = () => {
    if (!baseChallenge || completed) {
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
          <>
            <div className="challenge-card">
              <div className="challenge-card-header">
                <div>
                  <div className="badge-row">
                    <span className="difficulty-pill">
                      {difficultyLabelMap[dailyChallenge.difficulty] || dailyChallenge.difficulty}
                    </span>

                    {completed && (
                      <span className="completed-pill">{text.completedBadge}</span>
                    )}
                  </div>

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
                <h3>{text.starterCode}</h3>
                <pre className="code-block">
                  <code>{dailyChallenge.starterCode}</code>
                </pre>
              </div>
            </div>

            <div className="editor-card">
              <div className="editor-card-header">
                <div>
                  <h2>{text.editorTitle}</h2>
                  <p>{text.prototypeNote}</p>
                </div>

                <div className="editor-stats">
                  <div className="mini-stat">
                    <span>{text.attempts}</span>
                    <strong>{attemptCount}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>{text.visibleHints}</span>
                    <strong>{revealedHints}</strong>
                  </div>
                </div>
              </div>

              <textarea
                className="code-editor"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                spellCheck={false}
                placeholder={text.editorPlaceholder}
                disabled={completed}
              />

              <div className="editor-actions">
                <button
                  className="primary-button"
                  onClick={handleValidate}
                  disabled={completed}
                >
                  {completed ? text.completedBadge : text.checkButton}
                </button>

                <button
                  className="secondary-button"
                  onClick={handleResetCode}
                  disabled={completed}
                >
                  {text.resetButton}
                </button>
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
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="result-panel">
                  <h3>{text.hintsSection}</h3>

                  {revealedHints === 0 ? (
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

export default DailyPage;
import { useCallback, useEffect, useMemo, useState } from 'react';
import Window from '../ui/Window';
import PixelIcon from '../ui/PixelIcon';
import RichText from '../ui/RichText';
import SolutionWalkthrough from './SolutionWalkthrough';
import { handleCodeEditorKeyDown } from './codeEditorKeys';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { ensurePyodideLoaded, runPythonChallengeTests } from '../../services/pythonRunnerService';
import { getProgressEntry, updateProgressEntry, markTodayCompleted } from '../../services/progressService';
import { getWeeklyText, getWeekStart } from '../../services/weeklyService';
import { SITE_ORIGIN, shareText } from '../../services/shareService';

const GRID_SLOTS = 5;

const TEXT = {
  es: {
    kinds: { transform: 'Transformación', restricted: 'Con restricciones', efficiency: 'Eficiencia' },
    weekTitle: (n) => `Semana #${n}`,
    completed: 'Completado',
    givenUp: 'Rendido',
    rules: 'Reglas',
    instructions: 'Instrucciones',
    functionLabel: 'Función esperada',
    testsLabel: 'Número de tests',
    timeLabel: 'Límite de tiempo',
    weekLabel: 'Semana',
    seconds: (s) => `${s} s`,
    editorTitle: 'Tu solución',
    pythonLoading: 'Cargando Python',
    pythonReady: 'Python listo',
    checking: 'Comprobando',
    check: 'Comprobar solución',
    checkingButton: 'Comprobando...',
    loadingButton: 'Cargando Python...',
    reset: 'Restablecer código',
    giveUp: 'Rendirse',
    share: 'Compartir resultado',
    shareShort: 'Compartir',
    copied: '¡Copiado!',
    shared: '¡Compartido!',
    shareFailed: 'No se pudo copiar',
    attempts: 'Intentos',
    hintsUnlocked: 'Pistas desbloqueadas',
    result: 'Resultado',
    waiting: 'Todavía no has comprobado tu solución.',
    passedTitle: '¡Desafío superado!',
    passedText: 'Tu solución pasa todos los tests y cumple las reglas.',
    failedTitle: 'Todavía no',
    rulesBroken: 'Reglas incumplidas',
    rulesBrokenSummary: 'Tu código incumple alguna regla del desafío, así que no se ha ejecutado.',
    testsPassed: (p, t) => `${p} / ${t} tests superados`,
    tests: 'Tests',
    details: 'Detalles',
    pythonError: 'Error de Python',
    testOk: 'OK',
    testFail: 'Fallo',
    hints: 'Pistas',
    noHints: 'Cada intento fallido desbloquea una pista.',
    giveUpPointer: 'Abajo tienes la solución explicada paso a paso.',
    confirmTitle: '¿Seguro que quieres rendirte?',
    confirmText: 'Verás la solución explicada y no podrás volver a intentar el desafío de esta semana.',
    confirmYes: 'Sí, rendirse',
    cancel: 'Cancelar',
    dialogTitle: '¡Desafío superado!',
    close: 'Cerrar',
    attemptsWord: (n) => (n === 1 ? 'intento' : 'intentos'),
    line: (n) => `Línea ${n}: `,
    syntax: {
      for: 'los bucles `for`',
      while: 'los bucles `while`',
      comprehension: 'las comprensiones (`[... for ...]`)',
      lambda: '`lambda`',
      pow_operator: 'el operador `**`',
      slice: 'los cortes `[a:b]`',
      negative_step_slice: 'los cortes con paso negativo como `[::-1]`',
      in_operator: 'el operador `in`',
      import: '`import`',
    },
    violation: {
      FORBIDDEN_CALL: (d) => `usas \`${d}\`, que está prohibido en este desafío.`,
      FORBIDDEN_METHOD: (d) => `usas el método \`.${d}()\`, que está prohibido en este desafío.`,
      FORBIDDEN_NAME: (d) => `\`${d}\` no está permitido en los desafíos con reglas (serviría para saltárselas).`,
      FORBIDDEN_SYNTAX: (d, labels) => `aquí no se permiten ${labels[d] || `\`${d}\``}.`,
      RECURSION_REQUIRED: () => 'tu solución debe ser recursiva, pero ninguna función se llama a sí misma.',
      RECURSION_FORBIDDEN: (d) => `\`${d}\` se llama a sí misma, y en este desafío la recursión está prohibida.`,
      TOO_MANY_LINES: (d) => `tu código tiene ${d.split('/')[0]} líneas y el máximo es ${d.split('/')[1]}.`,
    },
    errors: {
      PYTHON_TIMEOUT: (s) => `Tu código superó el límite de ${s} s y se detuvo. ¿Hay un bucle infinito o un algoritmo demasiado lento?`,
      RECURSION_DEPTH: () => 'La recursión es demasiado profunda: revisa el caso base o reduce el número de llamadas.',
      FUNCTION_NOT_CALLABLE: (fn) => `No se encontró una función llamada \`${fn}\`.`,
      PYTHON_SYNTAX_ERROR: () => 'Python ha detectado un error de sintaxis en tu código.',
      PYTHON_RUNTIME_ERROR: () => 'Tu código lanzó un error al ejecutarse.',
      PYODIDE_LOAD_ERROR: () => 'No se pudo cargar Python. Comprueba tu conexión y vuelve a intentarlo.',
    },
  },
  en: {
    kinds: { transform: 'Transformation', restricted: 'Restricted', efficiency: 'Efficiency' },
    weekTitle: (n) => `Week #${n}`,
    completed: 'Completed',
    givenUp: 'Given up',
    rules: 'Rules',
    instructions: 'Instructions',
    functionLabel: 'Expected function',
    testsLabel: 'Number of tests',
    timeLabel: 'Time limit',
    weekLabel: 'Week',
    seconds: (s) => `${s} s`,
    editorTitle: 'Your solution',
    pythonLoading: 'Loading Python',
    pythonReady: 'Python ready',
    checking: 'Checking',
    check: 'Check solution',
    checkingButton: 'Checking...',
    loadingButton: 'Loading Python...',
    reset: 'Reset code',
    giveUp: 'Give up',
    share: 'Share result',
    shareShort: 'Share',
    copied: 'Copied!',
    shared: 'Shared!',
    shareFailed: "Couldn't copy",
    attempts: 'Attempts',
    hintsUnlocked: 'Unlocked hints',
    result: 'Result',
    waiting: 'You have not checked your solution yet.',
    passedTitle: 'Challenge solved!',
    passedText: 'Your solution passes every test and follows the rules.',
    failedTitle: 'Not yet',
    rulesBroken: 'Broken rules',
    rulesBrokenSummary: 'Your code breaks a rule of the challenge, so it was not run.',
    testsPassed: (p, t) => `${p} / ${t} tests passed`,
    tests: 'Tests',
    details: 'Details',
    pythonError: 'Python error',
    testOk: 'OK',
    testFail: 'Failed',
    hints: 'Hints',
    noHints: 'Each failed attempt unlocks a hint.',
    giveUpPointer: 'The step-by-step solution is shown below.',
    confirmTitle: 'Are you sure you want to give up?',
    confirmText: 'You will see the explained solution and will not be able to retry this week’s challenge.',
    confirmYes: 'Yes, give up',
    cancel: 'Cancel',
    dialogTitle: 'Challenge solved!',
    close: 'Close',
    attemptsWord: (n) => (n === 1 ? 'attempt' : 'attempts'),
    line: (n) => `Line ${n}: `,
    syntax: {
      for: '`for` loops',
      while: '`while` loops',
      comprehension: 'comprehensions (`[... for ...]`)',
      lambda: '`lambda`',
      pow_operator: 'the `**` operator',
      slice: 'slices like `[a:b]`',
      negative_step_slice: 'negative-step slices such as `[::-1]`',
      in_operator: 'the `in` operator',
      import: '`import`',
    },
    violation: {
      FORBIDDEN_CALL: (d) => `you use \`${d}\`, which is not allowed in this challenge.`,
      FORBIDDEN_METHOD: (d) => `you use the \`.${d}()\` method, which is not allowed in this challenge.`,
      FORBIDDEN_NAME: (d) => `\`${d}\` is not allowed in challenges with rules (it could be used to bypass them).`,
      FORBIDDEN_SYNTAX: (d, labels) => `${labels[d] || `\`${d}\``} are not allowed here.`,
      RECURSION_REQUIRED: () => 'your solution must be recursive, but no function calls itself.',
      RECURSION_FORBIDDEN: (d) => `\`${d}\` calls itself, and recursion is not allowed in this challenge.`,
      TOO_MANY_LINES: (d) => `your code has ${d.split('/')[0]} lines and the maximum is ${d.split('/')[1]}.`,
    },
    errors: {
      PYTHON_TIMEOUT: (s) => `Your code went over the ${s} s limit and was stopped. Is there an infinite loop or a too-slow algorithm?`,
      RECURSION_DEPTH: () => 'The recursion is too deep: check the base case or reduce the number of calls.',
      FUNCTION_NOT_CALLABLE: (fn) => `No function called \`${fn}\` was found.`,
      PYTHON_SYNTAX_ERROR: () => 'Python found a syntax error in your code.',
      PYTHON_RUNTIME_ERROR: () => 'Your code raised an error while running.',
      PYODIDE_LOAD_ERROR: () => 'Python could not be loaded. Check your connection and try again.',
    },
  },
};

// Muestra valores de test sin volcar listas de miles de elementos
function preview(value) {
  const json = JSON.stringify(value);
  if (json === undefined) return String(value);
  return json.length > 120 ? `${json.slice(0, 120)} …` : json;
}

function WeeklyPlayer({ challenge: rawChallenge, week, isCurrentWeek, countdownText, language }) {
  const text = TEXT[language] || TEXT.es;
  const challenge = useMemo(() => getWeeklyText(rawChallenge, language), [rawChallenge, language]);
  const weekStartDate = useMemo(() => new Date(`${getWeekStart(week)}T00:00:00Z`), [week]);
  const progressKey = useMemo(
    () => ({ date: weekStartDate, challengeId: `weekly_${rawChallenge.id}`, mode: 'weekly' }),
    [weekStartDate, rawChallenge.id]
  );
  // El componente se monta de nuevo para cada semana: el progreso guardado se lee una vez
  const [saved] = useState(() => getProgressEntry(progressKey));

  const [code, setCode] = useState(saved.code || rawChallenge.starterCode);
  const [attemptCount, setAttemptCount] = useState(saved.attempts || 0);
  const [revealedHints, setRevealedHints] = useState(saved.revealedHints || 0);
  const [completed, setCompleted] = useState(Boolean(saved.completed));
  const [givenUp, setGivenUp] = useState(Boolean(saved.givenUp));
  const [validation, setValidation] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isPythonLoading, setIsPythonLoading] = useState(true);
  const [pythonLoadFailed, setPythonLoadFailed] = useState(false);
  const [showGiveUp, setShowGiveUp] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [shareStatus, setShareStatus] = useState('idle');

  const isOver = completed || givenUp;
  const timeLimitSeconds = Math.round(rawChallenge.timeLimitMs / 1000);

  useEffect(() => {
    let isMounted = true;
    ensurePyodideLoaded()
      .then(() => isMounted && setIsPythonLoading(false))
      .catch(() => {
        if (!isMounted) return;
        setIsPythonLoading(false);
        setPythonLoadFailed(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    updateProgressEntry({
      ...progressKey,
      update: { code, attempts: attemptCount, revealedHints, completed, givenUp, locked: givenUp },
    });
  }, [progressKey, code, attemptCount, revealedHints, completed, givenUp]);

  const closeGiveUp = useCallback(() => setShowGiveUp(false), []);
  const closeResult = useCallback(() => setShowResult(false), []);
  useEscapeKey(showGiveUp, closeGiveUp);
  useEscapeKey(showResult && completed, closeResult);

  async function handleCheck() {
    if (isOver || isChecking || isPythonLoading) return;
    setIsChecking(true);

    let result;
    try {
      result = await runPythonChallengeTests(rawChallenge, code, {
        constraints: rawChallenge.constraints,
        timeoutMs: rawChallenge.timeLimitMs,
      });
    } catch {
      result = { success: false, errorCodes: ['PYODIDE_LOAD_ERROR'], testResults: [], violations: [], passedCount: 0, totalTests: rawChallenge.tests.length };
    }

    setValidation(result);
    setAttemptCount((n) => n + 1);
    setIsChecking(false);
    setPythonLoadFailed(false);

    if (result.success) {
      setCompleted(true);
      markTodayCompleted(progressKey);
      setTimeout(() => setShowResult(true), 700);
    } else {
      setRevealedHints((n) => Math.min(n + 1, challenge.localizedHints.length));
    }
  }

  function handleGiveUp() {
    setRevealedHints(challenge.localizedHints.length);
    setGivenUp(true);
    setShowGiveUp(false);
  }

  const gridSlots = Math.max(GRID_SLOTS, attemptCount);
  const emojiGrid = Array.from({ length: gridSlots }, (_, i) => {
    if (i < attemptCount - 1) return '🟥';
    if (i === attemptCount - 1) return completed ? '🟩' : '🟥';
    return '⬜';
  }).join('');
  const attemptsSummary = `${attemptCount} ${text.attemptsWord(attemptCount)}`;

  async function handleShare() {
    const lines = [
      `CodeDaily ${language === 'es' ? 'Semanal' : 'Weekly'} #${week} 🏆`,
      challenge.localizedTitle,
      '',
      `${emojiGrid} — ${givenUp ? text.givenUp : attemptsSummary}`,
      '',
      `${SITE_ORIGIN}/weekly/${week}`,
    ];
    const status = await shareText(lines.join('\n'));
    if (!status) return;
    setShareStatus(status);
    setTimeout(() => setShareStatus('idle'), 2000);
  }

  const shareLabel = (idle) => (
    shareStatus === 'copied' ? text.copied
      : shareStatus === 'shared' ? text.shared
      : shareStatus === 'failed' ? text.shareFailed
      : idle
  );

  const violations = validation?.violations || [];
  const errorMessages = (validation?.errorCodes || [])
    .filter((code_) => text.errors[code_])
    .map((code_) =>
      code_ === 'PYTHON_TIMEOUT' ? text.errors.PYTHON_TIMEOUT(timeLimitSeconds)
        : code_ === 'FUNCTION_NOT_CALLABLE' ? text.errors.FUNCTION_NOT_CALLABLE(rawChallenge.functionName)
        : text.errors[code_]()
    );
  const showWalkthrough = givenUp && !completed;

  return (
    <>
      <div className="workspace">
        <div className="workspace-stack">
          <Window
            title={text.weekTitle(week)}
            icon="trophy"
            status={
              <>
                <span>{text.kinds[rawChallenge.kind]}</span>
                <span>{text.timeLabel}: {text.seconds(timeLimitSeconds)}</span>
              </>
            }
          >
            <div className="brief-body">
              <div className="badge-row">
                <span className="pill">{text.kinds[rawChallenge.kind]}</span>
                <span className="pill">Python</span>
                {completed && (
                  <span className="pill inverse">
                    <PixelIcon name="check" size={14} />
                    {text.completed}
                  </span>
                )}
                {givenUp && !completed && <span className="pill dotted">{text.givenUp}</span>}
              </div>

              <h2 className="challenge-heading">{challenge.localizedTitle}</h2>
              <p className="challenge-description"><RichText text={challenge.localizedDescription} /></p>

              <div className="section-block weekly-rules">
                <h3>
                  <PixelIcon name="alert" size={18} />
                  {text.rules}
                </h3>
                <ul className="challenge-list">
                  {challenge.localizedRules.map((rule) => (
                    <li key={rule}><RichText text={rule} /></li>
                  ))}
                </ul>
              </div>

              {rawChallenge.referenceCode && (
                <div className="section-block">
                  <h3>{challenge.localizedReferenceTitle}</h3>
                  <pre className="code-block">
                    <code>{rawChallenge.referenceCode}</code>
                  </pre>
                </div>
              )}

              <div className="section-block">
                <h3>{text.instructions}</h3>
                <p><RichText text={challenge.localizedInstructions} /></p>
              </div>

              <dl className="facts">
                <div>
                  <dt>{text.functionLabel}</dt>
                  <dd>{rawChallenge.functionName}</dd>
                </div>
                <div>
                  <dt>{text.testsLabel}</dt>
                  <dd>{rawChallenge.tests.length}</dd>
                </div>
                <div>
                  <dt>{text.timeLabel}</dt>
                  <dd>{text.seconds(timeLimitSeconds)}</dd>
                </div>
                <div>
                  <dt>{text.weekLabel}</dt>
                  <dd>#{week}</dd>
                </div>
              </dl>
            </div>
          </Window>
        </div>

        <Window
          className={`editor-window ${isChecking ? 'is-busy' : ''}`}
          title="solucion.py"
          icon="doc"
          style={{ '--zoom-delay': '0.1s' }}
          status={
            <>
              <span className={isPythonLoading || isChecking ? 'busy-dots' : undefined}>
                {isChecking ? text.checking : isPythonLoading ? text.pythonLoading : text.pythonReady}
              </span>
              <span>{isCurrentWeek ? countdownText : text.editorTitle}</span>
            </>
          }
        >
          <div className="editor-body">
            <div className="editor-meta">
              <div className="mini-stats">
                <div className="mini-stat">
                  <span>{text.attempts}</span>
                  <strong>{attemptCount}</strong>
                </div>
                <div className="mini-stat">
                  <span>{text.hintsUnlocked}</span>
                  <strong>{revealedHints}</strong>
                </div>
              </div>
            </div>

            {pythonLoadFailed && (
              <div className="feedback-box error-box">
                <PixelIcon name="alert" size={32} />
                <h4>{text.pythonError}</h4>
                <p>{text.errors.PYODIDE_LOAD_ERROR()}</p>
              </div>
            )}

            <label className="sr-only" htmlFor="weekly-editor">{text.editorTitle}</label>
            <textarea
              id="weekly-editor"
              className="code-editor"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => handleCodeEditorKeyDown(event, code, setCode)}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              disabled={isOver || isChecking || isPythonLoading}
            />

            <div className="button-row">
              <button className="primary-button" onClick={handleCheck} disabled={isOver || isChecking || isPythonLoading}>
                {completed ? text.completed : isChecking ? text.checkingButton : isPythonLoading ? text.loadingButton : text.check}
              </button>
              {!isOver && (
                <button className="secondary-button" onClick={() => setCode(rawChallenge.starterCode)} disabled={isChecking}>
                  {text.reset}
                </button>
              )}
              {completed && (
                <button
                  className={`secondary-button ${shareStatus === 'copied' || shareStatus === 'shared' ? 'is-confirmed' : ''}`}
                  onClick={handleShare}
                  aria-live="polite"
                >
                  {shareLabel(text.share)}
                </button>
              )}
              {!isOver && attemptCount >= 1 && (
                <button className="secondary-button danger-button" onClick={() => setShowGiveUp(true)}>
                  {text.giveUp}
                </button>
              )}
            </div>
          </div>
        </Window>
      </div>

      <div className={`results-grid ${showWalkthrough ? 'is-single' : ''}`}>
        <Window title={text.result} icon="check" style={{ '--zoom-delay': '0.16s' }}>
          <div className="result-stack" aria-live="polite">
            {givenUp && !completed && (
              <div className="feedback-box error-box">
                <PixelIcon name="alert" size={32} />
                <h4>{text.givenUp}</h4>
                <p>{text.giveUpPointer}</p>
              </div>
            )}

            {!validation && !isOver && (
              <div className="empty-note">
                <PixelIcon name="doc" size={28} />
                <span>{text.waiting}</span>
              </div>
            )}

            {completed && (
              <div className="feedback-box success-box">
                <PixelIcon name="check" size={36} />
                <h4>{text.passedTitle}</h4>
                <p>{text.passedText}</p>
              </div>
            )}

            {validation && !validation.success && (
              <div className="feedback-box error-box">
                <PixelIcon name={violations.length ? 'alert' : 'cross'} size={36} />
                <h4>{violations.length ? text.rulesBroken : text.failedTitle}</h4>
                <p>
                  {violations.length
                    ? text.rulesBrokenSummary
                    : text.testsPassed(validation.passedCount || 0, validation.totalTests || rawChallenge.tests.length)}
                </p>
              </div>
            )}

            {violations.length > 0 && (
              <div className="result-subsection">
                <h4>{text.rulesBroken}</h4>
                <ul className="challenge-list violation-list">
                  {violations.map((v) => (
                    <li key={`${v.code}-${v.detail}`}>
                      {v.line ? <strong>{text.line(v.line)}</strong> : null}
                      <RichText text={text.violation[v.code]?.(v.detail, text.syntax) || v.code} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {errorMessages.length > 0 && (
              <div className="result-subsection">
                <h4>{text.details}</h4>
                <ul className="challenge-list">
                  {errorMessages.map((message) => (
                    <li key={message}><RichText text={message} /></li>
                  ))}
                </ul>
              </div>
            )}

            {validation?.pythonError && (
              <div className="result-subsection">
                <h4>{text.pythonError}</h4>
                <pre className="code-block"><code>{validation.pythonError}</code></pre>
              </div>
            )}

            {validation?.testResults?.length > 0 && (
              <div className="result-subsection">
                <h4>{text.tests}</h4>
                <div className="tests-list">
                  {validation.testResults.map((test, row) => (
                    <div
                      key={`${attemptCount}-${test.index}`}
                      className={`test-item ${test.passed ? 'passed' : 'failed'}`}
                      style={{ '--row': row }}
                    >
                      <span className="test-mark">
                        <PixelIcon name={test.passed ? 'check' : 'cross'} size={18} />
                      </span>
                      <span className="test-name">
                        Test {test.index + 1}: {test.passed ? text.testOk : text.testFail}
                      </span>
                      <code>
                        input: {preview(test.input)} | expected: {preview(test.expected)}
                        {test.runtimeError ? ` | ${test.runtimeError}` : ` | actual: ${preview(test.actual)}`}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Window>

        {!showWalkthrough && (
          <Window title={text.hints} icon="bulb" style={{ '--zoom-delay': '0.2s' }}>
            {revealedHints === 0 ? (
              <div className="empty-note">
                <PixelIcon name="bulb" size={28} />
                <span>{text.noHints}</span>
              </div>
            ) : (
              <ol className="hint-list">
                {challenge.localizedHints.slice(0, revealedHints).map((hint, index) => (
                  <li key={`${index}-${hint}`}>
                    <span className="hint-num">{index + 1}</span>
                    <span><RichText text={hint} /></span>
                  </li>
                ))}
              </ol>
            )}
          </Window>
        )}
      </div>

      {showWalkthrough && (
        <SolutionWalkthrough
          challenge={rawChallenge}
          hints={challenge.localizedHints}
          userCode={code}
          testResults={validation?.testResults || null}
          language={language}
        />
      )}

      {showGiveUp && (
        <div className="modal-overlay" onClick={closeGiveUp}>
          <Window
            className="dialog"
            title={text.giveUp}
            titleAs="p"
            onClose={closeGiveUp}
            closeLabel={text.cancel}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="weekly-give-up-title"
            aria-describedby="weekly-give-up-text"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="alert-layout">
              <PixelIcon name="alert" size={48} />
              <div>
                <h3 id="weekly-give-up-title">{text.confirmTitle}</h3>
                <p id="weekly-give-up-text">{text.confirmText}</p>
              </div>
            </div>
            <div className="dialog-actions">
              <button className="secondary-button" onClick={closeGiveUp} autoFocus>{text.cancel}</button>
              <button className="secondary-button danger-button solid" onClick={handleGiveUp}>{text.confirmYes}</button>
            </div>
          </Window>
        </div>
      )}

      {showResult && completed && (
        <div className="modal-overlay" onClick={closeResult}>
          <Window
            className="dialog result-dialog"
            title={text.dialogTitle}
            titleAs="h2"
            titleId="weekly-result-title"
            onClose={closeResult}
            closeLabel={text.close}
            role="dialog"
            aria-modal="true"
            aria-labelledby="weekly-result-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="result-day">{language === 'es' ? 'Semanal' : 'Weekly'} #{week}</p>
            <p className="result-meta">{challenge.localizedTitle}</p>
            <div className="attempt-grid" role="img" aria-label={attemptsSummary}>
              {Array.from({ length: gridSlots }, (_, i) => {
                const state = i < attemptCount - 1 ? 'fail' : i === attemptCount - 1 ? 'win' : '';
                return (
                  <span key={i} className={`attempt-cell ${state}`}>
                    {state === 'win' && <PixelIcon name="check" size={22} />}
                    {state === 'fail' && <PixelIcon name="cross" size={18} />}
                  </span>
                );
              })}
            </div>
            <p className="result-attempts">{attemptsSummary}</p>
            {isCurrentWeek && (
              <p className="result-next">
                <PixelIcon name="clock" size={20} />
                {countdownText}
              </p>
            )}
            <div className="dialog-actions">
              <button className="secondary-button" onClick={closeResult}>{text.close}</button>
              <button className="primary-button" onClick={handleShare} autoFocus aria-live="polite">
                {shareLabel(text.shareShort)}
              </button>
            </div>
          </Window>
        </div>
      )}
    </>
  );
}

export default WeeklyPlayer;

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  getChallengeStats,
  getChallengeText,
  getDaySeed,
  getDayNumber,
  loadLanguagePools,
  pickDailyChallenge,
} from '../../services/challengeService';
import { validateChallengeSolution } from '../../services/solutionValidationService';
import {
  getProgressEntry,
  updateProgressEntry,
  markTodayCompleted,
  getStats,
} from '../../services/progressService';
import { ensurePyodideLoaded } from '../../services/pythonRunnerService';
import { getPreferences, savePreferences } from '../../services/uiService';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { buildPath } from '../../router';
import { formatCountdown, useDayClock } from '../../hooks/useDayClock';
import Window from '../ui/Window';
import PixelIcon from '../ui/PixelIcon';

const NORMAL_GRID_SLOTS = 5;

const SITE_ORIGIN = 'https://codedaily-nu.vercel.app';

// En móvil se abre el menú nativo de compartir (WhatsApp, Telegram...);
// en escritorio se copia al portapapeles, que es lo que se espera allí.
function shouldUseNativeShare() {
  return typeof navigator !== 'undefined'
    && typeof navigator.share === 'function'
    && window.matchMedia?.('(pointer: coarse)').matches;
}

async function copyToClipboard(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Fallback for browsers or contexts without the async Clipboard API
    const helper = document.createElement('textarea');
    helper.value = value;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(helper);
    return ok;
  }
}

function parseYMDToUTCDate(ymd) {
  const [year, month, day] = ymd.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function ChallengePlayer({
  pageTitle,
  pageSubtitle,
  notice = null,
  selectedDate,
  onDateChange = null,
  allowDateSelection = false,
  allowHackerMode = true,
  minSelectableDate = null,
}) {
  const { language } = useLanguage();

  const [difficulty, setDifficulty] = useState(() => getPreferences().difficulty);
  const [playMode, setPlayMode] = useState(() => allowHackerMode ? getPreferences().playMode : 'normal');
  const [programmingLanguage, setProgrammingLanguage] = useState(() => getPreferences().programmingLanguage);
  const [code, setCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [revealedHints, setRevealedHints] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isPythonLoading, setIsPythonLoading] = useState(true);
  const [pythonLoadError, setPythonLoadError] = useState(null);
  const [givenUp, setGivenUp] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const effectivePlayMode = allowHackerMode ? playMode : 'normal';
  const isHackerMode = effectivePlayMode === 'hacker';
  const effectiveDifficulty = isHackerMode ? 'pro' : difficulty;
  const isPython = programmingLanguage === 'python';
  const maxHackerAttempts = 3;
  const challengeDate = useMemo(() => parseYMDToUTCDate(selectedDate), [selectedDate]);
  const { msUntilNext } = useDayClock();

  const text = useMemo(() => {
    return {
      es: {
        modeLabel: 'Modo',
        briefTitle: 'Reto',
        modeNormal: 'Normal',
        modeHacker: 'Hacker',
        hackerDescription:
          'El modo Hacker usa retos Pro, no muestra pistas y solo permite 3 intentos al día.',
        dateLabel: 'Fecha',
        progLangLabel: 'Lenguaje',
        progLangPython: 'Python',
        progLangJava: 'Java',
        difficultyLabel: 'Dificultad',
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
        poolLoading: 'Cargando el reto',
        poolErrorTitle: 'No se pudo cargar el reto',
        poolErrorText: 'Comprueba tu conexión y vuelve a intentarlo.',
        retry: 'Reintentar',
        statsTitle: 'Banco actual de retos',
        total: 'Total',
        starterCode: 'Código base',
        editorTitle: 'Tu solución',
        editorPlaceholder: isPython ? 'Escribe aquí tu solución en Python...' : 'Escribe aquí tu solución en Java...',
        checkButton: 'Comprobar solución',
        checkingButton: 'Comprobando...',
        resetButton: 'Restablecer código',
        attempts: 'Intentos',
        attemptsLeft: 'Intentos restantes',
        resultTitle: 'Resultado',
        passedTitle: '¡Reto superado!',
        passedText: isPython
          ? 'Tu solución ha pasado las comprobaciones con Python real.'
          : 'Tu solución ha pasado las comprobaciones con Java real.',
        failedTitle: 'La solución todavía no es válida',
        testsSection: 'Tests',
        errorsSection: 'Detalles',
        hintsSection: 'Pistas',
        noHintsYet: 'Todavía no has desbloqueado pistas.',
        noHintsInHacker: 'El modo Hacker no ofrece pistas.',
        prototypeNote: isPython
          ? 'La validación ejecuta Python real en el navegador con Pyodide.'
          : 'La validación ejecuta Java real vía Judge0.',
        difficultyNovatoShort: 'Novato',
        difficultyIntermedioShort: 'Intermedio',
        difficultyProShort: 'Pro',
        testPassed: 'OK',
        testFailed: 'Fallo',
        completedBadge: 'Completado',
        testsPassedText: 'tests superados',
        waitingResult: 'Todavía no has comprobado tu solución.',
        pythonLoading: isPython ? 'Cargando entorno Python...' : 'Listo',
        pythonReady: isPython ? 'Python listo' : 'Java (Judge0)',
        pythonLoadError: 'No se pudo cargar el entorno Python.',
        runtimeTitle: isPython ? 'Error de Python' : 'Error de Java',
        hackerBadge: 'Modo Hacker',
        hackerLockedTitle: 'Reto bloqueado',
        hackerLockedText:
          'Has agotado los 3 intentos disponibles del modo Hacker para esta fecha.',
        shareButton: 'Compartir resultado',
        shareCopied: '¡Copiado!',
        shareShared: '¡Compartido!',
        shareFailed: 'No se pudo copiar',
        modalTitle: '¡Reto superado!',
        modalClose: 'Cerrar',
        modalShare: 'Compartir',
        pythonLoadingButton: 'Cargando Python...',
        giveUpButton: 'Rendirse',
        giveUpConfirmTitle: '¿Seguro que quieres rendirte?',
        giveUpConfirmText: 'Si te rindes no podrás volver a intentar este desafío. Se mostrarán las pistas disponibles y la solución.',
        giveUpConfirm: 'Sí, rendirse',
        giveUpCancel: 'Cancelar',
        giveUpBadge: 'Rendido',
        solutionLabel: 'Solución',
      },
      en: {
        modeLabel: 'Mode',
        briefTitle: 'Challenge',
        modeNormal: 'Normal',
        modeHacker: 'Hacker',
        hackerDescription:
          'Hacker mode uses Pro challenges, shows no hints, and only allows 3 attempts per day.',
        dateLabel: 'Date',
        progLangLabel: 'Language',
        progLangPython: 'Python',
        progLangJava: 'Java',
        difficultyLabel: 'Difficulty',
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
        poolLoading: 'Loading the challenge',
        poolErrorTitle: 'The challenge could not be loaded',
        poolErrorText: 'Check your connection and try again.',
        retry: 'Retry',
        statsTitle: 'Current challenge pool',
        total: 'Total',
        starterCode: 'Starter code',
        editorTitle: 'Your solution',
        editorPlaceholder: isPython ? 'Write your Python solution here...' : 'Write your Java solution here...',
        checkButton: 'Check solution',
        checkingButton: 'Checking...',
        resetButton: 'Reset code',
        attempts: 'Attempts',
        attemptsLeft: 'Attempts left',
        resultTitle: 'Result',
        passedTitle: 'Challenge solved!',
        passedText: isPython
          ? 'Your solution passed the checks with real Python execution.'
          : 'Your solution passed the checks with real Java execution.',
        failedTitle: 'The solution is not valid yet',
        testsSection: 'Tests',
        errorsSection: 'Details',
        hintsSection: 'Hints',
        noHintsYet: 'You have not unlocked hints yet.',
        noHintsInHacker: 'Hacker mode does not provide hints.',
        prototypeNote: isPython
          ? 'Validation runs real Python in the browser with Pyodide.'
          : 'Validation runs real Java via Judge0.',
        difficultyNovatoShort: 'Beginner',
        difficultyIntermedioShort: 'Intermediate',
        difficultyProShort: 'Pro',
        testPassed: 'OK',
        testFailed: 'Failed',
        completedBadge: 'Completed',
        testsPassedText: 'tests passed',
        waitingResult: 'You have not checked your solution yet.',
        pythonLoading: isPython ? 'Loading Python runtime...' : 'Ready',
        pythonReady: isPython ? 'Python ready' : 'Java (Judge0)',
        pythonLoadError: 'Could not load the Python runtime.',
        runtimeTitle: isPython ? 'Python error' : 'Java error',
        hackerBadge: 'Hacker mode',
        hackerLockedTitle: 'Challenge locked',
        hackerLockedText:
          'You used all 3 available attempts for this Hacker challenge date.',
        shareButton: 'Share result',
        shareCopied: 'Copied!',
        shareShared: 'Shared!',
        shareFailed: "Couldn't copy",
        modalTitle: 'Challenge solved!',
        modalClose: 'Close',
        modalShare: 'Share',
        pythonLoadingButton: 'Loading Python...',
        giveUpButton: 'Give up',
        giveUpConfirmTitle: 'Are you sure you want to give up?',
        giveUpConfirmText: 'If you give up you will not be able to retry this challenge. Available hints and the solution will be revealed.',
        giveUpConfirm: 'Yes, give up',
        giveUpCancel: 'Cancel',
        giveUpBadge: 'Given up',
        solutionLabel: 'Solution',
      },
    }[language];
  }, [language, isPython]);

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

  // Los bancos de retos del lenguaje elegido se descargan al entrar (o al cambiar de lenguaje)
  const [poolAttempt, setPoolAttempt] = useState(0);
  const [loadedPools, setLoadedPools] = useState({ language: null, attempt: -1, pools: null, failed: false });

  useEffect(() => {
    let isMounted = true;
    loadLanguagePools(programmingLanguage)
      .then((pools) => {
        if (isMounted) setLoadedPools({ language: programmingLanguage, attempt: poolAttempt, pools, failed: false });
      })
      .catch(() => {
        if (isMounted) setLoadedPools({ language: programmingLanguage, attempt: poolAttempt, pools: null, failed: true });
      });
    return () => {
      isMounted = false;
    };
  }, [programmingLanguage, poolAttempt]);

  const poolIsCurrent = loadedPools.language === programmingLanguage && loadedPools.attempt === poolAttempt;
  const pools = poolIsCurrent ? loadedPools.pools : null;
  const isPoolLoading = !poolIsCurrent;
  const poolFailed = poolIsCurrent && loadedPools.failed;

  const stats = useMemo(() => getChallengeStats(pools), [pools]);
  const baseChallenge = useMemo(() => {
    if (!pools) return null;
    return pickDailyChallenge(pools[effectiveDifficulty], {
      date: challengeDate,
      language: programmingLanguage,
      difficulty: effectiveDifficulty,
    });
  }, [pools, challengeDate, effectiveDifficulty, programmingLanguage]);

  const dailyChallenge = useMemo(() => {
    return getChallengeText(baseChallenge, language);
  }, [baseChallenge, language]);

  useEffect(() => {
    if (!isPython) {
      setIsPythonLoading(false);
      setPythonLoadError(null);
      return;
    }

    let isMounted = true;

    async function loadPython() {
      setIsPythonLoading(true);
      setPythonLoadError(null);

      try {
        await ensurePyodideLoaded();
        if (isMounted) setIsPythonLoading(false);
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
  }, [isPython]);

  useEffect(() => {
    if (!baseChallenge) {
      setCode('');
      setValidationResult(null);
      setAttemptCount(0);
      setRevealedHints(0);
      setCompleted(false);
      setLocked(false);
      setGivenUp(false);
      return;
    }

    const progress = getProgressEntry({
      date: challengeDate,
      challengeId: `${programmingLanguage}_${baseChallenge.id}`,
      mode: effectivePlayMode,
    });

    setCode(progress.code || baseChallenge.starterCode);
    setValidationResult(null);
    setAttemptCount(progress.attempts || 0);
    setRevealedHints(progress.revealedHints || 0);
    setCompleted(progress.completed || false);
    setLocked(progress.locked || false);
    setGivenUp(progress.givenUp || false);
  }, [baseChallenge?.id, baseChallenge?.language, effectivePlayMode, challengeDate, programmingLanguage]);

  useEffect(() => {
    if (!baseChallenge) {
      return;
    }

    updateProgressEntry({
      date: challengeDate,
      challengeId: `${programmingLanguage}_${baseChallenge.id}`,
      mode: effectivePlayMode,
      update: {
        code,
        attempts: attemptCount,
        revealedHints,
        completed,
        locked,
        givenUp,
      },
    });
  }, [
    code,
    attemptCount,
    revealedHints,
    completed,
    locked,
    givenUp,
    baseChallenge,
    effectivePlayMode,
    challengeDate,
  ]);

  const difficulties = [
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
      challengeId: `${programmingLanguage}_${baseChallenge.id}`,
      mode: effectivePlayMode,
    });
    setIsChecking(false);
    setTimeout(() => setShowResultModal(true), 800);
  };

  const handleResetCode = () => {
    if (!baseChallenge || completed || isChecking || isHackerMode) {
      return;
    }

    setCode(baseChallenge.starterCode);
    setValidationResult(null);
  };

  const handleGiveUp = () => {
    if (!baseChallenge || completed || givenUp) return;
    const hints = dailyChallenge?.localizedHints || [];
    setRevealedHints(hints.length);
    setLocked(true);
    setGivenUp(true);
    setShowGiveUpConfirm(false);
  };

  const [shareStatus, setShareStatus] = useState('idle');

  const closeResultModal = useCallback(() => setShowResultModal(false), []);
  const closeGiveUpConfirm = useCallback(() => setShowGiveUpConfirm(false), []);
  useEscapeKey(showResultModal && completed, closeResultModal);
  useEscapeKey(showGiveUpConfirm, closeGiveUpConfirm);

  // Hacker mode has a real limit of 3 attempts; Normal mode is unlimited,
  // so its grid grows past the default 5 slots instead of overflowing.
  const gridSlots = isHackerMode ? maxHackerAttempts : Math.max(NORMAL_GRID_SLOTS, attemptCount);
  const emojiGrid = Array.from({ length: gridSlots }, (_, i) => {
    if (i < attemptCount - 1) return '🟥';
    if (i === attemptCount - 1 && completed) return '🟩';
    if (i === attemptCount - 1 && givenUp) return '🟥';
    return '⬜';
  }).join('');

  const attemptsWord = language === 'es'
    ? (attemptCount === 1 ? 'intento' : 'intentos')
    : (attemptCount === 1 ? 'attempt' : 'attempts');
  const attemptsSummary = isHackerMode
    ? `${attemptCount}/${maxHackerAttempts} ${attemptsWord}`
    : `${attemptCount} ${attemptsWord}`;

  const dayNum = getDayNumber(challengeDate);
  const resultMetaLine = `${difficultyLabelMap[effectiveDifficulty] || effectiveDifficulty} · ${
    programmingLanguage === 'java' ? 'Java' : 'Python'
  } · ${isHackerMode ? 'Hacker' : 'Normal'}`;
  const currentStats = getStats();
  const streakLine = currentStats.streak > 0
    ? `${language === 'es' ? 'Racha' : 'Streak'}: ${currentStats.streak} ${language === 'es'
        ? (currentStats.streak === 1 ? 'día' : 'días')
        : (currentStats.streak === 1 ? 'day' : 'days')}`
    : null;

  const handleShare = async () => {
    if (!baseChallenge) return;

    const resultLabel = givenUp ? text.giveUpBadge : attemptsSummary;
    const lines = [
      `CodeDaily #${dayNum} 🧩`,
      resultMetaLine,
      '',
      `${emojiGrid} — ${resultLabel}`,
      ...(streakLine ? [`🔥 ${streakLine}`] : []),
      '',
      // El enlace lleva al mismo reto: el de hoy o ese día del archivo
      `${SITE_ORIGIN}${buildPath(allowDateSelection ? { page: 'archive', date: getDaySeed(challengeDate) } : { page: 'daily' })}`,
    ];
    const shareText = lines.join('\n');

    let status;
    if (shouldUseNativeShare()) {
      try {
        await navigator.share({ text: shareText });
        status = 'shared';
      } catch (error) {
        // Cerrar el menú de compartir no es un error
        if (error?.name === 'AbortError') return;
        status = (await copyToClipboard(shareText)) ? 'copied' : 'failed';
      }
    } else {
      status = (await copyToClipboard(shareText)) ? 'copied' : 'failed';
    }

    setShareStatus(status);
    setTimeout(() => setShareStatus('idle'), 2000);
  };

  const shareLabel = (idleLabel) => (
    shareStatus === 'copied' ? text.shareCopied
      : shareStatus === 'shared' ? text.shareShared
      : shareStatus === 'failed' ? text.shareFailed
      : idleLabel
  );

  const handleEditorKeyDown = (event) => {
    const textarea = event.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const TAB = '    ';

    if (event.key === 'Tab') {
      event.preventDefault();

      const hasSelection = start !== end;

      if (event.shiftKey) {
        // Shift+Tab: desindenta las líneas seleccionadas (o la línea actual)
        const lineStart = code.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = end;
        const selectedLines = code.substring(lineStart, lineEnd);

        const dedented = selectedLines
          .split('\n')
          .map((line) => (line.startsWith(TAB) ? line.slice(TAB.length) : line.replace(/^ {1,3}/, '')))
          .join('\n');

        const removed = selectedLines.length - dedented.length;
        const newValue = code.substring(0, lineStart) + dedented + code.substring(lineEnd);
        setCode(newValue);

        setTimeout(() => {
          textarea.selectionStart = Math.max(lineStart, start - (hasSelection ? 0 : Math.min(removed, TAB.length)));
          textarea.selectionEnd = end - removed;
        }, 0);

      } else if (hasSelection) {
        // Tab con selección: indenta todas las líneas seleccionadas
        const lineStart = code.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = end;
        const selectedLines = code.substring(lineStart, lineEnd);

        const indented = selectedLines.split('\n').map((line) => TAB + line).join('\n');
        const added = indented.length - selectedLines.length;
        const newValue = code.substring(0, lineStart) + indented + code.substring(lineEnd);
        setCode(newValue);

        setTimeout(() => {
          textarea.selectionStart = start + TAB.length;
          textarea.selectionEnd = end + added;
        }, 0);

      } else {
        // Tab sin selección: inserta 4 espacios en el cursor
        const newValue = code.substring(0, start) + TAB + code.substring(end);
        setCode(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + TAB.length;
        }, 0);
      }

    } else if (event.key === 'Backspace' && start === end) {
      // Backspace inteligente: borra un TAB completo si el cursor está precedido de espacios
      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const textBeforeCursor = code.substring(lineStart, start);
      const trailingSpaces = textBeforeCursor.match(/( +)$/)?.[1] ?? '';

      if (trailingSpaces.length > 0) {
        event.preventDefault();
        const toRemove = ((trailingSpaces.length - 1) % TAB.length) + 1;
        const newValue = code.substring(0, start - toRemove) + code.substring(start);
        setCode(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - toRemove;
        }, 0);
      }
    }
  };

  const fileName = `solucion.${isPython ? 'py' : 'java'}`;
  const runtimeLabel = isPythonLoading ? text.pythonLoading : text.pythonReady;

  return (
    <section className="page-section">
      <div className="page-head">
        <div className="page-head-text">
          <h1 className="page-title">{pageTitle}</h1>
          <p className="lede">{pageSubtitle}</p>
        </div>

        <div className="toolbar">
          {allowHackerMode && (
            <div className="field">
              <span className="field-label" id="play-mode-label">{text.modeLabel}</span>
              <div className="segmented" role="group" aria-labelledby="play-mode-label">
                <button
                  aria-pressed={playMode === 'normal'}
                  onClick={() => { setPlayMode('normal'); savePreferences({ playMode: 'normal' }); }}
                >
                  {text.modeNormal}
                </button>
                <button
                  aria-pressed={playMode === 'hacker'}
                  onClick={() => { setPlayMode('hacker'); savePreferences({ playMode: 'hacker' }); }}
                >
                  {text.modeHacker}
                </button>
              </div>
            </div>
          )}

          {allowDateSelection && (
            <div className="field">
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
            <div className="field">
              <label htmlFor="daily-difficulty-select">{text.difficultyLabel}</label>
              <select
                id="daily-difficulty-select"
                value={difficulty}
                onChange={(event) => { setDifficulty(event.target.value); savePreferences({ difficulty: event.target.value }); }}
              >
                {difficulties.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label htmlFor="prog-lang-select">{text.progLangLabel}</label>
            <select
              id="prog-lang-select"
              value={programmingLanguage}
              onChange={(event) => {
                setProgrammingLanguage(event.target.value);
                savePreferences({ programmingLanguage: event.target.value });
              }}
            >
              <option value="python">{text.progLangPython}</option>
              <option value="java">{text.progLangJava}</option>
            </select>
          </div>
        </div>
      </div>

      {notice}

      {isHackerMode && (
        <div className="feedback-box error-box">
          <PixelIcon name="alert" size={36} />
          <h4>{text.hackerBadge}</h4>
          <p>{text.hackerDescription}</p>
        </div>
      )}

      {isPoolLoading ? (
        <Window title={text.briefTitle} icon="doc">
          <p className="busy-dots" role="status">{text.poolLoading}</p>
        </Window>
      ) : poolFailed ? (
        <Window title={text.poolErrorTitle} icon="alert">
          <div className="alert-layout">
            <PixelIcon name="alert" size={40} />
            <div>
              <p>{text.poolErrorText}</p>
              <div className="dialog-actions">
                <button
                  className="secondary-button"
                  onClick={() => setPoolAttempt((n) => n + 1)}
                >
                  {text.retry}
                </button>
              </div>
            </div>
          </div>
        </Window>
      ) : !dailyChallenge ? (
        <Window title={text.emptyTitle} icon="alert">
          <p>{text.emptyText}</p>
        </Window>
      ) : (
        <>
          <div className="workspace">
            <Window
              title={`${text.briefTitle} #${dayNum}`}
              icon="doc"
              status={
                <>
                  <span>{text.statsTitle}</span>
                  <span className="pool-row">
                    <span>{text.total} <strong>{stats.total}</strong></span>
                    <span>{text.difficultyNovato} <strong>{stats.novato}</strong></span>
                    <span>{text.difficultyIntermedio} <strong>{stats.intermedio}</strong></span>
                    <span>{text.difficultyPro} <strong>{stats.pro}</strong></span>
                  </span>
                </>
              }
            >
              <div className="brief-body">
                <div className="badge-row">
                  <span className="pill">
                    {difficultyLabelMap[dailyChallenge.difficulty] || dailyChallenge.difficulty}
                  </span>
                  {isHackerMode && <span className="pill inverse">{text.hackerBadge}</span>}
                  {completed && (
                    <span className="pill inverse">
                      <PixelIcon name="check" size={14} />
                      {text.completedBadge}
                    </span>
                  )}
                  {givenUp && !completed && <span className="pill dotted">{text.giveUpBadge}</span>}
                </div>

                <h2 className="challenge-heading">{dailyChallenge.localizedTitle}</h2>
                <p className="challenge-description">{dailyChallenge.localizedDescription}</p>

                <dl className="facts">
                  <div>
                    <dt>{text.selectedDate}</dt>
                    <dd>{getDaySeed(challengeDate)}</dd>
                  </div>
                  <div>
                    <dt>{text.challengeId}</dt>
                    <dd>{dailyChallenge.id}</dd>
                  </div>
                  <div>
                    <dt>{text.languageLabel}</dt>
                    <dd>{dailyChallenge.language}</dd>
                  </div>
                  <div>
                    <dt>{text.functionLabel}</dt>
                    <dd>{dailyChallenge.functionName}</dd>
                  </div>
                  <div>
                    <dt>{text.hintsPreview}</dt>
                    <dd>{isHackerMode ? 0 : dailyChallenge.localizedHints.length}</dd>
                  </div>
                  <div>
                    <dt>{text.testsCount}</dt>
                    <dd>{dailyChallenge.tests.length}</dd>
                  </div>
                </dl>

                <div className="section-block">
                  <h3>{text.instructions}</h3>
                  <p>{dailyChallenge.localizedInstructions}</p>
                </div>

                <div className="section-block">
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
                  <div className="section-block">
                    <h3>{text.starterCode}</h3>
                    <pre className="code-block">
                      <code>{dailyChallenge.starterCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            </Window>

            <Window
              className={`editor-window ${isChecking ? 'is-busy' : ''}`}
              title={fileName}
              icon="doc"
              style={{ '--zoom-delay': '0.1s' }}
              status={
                <>
                  <span className={isPythonLoading || isChecking ? 'busy-dots' : undefined}>
                    {isChecking ? text.checkingButton.replace(/\.+$/, '') : runtimeLabel}
                  </span>
                  <span>{text.editorTitle}</span>
                </>
              }
            >
              <div className="editor-body">
                <div className="editor-meta">
                  <p className="muted-text">{text.prototypeNote}</p>
                  <div className="mini-stats">
                    <div className="mini-stat">
                      <span>{text.attempts}</span>
                      <strong>{attemptCount}</strong>
                    </div>
                    {isHackerMode ? (
                      <div className="mini-stat inverse">
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

                {pythonLoadError && (
                  <div className="feedback-box error-box">
                    <PixelIcon name="alert" size={32} />
                    <h4>{text.pythonLoadError}</h4>
                    <p>{pythonLoadError}</p>
                  </div>
                )}

                {locked && !completed && !givenUp && (
                  <div className="feedback-box error-box">
                    <PixelIcon name="alert" size={32} />
                    <h4>{text.hackerLockedTitle}</h4>
                    <p>{text.hackerLockedText}</p>
                  </div>
                )}

                <label className="sr-only" htmlFor="solution-editor">{text.editorTitle}</label>
                <textarea
                  id="solution-editor"
                  className="code-editor"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  onKeyDown={handleEditorKeyDown}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  placeholder={text.editorPlaceholder}
                  disabled={completed || locked || isChecking || isPythonLoading}
                />

                <div className="button-row">
                  <button
                    className="primary-button"
                    onClick={handleValidate}
                    disabled={completed || locked || isChecking || isPythonLoading}
                  >
                    {completed
                      ? text.completedBadge
                      : isChecking
                      ? text.checkingButton
                      : isPythonLoading
                      ? text.pythonLoadingButton
                      : text.checkButton}
                  </button>

                  {!isHackerMode && (
                    <button
                      className="secondary-button"
                      onClick={handleResetCode}
                      disabled={completed || locked || isChecking}
                    >
                      {text.resetButton}
                    </button>
                  )}

                  {completed && (
                    <button
                      className={`secondary-button ${shareStatus === 'copied' || shareStatus === 'shared' ? 'is-confirmed' : ''}`}
                      onClick={handleShare}
                      aria-live="polite"
                    >
                      {shareLabel(text.shareButton)}
                    </button>
                  )}

                  {/* Botón rendirse: solo en modo normal, sin completar, sin rendido, tras al menos un intento fallido */}
                  {!isHackerMode && !completed && !givenUp && attemptCount >= 1 && !locked && (
                    <button className="secondary-button danger-button" onClick={() => setShowGiveUpConfirm(true)}>
                      {text.giveUpButton}
                    </button>
                  )}
                </div>
              </div>
            </Window>
          </div>

          <div className="results-grid">
            <Window title={text.resultTitle} icon="check" style={{ '--zoom-delay': '0.16s' }}>
              <div className="result-stack" aria-live="polite">
                {givenUp && !completed && (
                  <div className="feedback-box error-box">
                    <PixelIcon name="alert" size={32} />
                    <h4>{text.giveUpBadge}</h4>
                    {baseChallenge?.solution ? (
                      <div>
                        <p className="tutorial-label">{text.solutionLabel}</p>
                        <pre className="code-block">
                          <code>{baseChallenge.solution}</code>
                        </pre>
                      </div>
                    ) : (
                      <p>
                        {language === 'es'
                          ? 'Revisa las pistas para entender la solución.'
                          : 'Check the hints to understand the solution.'}
                      </p>
                    )}
                  </div>
                )}

                {!givenUp && !validationResult ? (
                  <div className="empty-note">
                    <PixelIcon name="doc" size={28} />
                    <span>{text.waitingResult}</span>
                  </div>
                ) : !givenUp && validationResult?.success ? (
                  <div className="feedback-box success-box">
                    <PixelIcon name="check" size={36} />
                    <h4>{text.passedTitle}</h4>
                    <p>{text.passedText}</p>
                    <p>
                      {validationResult.passedCount} / {validationResult.totalTests} {text.testsPassedText}
                    </p>
                  </div>
                ) : !givenUp && validationResult ? (
                  <div className="feedback-box error-box">
                    <PixelIcon name="alert" size={36} />
                    <h4>{text.failedTitle}</h4>
                    <p>
                      {validationResult.passedCount} / {validationResult.totalTests} {text.testsPassedText}
                    </p>
                  </div>
                ) : null}

                {(validationResult?.pythonError || validationResult?.runtimeError) && (
                  <div className="result-subsection">
                    <h4>{text.runtimeTitle}</h4>
                    <pre className="code-block">
                      <code>{validationResult.pythonError || validationResult.runtimeError}</code>
                    </pre>
                  </div>
                )}

                {validationResult && translatedErrors.length > 0 && (
                  <div className="result-subsection">
                    <h4>{text.errorsSection}</h4>
                    <ul className="challenge-list">
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
                      {validationResult.testResults.map((test, row) => (
                        <div
                          key={`${attemptCount}-${test.index}`}
                          className={`test-item ${test.passed ? 'passed' : 'failed'}`}
                          style={{ '--row': row }}
                        >
                          <span className="test-mark">
                            <PixelIcon name={test.passed ? 'check' : 'cross'} size={18} />
                          </span>
                          <span className="test-name">
                            Test {test.index + 1}: {test.passed ? text.testPassed : text.testFailed}
                          </span>
                          <code>
                            input: {JSON.stringify(test.input)} | expected: {JSON.stringify(test.expected)}
                            {test.actual !== undefined ? ` | actual: ${JSON.stringify(test.actual)}` : ''}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Window>

            <Window title={text.hintsSection} icon="bulb" style={{ '--zoom-delay': '0.2s' }}>
              {isHackerMode ? (
                <div className="empty-note">
                  <PixelIcon name="alert" size={28} />
                  <span>{text.noHintsInHacker}</span>
                </div>
              ) : revealedHints === 0 ? (
                <div className="empty-note">
                  <PixelIcon name="bulb" size={28} />
                  <span>{text.noHintsYet}</span>
                </div>
              ) : (
                <ol className="hint-list">
                  {dailyChallenge.localizedHints.slice(0, revealedHints).map((hint, index) => (
                    <li key={`${index}-${hint}`}>
                      <span className="hint-num">{index + 1}</span>
                      <span>{hint}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Window>
          </div>
        </>
      )}

      {showGiveUpConfirm && (
        <div className="modal-overlay" onClick={closeGiveUpConfirm}>
          <Window
            className="dialog"
            title={text.giveUpButton}
            titleAs="p"
            onClose={closeGiveUpConfirm}
            closeLabel={text.giveUpCancel}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="give-up-title"
            aria-describedby="give-up-text"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="alert-layout">
              <PixelIcon name="alert" size={48} />
              <div>
                <h3 id="give-up-title">{text.giveUpConfirmTitle}</h3>
                <p id="give-up-text">{text.giveUpConfirmText}</p>
              </div>
            </div>
            <div className="dialog-actions">
              <button className="secondary-button" onClick={closeGiveUpConfirm} autoFocus>
                {text.giveUpCancel}
              </button>
              <button className="secondary-button danger-button solid" onClick={handleGiveUp}>
                {text.giveUpConfirm}
              </button>
            </div>
          </Window>
        </div>
      )}

      {showResultModal && completed && (
        <div className="modal-overlay" onClick={closeResultModal}>
          <Window
            className="dialog result-dialog"
            title={text.modalTitle}
            titleAs="h2"
            titleId="result-title"
            onClose={closeResultModal}
            closeLabel={text.modalClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="result-day">CodeDaily #{dayNum}</p>
            <p className="result-meta">{resultMetaLine}</p>

            <div className="attempt-grid" role="img" aria-label={attemptsSummary}>
              {Array.from({ length: gridSlots }, (_, i) => {
                const isLast = i === attemptCount - 1;
                const state = i < attemptCount - 1 ? 'fail' : isLast && completed ? 'win' : '';
                return (
                  <span key={i} className={`attempt-cell ${state}`}>
                    {state === 'win' && <PixelIcon name="check" size={22} />}
                    {state === 'fail' && <PixelIcon name="cross" size={18} />}
                  </span>
                );
              })}
            </div>

            <p className="result-attempts">{attemptsSummary}</p>
            {streakLine && (
              <p className="result-streak">
                <PixelIcon name="flame" size={22} />
                {streakLine}
              </p>
            )}
            <p className="result-next">
              <PixelIcon name="clock" size={20} />
              {formatCountdown(msUntilNext, language)}
            </p>

            <div className="dialog-actions">
              <button className="secondary-button" onClick={closeResultModal}>
                {text.modalClose}
              </button>
              <button className="primary-button" onClick={handleShare} autoFocus aria-live="polite">
                {shareLabel(text.modalShare)}
              </button>
            </div>
          </Window>
        </div>
      )}
    </section>
  );
}

export default ChallengePlayer;

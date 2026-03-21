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

  // 🔥 CARGAR PROGRESO
  useEffect(() => {
    if (!baseChallenge) return;

    const progress = getTodayProgress();

    setCode(progress.code || baseChallenge.starterCode);
    setAttemptCount(progress.attempts || 0);
    setRevealedHints(progress.revealedHints || 0);
    setCompleted(progress.completed || false);
  }, [baseChallenge?.id]);

  // 🔥 GUARDAR CÓDIGO AUTOMÁTICO
  useEffect(() => {
    updateTodayProgress({ code });
  }, [code]);

  const handleValidate = () => {
    if (!baseChallenge || completed) return;

    const result = validateChallengeSolution(baseChallenge, code);

    setValidationResult(result);

    const newAttempts = attemptCount + 1;
    setAttemptCount(newAttempts);

    let newHints = revealedHints;

    if (!result.success) {
      newHints = Math.min(
        revealedHints + 1,
        dailyChallenge.localizedHints.length
      );
      setRevealedHints(newHints);
    } else {
      markTodayCompleted();
      setCompleted(true);
    }

    updateTodayProgress({
      attempts: newAttempts,
      revealedHints: newHints,
      completed: result.success,
      code,
    });
  };

  return (
    <section className="page-section">
      {!dailyChallenge ? (
        <div>No challenge</div>
      ) : (
        <>
          <div className="challenge-card">
            <h2>{dailyChallenge.localizedTitle}</h2>
            <p>{dailyChallenge.localizedDescription}</p>

            <pre className="code-block">
              <code>{dailyChallenge.starterCode}</code>
            </pre>
          </div>

          <div className="editor-card">
            <h2>Tu solución</h2>

            <textarea
              className="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={completed}
            />

            <div className="editor-actions">
              <button onClick={handleValidate} disabled={completed}>
                {completed ? 'Completado' : 'Comprobar'}
              </button>
            </div>

            <p>Intentos: {attemptCount}</p>
            <p>Pistas: {revealedHints}</p>

            {completed && <p style={{ color: 'lime' }}>✅ Reto completado</p>}

            {validationResult && !validationResult.success && (
              <p style={{ color: 'red' }}>❌ Fallo</p>
            )}

            <div>
              {dailyChallenge.localizedHints
                .slice(0, revealedHints)
                .map((h, i) => (
                  <p key={i}>💡 {h}</p>
                ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default DailyPage;
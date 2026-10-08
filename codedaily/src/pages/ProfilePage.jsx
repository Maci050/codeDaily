import { useMemo } from 'react';
import { getStats, getDayKey } from '../services/progressService';
import { useLanguage } from '../context/LanguageContext';
import Window from '../components/ui/Window';
import PixelIcon from '../components/ui/PixelIcon';

function ProfilePage({ onNavigate }) {
  const { language } = useLanguage();
  const stats = useMemo(() => getStats(), []);

  const text = useMemo(() => ({
    es: {
      title: 'Progreso',
      subtitle: 'Tu historial de retos completados.',
      streakTitle: 'Racha',
      streakCurrent: 'Racha actual',
      streakMax: 'Racha máxima',
      days: (n) => (n === 1 ? 'día' : 'días'),
      completedTitle: 'Completados',
      completedDays: 'Días con reto',
      normalCompleted: 'Modo Normal',
      hackerCompleted: 'Modo Hacker',
      langPython: 'Python',
      langJava: 'Java',
      modesTitle: 'Modos extra',
      modeGuessOutput: '¿Qué devuelve?',
      modeFindBug: 'Encuentra el bug',
      modeComplexity: '¿Cuál es la complejidad?',
      attemptsTitle: 'Distribución de intentos',
      noAttempts: 'Completa un reto para ver cuántos intentos sueles necesitar.',
      activityTitle: 'Actividad — últimos 60 días',
      noActivity: 'Aún no hay actividad registrada.',
      play: 'Jugar Daily Challenge',
      less: 'Menos',
      more: 'Más',
      challengesOn: (day, n) => `${day}: ${n} ${n === 1 ? 'reto' : 'retos'}`,
    },
    en: {
      title: 'Progress',
      subtitle: 'Your challenge completion history.',
      streakTitle: 'Streak',
      streakCurrent: 'Current streak',
      streakMax: 'Best streak',
      days: (n) => (n === 1 ? 'day' : 'days'),
      completedTitle: 'Completed',
      completedDays: 'Days with challenge',
      normalCompleted: 'Normal mode',
      hackerCompleted: 'Hacker mode',
      langPython: 'Python',
      langJava: 'Java',
      modesTitle: 'Extra modes',
      modeGuessOutput: 'What does it return?',
      modeFindBug: 'Find the bug',
      modeComplexity: "What's the complexity?",
      attemptsTitle: 'Attempts distribution',
      noAttempts: 'Complete a challenge to see how many attempts you usually need.',
      activityTitle: 'Activity — last 60 days',
      noActivity: 'No activity recorded yet.',
      play: 'Play Daily Challenge',
      less: 'Less',
      more: 'More',
      challengesOn: (day, n) => `${day}: ${n} ${n === 1 ? 'challenge' : 'challenges'}`,
    },
  }[language]), [language]);

  // Últimos 60 días para el mapa de actividad
  const last60Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 59; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      days.push(getDayKey(d));
    }
    return days;
  }, []);

  const totalExtra = stats.modeStats.guess_output + stats.modeStats.find_bug + stats.modeStats.guess_complexity;
  const maxBucket = Math.max(...Object.values(stats.attemptsDist), 1);
  const totalAttempts = Object.values(stats.attemptsDist).reduce((a, b) => a + b, 0);
  const hasActivity = Object.keys(stats.activityByDay).length > 0;
  const todayKey = getDayKey(new Date());

  const heatLevel = (count) => (count === 0 ? '' : count === 1 ? 'l1' : count <= 3 ? 'l2' : 'l3');

  return (
    <section className="page-section">
      <div className="page-head">
        <div className="page-head-text">
          <h1 className="page-title">{text.title}</h1>
          <p className="lede">{text.subtitle}</p>
        </div>
      </div>

      <div className="progress-grid">
        <Window className="span-5" title={text.streakTitle} icon="flame">
          <div className="streak-body">
            <p className="big-number">
              <strong>{stats.streak}</strong>
              <span>{text.days(stats.streak)}</span>
            </p>
            <p className="sr-only">{text.streakCurrent}</p>
            <table className="info-table">
              <tbody>
                <tr>
                  <th scope="row">{text.streakMax}</th>
                  <td>{stats.maxStreak} {text.days(stats.maxStreak)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Window>

        <Window className="span-7" title={text.completedTitle} icon="check" style={{ '--zoom-delay': '0.06s' }}>
          <table className="info-table">
            <tbody>
              <tr>
                <th scope="row">{text.completedDays}</th>
                <td>{stats.completedDays}</td>
              </tr>
              <tr>
                <th scope="row">{text.normalCompleted}</th>
                <td>{stats.normalCompleted}</td>
              </tr>
              <tr>
                <th scope="row">{text.hackerCompleted}</th>
                <td>{stats.hackerCompleted}</td>
              </tr>
              <tr>
                <th scope="row">{text.langPython}</th>
                <td>{stats.byLanguage.python}</td>
              </tr>
              <tr>
                <th scope="row">{text.langJava}</th>
                <td>{stats.byLanguage.java}</td>
              </tr>
            </tbody>
          </table>
        </Window>

        <Window className="span-7" title={text.attemptsTitle} icon="chart" style={{ '--zoom-delay': '0.12s' }}>
          {totalAttempts > 0 ? (
            <div className="bars">
              {Object.entries(stats.attemptsDist).map(([bucket, count]) => {
                const pct = (count / maxBucket) * 100;
                return (
                  <div key={bucket} className="bar-row">
                    <span>{bucket}</span>
                    <div className="bar-track" role="presentation">
                      <div
                        className={`bar-fill ${count === maxBucket ? 'lead' : ''} ${count === 0 ? 'empty' : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span>{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-note">
              <PixelIcon name="chart" size={28} />
              <span>{text.noAttempts}</span>
            </div>
          )}
        </Window>

        <Window className="span-5" title={text.modesTitle} icon="braces" style={{ '--zoom-delay': '0.18s' }}>
          <table className="info-table">
            <tbody>
              <tr>
                <th scope="row">{text.modeGuessOutput}</th>
                <td>{stats.modeStats.guess_output}</td>
              </tr>
              <tr>
                <th scope="row">{text.modeFindBug}</th>
                <td>{stats.modeStats.find_bug}</td>
              </tr>
              <tr>
                <th scope="row">{text.modeComplexity}</th>
                <td>{stats.modeStats.guess_complexity}</td>
              </tr>
              <tr className="total">
                <th scope="row">Total</th>
                <td>{totalExtra}</td>
              </tr>
            </tbody>
          </table>
        </Window>

        <Window className="span-12" title={text.activityTitle} icon="calendar" style={{ '--zoom-delay': '0.24s' }}>
          {hasActivity ? (
            <>
              <div className="heatmap">
                {last60Days.map((day) => {
                  const count = stats.activityByDay[day] || 0;
                  return (
                    <span
                      key={day}
                      className={`heat-cell ${heatLevel(count)} ${day === todayKey ? 'today' : ''}`}
                      title={text.challengesOn(day, count)}
                      aria-label={text.challengesOn(day, count)}
                      role="img"
                    />
                  );
                })}
              </div>
              <div className="heat-legend" aria-hidden="true">
                <span>{text.less}</span>
                <span className="heat-cell" />
                <span className="heat-cell l1" />
                <span className="heat-cell l2" />
                <span className="heat-cell l3" />
                <span>{text.more}</span>
              </div>
            </>
          ) : (
            <div className="button-row">
              <div className="empty-note">
                <PixelIcon name="calendar" size={28} />
                <span>{text.noActivity}</span>
              </div>
              <button className="primary-button" onClick={() => onNavigate?.('daily')}>
                {text.play}
              </button>
            </div>
          )}
        </Window>
      </div>
    </section>
  );
}

export default ProfilePage;

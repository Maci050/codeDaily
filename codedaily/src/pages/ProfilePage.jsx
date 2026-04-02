import { useEffect, useMemo, useState } from 'react';
import { getStats, getDayKey } from '../services/progressService';
import { useLanguage } from '../context/LanguageContext';

function ProfilePage() {
  const [stats, setStats] = useState(null);
  const { language } = useLanguage();

  useEffect(() => {
    setStats(getStats());
  }, []);

  const text = useMemo(() => ({
    es: {
      title: 'Progreso',
      subtitle: 'Tu historial de retos completados.',
      streakTitle: 'Racha',
      streakCurrent: 'Racha actual',
      streakMax: 'Racha máxima',
      completedTitle: 'Completados',
      completedDays: 'Días con reto',
      normalCompleted: 'Modo Normal',
      hackerCompleted: 'Modo Hacker',
      langTitle: 'Por lenguaje',
      langPython: 'Python',
      langJava: 'Java',
      modesTitle: 'Modos extra',
      modeGuessOutput: '¿Qué devuelve?',
      modeFindBug: 'Encuentra el bug',
      modeComplexity: '¿Cuál es la complejidad?',
      attemptsTitle: 'Distribución de intentos',
      attempt: 'intento',
      attempts: 'intentos',
      activityTitle: 'Actividad — últimos 60 días',
      noActivity: 'Aún no hay actividad registrada.',
      loading: 'Cargando...',
    },
    en: {
      title: 'Progress',
      subtitle: 'Your challenge completion history.',
      streakTitle: 'Streak',
      streakCurrent: 'Current streak',
      streakMax: 'Best streak',
      completedTitle: 'Completed',
      completedDays: 'Days with challenge',
      normalCompleted: 'Normal mode',
      hackerCompleted: 'Hacker mode',
      langTitle: 'By language',
      langPython: 'Python',
      langJava: 'Java',
      modesTitle: 'Extra modes',
      modeGuessOutput: 'What does it return?',
      modeFindBug: 'Find the bug',
      modeComplexity: "What's the complexity?",
      attemptsTitle: 'Attempts distribution',
      attempt: 'attempt',
      attempts: 'attempts',
      activityTitle: 'Activity — last 60 days',
      noActivity: 'No activity recorded yet.',
      loading: 'Loading...',
    },
  }[language]), [language]);

  // Genera los últimos 60 días para el calendario
  const last60Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(getDayKey(d));
    }
    return days;
  }, []);

  if (!stats) return (
    <section className="page-section">
      <div className="content-card"><p>{text?.loading}</p></div>
    </section>
  );

  const totalExtra = stats.modeStats.guess_output + stats.modeStats.find_bug + stats.modeStats.guess_complexity;
  const maxAttempts = Math.max(...Object.values(stats.attemptsDist), 1);
  const totalAttempts = Object.values(stats.attemptsDist).reduce((a, b) => a + b, 0);

  const sectionStyle = {
    marginTop: '32px',
  };

  const sectionTitleStyle = {
    fontFamily: 'var(--mono)',
    fontSize: '0.75rem',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '14px',
  };

  const statRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid var(--border-muted)',
    fontSize: '0.9rem',
  };

  return (
    <section className="page-section">
      <div className="content-card">
        <h1>{text.title}</h1>
        <p style={{ color: 'var(--muted)', marginTop: '4px' }}>{text.subtitle}</p>

        {/* Racha */}
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>{text.streakTitle}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '2.5rem', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>
                {stats.streak}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '6px', display: 'block' }}>
                🔥 {text.streakCurrent}
              </span>
            </div>
            <div className="stat-card" style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '2.5rem', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--cyan)', lineHeight: 1 }}>
                {stats.maxStreak}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '6px', display: 'block' }}>
                🏆 {text.streakMax}
              </span>
            </div>
          </div>
        </div>

        {/* Completados */}
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>{text.completedTitle}</p>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {[
              { label: text.completedDays, value: stats.completedDays, color: 'var(--text)' },
              { label: text.normalCompleted, value: stats.normalCompleted, color: 'var(--green)' },
              { label: text.hackerCompleted, value: stats.hackerCompleted, color: 'var(--red)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={statRowStyle}>
                <span style={{ color: 'var(--text-soft)', paddingLeft: '14px' }}>{label}</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color, paddingRight: '14px', fontSize: '1rem' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Por lenguaje */}
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>{text.langTitle}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: text.langPython, value: stats.byLanguage.python, icon: '🐍', color: 'var(--green)' },
              { label: text.langJava, value: stats.byLanguage.java, icon: '☕', color: 'var(--yellow)' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="stat-card" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                <span style={{ display: 'block', fontSize: '1.8rem', fontFamily: 'var(--mono)', fontWeight: 700, color, lineHeight: 1, marginTop: '6px' }}>
                  {value}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modos extra */}
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>{text.modesTitle}</p>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {[
              { label: text.modeGuessOutput, value: stats.modeStats.guess_output, color: 'var(--green)' },
              { label: text.modeFindBug, value: stats.modeStats.find_bug, color: 'var(--red)' },
              { label: text.modeComplexity, value: stats.modeStats.guess_complexity, color: 'var(--blue)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={statRowStyle}>
                <span style={{ color: 'var(--text-soft)', paddingLeft: '14px' }}>{label}</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color, paddingRight: '14px', fontSize: '1rem' }}>{value}</span>
              </div>
            ))}
            <div style={{ ...statRowStyle, borderBottom: 'none', opacity: 0.6 }}>
              <span style={{ color: 'var(--muted)', paddingLeft: '14px', fontSize: '0.85rem' }}>Total</span>
              <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text)', paddingRight: '14px' }}>{totalExtra}</span>
            </div>
          </div>
        </div>

        {/* Distribución de intentos */}
        {totalAttempts > 0 && (
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>{text.attemptsTitle}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(stats.attemptsDist).map(([bucket, count]) => {
                const pct = maxAttempts > 0 ? (count / maxAttempts) * 100 : 0;
                return (
                  <div key={bucket} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--muted)', width: '28px', textAlign: 'right', flexShrink: 0 }}>
                      {bucket}
                    </span>
                    <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 'var(--radius-sm)', height: '20px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: bucket === '1' ? 'var(--green)' : bucket === '2' ? 'var(--cyan)' : bucket === '3' ? 'var(--yellow)' : 'var(--red)',
                        transition: 'width 0.4s ease',
                        minWidth: count > 0 ? '4px' : '0',
                      }} />
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text)', width: '20px', flexShrink: 0 }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Calendario de actividad */}
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>{text.activityTitle}</p>
          {Object.keys(stats.activityByDay).length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{text.noActivity}</p>
          ) : (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
            }}>
              {last60Days.map((day) => {
                const count = stats.activityByDay[day] || 0;
                const opacity = count === 0 ? 0.25 : count === 1 ? 0.45 : count <= 3 ? 0.75 : 1;
                return (
                  <div
                    key={day}
                    title={`${day}: ${count}`}
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '3px',
                      background: count === 0 ? 'var(--border)' : 'var(--green)',
                      opacity,
                      transition: '0.2s ease',
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

export default ProfilePage;
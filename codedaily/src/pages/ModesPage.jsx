import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import GuessOutputPlayer from '../components/challenge/GuessOutputPlayer';
import FindBugPlayer from '../components/challenge/FindBugPlayer';
import GuessComplexityPlayer from '../components/challenge/GuessComplexityPlayer';
import { getDaySeed } from '../services/challengeService';

const ARCHIVE_START_DATE = '2026-03-22';

function ModesPage() {
  const { language } = useLanguage();
  const [activeMode, setActiveMode] = useState('guess_output');
  const [selectedDate, setSelectedDate] = useState(getDaySeed(new Date()));

  const text = {
    es: {
      title: 'Modos de juego',
      subtitle: 'Pon a prueba tus habilidades de otra forma.',
      guessOutput: '¿Qué devuelve?',
      guessOutputDesc: 'Lee el código y predice el valor de retorno.',
      comingSoon: 'Próximamente',
      findBug: 'Encuentra el bug',
      findBugDesc: 'Detecta y corrige el error en el código.',
      guessComplexity: '¿Cuál es la complejidad?',
      guessComplexityDesc: 'Analiza el algoritmo y elige su complejidad temporal.',
    },
    en: {
      title: 'Game Modes',
      subtitle: 'Test your skills in a different way.',
      guessOutput: 'What does it return?',
      guessOutputDesc: 'Read the code and predict the return value.',
      comingSoon: 'Coming soon',
      findBug: 'Find the bug',
      findBugDesc: 'Detect and fix the error in the code.',
      guessComplexity: "What's the complexity?",
      guessComplexityDesc: 'Analyze the algorithm and choose its time complexity.',
    },
  }[language];

  return (
    <section className="page-section">
      {/* Selector de modo */}
      <div className="content-card">
        <h1>{text.title}</h1>
        <p style={{ color: 'var(--muted)', marginTop: '4px' }}>{text.subtitle}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '24px' }}>
          {/* Modo 1 — activo */}
          <button
            onClick={() => setActiveMode('guess_output')}
            style={{
              background: activeMode === 'guess_output' ? 'var(--primary-soft)' : 'var(--bg)',
              border: `1px solid ${activeMode === 'guess_output' ? 'rgba(63,185,80,0.3)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: '0.15s ease',
            }}
          >
            <div style={{ fontFamily: 'var(--mono)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: '6px' }}>
              {'{ }'}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{text.guessOutput}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: '4px' }}>{text.guessOutputDesc}</div>
          </button>

          {/* Modo 2 — activo */}
          <button
            onClick={() => setActiveMode('find_bug')}
            style={{
              background: activeMode === 'find_bug' ? 'var(--red-soft)' : 'var(--bg)',
              border: `1px solid ${activeMode === 'find_bug' ? 'rgba(227,65,65,0.3)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: '0.15s ease',
            }}
          >
            <div style={{ fontFamily: 'var(--mono)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: '6px' }}>🐛</div>
            <div style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{text.findBug}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: '4px' }}>{text.findBugDesc}</div>
          </button>

          {/* Modo 3 — activo */}
          <button
            onClick={() => setActiveMode('guess_complexity')}
            style={{
              background: activeMode === 'guess_complexity' ? 'var(--blue-soft)' : 'var(--bg)',
              border: '1px solid ' + (activeMode === 'guess_complexity' ? 'rgba(88,166,255,0.3)' : 'var(--border)'),
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: '0.15s ease',
            }}
          >
            <div style={{ fontFamily: 'var(--mono)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: '6px' }}>⏱</div>
            <div style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{text.guessComplexity}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: '4px' }}>{text.guessComplexityDesc}</div>
          </button>
        </div>
      </div>

      {/* Contenido del modo activo */}
      {activeMode === 'guess_complexity' && (
        <GuessComplexityPlayer selectedDate={selectedDate} />
      )}

      {activeMode === 'find_bug' && (
        <FindBugPlayer
          selectedDate={selectedDate}
          allowDateSelection={false}
        />
      )}

      {activeMode === 'guess_output' && (
        <GuessOutputPlayer
          selectedDate={selectedDate}
          allowDateSelection={false}
          onDateChange={(d) => {
            if (d >= ARCHIVE_START_DATE) setSelectedDate(d);
          }}
          minSelectableDate={ARCHIVE_START_DATE}
        />
      )}
    </section>
  );
}

export default ModesPage;
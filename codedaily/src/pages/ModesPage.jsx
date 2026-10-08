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
      findBug: 'Find the bug',
      findBugDesc: 'Detect and fix the error in the code.',
      guessComplexity: "What's the complexity?",
      guessComplexityDesc: 'Analyze the algorithm and choose its time complexity.',
    },
  }[language];

  const modes = [
    { id: 'guess_output', icon: '{ }', accent: 'green', title: text.guessOutput, desc: text.guessOutputDesc },
    { id: 'find_bug', icon: '🐛', accent: 'red', title: text.findBug, desc: text.findBugDesc },
    { id: 'guess_complexity', icon: '⏱', accent: 'blue', title: text.guessComplexity, desc: text.guessComplexityDesc },
  ];

  return (
    <section className="page-section">
      {/* Selector de modo */}
      <div className="content-card">
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>

        <div className="mode-picker">
          {modes.map((mode) => (
            <button
              key={mode.id}
              className={`mode-tile accent-${mode.accent}`}
              aria-pressed={activeMode === mode.id}
              onClick={() => setActiveMode(mode.id)}
            >
              <span className="mode-tile-icon" aria-hidden="true">{mode.icon}</span>
              <span className="mode-tile-title">{mode.title}</span>
              <span className="mode-tile-desc">{mode.desc}</span>
            </button>
          ))}
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
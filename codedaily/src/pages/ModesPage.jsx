import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import GuessOutputPlayer from '../components/challenge/GuessOutputPlayer';
import FindBugPlayer from '../components/challenge/FindBugPlayer';
import GuessComplexityPlayer from '../components/challenge/GuessComplexityPlayer';
import PixelIcon from '../components/ui/PixelIcon';
import { getDaySeed } from '../services/challengeService';
import { ARCHIVE_START_DATE } from '../router';

const MODE_IDS = ['guess_output', 'find_bug', 'guess_complexity'];

function ModesPage({ initialMode = null, onModeChange }) {
  const { language } = useLanguage();
  const [activeMode, setActiveMode] = useState(MODE_IDS.includes(initialMode) ? initialMode : 'guess_output');
  const [selectedDate, setSelectedDate] = useState(getDaySeed(new Date()));

  const text = {
    es: {
      title: 'Modos de juego',
      subtitle: 'Pon a prueba tus habilidades de otra forma.',
      pickerLabel: 'Elige un modo',
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
      pickerLabel: 'Choose a mode',
      guessOutput: 'What does it return?',
      guessOutputDesc: 'Read the code and predict the return value.',
      findBug: 'Find the bug',
      findBugDesc: 'Detect and fix the error in the code.',
      guessComplexity: "What's the complexity?",
      guessComplexityDesc: 'Analyze the algorithm and choose its time complexity.',
    },
  }[language];

  const modes = [
    { id: 'guess_output', icon: 'braces', title: text.guessOutput, desc: text.guessOutputDesc },
    { id: 'find_bug', icon: 'bug', title: text.findBug, desc: text.findBugDesc },
    { id: 'guess_complexity', icon: 'clock', title: text.guessComplexity, desc: text.guessComplexityDesc },
  ];

  return (
    <section className="page-section">
      <div className="page-head">
        <div className="page-head-text">
          <h1 className="page-title">{text.title}</h1>
          <p className="lede">{text.subtitle}</p>
        </div>

        <div className="mode-desk" role="group" aria-label={text.pickerLabel}>
          {modes.map((mode) => (
            <button
              key={mode.id}
              className="desk-icon"
              aria-pressed={activeMode === mode.id}
              onClick={() => {
                setActiveMode(mode.id);
                onModeChange?.(mode.id);
              }}
            >
              <PixelIcon name={mode.icon} size={48} />
              <span className="desk-icon-label">{mode.title}</span>
              <span className="desk-icon-desc">{mode.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* La key remonta el reproductor para que sus ventanas se abran con zoom al cambiar de modo */}
      <div key={activeMode}>
        {activeMode === 'guess_complexity' && <GuessComplexityPlayer selectedDate={selectedDate} />}

        {activeMode === 'find_bug' && <FindBugPlayer selectedDate={selectedDate} allowDateSelection={false} />}

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
      </div>
    </section>
  );
}

export default ModesPage;

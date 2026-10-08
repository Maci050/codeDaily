import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useEscapeKey } from '../hooks/useEscapeKey';

function HowToPlayModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const [tab, setTab] = useState('daily');
  const cardRef = useRef(null);

  useEscapeKey(isOpen, onClose);

  // Focus the dialog itself so its title stays in view on small screens
  useEffect(() => {
    if (isOpen) cardRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  if (!isOpen) return null;

  const text = {
    es: {
      title: 'Cómo jugar',
      tabDaily: 'Daily',
      tabModes: 'Modos extra',

      dailyIntro: 'Cada día hay un reto nuevo, igual para todo el mundo. Puedes resolverlo en Python o Java.',
      dailySteps: [
        'Elige dificultad (Novato, Intermedio o Pro) y lenguaje (Python o Java).',
        'Lee el enunciado y las restricciones del reto.',
        'Escribe la función `solve(...)` en el editor.',
        'Pulsa "Comprobar" para validar con ejecución real.',
        'Si fallas, se desbloquean pistas progresivas.',
        'Tienes intentos ilimitados en modo Normal, 3 en modo Hacker.',
      ],
      dailyExampleTitle: 'Ejemplo Python:',
      dailyExample: 'def solve(a, b):\n    return a + b',
      dailyExampleJava: 'class Solution {\n    public static int solve(int a, int b) {\n        return a + b;\n    }\n}',
      dailyExampleJavaTitle: 'Ejemplo Java:',

      modesIntro: 'En la sección "Modos" encontrarás tres formas adicionales de practicar:',
      mode1Title: '{ } ¿Qué devuelve?',
      mode1Desc: 'Lee el código y predice el valor exacto que devuelve para la entrada dada. Tienes 3 intentos. La solución solo se revela al agotar los intentos.',
      mode2Title: '🐛 Encuentra el bug',
      mode2Desc: 'El código tiene un error. Corrígelo para que todos los tests pasen. Se desbloquean pistas progresivas al fallar. Tienes 3 intentos.',
      mode3Title: '⏱ ¿Cuál es la complejidad?',
      mode3Desc: 'Elige la complejidad temporal correcta en notación Big O entre 4 opciones. Las opciones incorrectas se deshabilitan. Tienes 2 intentos.',

      close: 'Cerrar',
    },
    en: {
      title: 'How to play',
      tabDaily: 'Daily',
      tabModes: 'Extra modes',

      dailyIntro: 'Every day there is a new challenge, the same for everyone. You can solve it in Python or Java.',
      dailySteps: [
        'Choose difficulty (Beginner, Intermediate or Pro) and language (Python or Java).',
        'Read the challenge description and restrictions.',
        'Write the `solve(...)` function in the editor.',
        'Click "Check" to validate with real execution.',
        'If you fail, progressive hints are unlocked.',
        'Unlimited attempts in Normal mode, 3 in Hacker mode.',
      ],
      dailyExampleTitle: 'Python example:',
      dailyExample: 'def solve(a, b):\n    return a + b',
      dailyExampleJavaTitle: 'Java example:',
      dailyExampleJava: 'class Solution {\n    public static int solve(int a, int b) {\n        return a + b;\n    }\n}',

      modesIntro: 'In the "Modes" section you will find three additional ways to practice:',
      mode1Title: '{ } What does it return?',
      mode1Desc: 'Read the code and predict the exact return value for the given input. You have 3 attempts. The solution is only revealed after all attempts are used.',
      mode2Title: '🐛 Find the bug',
      mode2Desc: 'The code has an error. Fix it so all tests pass. Progressive hints unlock on failure. You have 3 attempts.',
      mode3Title: '⏱ What is the complexity?',
      mode3Desc: 'Choose the correct time complexity in Big O notation from 4 options. Wrong options are disabled. You have 2 attempts.',

      close: 'Close',
    },
  }[language];

  const modes = [
    { title: text.mode1Title, desc: text.mode1Desc, accent: 'green' },
    { title: text.mode2Title, desc: text.mode2Desc, accent: 'red' },
    { title: text.mode3Title, desc: text.mode3Desc, accent: 'blue' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={cardRef}
        tabIndex={-1}
        className="modal-card tutorial-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-to-play-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="how-to-play-title">{text.title}</h2>

        <div className="mode-switch-buttons tutorial-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'daily'}
            className={`mode-button ${tab === 'daily' ? 'active' : ''}`}
            onClick={() => setTab('daily')}
          >
            {text.tabDaily}
          </button>
          <button
            role="tab"
            aria-selected={tab === 'modes'}
            className={`mode-button ${tab === 'modes' ? 'active' : ''}`}
            onClick={() => setTab('modes')}
          >
            {text.tabModes}
          </button>
        </div>

        {tab === 'daily' && (
          <div role="tabpanel">
            <p className="tutorial-intro">{text.dailyIntro}</p>
            <ol className="tutorial-steps">
              {text.dailySteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <p className="tutorial-label">{text.dailyExampleTitle}</p>
            <pre className="code-block" style={{ marginBottom: '12px' }}>
              <code>{text.dailyExample}</code>
            </pre>

            <p className="tutorial-label">{text.dailyExampleJavaTitle}</p>
            <pre className="code-block" style={{ marginBottom: '20px' }}>
              <code>{text.dailyExampleJava}</code>
            </pre>
          </div>
        )}

        {tab === 'modes' && (
          <div role="tabpanel">
            <p className="tutorial-intro">{text.modesIntro}</p>

            {modes.map((mode) => (
              <div key={mode.title} className={`tutorial-mode accent-${mode.accent}`}>
                <h3>{mode.title}</h3>
                <p>{mode.desc}</p>
              </div>
            ))}
          </div>
        )}

        <button className="primary-button" onClick={onClose}>
          {text.close}
        </button>
      </div>
    </div>
  );
}

export default HowToPlayModal;
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

function HowToPlayModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const [tab, setTab] = useState('daily');

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

  const tabStyle = (isActive) => ({
    padding: '8px 16px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: isActive ? 'var(--primary-soft)' : 'transparent',
    color: isActive ? 'var(--green)' : 'var(--muted)',
    fontFamily: 'var(--mono)',
    fontSize: '0.85rem',
    fontWeight: isActive ? 600 : 400,
    cursor: 'pointer',
    transition: '0.15s ease',
  });

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ width: 'min(600px, 92%)', maxHeight: '85vh', overflowY: 'auto' }}>
        <h2>{text.title}</h2>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '3px',
          margin: '16px 0',
        }}>
          <button style={tabStyle(tab === 'daily')} onClick={() => setTab('daily')}>{text.tabDaily}</button>
          <button style={tabStyle(tab === 'modes')} onClick={() => setTab('modes')}>{text.tabModes}</button>
        </div>

        {/* Tab Daily */}
        {tab === 'daily' && (
          <>
            <p style={{ color: 'var(--text-soft)', marginBottom: '16px' }}>{text.dailyIntro}</p>
            <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: '20px' }}>
              {text.dailySteps.map((step, i) => (
                <li key={i} style={{
                  padding: '8px 0 8px 20px',
                  position: 'relative',
                  borderBottom: '1px solid var(--border-muted)',
                  color: 'var(--text-soft)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                }}>
                  <span style={{
                    position: 'absolute', left: 0,
                    color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '0.85rem',
                  }}>{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>

            <p style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--muted-strong)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              {text.dailyExampleTitle}
            </p>
            <pre className="code-block" style={{ marginBottom: '12px' }}>
              <code>{text.dailyExample}</code>
            </pre>

            <p style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--muted-strong)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              {text.dailyExampleJavaTitle}
            </p>
            <pre className="code-block" style={{ marginBottom: '20px' }}>
              <code>{text.dailyExampleJava}</code>
            </pre>
          </>
        )}

        {/* Tab Modos */}
        {tab === 'modes' && (
          <>
            <p style={{ color: 'var(--text-soft)', marginBottom: '16px' }}>{text.modesIntro}</p>

            {[
              { title: text.mode1Title, desc: text.mode1Desc, color: 'var(--green)', bg: 'var(--green-dim)', border: 'rgba(63,185,80,0.2)' },
              { title: text.mode2Title, desc: text.mode2Desc, color: 'var(--red)', bg: 'var(--red-soft)', border: 'rgba(255,123,114,0.2)' },
              { title: text.mode3Title, desc: text.mode3Desc, color: 'var(--blue)', bg: 'var(--blue-soft)', border: 'rgba(88,166,255,0.2)' },
            ].map((mode) => (
              <div key={mode.title} style={{
                background: mode.bg,
                border: `1px solid ${mode.border}`,
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                marginBottom: '12px',
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: mode.color, marginBottom: '6px', fontSize: '0.9rem' }}>
                  {mode.title}
                </div>
                <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  {mode.desc}
                </p>
              </div>
            ))}
          </>
        )}

        <button className="primary-button" onClick={onClose} style={{ width: '100%', marginTop: '8px' }}>
          {text.close}
        </button>
      </div>
    </div>
  );
}

export default HowToPlayModal;
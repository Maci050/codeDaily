import { useLanguage } from '../context/LanguageContext';

function HowToPlayModal({ isOpen, onClose }) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const text = {
    es: {
      title: 'Cómo jugar',
      intro: 'Resuelve el reto diario escribiendo una función en Python.',
      steps: [
        '1. Lee el enunciado y las restricciones.',
        '2. Escribe la función solve(...) correctamente.',
        '3. Pulsa "Comprobar" para validar tu código.',
        '4. Si fallas, recibirás pistas progresivas.',
      ],
      exampleTitle: 'Ejemplo:',
      example: `def solve(a, b):
    return a + b`,
      close: 'Cerrar',
    },
    en: {
      title: 'How to play',
      intro: 'Solve the daily challenge by writing a Python function.',
      steps: [
        '1. Read the description and constraints.',
        '2. Write the solve(...) function.',
        '3. Click "Check" to validate your code.',
        '4. If you fail, you will get hints.',
      ],
      exampleTitle: 'Example:',
      example: `def solve(a, b):
    return a + b`,
      close: 'Close',
    },
  }[language];

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>{text.title}</h2>
        <p>{text.intro}</p>

        <ul>
          {text.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>

        <h3>{text.exampleTitle}</h3>
        <pre className="code-block">
          <code>{text.example}</code>
        </pre>

        <button className="primary-button" onClick={onClose}>
          {text.close}
        </button>
      </div>
    </div>
  );
}

export default HowToPlayModal;
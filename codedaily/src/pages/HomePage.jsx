import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

function HomePage({ onNavigate }) {
  const { language } = useLanguage();

  const text = useMemo(() => {
    return {
      es: {
        badge: 'Retos diarios de programación',
        title: 'Mejora programando un reto corto cada día',
        description:
          'CodeDaily es un juego web de desafíos de programación centrado en funciones cortas, validación automática y progreso local. Resuelve el reto diario en Python o Java.',
        primaryButton: 'Jugar Daily Challenge',
        card1Title: 'Un reto al día',
        card1Text:
          'Cada día habrá un único reto elegido de forma determinista según la fecha, igual para todo el mundo.',
        card2Title: 'Dificultades',
        card2Text:
          'Novato, Intermedio y Pro. El mismo reto disponible en Python y Java.',
        card3Title: 'Validación',
        card3Text:
          'Las soluciones se comprueban con ejecución real: Python en el navegador con Pyodide, Java vía Judge0.',
        card4Title: 'Idiomas',
        card4Text:
          'El contenido del reto puede mostrarse en español o en inglés, manteniendo la misma solución.',
      },
      en: {
        badge: 'Daily programming challenges',
        title: 'Improve by solving one short coding challenge every day',
        description:
          'CodeDaily is a web game built around short programming challenges, automatic validation, and local progress tracking. Solve the daily challenge in Python or Java.',
        primaryButton: 'Play Daily Challenge',
        card1Title: 'One challenge a day',
        card1Text:
          'Each day there is a single challenge chosen deterministically from the date, the same for everyone.',
        card2Title: 'Difficulties',
        card2Text:
          'Beginner, Intermediate, and Pro. The same challenge available in Python and Java.',
        card3Title: 'Validation',
        card3Text:
          'Solutions are checked with real execution: Python in the browser via Pyodide, Java via Judge0.',
        card4Title: 'Languages',
        card4Text:
          'Challenge content can be shown in Spanish or English while keeping the same solution.',
      },
    }[language];
  }, [language]);

  return (
    <section className="page-section">
      <div className="hero-card">
        <span className="hero-badge">{text.badge}</span>
        <h1 className="hero-title">{text.title}</h1>
        <p className="hero-description">{text.description}</p>

        <div className="hero-actions">
          <button className="primary-button" onClick={() => onNavigate('daily')}>
            {text.primaryButton}
          </button>
        </div>
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <h2>{text.card1Title}</h2>
          <p>{text.card1Text}</p>
        </article>

        <article className="feature-card">
          <h2>{text.card2Title}</h2>
          <p>{text.card2Text}</p>
        </article>

        <article className="feature-card">
          <h2>{text.card3Title}</h2>
          <p>{text.card3Text}</p>
        </article>

        <article className="feature-card">
          <h2>{text.card4Title}</h2>
          <p>{text.card4Text}</p>
        </article>
      </div>
    </section>
  );
}

export default HomePage;
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
          'CodeDaily es un juego web de desafíos de programación centrado en funciones cortas, validación automática y progreso local. En esta primera versión empezaremos solo con Python.',
        primaryButton: 'Jugar Daily Challenge',
        secondaryButton: 'Ir a Unlimited',
        card1Title: 'Daily Challenge',
        card1Text:
          'Un reto diario elegido de forma determinista según la fecha, igual para todo el mundo.',
        card2Title: 'Unlimited',
        card2Text:
          'Práctica libre con retos aleatorios del banco disponible.',
        card3Title: 'Dificultades',
        card3Text:
          'Novato, Intermedio y Pro, con base preparada para crecer más adelante.',
        card4Title: 'Idiomas',
        card4Text:
          'El contenido del reto podrá mostrarse en español o en inglés, manteniendo la misma solución.',
      },
      en: {
        badge: 'Daily programming challenges',
        title: 'Improve by solving one short coding challenge every day',
        description:
          'CodeDaily is a web game built around short programming challenges, automatic validation, and local progress tracking. In this first version we will focus only on Python.',
        primaryButton: 'Play Daily Challenge',
        secondaryButton: 'Go to Unlimited',
        card1Title: 'Daily Challenge',
        card1Text:
          'One daily challenge chosen deterministically from the date, the same for everyone.',
        card2Title: 'Unlimited',
        card2Text:
          'Free practice with random challenges from the available pool.',
        card3Title: 'Difficulties',
        card3Text:
          'Beginner, Intermediate, and Pro, with a base ready to grow later.',
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
          <button className="secondary-button" onClick={() => onNavigate('unlimited')}>
            {text.secondaryButton}
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
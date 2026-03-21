import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

function ProfilePage() {
  const { language } = useLanguage();

  const text = useMemo(() => {
    return {
      es: {
        title: 'Progreso',
        subtitle:
          'Aquí mostraremos la racha diaria, retos completados y otros datos guardados en local storage.',
        cardTitle: 'Próximamente',
        cardText:
          'En una fase posterior añadiremos persistencia local real y estadísticas básicas del jugador.',
      },
      en: {
        title: 'Progress',
        subtitle:
          'This page will show daily streak, completed challenges, and other data stored in local storage.',
        cardTitle: 'Coming soon',
        cardText:
          'In a later step we will add real local persistence and basic player stats.',
      },
    }[language];
  }, [language]);

  return (
    <section className="page-section">
      <div className="content-card">
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>

        <div className="status-box">
          <h2>{text.cardTitle}</h2>
          <p>{text.cardText}</p>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
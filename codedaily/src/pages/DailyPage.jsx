import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

function DailyPage() {
  const { language } = useLanguage();

  const text = useMemo(() => {
    return {
      es: {
        title: 'Daily Challenge',
        subtitle:
          'Aquí mostraremos el reto diario. En el siguiente paso conectaremos el sistema de retos y la selección por fecha.',
        statusTitle: 'Estado actual',
        statusText:
          'Pantalla base preparada. Ya soporta cambio de idioma para el contenido textual.',
      },
      en: {
        title: 'Daily Challenge',
        subtitle:
          'The daily challenge will appear here. In the next step we will connect the challenge system and date-based selection.',
        statusTitle: 'Current status',
        statusText:
          'Base page ready. It already supports language switching for text content.',
      },
    }[language];
  }, [language]);

  return (
    <section className="page-section">
      <div className="content-card">
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>

        <div className="status-box">
          <h2>{text.statusTitle}</h2>
          <p>{text.statusText}</p>
        </div>
      </div>
    </section>
  );
}

export default DailyPage;
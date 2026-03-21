import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

function UnlimitedPage() {
  const { language } = useLanguage();

  const text = useMemo(() => {
    return {
      es: {
        title: 'Unlimited',
        subtitle:
          'Aquí aparecerán retos aleatorios del banco de ejercicios. Lo conectaremos en el siguiente paso.',
        infoTitle: 'Pensado para crecer',
        infoText:
          'Más adelante podremos añadir filtros por dificultad, lenguaje y tipo de reto.',
      },
      en: {
        title: 'Unlimited',
        subtitle:
          'Random challenges from the challenge pool will appear here. We will connect it in the next step.',
        infoTitle: 'Built to grow',
        infoText:
          'Later we can add filters by difficulty, language, and challenge type.',
      },
    }[language];
  }, [language]);

  return (
    <section className="page-section">
      <div className="content-card">
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>

        <div className="status-box">
          <h2>{text.infoTitle}</h2>
          <p>{text.infoText}</p>
        </div>
      </div>
    </section>
  );
}

export default UnlimitedPage;
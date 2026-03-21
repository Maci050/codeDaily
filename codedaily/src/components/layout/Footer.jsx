import { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';

function Footer() {
  const { language } = useLanguage();

  const text = useMemo(() => {
    return {
      es: {
        line: 'Primera versión del juego web de retos diarios de programación.',
      },
      en: {
        line: 'First version of the daily programming challenge web game.',
      },
    }[language];
  }, [language]);

  return (
    <footer className="site-footer">
      <div className="page-container footer-inner">
        <p>{text.line}</p>
      </div>
    </footer>
  );
}

export default Footer;
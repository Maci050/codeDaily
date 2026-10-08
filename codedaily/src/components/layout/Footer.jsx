import { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';

function Footer() {
  const { language } = useLanguage();

  const text = useMemo(() => ({
    es: {
      line: 'Juego web de retos diarios de programación.',
      support: 'Si te gusta el proyecto, puedes apoyarlo:',
      buyMeCoffee: 'Invítame a un café',
    },
    en: {
      line: 'Daily programming challenge web game.',
      support: 'If you enjoy the project, you can support it:',
      buyMeCoffee: 'Buy me a coffee',
    },
  }[language]), [language]);

  return (
    <footer className="site-footer">
      <div className="page-container footer-inner">
        <p>{text.line}</p>
        <div className="footer-support">
          <span>{text.support}</span>
          <a
            className="support-link"
            href="https://ko-fi.com/codedaily"
            target="_blank"
            rel="noopener noreferrer"
          >
            {text.buyMeCoffee}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

import { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';

function Footer() {
  const { language } = useLanguage();

  const text = useMemo(() => ({
    es: {
      line: 'Juego web de retos diarios de programación.',
      support: 'Si te gusta el proyecto, puedes apoyarlo:',
      buyMeCoffee: '☕ Invítame a un café',
    },
    en: {
      line: 'Daily programming challenge web game.',
      support: 'If you enjoy the project, you can support it:',
      buyMeCoffee: '☕ Buy me a coffee',
    },
  }[language]), [language]);

  return (
    <footer className="site-footer">
      <div className="page-container footer-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ margin: 0 }}>{text.line}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{text.support}</span>
          <a
            href="https://ko-fi.com/codedaily"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.8rem',
              color: 'var(--text)',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '5px 12px',
              textDecoration: 'none',
              transition: '0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(63,185,80,0.4)';
              e.currentTarget.style.color = 'var(--green)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
          >
            {text.buyMeCoffee}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
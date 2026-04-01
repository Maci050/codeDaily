import { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';

function Header({ appName, currentPage, onNavigate, onOpenTutorial }) {
  const { language, setLanguage } = useLanguage();

  const text = useMemo(() => {
    return {
      es: {
        navHome: 'Inicio',
        navDaily: 'Daily Challenge',
        navArchive: 'Archivo',
        navProfile: 'Progreso',
        navModes: 'Modos',
        language: 'Idioma',
      },
      en: {
        navHome: 'Home',
        navDaily: 'Daily Challenge',
        navArchive: 'Archive',
        navProfile: 'Progress',
        navModes: 'Modes',
        language: 'Language',
      },
    }[language];
  }, [language]);

  const navItems = [
    { id: 'home', label: text.navHome },
    { id: 'daily', label: text.navDaily },
    { id: 'archive', label: text.navArchive },
    { id: 'profile', label: text.navProfile },
    { id: 'modes', label: text.navModes },
  ];

  return (
    <header className="site-header">
      <div className="page-container header-inner">
        <button className="brand-button" onClick={() => onNavigate('home')}>
          <span className="brand-mark">&lt;/&gt;</span>
          <span className="brand-name">{appName}</span>
        </button>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="language-switcher">
          <span className="language-label">{text.language}</span>

          <div className="language-buttons">
            <button
              className={`lang-button ${language === 'es' ? 'active' : ''}`}
              onClick={() => setLanguage('es')}
            >
              ES
            </button>
            <button
              className={`lang-button ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
          </div>

          <button
            className="lang-button"
            onClick={onOpenTutorial}
            title={language === 'es' ? 'Cómo jugar' : 'How to play'}
            style={{ minWidth: '36px' }}
          >
            ?
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
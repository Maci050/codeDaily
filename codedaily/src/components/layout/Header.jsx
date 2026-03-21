import { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';

function Header({ appName, currentPage, onNavigate }) {
  const { language, setLanguage } = useLanguage();

  const text = useMemo(() => {
    return {
      es: {
        navHome: 'Inicio',
        navDaily: 'Daily Challenge',
        navUnlimited: 'Unlimited',
        navProfile: 'Progreso',
        language: 'Idioma',
      },
      en: {
        navHome: 'Home',
        navDaily: 'Daily Challenge',
        navUnlimited: 'Unlimited',
        navProfile: 'Progress',
        language: 'Language',
      },
    }[language];
  }, [language]);

  const navItems = [
    { id: 'home', label: text.navHome },
    { id: 'daily', label: text.navDaily },
    { id: 'unlimited', label: text.navUnlimited },
    { id: 'profile', label: text.navProfile },
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
        </div>
      </div>
    </header>
  );
}

export default Header;
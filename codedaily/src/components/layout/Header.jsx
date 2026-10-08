import { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import PixelIcon from '../ui/PixelIcon';
import { buildPath, isPlainLeftClick } from '../../router';

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
        mainNav: 'Navegación principal',
        help: 'Cómo jugar',
      },
      en: {
        navHome: 'Home',
        navDaily: 'Daily Challenge',
        navArchive: 'Archive',
        navProfile: 'Progress',
        navModes: 'Modes',
        language: 'Language',
        mainNav: 'Main navigation',
        help: 'How to play',
      },
    }[language];
  }, [language]);

  // Enlaces reales: Ctrl/Cmd+clic abre en pestaña nueva; el clic normal navega sin recargar
  const linkProps = (page) => ({
    href: buildPath({ page }),
    onClick: (event) => {
      if (!isPlainLeftClick(event)) return;
      event.preventDefault();
      onNavigate(page);
    },
  });

  const navItems = [
    { id: 'home', label: text.navHome },
    { id: 'daily', label: text.navDaily },
    { id: 'archive', label: text.navArchive },
    { id: 'profile', label: text.navProfile },
    { id: 'modes', label: text.navModes },
  ];

  return (
    <header className="menubar">
      <div className="page-container menubar-inner">
        <a className="menubar-brand" {...linkProps('home')}>
          <PixelIcon name="computer" size={26} />
          <span>{appName}</span>
        </a>

        <nav className="menubar-nav" aria-label={text.mainNav}>
          {navItems.map((item) => (
            <a
              key={item.id}
              className="menu-item"
              aria-current={currentPage === item.id ? 'page' : undefined}
              {...linkProps(item.id)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="menubar-tools">
          <div className="toggle-group" role="group" aria-label={text.language}>
            <button aria-pressed={language === 'es'} lang="es" title="Español" onClick={() => setLanguage('es')}>
              ES
            </button>
            <button aria-pressed={language === 'en'} lang="en" title="English" onClick={() => setLanguage('en')}>
              EN
            </button>
          </div>

          <button className="icon-button" onClick={onOpenTutorial} title={text.help} aria-label={text.help}>
            ?
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

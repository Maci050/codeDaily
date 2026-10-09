import { lazy, Suspense, useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import { useLanguage } from './context/LanguageContext';
import HowToPlayModal from './components/HowToPlayModal';
import PageErrorBoundary from './components/ui/PageErrorBoundary';
import { shouldShowTutorial, markTutorialSeen } from './services/uiService';
import { buildPath, parsePath } from './router';

// La portada va en el paquete inicial; el resto de páginas se descarga al visitarlas
const DailyPage = lazy(() => import('./pages/DailyPage'));
const ArchivePage = lazy(() => import('./pages/ArchivePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ModesPage = lazy(() => import('./pages/ModesPage'));
const WeeklyPage = lazy(() => import('./pages/WeeklyPage'));

const SITE_ORIGIN = 'https://codedaily-nu.vercel.app';

const PAGE_TITLES = {
  es: {
    home: 'CodeDaily — Reto diario de programación',
    daily: 'Daily Challenge — CodeDaily',
    weekly: 'Desafío semanal — CodeDaily',
    archive: 'Archivo — CodeDaily',
    profile: 'Progreso — CodeDaily',
    modes: 'Modos de juego — CodeDaily',
  },
  en: {
    home: 'CodeDaily — Daily coding challenge',
    daily: 'Daily Challenge — CodeDaily',
    weekly: 'Weekly challenge — CodeDaily',
    archive: 'Archive — CodeDaily',
    profile: 'Progress — CodeDaily',
    modes: 'Game modes — CodeDaily',
  },
};

// Lee la ruta de la URL actual; si no es válida, corrige la URL sin añadir historial
function readRouteFromLocation(visit) {
  const parsed = parsePath(window.location.pathname);
  const route = { page: parsed.page, mode: parsed.mode, date: parsed.date, week: parsed.week || null, visit };
  const canonicalPath = buildPath(route);
  if (!parsed.valid || window.location.pathname !== canonicalPath) {
    window.history.replaceState(null, '', canonicalPath + window.location.search + window.location.hash);
  }
  return route;
}

function App() {
  const [route, setRoute] = useState(() => readRouteFromLocation(0));
  const [isTutorialOpen, setIsTutorialOpen] = useState(() => shouldShowTutorial());
  const { language } = useLanguage();

  // Botones atrás/adelante del navegador
  useEffect(() => {
    const handlePopState = () => {
      setRoute((previous) => readRouteFromLocation(previous.visit + 1));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Título de la pestaña y URL canónica por página
  useEffect(() => {
    const path = buildPath(route);
    const titles = PAGE_TITLES[language] || PAGE_TITLES.es;
    if (route.page === 'archive' && route.date) {
      document.title = `${titles.archive.replace(' — CodeDaily', '')} ${route.date} — CodeDaily`;
    } else if (route.page === 'weekly' && route.week) {
      document.title = `${titles.weekly.replace(' — CodeDaily', '')} #${route.week} — CodeDaily`;
    } else {
      document.title = titles[route.page] || titles.home;
    }
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${SITE_ORIGIN}${path}`);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', `${SITE_ORIGIN}${path}`);
  }, [route, language]);

  // Cada visita remonta la página para que sus ventanas vuelvan a abrirse con zoom
  function navigate(page, options = {}) {
    const next = { page, mode: options.mode || null, date: options.date || null, week: options.week || null };
    const path = buildPath(next);
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    setRoute((previous) => ({ ...next, visit: previous.visit + 1 }));
    window.scrollTo({ top: 0 });
  }

  // Cambios dentro de una misma página (día del archivo, modo): URL y título al día,
  // sin añadir historial ni remontar la página
  function replaceRoute(patch) {
    setRoute((previous) => {
      const next = { ...previous, ...patch };
      window.history.replaceState(null, '', buildPath(next));
      return next;
    });
  }

  useEffect(() => {
    document.body.style.overflow = isTutorialOpen ? 'hidden' : '';
  }, [isTutorialOpen]);

  function handleCloseTutorial() {
    setIsTutorialOpen(false);
    markTutorialSeen();
  }

  const renderPage = () => {
    switch (route.page) {
      case 'daily':
        return <DailyPage />;
      case 'weekly':
        return <WeeklyPage initialWeek={route.week} onWeekChange={(week) => replaceRoute({ week })} />;
      case 'archive':
        return <ArchivePage initialDate={route.date} onDateChange={(date) => replaceRoute({ date })} />;
      case 'profile':
        return <ProfilePage onNavigate={navigate} />;
      case 'modes':
        return <ModesPage initialMode={route.mode} onModeChange={(mode) => replaceRoute({ mode })} />;
      case 'home':
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="app-shell">
      <Header
        appName="CodeDaily"
        currentPage={route.page}
        onNavigate={navigate}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      <main className="desktop">
        <div className="page-container" key={`${route.page}-${route.visit}`}>
          <PageErrorBoundary language={language}>
            <Suspense
              fallback={
                <p className="page-loading busy-dots" role="status">
                  {language === 'es' ? 'Cargando' : 'Loading'}
                </p>
              }
            >
              {renderPage()}
            </Suspense>
          </PageErrorBoundary>
        </div>
      </main>

      <Footer />

      <HowToPlayModal isOpen={isTutorialOpen} onClose={handleCloseTutorial} />
    </div>
  );
}

export default App;

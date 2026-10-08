import { lazy, Suspense, useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import { useLanguage } from './context/LanguageContext';
import HowToPlayModal from './components/HowToPlayModal';
import PageErrorBoundary from './components/ui/PageErrorBoundary';
import { shouldShowTutorial, markTutorialSeen } from './services/uiService';

// La portada va en el paquete inicial; el resto de páginas se descarga al visitarlas
const DailyPage = lazy(() => import('./pages/DailyPage'));
const ArchivePage = lazy(() => import('./pages/ArchivePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ModesPage = lazy(() => import('./pages/ModesPage'));

function App() {
  const [route, setRoute] = useState({ page: 'home', mode: null, visit: 0 });
  const [isTutorialOpen, setIsTutorialOpen] = useState(() => shouldShowTutorial());
  const { language } = useLanguage();

  // Cada visita remonta la página para que sus ventanas vuelvan a abrirse con zoom
  function navigate(page, options = {}) {
    setRoute((previous) => ({ page, mode: options.mode || null, visit: previous.visit + 1 }));
    window.scrollTo({ top: 0 });
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
      case 'archive':
        return <ArchivePage />;
      case 'profile':
        return <ProfilePage onNavigate={navigate} />;
      case 'modes':
        return <ModesPage initialMode={route.mode} />;
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

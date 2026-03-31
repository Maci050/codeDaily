import { useMemo, useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import DailyPage from './pages/DailyPage';
import ArchivePage from './pages/ArchivePage';
import ProfilePage from './pages/ProfilePage';
import ModesPage from './pages/ModesPage';
import { useLanguage } from './context/LanguageContext';
import HowToPlayModal from './components/HowToPlayModal';
import { shouldShowTutorial, markTutorialSeen } from './services/uiService';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const { language } = useLanguage();

  const appText = useMemo(() => {
    return {
      es: {
        appName: 'CodeDaily',
      },
      en: {
        appName: 'CodeDaily',
      },
    }[language];
  }, [language]);

  useEffect(() => {
    if (shouldShowTutorial()) {
      setIsTutorialOpen(true);
    }
  }, []);

  function handleCloseTutorial() {
    setIsTutorialOpen(false);
    markTutorialSeen();
  }

  function handleOpenTutorial() {
    setIsTutorialOpen(true);
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'daily':
        return <DailyPage />;
      case 'archive':
        return <ArchivePage />;
      case 'profile':
        return <ProfilePage />;
      case 'modes':
        return <ModesPage />;
      case 'home':
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app-shell">
      <Header
        appName={appText.appName}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onOpenTutorial={handleOpenTutorial}
      />

      <main className="main-content">
        <div className="page-container">{renderPage()}</div>
      </main>

      <Footer />

      <HowToPlayModal
        isOpen={isTutorialOpen}
        onClose={handleCloseTutorial}
      />
    </div>
  );
}

export default App;
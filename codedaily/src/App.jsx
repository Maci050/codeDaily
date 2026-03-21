import { useMemo, useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import DailyPage from './pages/DailyPage';
import ProfilePage from './pages/ProfilePage';
import { useLanguage } from './context/LanguageContext';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
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

  const renderPage = () => {
    switch (currentPage) {
      case 'daily':
        return <DailyPage />;
      case 'profile':
        return <ProfilePage />;
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
      />

      <main className="main-content">
        <div className="page-container">{renderPage()}</div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
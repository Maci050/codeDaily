import { useEffect, useMemo, useState } from 'react';
import { getStats } from '../services/progressService';
import { useLanguage } from '../context/LanguageContext';

function ProfilePage() {
  const [stats, setStats] = useState({
    streak: 0,
    completedDays: 0,
    normalCompleted: 0,
    hackerCompleted: 0,
  });

  const { language } = useLanguage();

  const text = useMemo(() => {
    return {
      es: {
        title: 'Progreso',
        streak: 'Racha',
        completedDays: 'Días completados',
        normalCompleted: 'Retos normales completados',
        hackerCompleted: 'Retos hacker completados',
      },
      en: {
        title: 'Progress',
        streak: 'Streak',
        completedDays: 'Completed days',
        normalCompleted: 'Normal challenges completed',
        hackerCompleted: 'Hacker challenges completed',
      },
    }[language];
  }, [language]);

  useEffect(() => {
    setStats(getStats());
  }, []);

  return (
    <section className="page-section">
      <div className="content-card">
        <h1>{text.title}</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <span>{text.streak}</span>
            <strong>{stats.streak}</strong>
          </div>

          <div className="stat-card">
            <span>{text.completedDays}</span>
            <strong>{stats.completedDays}</strong>
          </div>

          <div className="stat-card">
            <span>{text.normalCompleted}</span>
            <strong>{stats.normalCompleted}</strong>
          </div>

          <div className="stat-card">
            <span>{text.hackerCompleted}</span>
            <strong>{stats.hackerCompleted}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
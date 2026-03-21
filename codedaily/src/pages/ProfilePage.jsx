import { useEffect, useState } from 'react';
import { getStats } from '../services/progressService';

function ProfilePage() {
  const [stats, setStats] = useState({ streak: 0, completedDays: 0 });

  useEffect(() => {
    setStats(getStats());
  }, []);

  return (
    <section className="page-section">
      <div className="content-card">
        <h1>Progreso</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Racha</span>
            <strong>{stats.streak}</strong>
          </div>

          <div className="stat-card">
            <span>Días completados</span>
            <strong>{stats.completedDays}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
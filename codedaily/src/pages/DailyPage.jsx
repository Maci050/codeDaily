import { useState } from 'react';
import ChallengePlayer from '../components/challenge/ChallengePlayer';
import PixelIcon from '../components/ui/PixelIcon';
import { useLanguage } from '../context/LanguageContext';
import { useDayClock } from '../hooks/useDayClock';

function DailyPage() {
  const { language } = useLanguage();
  const { today } = useDayClock();
  // La fecha queda fija al entrar: si el día cambia mientras juegas, se avisa en vez de cambiar el reto
  const [playingDate, setPlayingDate] = useState(today);

  const text = {
    es: {
      title: 'Daily Challenge',
      subtitle:
        'Cada día se selecciona un reto de forma determinista según la fecha.',
      newDayTitle: 'Ya hay un reto nuevo',
      newDayText: 'Este reto es del día anterior. Puedes terminarlo o pasar al de hoy.',
      newDayButton: 'Ir al reto de hoy',
    },
    en: {
      title: 'Daily Challenge',
      subtitle:
        'A challenge is selected every day in a deterministic way based on the date.',
      newDayTitle: 'A new challenge is out',
      newDayText: 'This challenge is from the previous day. You can finish it or move on to today’s.',
      newDayButton: "Go to today's challenge",
    },
  }[language];

  const notice = today !== playingDate ? (
    <div className="feedback-box new-day-box" role="status">
      <PixelIcon name="calendar" size={36} />
      <h4>{text.newDayTitle}</h4>
      <p>{text.newDayText}</p>
      <div className="button-row">
        <button className="primary-button" onClick={() => setPlayingDate(today)}>
          {text.newDayButton}
        </button>
      </div>
    </div>
  ) : null;

  return (
    <ChallengePlayer
      key={playingDate}
      pageTitle={text.title}
      pageSubtitle={text.subtitle}
      selectedDate={playingDate}
      allowDateSelection={false}
      allowHackerMode={true}
      notice={notice}
    />
  );
}

export default DailyPage;

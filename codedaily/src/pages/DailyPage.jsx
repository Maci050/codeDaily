import { getDaySeed } from '../services/challengeService';
import ChallengePlayer from '../components/challenge/ChallengePlayer';
import { useLanguage } from '../context/LanguageContext';

function DailyPage() {
  const { language } = useLanguage();

  const text = {
    es: {
      title: 'Daily Challenge',
      subtitle:
        'Cada día se selecciona un reto de forma determinista según la fecha.',
    },
    en: {
      title: 'Daily Challenge',
      subtitle:
        'A challenge is selected every day in a deterministic way based on the date.',
    },
  }[language];

  return (
    <ChallengePlayer
      pageTitle={text.title}
      pageSubtitle={text.subtitle}
      selectedDate={getDaySeed(new Date())}
      allowDateSelection={false}
      allowHackerMode={true}
    />
  );
}

export default DailyPage;
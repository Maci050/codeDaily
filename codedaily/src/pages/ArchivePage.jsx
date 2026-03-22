import { useState } from 'react';
import { getDaySeed } from '../services/challengeService';
import ChallengePlayer from '../components/challenge/ChallengePlayer';
import { useLanguage } from '../context/LanguageContext';

function ArchivePage() {
  const [selectedDate, setSelectedDate] = useState(getDaySeed(new Date()));
  const { language } = useLanguage();

  const text = {
    es: {
      title: 'Archivo',
      subtitle:
        'Juega retos de días anteriores seleccionando una fecha del calendario.',
    },
    en: {
      title: 'Archive',
      subtitle:
        'Play past daily challenges by selecting a date from the calendar.',
    },
  }[language];

  return (
    <ChallengePlayer
      pageTitle={text.title}
      pageSubtitle={text.subtitle}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      allowDateSelection={true}
      allowHackerMode={false}
    />
  );
}

export default ArchivePage;
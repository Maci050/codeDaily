import { useState } from 'react';
import ChallengePlayer from '../components/challenge/ChallengePlayer';
import { useLanguage } from '../context/LanguageContext';

const ARCHIVE_START_DATE = '2026-03-22';

function ArchivePage() {
  const [selectedDate, setSelectedDate] = useState(ARCHIVE_START_DATE);
  const { language } = useLanguage();

  const text = {
    es: {
      title: 'Archivo',
      subtitle:
        'Juega retos desde la fecha de lanzamiento en adelante seleccionando un día del calendario.',
    },
    en: {
      title: 'Archive',
      subtitle:
        'Play challenges from the launch date onward by selecting a day from the calendar.',
    },
  }[language];

  const handleDateChange = (newDate) => {
    if (newDate < ARCHIVE_START_DATE) {
      return;
    }

    setSelectedDate(newDate);
  };

  return (
    <ChallengePlayer
      pageTitle={text.title}
      pageSubtitle={text.subtitle}
      selectedDate={selectedDate}
      onDateChange={handleDateChange}
      allowDateSelection={true}
      allowHackerMode={false}
      minSelectableDate={ARCHIVE_START_DATE}
    />
  );
}

export default ArchivePage;
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Window from '../components/ui/Window';
import PixelIcon from '../components/ui/PixelIcon';
import { getChallengeText, getDayNumber, getDaySeed, loadDailyChallenge } from '../services/challengeService';
import { getPreferences } from '../services/uiService';
import { getStats } from '../services/progressService';
import { formatCountdown, useDayClock } from '../hooks/useDayClock';

function HomePage({ onNavigate }) {
  const { language } = useLanguage();

  const text = useMemo(() => {
    return {
      es: {
        windowTitle: 'CodeDaily — Retos diarios de programación',
        title: 'Mejora programando un reto corto cada día',
        description:
          'CodeDaily es un juego web de desafíos de programación centrado en funciones cortas, validación automática y progreso local. Resuelve el reto diario en Python o Java.',
        primaryButton: 'Jugar Daily Challenge',
        secondaryLink: 'Ver los modos extra',
        openChallenge: 'Abrir reto',
        starterCode: 'Código base',
        todayLabel: 'Reto',
        streak: (n) => `Racha: ${n} ${n === 1 ? 'día' : 'días'}`,
        readmeTitle: 'Léeme.txt',
        desk: {
          archive: 'Archivo',
          guessOutput: '¿Qué devuelve?',
          findBug: 'Encuentra el bug',
          complexity: 'Complejidad',
          progress: 'Progreso',
        },
        deskLabel: 'Accesos directos',
        difficulty: { novato: 'Novato', intermedio: 'Intermedio', pro: 'Pro' },
        card1Title: 'Un reto al día',
        card1Text:
          'Cada día habrá un único reto elegido de forma determinista según la fecha, igual para todo el mundo.',
        card2Title: 'Dificultades',
        card2Text:
          'Novato, Intermedio y Pro. El mismo reto disponible en Python y Java.',
        card3Title: 'Validación',
        card3Text:
          'Las soluciones se comprueban con ejecución real: Python en el navegador con Pyodide, Java vía Judge0.',
        card4Title: 'Idiomas',
        card4Text:
          'El contenido del reto puede mostrarse en español o en inglés, manteniendo la misma solución.',
      },
      en: {
        windowTitle: 'CodeDaily — Daily programming challenges',
        title: 'Improve by solving one short coding challenge every day',
        description:
          'CodeDaily is a web game built around short programming challenges, automatic validation, and local progress tracking. Solve the daily challenge in Python or Java.',
        primaryButton: 'Play Daily Challenge',
        secondaryLink: 'See the extra modes',
        openChallenge: 'Open challenge',
        starterCode: 'Starter code',
        todayLabel: 'Challenge',
        streak: (n) => `Streak: ${n} ${n === 1 ? 'day' : 'days'}`,
        readmeTitle: 'ReadMe.txt',
        desk: {
          archive: 'Archive',
          guessOutput: 'What does it return?',
          findBug: 'Find the bug',
          complexity: 'Complexity',
          progress: 'Progress',
        },
        deskLabel: 'Shortcuts',
        difficulty: { novato: 'Beginner', intermedio: 'Intermediate', pro: 'Pro' },
        card1Title: 'One challenge a day',
        card1Text:
          'Each day there is a single challenge chosen deterministically from the date, the same for everyone.',
        card2Title: 'Difficulties',
        card2Text:
          'Beginner, Intermediate, and Pro. The same challenge available in Python and Java.',
        card3Title: 'Validation',
        card3Text:
          'Solutions are checked with real execution: Python in the browser via Pyodide, Java via Judge0.',
        card4Title: 'Languages',
        card4Text:
          'Challenge content can be shown in Spanish or English while keeping the same solution.',
      },
    }[language];
  }, [language]);

  const preferences = getPreferences();
  // El reloj del juego refresca la portada sola cuando cambia el día (00:00 UTC)
  const { today: todaySeed, msUntilNext } = useDayClock();
  const today = new Date(`${todaySeed}T00:00:00Z`);
  const dayNumber = getDayNumber(today);
  const isJava = preferences.programmingLanguage === 'java';

  // Solo se descarga el banco del reto de hoy; la ventana se abre cuando llega
  const [rawChallenge, setRawChallenge] = useState(null);

  useEffect(() => {
    let isMounted = true;
    loadDailyChallenge({
      date: new Date(`${todaySeed}T00:00:00Z`),
      language: preferences.programmingLanguage,
      difficulty: preferences.difficulty,
    })
      .then((challenge) => {
        if (isMounted) setRawChallenge(challenge);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [todaySeed, preferences.programmingLanguage, preferences.difficulty]);

  const todayChallenge = useMemo(() => getChallengeText(rawChallenge, language), [rawChallenge, language]);

  const streak = getStats().streak;
  const fileName = `reto_${dayNumber}.${isJava ? 'java' : 'py'}`;

  const deskIcons = [
    { icon: 'calendar', label: text.desk.archive, go: () => onNavigate('archive') },
    { icon: 'braces', label: text.desk.guessOutput, go: () => onNavigate('modes', { mode: 'guess_output' }) },
    { icon: 'bug', label: text.desk.findBug, go: () => onNavigate('modes', { mode: 'find_bug' }) },
    { icon: 'clock', label: text.desk.complexity, go: () => onNavigate('modes', { mode: 'guess_complexity' }) },
    { icon: 'chart', label: text.desk.progress, go: () => onNavigate('profile') },
  ];

  const readme = [
    { title: text.card1Title, body: text.card1Text },
    { title: text.card2Title, body: text.card2Text },
    { title: text.card3Title, body: text.card3Text },
    { title: text.card4Title, body: text.card4Text },
  ];

  return (
    <section className="page-section">
      <div className="home-desk">
        <nav className="desk-column" aria-label={text.deskLabel}>
          {deskIcons.map((item) => (
            <button key={item.label} className="desk-icon" onClick={item.go}>
              <PixelIcon name={item.icon} size={48} />
              <span className="desk-icon-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="home-stage">
          <Window
            className="home-hero"
            title={text.windowTitle}
            titleAs="p"
            status={
              <>
                <span>
                  {text.todayLabel} #{dayNumber} · {getDaySeed(today)}
                </span>
                {streak > 0 && <span>{text.streak(streak)}</span>}
              </>
            }
          >
            <h1 className="display">{text.title}</h1>
            <p className="lede">{text.description}</p>
            <div className="button-row">
              <button className="primary-button" onClick={() => onNavigate('daily')}>
                {text.primaryButton}
              </button>
              <button className="text-link" onClick={() => onNavigate('modes')}>
                {text.secondaryLink}
              </button>
            </div>
          </Window>

          {todayChallenge && (
            <Window
              className="home-today"
              title={fileName}
              icon="doc"
              style={{ '--zoom-delay': '0.12s' }}
              status={
                <>
                  <span>
                    {text.difficulty[todayChallenge.difficulty]} · {isJava ? 'Java' : 'Python'}
                  </span>
                  <span>{formatCountdown(msUntilNext, language)}</span>
                </>
              }
            >
              <div className="badge-row">
                <span className="pill inverse">#{dayNumber}</span>
                <span className="pill">{getDaySeed(today)}</span>
              </div>
              <h2 className="today-title">{todayChallenge.localizedTitle}</h2>
              <p>{todayChallenge.localizedDescription}</p>
              <pre className="code-block" aria-label={text.starterCode}>
                <code>{todayChallenge.starterCode}</code>
              </pre>
              <div className="button-row">
                <button className="secondary-button" onClick={() => onNavigate('daily')}>
                  {text.openChallenge}
                </button>
              </div>
            </Window>
          )}
        </div>
      </div>

      <Window className="home-readme" title={text.readmeTitle} icon="doc" style={{ '--zoom-delay': '0.2s' }}>
        <div className="readme-doc">
          {readme.map((item) => (
            <p key={item.title}>
              <strong>{item.title}.</strong> {item.body}
            </p>
          ))}
        </div>
      </Window>
    </section>
  );
}

export default HomePage;

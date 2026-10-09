import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useDayClock } from '../hooks/useDayClock';
import WeeklyPlayer from '../components/challenge/WeeklyPlayer';
import Window from '../components/ui/Window';
import PixelIcon from '../components/ui/PixelIcon';
import {
  getMsUntilNextWeek,
  getWeekEnd,
  getWeekNumber,
  getWeekStart,
  loadWeeklyPool,
  pickWeekly,
} from '../services/weeklyService';

const TEXT = {
  es: {
    title: 'Desafío semanal',
    subtitle: 'Un reto más difícil cada semana, solo en Python: transforma código, resuelve con reglas o hazlo eficiente. Cambia cada lunes a las 00:00 UTC.',
    prevWeek: 'Semana anterior',
    nextWeek: 'Semana siguiente',
    week: (n) => `Semana #${n}`,
    pastTitle: (n) => `Estás viendo la semana #${n}`,
    pastText: 'Puedes jugarla igual, pero ya hay un desafío más reciente.',
    goCurrent: 'Ir a la semana actual',
    loading: 'Cargando el desafío',
    loadError: 'No se pudo cargar el desafío',
    loadErrorText: 'Comprueba tu conexión y vuelve a intentarlo.',
    retry: 'Reintentar',
    countdown: (ms) => formatWeekCountdown(ms, 'es'),
    locale: 'es-ES',
  },
  en: {
    title: 'Weekly challenge',
    subtitle: 'A harder challenge every week, Python only: transform code, solve under rules or make it efficient. It changes every Monday at 00:00 UTC.',
    prevWeek: 'Previous week',
    nextWeek: 'Next week',
    week: (n) => `Week #${n}`,
    pastTitle: (n) => `You are viewing week #${n}`,
    pastText: 'You can still play it, but there is a newer challenge.',
    goCurrent: 'Go to the current week',
    loading: 'Loading the challenge',
    loadError: 'The challenge could not be loaded',
    loadErrorText: 'Check your connection and try again.',
    retry: 'Retry',
    countdown: (ms) => formatWeekCountdown(ms, 'en'),
    locale: 'en-US',
  },
};

function formatWeekCountdown(ms, language) {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts = days > 0 ? `${days} d ${hours} h` : hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
  return language === 'es' ? `Nuevo desafío en ${parts}` : `New challenge in ${parts}`;
}

function formatWeekRange(week, locale) {
  const start = new Date(`${getWeekStart(week)}T00:00:00Z`);
  const end = new Date(`${getWeekEnd(week)}T00:00:00Z`);
  const day = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'UTC' });
  const full = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  return `${sameMonth ? day.format(start) : full.format(start)}–${full.format(end)}`;
}

function WeeklyPage({ initialWeek = null, onWeekChange }) {
  const { language } = useLanguage();
  const text = TEXT[language] || TEXT.es;
  const { today } = useDayClock();
  const currentWeek = getWeekNumber(new Date(`${today}T00:00:00Z`));
  const [week, setWeek] = useState(() => initialWeek || currentWeek);
  const [pool, setPool] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;
    loadWeeklyPool()
      .then((data) => isMounted && setPool(data))
      .catch(() => isMounted && setLoadFailed(true));
    return () => {
      isMounted = false;
    };
  }, [loadAttempt]);

  const challenge = useMemo(() => pickWeekly(pool, week), [pool, week]);
  const isCurrentWeek = week === currentWeek;
  // El reloj del juego hace que esto se recalcule cada pocos segundos
  const countdownText = text.countdown(getMsUntilNextWeek(new Date()));

  function changeWeek(next) {
    setWeek(next);
    onWeekChange?.(next === currentWeek ? null : next);
  }

  return (
    <section className="page-section">
      <div className="page-head">
        <div className="page-head-text">
          <h1 className="page-title">{text.title}</h1>
          <p className="lede">{text.subtitle}</p>
        </div>

        <div className="week-nav-box">
          <div className="week-nav">
            <button
              type="button"
              className="calendar-nav"
              onClick={() => changeWeek(week - 1)}
              disabled={week <= 1}
              aria-label={text.prevWeek}
            >
              <PixelIcon name="arrowLeft" size={20} />
            </button>
            <p className="week-label" aria-live="polite">
              <strong>{text.week(week)}</strong>
              <span>{formatWeekRange(week, text.locale)}</span>
            </p>
            <button
              type="button"
              className="calendar-nav"
              onClick={() => changeWeek(week + 1)}
              disabled={week >= currentWeek}
              aria-label={text.nextWeek}
            >
              <PixelIcon name="arrowRight" size={20} />
            </button>
          </div>
          {isCurrentWeek && (
            <p className="weekly-countdown">
              <PixelIcon name="clock" size={18} />
              {countdownText}
            </p>
          )}
        </div>
      </div>

      {!isCurrentWeek && (
        <div className="feedback-box" role="status">
          <PixelIcon name="calendar" size={36} />
          <h4>{text.pastTitle(week)}</h4>
          <p>{text.pastText}</p>
          <div className="button-row">
            <button className="secondary-button" onClick={() => changeWeek(currentWeek)}>
              {text.goCurrent}
            </button>
          </div>
        </div>
      )}

      {loadFailed ? (
        <Window title={text.loadError} icon="alert">
          <div className="alert-layout">
            <PixelIcon name="alert" size={40} />
            <div>
              <p>{text.loadErrorText}</p>
              <div className="dialog-actions">
                <button
                  className="secondary-button"
                  onClick={() => {
                    setLoadFailed(false);
                    setLoadAttempt((n) => n + 1);
                  }}
                >
                  {text.retry}
                </button>
              </div>
            </div>
          </div>
        </Window>
      ) : !challenge ? (
        <Window title={text.title} icon="trophy">
          <p className="busy-dots" role="status">{text.loading}</p>
        </Window>
      ) : (
        <WeeklyPlayer
          key={`${week}-${challenge.id}`}
          challenge={challenge}
          week={week}
          isCurrentWeek={isCurrentWeek}
          countdownText={countdownText}
          language={language}
        />
      )}
    </section>
  );
}

export default WeeklyPage;

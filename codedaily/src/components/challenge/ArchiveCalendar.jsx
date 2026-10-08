import { useMemo, useRef, useState } from 'react';
import Window from '../ui/Window';
import PixelIcon from '../ui/PixelIcon';

// Fechas como 'YYYY-MM-DD' en UTC, igual que el resto del juego
function toDate(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toYMD(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(ymd, days) {
  const date = toDate(ymd);
  date.setUTCDate(date.getUTCDate() + days);
  return toYMD(date);
}

function monthKey(ymd) {
  return ymd.slice(0, 7);
}

function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1 + delta, 1));
  return toYMD(date).slice(0, 7);
}

const TEXT = {
  es: {
    title: 'Calendario',
    prev: 'Mes anterior',
    next: 'Mes siguiente',
    weekdays: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
    weekdaysLong: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
    done: 'Completado',
    tried: 'Intentado',
    none: 'Sin jugar',
    unavailable: 'no disponible',
    locale: 'es-ES',
  },
  en: {
    title: 'Calendar',
    prev: 'Previous month',
    next: 'Next month',
    weekdays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    weekdaysLong: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    done: 'Completed',
    tried: 'Attempted',
    none: 'Not played',
    unavailable: 'not available',
    locale: 'en-US',
  },
};

// Calendario mensual del archivo: cada día muestra si ya lo completaste o lo intentaste.
// Teclado: las flechas mueven el foco entre días, Inicio/Fin van al principio/fin de semana.
function ArchiveCalendar({ selectedDate, minDate, maxDate, onSelect, getDayState, language }) {
  const text = TEXT[language] || TEXT.es;
  const [visibleMonth, setVisibleMonth] = useState(monthKey(selectedDate));
  const [focusDate, setFocusDate] = useState(selectedDate);
  const gridRef = useRef(null);

  const monthLabel = useMemo(() => {
    const label = new Intl.DateTimeFormat(text.locale, { month: 'long', year: 'numeric', timeZone: 'UTC' })
      .format(toDate(`${visibleMonth}-01`));
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [visibleMonth, text.locale]);

  // Celdas del mes: huecos iniciales para empezar la semana en lunes
  const cells = useMemo(() => {
    const first = toDate(`${visibleMonth}-01`);
    const leading = (first.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    const list = Array.from({ length: leading }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const ymd = `${visibleMonth}-${String(day).padStart(2, '0')}`;
      const available = ymd >= minDate && ymd <= maxDate;
      list.push({ ymd, day, available, state: available ? getDayState(ymd) : null });
    }
    return list;
  }, [visibleMonth, minDate, maxDate, getDayState]);

  const canGoPrev = monthKey(minDate) < visibleMonth;
  const canGoNext = visibleMonth < monthKey(maxDate);

  // El día que recibe el foco con Tab: el seleccionado si está en este mes, si no el primero disponible
  const tabStop = cells.some((c) => c?.ymd === focusDate && c.available)
    ? focusDate
    : cells.find((c) => c?.available)?.ymd;

  function moveFocus(target) {
    if (target < minDate || target > maxDate) return;
    setFocusDate(target);
    if (monthKey(target) !== visibleMonth) setVisibleMonth(monthKey(target));
    // Espera al render del mes nuevo antes de mover el foco
    requestAnimationFrame(() => {
      gridRef.current?.querySelector(`[data-date="${target}"]`)?.focus();
    });
  }

  function handleKeyDown(event, ymd) {
    const weekday = (toDate(ymd).getUTCDay() + 6) % 7;
    const moves = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -weekday,
      End: 6 - weekday,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    moveFocus(addDays(ymd, moves[event.key]));
  }

  function dayLabel(cell) {
    const date = toDate(cell.ymd);
    const weekday = text.weekdaysLong[(date.getUTCDay() + 6) % 7];
    const full = new Intl.DateTimeFormat(text.locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
    if (!cell.available) return `${weekday}, ${full}, ${text.unavailable}`;
    const state = cell.state === 'done' ? text.done : cell.state === 'tried' ? text.tried : text.none;
    return `${weekday}, ${full}, ${state}`;
  }

  return (
    <Window className="archive-calendar" title={text.title} icon="calendar">
      <div className="calendar-head">
        <button
          type="button"
          className="calendar-nav"
          onClick={() => setVisibleMonth(shiftMonth(visibleMonth, -1))}
          disabled={!canGoPrev}
          aria-label={text.prev}
        >
          <PixelIcon name="arrowLeft" size={20} />
        </button>
        <p className="calendar-month" aria-live="polite">{monthLabel}</p>
        <button
          type="button"
          className="calendar-nav"
          onClick={() => setVisibleMonth(shiftMonth(visibleMonth, 1))}
          disabled={!canGoNext}
          aria-label={text.next}
        >
          <PixelIcon name="arrowRight" size={20} />
        </button>
      </div>

      <div className="calendar-grid" role="grid" aria-label={monthLabel} ref={gridRef}>
        <div className="calendar-row" role="row">
          {text.weekdays.map((day, i) => (
            <span key={i} className="calendar-weekday" role="columnheader" aria-label={text.weekdaysLong[i]}>
              {day}
            </span>
          ))}
        </div>
        {Array.from({ length: Math.ceil(cells.length / 7) }, (_, week) => (
          <div className="calendar-row" role="row" key={week}>
            {cells.slice(week * 7, week * 7 + 7).map((cell, i) =>
              cell ? (
                <span role="gridcell" key={cell.ymd}>
                  <button
                    type="button"
                    data-date={cell.ymd}
                    className={`calendar-day ${cell.state ? `is-${cell.state}` : ''}`}
                    aria-pressed={cell.ymd === selectedDate}
                    aria-label={dayLabel(cell)}
                    disabled={!cell.available}
                    tabIndex={cell.ymd === tabStop ? 0 : -1}
                    onClick={() => {
                      setFocusDate(cell.ymd);
                      onSelect(cell.ymd);
                    }}
                    onKeyDown={(event) => handleKeyDown(event, cell.ymd)}
                  >
                    {cell.day}
                  </button>
                </span>
              ) : (
                <span role="gridcell" key={`empty-${week}-${i}`} />
              )
            )}
          </div>
        ))}
      </div>

      <div className="calendar-legend" aria-hidden="true">
        <span><i className="calendar-swatch is-done" />{text.done}</span>
        <span><i className="calendar-swatch is-tried" />{text.tried}</span>
        <span><i className="calendar-swatch" />{text.none}</span>
      </div>
    </Window>
  );
}

export default ArchiveCalendar;

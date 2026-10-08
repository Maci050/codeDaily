import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import PixelIcon from './PixelIcon';
import { useLanguage } from '../../context/LanguageContext';

// Último punto que el usuario activó (clic, toque o Enter/Espacio). Las ventanas
// que se abren justo después hacen crecer su rectángulo de zoom desde ahí.
let lastOrigin = null;
const ORIGIN_TTL_MS = 2500;

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', (event) => {
    lastOrigin = { x: event.clientX, y: event.clientY, t: Date.now() };
  }, true);

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const rect = event.target?.getBoundingClientRect?.();
    if (rect) lastOrigin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, t: Date.now() };
  }, true);
}

// Ventana de escritorio de 1 bit: barra de título rayada con caja, cuerpo y barra de estado.
// Sin onClose, la caja pliega la ventana a su barra de título (persiana).
function Window({
  title,
  titleAs = 'h2',
  titleId,
  icon,
  onClose,
  closeLabel,
  status,
  className = '',
  bodyClassName = '',
  zoom = true,
  ref,
  children,
  ...rest
}) {
  const TitleTag = titleAs;
  const { language } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const innerRef = useRef(null);

  const setRefs = useCallback((node) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  useLayoutEffect(() => {
    const node = innerRef.current;
    if (!zoom || !node || !lastOrigin || Date.now() - lastOrigin.t > ORIGIN_TTL_MS) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty('--zoom-ox', `${lastOrigin.x - rect.left}px`);
    node.style.setProperty('--zoom-oy', `${lastOrigin.y - rect.top}px`);
  }, [zoom]);

  const boxLabel = onClose
    ? closeLabel || (language === 'es' ? 'Cerrar' : 'Close')
    : collapsed
    ? (language === 'es' ? 'Desplegar ventana' : 'Expand window')
    : (language === 'es' ? 'Plegar ventana' : 'Collapse window');

  return (
    <section
      ref={setRefs}
      className={`window ${zoom ? 'zoom-open' : ''} ${collapsed ? 'is-collapsed' : ''} ${className}`}
      {...rest}
    >
      {zoom && (
        <span className="zoom-rects" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      )}

      <header className="window-titlebar">
        <TitleTag className="window-title" id={titleId}>
          {icon && <PixelIcon name={icon} size={16} />}
          <span>{title}</span>
        </TitleTag>
        <button
          type="button"
          className="window-close"
          onClick={onClose || (() => setCollapsed((value) => !value))}
          aria-label={boxLabel}
          title={boxLabel}
          aria-expanded={onClose ? undefined : !collapsed}
        >
          {onClose && <PixelIcon name="cross" size={12} />}
        </button>
      </header>

      {!collapsed && <div className={`window-body ${bodyClassName}`}>{children}</div>}

      {!collapsed && status && <footer className="window-status">{status}</footer>}
    </section>
  );
}

export default Window;

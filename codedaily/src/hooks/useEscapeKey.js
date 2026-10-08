import { useEffect } from 'react';

// Calls onEscape when Escape is pressed while `active` is true.
export function useEscapeKey(active, onEscape) {
  useEffect(() => {
    if (!active) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onEscape();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, onEscape]);
}

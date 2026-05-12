import React from 'react';

const THEME_KEY = 'panhel-theme';
const POSITION_KEY = 'panhel-theme-toggle-position';

type ThemeMode = 'light' | 'dark';
type TogglePosition = {
  x: number;
  y: number;
};

const DEFAULT_POSITION: TogglePosition = {
  x: 24,
  y: 120,
};

function getSavedTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

function getSavedPosition(): TogglePosition {
  if (typeof window === 'undefined') return DEFAULT_POSITION;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(POSITION_KEY) || '');
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
      return parsed;
    }
  } catch {
    return DEFAULT_POSITION;
  }

  return DEFAULT_POSITION;
}

function clampPosition(position: TogglePosition): TogglePosition {
  if (typeof window === 'undefined') return position;

  const size = 58;
  const padding = 10;

  return {
    x: Math.min(Math.max(position.x, padding), window.innerWidth - size - padding),
    y: Math.min(Math.max(position.y, padding), window.innerHeight - size - padding),
  };
}

export default function FloatingThemeToggle() {
  const [theme, setTheme] = React.useState<ThemeMode>(() => getSavedTheme());
  const [position, setPosition] = React.useState<TogglePosition>(() => clampPosition(getSavedPosition()));
  const dragState = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  React.useEffect(() => {
    const handleResize = () => {
      setPosition((current) => {
        const next = clampPosition(current);
        window.localStorage.setItem(POSITION_KEY, JSON.stringify(next));
        return next;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const persistPosition = React.useCallback((nextPosition: TogglePosition) => {
    const clamped = clampPosition(nextPosition);
    setPosition(clamped);
    window.localStorage.setItem(POSITION_KEY, JSON.stringify(clamped));
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      drag.moved = true;
    }

    persistPosition({
      x: drag.originX + deltaX,
      y: drag.originY + deltaY,
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragState.current = null;
    if (!drag.moved) {
      setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
    }
  };

  return (
    <button
      className="floating-theme-toggle"
      type="button"
      aria-label={theme === 'dark' ? 'Ενεργοποίηση φωτεινού mode' : 'Ενεργοποίηση dark mode'}
      title="Σύρε το όπου θέλεις ή πάτα για dark mode"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragState.current = null;
      }}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <span className="floating-theme-toggle__orb" aria-hidden="true">
        {theme === 'dark' ? '☾' : '☀'}
      </span>
    </button>
  );
}

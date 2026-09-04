import { createContext, useContext, useEffect, useState } from 'react';

const DEFAULTS = {
  theme: 'system',
  accent: null,
  dateFormat: 'yyyy. M. d.',
  timeFormat: '24h',
  weekStart: 1,
  soundEnabled: true,
  notificationsEnabled: false,
  compactMode: false,
  language: 'en',
};

const SettingsContext = createContext(null);

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('app_settings');
      return { ...DEFAULTS, ...(saved ? JSON.parse(saved) : {}) };
    } catch { return DEFAULTS; }
  });

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark) => root.classList.toggle('dark', dark);
    if (settings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches);
      const handler = (e) => apply(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    apply(settings.theme === 'dark');
  }, [settings.theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.accent) {
      root.style.setProperty('--primary', hexToHsl(settings.accent));
      root.style.setProperty('--primary-foreground', '0 0% 100%');
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
    }
  }, [settings.accent]);

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
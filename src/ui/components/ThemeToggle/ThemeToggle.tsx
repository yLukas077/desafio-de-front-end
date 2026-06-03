'use client';

import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.css';

export type Theme = 'light' | 'dark' | 'blue';

const THEMES: { id: Theme; label: string; swatch: string }[] = [
  { id: 'light', label: 'Gray', swatch: '#CACACA' },
  { id: 'dark', label: 'Dark', swatch: '#0F0F0F' },
  { id: 'blue', label: 'Blue', swatch: '#2CAEFF' },
];

const STORAGE_KEY = 'weather-theme';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored =
      (typeof window !== 'undefined' && (localStorage.getItem(STORAGE_KEY) as Theme | null)) ||
      'light';
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const handleChange = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage may be disabled */
    }
  };

  return (
    <div className={styles.toggle} role="radiogroup" aria-label="Color theme">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={theme === t.id}
          aria-label={`${t.label} theme`}
          title={`${t.label} theme`}
          className={`${styles.swatch} ${theme === t.id ? styles.active : ''}`}
          style={{ background: t.swatch }}
          onClick={() => handleChange(t.id)}
        />
      ))}
    </div>
  );
}

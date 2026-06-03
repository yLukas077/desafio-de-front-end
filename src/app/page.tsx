'use client';

import { useEffect, useState } from 'react';
import { CitySelector } from '@/ui/components/CitySelector/CitySelector';
import { WeatherCard } from '@/ui/components/WeatherCard/WeatherCard';
import { ThemeToggle } from '@/ui/components/ThemeToggle/ThemeToggle';
import type { Weather } from '@/domain/weather';
import styles from './page.module.css';

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: Weather };

export default function Page() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [state, setState] = useState<State>({ kind: 'idle' });

  useEffect(() => {
    if (!selectedCity) {
      setState({ kind: 'idle' });
      return;
    }
    let cancelled = false;
    setState({ kind: 'loading' });
    fetch(`/api/weather?city=${selectedCity}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Request failed (${res.status})`);
        }
        return res.json() as Promise<Weather>;
      })
      .then((data) => {
        if (!cancelled) setState({ kind: 'ready', data });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ kind: 'error', message: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCity]);

  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        {selectedCity && (
          <button
            className={styles.backButton}
            onClick={() => setSelectedCity(null)}
            type="button"
            aria-label="Choose another city"
          >
            ← Back
          </button>
        )}
        <div className={styles.spacer} />
        <ThemeToggle />
      </div>

      <div className={styles.content}>
        {!selectedCity && <CitySelector onSelect={setSelectedCity} />}

        {selectedCity && state.kind === 'loading' && <div className={styles.status}>Loading…</div>}
        {selectedCity && state.kind === 'error' && (
          <div className={styles.status} role="alert">
            Could not load weather: {state.message}
          </div>
        )}
        {selectedCity && state.kind === 'ready' && <WeatherCard data={state.data} />}
      </div>
    </main>
  );
}

'use client';

import { FaGlobeAmericas } from 'react-icons/fa';
import { CITIES } from '@/domain/cities';
import styles from './CitySelector.module.css';

type Props = {
  onSelect: (cityId: string) => void;
};

export function CitySelector({ onSelect }: Props) {
  return (
    <section className={styles.wrapper} aria-label="City selector">
      <header className={styles.header}>
        <h1 className={styles.title}>Weather</h1>
        <p className={styles.subtitle}>Select a city</p>
      </header>

      <div className={styles.globe} aria-hidden>
        <FaGlobeAmericas size={176} />
      </div>

      <ul className={styles.list} role="list">
        {CITIES.map((city) => (
          <li key={city.id}>
            <button type="button" className={styles.cityButton} onClick={() => onSelect(city.id)}>
              {city.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

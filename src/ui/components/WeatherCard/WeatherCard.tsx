'use client';

import { BsArrowUp, BsArrowDown } from 'react-icons/bs';
import { WeatherIcon } from '../WeatherIcon/WeatherIcon';
import type { Weather, Period } from '@/domain/weather';
import { PERIODS } from '@/domain/weather';
import styles from './WeatherCard.module.css';

const PERIOD_LABELS: Record<Period, string> = {
  dawn: 'Dawn',
  morning: 'Morning',
  afternoon: 'Afternoon',
  night: 'Night',
};

export function WeatherCard({ data }: { data: Weather }) {
  return (
    <article className={styles.card} aria-label={`Weather for ${data.city}`}>
      <header className={styles.header}>
        <h1 className={styles.cityName}>{data.city}</h1>
        <p className={styles.condition}>{data.conditionLabel}</p>
      </header>

      <div className={styles.tempRow}>
        <span className={styles.tempBig}>{data.temperature}</span>
        <div className={styles.tempSide}>
          <span className={styles.tempUnit}>°c</span>
          <div className={styles.minMax}>
            <div className={styles.arrows} aria-hidden>
              <BsArrowUp size={16} />
              <BsArrowDown size={16} />
            </div>
            <div className={styles.minMaxValues}>
              <span aria-label={`Max ${data.temperatureMax} degrees`}>{data.temperatureMax}°</span>
              <span aria-label={`Min ${data.temperatureMin} degrees`}>{data.temperatureMin}°</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bigIcon} aria-hidden>
        <WeatherIcon condition={data.condition} size={176} />
      </div>

      <div className={styles.forecast}>
        <section className={styles.periods} aria-label="Forecast by time of day">
          {PERIODS.map((p) => (
            <div key={p} className={styles.period}>
              <span className={styles.periodLabel}>{PERIOD_LABELS[p]}</span>
              <span className={styles.periodIcon} aria-hidden>
                <WeatherIcon
                  condition={data.periods[p].condition}
                  size={48}
                  timeOfDay={p === 'night' ? 'night' : 'day'}
                />
              </span>
              <span className={styles.periodTemp}>{data.periods[p].temperature}℃</span>
            </div>
          ))}
        </section>

        <section className={styles.metrics} aria-label="Atmospheric metrics">
          <Metric label="Wind speed" value={`${data.windSpeed.toFixed(2)} m/s`} />
          <Divider />
          <Metric label="Sunrise" value={data.sunrise} />
          <Divider />
          <Metric label="Sunset" value={data.sunset} />
          <Divider />
          <Metric label="Humidity" value={`${data.humidity}%`} />
        </section>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{value}</span>
    </div>
  );
}

function Divider() {
  return <span className={styles.divider} aria-hidden />;
}

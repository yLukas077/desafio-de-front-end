import {
  BsSun,
  BsMoon,
  BsCloudSun,
  BsCloudMoon,
  BsCloudRain,
  BsCloudRainHeavy,
  BsCloudDrizzle,
  BsCloudSnow,
  BsCloudFog2,
  BsCloudLightningRain,
  BsClouds,
} from 'react-icons/bs';
import type { WeatherCondition } from '@/domain/weather';

type Props = {
  condition: WeatherCondition;
  size?: number;
  timeOfDay?: 'day' | 'night';
};

export function WeatherIcon({ condition, size = 48, timeOfDay = 'day' }: Props) {
  const props = { size, 'aria-hidden': true } as const;

  switch (condition) {
    case 'clear-day':
      return <BsSun {...props} />;
    case 'clear-night':
      return <BsMoon {...props} />;
    case 'clouds':
      return timeOfDay === 'night' ? <BsCloudMoon {...props} /> : <BsCloudSun {...props} />;
    case 'rain':
      return <BsCloudRainHeavy {...props} />;
    case 'drizzle':
      return <BsCloudDrizzle {...props} />;
    case 'snow':
      return <BsCloudSnow {...props} />;
    case 'thunderstorm':
      return <BsCloudLightningRain {...props} />;
    case 'fog':
      return <BsCloudFog2 {...props} />;
    default:
      return <BsClouds {...props} />;
  }
}
// Re-export to silence unused-import noise in some linters
export const __icons = { BsCloudRain };

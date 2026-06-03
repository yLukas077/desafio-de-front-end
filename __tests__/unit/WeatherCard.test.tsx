import { render, screen } from '@testing-library/react';
import { WeatherCard } from '@/ui/components/WeatherCard/WeatherCard';
import type { Weather } from '@/domain/weather';

const mockData: Weather = {
  city: 'Vancouver',
  condition: 'snow',
  conditionLabel: 'Snow',
  temperature: -4,
  temperatureMin: -5,
  temperatureMax: -4,
  periods: {
    dawn: { temperature: -8, condition: 'clouds' },
    morning: { temperature: -8, condition: 'clear-day' },
    afternoon: { temperature: -4, condition: 'clouds' },
    night: { temperature: -1, condition: 'clear-night' },
  },
  windSpeed: 1.69,
  sunrise: '12:38 PM',
  sunset: '10:13 PM',
  humidity: 95,
};

describe('WeatherCard', () => {
  it('renders the city name as the page heading', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByRole('heading', { name: 'Vancouver' })).toBeInTheDocument();
  });

  it('renders the current condition label', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByText('Snow')).toBeInTheDocument();
  });

  it('renders the current temperature', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByText('-4')).toBeInTheDocument();
  });

  it('renders all four period labels', () => {
    render(<WeatherCard data={mockData} />);
    for (const label of ['Dawn', 'Morning', 'Afternoon', 'Night']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('renders period temperatures', () => {
    render(<WeatherCard data={mockData} />);
    // Three identical labels for "-8℃", screen.getAllByText handles that
    expect(screen.getAllByText('-8℃')).toHaveLength(2);
    expect(screen.getByText('-4℃')).toBeInTheDocument();
    expect(screen.getByText('-1℃')).toBeInTheDocument();
  });

  it('renders all four atmospheric metrics with values', () => {
    render(<WeatherCard data={mockData} />);
    expect(screen.getByText('Wind speed')).toBeInTheDocument();
    expect(screen.getByText('1.69 m/s')).toBeInTheDocument();
    expect(screen.getByText('Sunrise')).toBeInTheDocument();
    expect(screen.getByText('12:38 PM')).toBeInTheDocument();
    expect(screen.getByText('Sunset')).toBeInTheDocument();
    expect(screen.getByText('10:13 PM')).toBeInTheDocument();
    expect(screen.getByText('Humidity')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });
});

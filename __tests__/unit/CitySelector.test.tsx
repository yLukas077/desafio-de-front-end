import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CitySelector } from '@/ui/components/CitySelector/CitySelector';

describe('CitySelector', () => {
  it('renders all six required cities from the challenge brief', () => {
    render(<CitySelector onSelect={() => {}} />);
    for (const name of ['Dallol', 'Fairbanks', 'London', 'Recife', 'Vancouver', 'Yakutsk']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('emits the city id when a button is activated', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<CitySelector onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Recife' }));
    expect(onSelect).toHaveBeenCalledWith('recife');
  });

  it('is operable via keyboard', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<CitySelector onSelect={onSelect} />);
    await user.tab();
    // First focusable is the first city button
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalled();
  });
});

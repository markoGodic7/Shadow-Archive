import { render, screen } from '@testing-library/react';
import App from './App';

describe('App smoke test', () => {
  it('renders the Duel Archive heading', () => {
    render(<App />);

    expect(screen.getByText('Duel Archive')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import App from './App';

describe('App smoke test', () => {
  it('renders the Shadow Archive heading', () => {
    render(<App />);

    expect(screen.getByText('Shadow Archive')).toBeInTheDocument();
  });
});

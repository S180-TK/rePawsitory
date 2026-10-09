import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the signed-out landing page without fetching account data', () => {
  localStorage.clear();
  global.fetch = jest.fn();
  render(<App />);
  expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

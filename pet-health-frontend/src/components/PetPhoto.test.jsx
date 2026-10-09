import { act, fireEvent, render, screen } from '@testing-library/react';
import PetPhoto from './PetPhoto';
import { API_BASE_URL } from '../config';

test('failed images use the existing placeholder, retry once, and reset for replacements', () => {
  jest.useFakeTimers();
  const { rerender, unmount } = render(<PetPhoto photoUrl="uploads/pets/a.jpg" name="Pet" />);
  expect(screen.getByRole('img')).toHaveAttribute('src', `${API_BASE_URL}/uploads/pets/a.jpg`);
  fireEvent.error(screen.getByRole('img'));
  expect(screen.getByText('Image Preview')).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(1000));
  expect(screen.getByRole('img')).toBeInTheDocument();
  fireEvent.error(screen.getByRole('img'));
  act(() => jest.advanceTimersByTime(5000));
  expect(screen.queryByRole('img')).toBeNull();
  rerender(<PetPhoto photoUrl="https://legacy.example/replaced.jpg" name="Pet" />);
  expect(screen.getByRole('img')).toHaveAttribute('src', 'https://legacy.example/replaced.jpg');
  rerender(<PetPhoto photoUrl="" name="Pet" />);
  expect(screen.getByText('Image Preview')).toBeInTheDocument();
  unmount();
  jest.useRealTimers();
});

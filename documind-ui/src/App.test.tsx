import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders DocuMind chat UI', () => {
  render(<App />);
  expect(screen.getByText(/documind/i)).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText(/ask a question about your documents/i),
  ).toBeInTheDocument();
});

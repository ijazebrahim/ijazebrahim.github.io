import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders hello message', () => {
  const { getByText } = render(<App />);
  const helloElement = getByText(/Hi there, it's a demo!/i);
  expect(helloElement).toBeInTheDocument();
});
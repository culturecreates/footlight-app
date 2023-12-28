import { render, screen } from '@testing-library/react';
import App from './App';

test('Footlight admin appp', () => {
  render(<App />);
  const linkElement = screen.getByText(/Footlight-admin app/i);
  expect(linkElement).toBeInTheDocument();
});

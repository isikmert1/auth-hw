/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './Home';

// --- Test Suite ---
describe('Home Page', () => {
  // Test 1: Checks if the welcome heading is rendered.
  it('should render the welcome heading', () => {
    render(<Home />);

    // Find the heading by its text content (case-insensitive)
    const heading = screen.getByRole('heading', { name: /welcome!/i });
    expect(heading).toBeInTheDocument();
  });

});

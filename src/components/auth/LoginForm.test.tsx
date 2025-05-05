/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LoginForm from './LoginForm';
import { ToastProvider } from '@radix-ui/react-toast'; // Correct import for ToastProvider
import * as toastHooks from '@/hooks/use-toast';

// --- Mocks & Spies ---
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/use-toast', async () => {
  const actual = await vi.importActual('@/hooks/use-toast');
  const internalMockToast = vi.fn();
  return {
    ...actual,
    toast: internalMockToast,
    useToast: () => ({
      toast: internalMockToast,
    }),
  };
});

// --- Test Setup ---
const renderLoginForm = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <LoginForm />
      </ToastProvider>
    </BrowserRouter>
  );
};

// --- Test Suite ---
describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
    localStorage.clear(); // Clear localStorage
  });

  // Test 1: Checks if essential login form elements render.
  it('should render email, password fields, and login button', () => {
    renderLoginForm();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  // Test 2: Verifies user can type into email and password fields.
  it('should update email and password fields on user input', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'password123');
    expect(passwordInput).toHaveValue('password123');
  });

});

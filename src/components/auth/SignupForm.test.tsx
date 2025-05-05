/// <reference types="vitest/globals" />

import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import SignupForm from "./SignupForm";
import { Toaster } from "@/components/ui/toaster";
import * as toastHooks from "@/hooks/use-toast";

// --- Mocks & Spies ---
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock implementations
const mockToastDispatch = vi.fn();
const mockToastsState = { 
  toasts: [], 
  toast: vi.fn(), 
  dismiss: vi.fn(), 
}; 
let toastSpy;
let useToastSpy;

// Helper function to render the component
const renderSignupForm = () => {
  return render(
    <BrowserRouter>
        <SignupForm />
        <Toaster />
    </BrowserRouter>
  );
};

// --- Test Suite ---
describe('SignupForm', () => {

    // Setup spies before each test
    beforeEach(() => {
      // Spy on the exported 'toast' function and replace its implementation
      toastSpy = vi.spyOn(toastHooks, 'toast').mockImplementation(mockToastDispatch);
      // Spy on the exported 'useToast' hook and replace its return value
      useToastSpy = vi.spyOn(toastHooks, 'useToast').mockReturnValue(mockToastsState);
      mockNavigate.mockClear();
      mockToastDispatch.mockClear();
      mockToastsState.toasts = []; 
    });

    // Restore original implementations after each test
    afterEach(() => {
      toastSpy.mockRestore();
      useToastSpy.mockRestore();
    });

    // Test: Checks if essential form fields and button render correctly.
    it('should render all essential form fields and the submit button', () => {
      renderSignupForm();

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /Day/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /Month/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /Year/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    // Test: Verifies text inputs update correctly when typed into.
    it('should update text input fields when user types', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const firstNameInput = screen.getByLabelText(/first name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      await user.type(firstNameInput, 'John');
      await user.type(emailInput, 'john.doe@test.com');
      await user.type(passwordInput, 'Secret123!');

      expect(firstNameInput).toHaveValue('John');
      expect(emailInput).toHaveValue('john.doe@test.com');
      expect(passwordInput).toHaveValue('Secret123!');
    });

    // Test: Ensures date dropdowns update when selections are made.
    it('should update date selection fields when user selects', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const daySelect = screen.getByRole('combobox', { name: /Day/i });
      const monthSelect = screen.getByRole('combobox', { name: /Month/i });
      const yearSelect = screen.getByRole('combobox', { name: /Year/i });

      await user.click(daySelect);
      const dayListbox = await screen.findByRole('listbox');
      await user.click(within(dayListbox).getByText('10'));
      expect(daySelect).toHaveTextContent('10');

      await user.click(monthSelect);
      const monthListbox = await screen.findByRole('listbox');
      await user.click(within(monthListbox).getByText('05'));
      expect(monthSelect).toHaveTextContent('05');

      await user.click(yearSelect);
      const yearListbox = await screen.findByRole('listbox');
      await user.click(within(yearListbox).getByText('2000'));
      expect(yearSelect).toHaveTextContent('2000');
    });

    // Test: Checks if required field errors appear on empty form submission.
    it('should show required field errors on submit if fields are empty', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(await screen.findByText('First name must be at least 2 characters')).toBeInTheDocument();
      expect(await screen.findByText('Last name must be at least 2 characters')).toBeInTheDocument();
      expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
      expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
    });

    // Test: Confirms invalid email prevents successful form submission.
    it('should detect invalid email format on blur', async () => {
      const user = userEvent.setup();
      renderSignupForm();
      
      // Focus on email input and type invalid email
      const emailInput = screen.getByLabelText(/email/i);
      await user.click(emailInput);
      await user.type(emailInput, 'invalid-email');
      
      // Trigger validation by moving focus away (blur)
      await user.tab();
      
      // Toast should not be called with invalid data
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      // The toast for successful creation should not have been called
      expect(toastHooks.toast).not.toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Account created"
        })
      );
    });

    // Test: Checks if a password mismatch error is displayed.
    it('should show an error if passwords do not match', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'PasswordDoesNotMatch123!');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(await screen.findByText("Passwords don't match")).toBeInTheDocument();
    });

    // Test: Verifies the minimum password length validation.
    it('should show password length error if less than 8 characters', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      await user.type(screen.getByLabelText(/^password$/i), 'Short1!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Short1!');
      await user.click(screen.getByLabelText(/first name/i));

      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
    });

    // Test: Checks validation for missing uppercase letters in the password.
    it('should show password uppercase error if missing', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      await user.type(screen.getByLabelText(/^password$/i), 'nouppercase1!');
      await user.click(screen.getByLabelText(/first name/i));

      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(await screen.findByText('Password must contain at least one uppercase letter')).toBeInTheDocument();
    });

    // Test: Checks validation for missing numbers in the password.
    it('should show password number error if missing', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      await user.type(screen.getByLabelText(/^password$/i), 'NoNumber!');
      await user.click(screen.getByLabelText(/first name/i));

      await user.click(screen.getByRole('button', { name: /create account/i }));
      expect(await screen.findByText('Password must contain at least one number')).toBeInTheDocument();
    });

    // Test: Ensures name fields reject invalid characters like numbers.
    it('should show name validation error if numbers are entered', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'John123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(await screen.findByText(/First name can only contain letters, spaces, hyphens, or apostrophes/i)).toBeInTheDocument();
    });

    // Test: Verifies successful submission triggers toast and navigation.
    it('should call toast and navigate on successful submission', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      await user.type(screen.getByLabelText(/first name/i), 'Valid');
      await user.type(screen.getByLabelText(/last name/i), 'User');
      await user.type(screen.getByLabelText(/email/i), 'valid@test.com');
      await user.type(screen.getByLabelText(/^password$/i), 'ValidPass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'ValidPass123!');

      await user.click(screen.getByRole('combobox', { name: /Day/i }));
      const dayListbox = await screen.findByRole('listbox');
      await user.click(within(dayListbox).getByText('15'));

      await user.click(screen.getByRole('combobox', { name: /Month/i }));
      const monthListbox = await screen.findByRole('listbox');
      await user.click(within(monthListbox).getByText('01')); 

      await user.click(screen.getByRole('combobox', { name: /Year/i }));
      const yearListbox = await screen.findByRole('listbox');
      await user.click(within(yearListbox).getByText('1995'));

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToastDispatch).toHaveBeenCalledWith(expect.objectContaining({
          title: "Account created",
          description: "Your account has been created successfully.",
        }));
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
});

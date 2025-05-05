import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock PointerEvent methods for Radix UI components in jsdom
// https://github.com/radix-ui/primitives/issues/1822
// https://github.com/testing-library/user-event/discussions/1087

// Define a basic PointerEvent class if it doesn't exist
if (typeof window.PointerEvent === 'undefined') {
  class PointerEvent extends MouseEvent {
    pointerId?: number;
    // Add any other properties or methods needed by your components
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId;
    }
  }
  window.PointerEvent = PointerEvent as any;
}

// Mock hasPointerCapture and releasePointerCapture on Element prototype
if (typeof window !== 'undefined') {
  // Mock hasPointerCapture
  if (!window.HTMLElement.prototype.hasPointerCapture) {
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  }

  // Mock releasePointerCapture
  if (!window.HTMLElement.prototype.releasePointerCapture) {
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  }

  // Mock scrollIntoView
  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  }
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.crypto
if (typeof window !== 'undefined' && !window.crypto) {
  Object.defineProperty(window, 'crypto', {
    value: {
      getRandomValues: (arr: Uint8Array) => {
        // Simple pseudo-random number generator for testing
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
      // Add other crypto methods if needed, mocking minimally
      subtle: {
        // Mock subtle crypto methods if required by your components
      },
    },
    writable: false, // Ensure it matches browser behavior (usually not writable)
  });
}

// You can add other global setup here if needed
// For example, mocking global functions or setting up mocks

// Example: Mocking localStorage (if not done per-test)
// const localStorageMock = (() => {
//   let store: { [key: string]: string } = {};
//   return {
//     getItem: (key: string) => store[key] || null,
//     setItem: (key: string, value: string) => {
//       store[key] = value.toString();
//     },
//     removeItem: (key: string) => {
//       delete store[key];
//     },
//     clear: () => {
//       store = {};
//     }
//   };
// })();
// Object.defineProperty(window, 'localStorage', {
//   value: localStorageMock
// });

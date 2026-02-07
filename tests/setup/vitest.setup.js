/**
 * Vitest Setup File
 * Configures testing environment for React components
 */

import '@testing-library/jest-dom';

// Mock IntersectionObserver
class IntersectionObserverMock {
    constructor(callback) {
        this.callback = callback;
    }
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
}

global.IntersectionObserver = IntersectionObserverMock;

// Mock ResizeObserver
class ResizeObserverMock {
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
}

global.ResizeObserver = ResizeObserverMock;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => { },
    }),
});

// Mock scrollTo
window.scrollTo = () => { };

// Suppress console errors in tests (optional)
// console.error = () => {};

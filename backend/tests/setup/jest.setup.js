/**
 * Jest Global Setup
 * Configures test environment before all tests run
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGOMS_MD5_CHECK = 'false';
process.env.MONGOMS_DOWNLOAD_MD5_CHECK = 'false';
process.env.MONGOMS_VERSION = '7.0.8';
process.env.JWT_ACCESS_SECRET = 'test-secret-access-token-at-least-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-secret-refresh-token-at-least-32-characters-long';
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';

// Increase timeout for integration tests (especially for downloading mongodb binary)
jest.setTimeout(180000);

// Global beforeAll - runs once before all test suites
beforeAll(async () => {
    // Silence console during tests (optional, uncomment if needed)
    // jest.spyOn(console, 'log').mockImplementation(() => {});
    // jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Global afterAll - runs once after all test suites
afterAll(async () => {
    // Cleanup any global resources
});

// Suppress unhandled promise rejection warnings in tests
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection in test:', reason);
});

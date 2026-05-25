import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(viteConfig, defineConfig({
    test: {
        // Use jsdom for DOM testing
        environment: 'jsdom',

        // Setup files
        setupFiles: ['./tests/setup/vitest.setup.js'],

        // Global test APIs
        globals: true,

        // Include pattern
        include: ['tests/**/*.test.{js,jsx,ts,tsx}'],

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/**',
                'tests/**',
                '**/*.config.*',
            ],
        },

        // Timeout
        testTimeout: 10000,
    },
}));

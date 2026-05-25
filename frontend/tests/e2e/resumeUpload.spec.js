/**
 * E2E Test: Resume Upload Flow
 * Tests: File upload, analysis display
 */

import { test, expect } from '@playwright/test';

test.describe('Resume Upload Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/analyze');
    });

    test('should display analyze page', async ({ page }) => {
        // Page should have upload area
        await expect(page.locator('text=/upload|resume|analyze/i').first()).toBeVisible();
    });

    test('should have file upload input', async ({ page }) => {
        // Check for file input (might be hidden)
        const fileInput = page.locator('input[type="file"]');
        await expect(fileInput).toBeAttached();
    });

    test('should have job description textarea', async ({ page }) => {
        // Check for job description input
        const textarea = page.locator('textarea').first();
        await expect(textarea).toBeVisible();
    });

    test('should display analyze button', async ({ page }) => {
        // Look for analyze/submit button
        const analyzeButton = page.locator('button', { hasText: /analyze|scan|check/i }).first();
        await expect(analyzeButton).toBeVisible();
    });

    test('should accept PDF files', async ({ page }) => {
        // Verify that file input accepts PDF
        const fileInput = page.locator('input[type="file"]');
        const acceptAttribute = await fileInput.getAttribute('accept');

        expect(acceptAttribute).toContain('pdf');
    });
});

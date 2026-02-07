/**
 * E2E Test: Full Scan Flow
 * Tests: Complete user journey from landing to analysis
 */

import { test, expect } from '@playwright/test';

test.describe('Full Scan Flow', () => {
    test('should navigate from landing to analyze page', async ({ page }) => {
        // Start at landing page
        await page.goto('/');

        // Find CTA button to analyze
        const analyzeLink = page.locator('a', { hasText: /analyze|scan|check|start/i }).first();

        if (await analyzeLink.isVisible()) {
            await analyzeLink.click();
            await expect(page).toHaveURL(/analyze/);
        }
    });

    test('should display landing page with key sections', async ({ page }) => {
        await page.goto('/');

        // Landing page should have key elements
        await expect(page.locator('text=/ATS|resume|checker|score/i').first()).toBeVisible();
    });

    test('should navigate to pricing page', async ({ page }) => {
        await page.goto('/');

        // Find pricing link
        const pricingLink = page.getByRole('link', { name: /pricing/i }).first();

        if (await pricingLink.isVisible()) {
            await pricingLink.click();
            await expect(page).toHaveURL(/pricing/);
        }
    });

    test('should navigate to help page', async ({ page }) => {
        await page.goto('/');

        // Find help link
        const helpLink = page.getByRole('link', { name: /help|support/i }).first();

        if (await helpLink.isVisible()) {
            await helpLink.click();
            await expect(page).toHaveURL(/help/);
        }
    });

    test('should have responsive navigation', async ({ page }) => {
        await page.goto('/');

        // Check for navigation element
        const nav = page.locator('nav').first();
        await expect(nav).toBeVisible();
    });

    test('should be accessible - has proper heading', async ({ page }) => {
        await page.goto('/');

        // Page should have h1
        const h1 = page.locator('h1').first();
        await expect(h1).toBeVisible();
    });
});

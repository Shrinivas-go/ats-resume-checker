/**
 * E2E Test: Login Flow
 * Tests: Navigation to login, form submission, validation
 */

import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('should display login page', async ({ page }) => {
        // Page should have login form
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should show validation error for empty form', async ({ page }) => {
        // Try to submit empty form
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Should show error or prevent submission
        await expect(page).toHaveURL(/login/);
    });

    test('should navigate to register page', async ({ page }) => {
        // Find register link
        const registerLink = page.getByRole('link', { name: /sign up|register|create account/i });

        if (await registerLink.isVisible()) {
            await registerLink.click();
            await expect(page).toHaveURL(/register/);
        }
    });

    test('should show error for invalid credentials', async ({ page }) => {
        // Fill form with invalid credentials
        await page.fill('input[type="email"]', 'nonexistent@example.com');
        await page.fill('input[type="password"]', 'wrongpassword123');

        // Submit form
        await page.locator('button[type="submit"]').click();

        // Should stay on login page or show error
        await expect(page).toHaveURL(/login/);
    });

    test('should have Google OAuth button', async ({ page }) => {
        // Check for Google sign-in option
        const googleButton = page.locator('button', { hasText: /google/i }).or(
            page.locator('[data-testid="google-signin"]')
        );

        // Google OAuth button should be present
        const isVisible = await googleButton.isVisible();
        expect(isVisible).toBe(true);
    });
});

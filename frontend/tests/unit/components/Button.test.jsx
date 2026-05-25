/**
 * Unit Tests for Button Component
 * Tests: Variants, disabled states, click handling
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../../src/components/ui/Button';

describe('Button Component', () => {
    // =================== RENDERING TESTS ===================

    describe('Rendering', () => {
        it('should render button with children', () => {
            render(<Button>Click me</Button>);
            expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
        });

        it('should render with default variant', () => {
            render(<Button>Default</Button>);
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            render(<Button className="custom-class">Styled</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('custom-class');
        });
    });

    // =================== VARIANT TESTS ===================

    describe('Variants', () => {
        it('should render primary variant', () => {
            render(<Button variant="primary">Primary</Button>);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should render secondary variant', () => {
            render(<Button variant="secondary">Secondary</Button>);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should render ghost variant', () => {
            render(<Button variant="ghost">Ghost</Button>);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should render outline variant', () => {
            render(<Button variant="outline">Outline</Button>);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    // =================== DISABLED STATE TESTS ===================

    describe('Disabled State', () => {
        it('should be disabled when disabled prop is true', () => {
            render(<Button disabled>Disabled</Button>);
            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('should not be disabled by default', () => {
            render(<Button>Enabled</Button>);
            expect(screen.getByRole('button')).not.toBeDisabled();
        });

        it('should not trigger onClick when disabled', () => {
            const handleClick = vi.fn();
            render(<Button disabled onClick={handleClick}>Disabled</Button>);

            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    // =================== CLICK HANDLING TESTS ===================

    describe('Click Handling', () => {
        it('should call onClick when clicked', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Click</Button>);

            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should call onClick multiple times', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Click</Button>);

            const button = screen.getByRole('button');
            fireEvent.click(button);
            fireEvent.click(button);
            fireEvent.click(button);

            expect(handleClick).toHaveBeenCalledTimes(3);
        });
    });

    // =================== LOADING STATE TESTS ===================

    describe('Loading State', () => {
        it('should show loading state when loading prop is true', () => {
            render(<Button loading>Loading</Button>);
            const button = screen.getByRole('button');
            // Button should still be in the DOM
            expect(button).toBeInTheDocument();
        });

        it('should disable button when loading', () => {
            render(<Button loading>Loading</Button>);
            // Loading buttons are typically disabled
            expect(screen.getByRole('button')).toBeDisabled();
        });
    });

    // =================== TYPE TESTS ===================

    describe('Button Type', () => {
        it('should have type="button" by default', () => {
            render(<Button>Button</Button>);
            expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
        });

        it('should accept type="submit"', () => {
            render(<Button type="submit">Submit</Button>);
            expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
        });
    });
});

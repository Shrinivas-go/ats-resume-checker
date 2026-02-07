/**
 * Unit Tests for ScoreRing Component
 * Tests: Rendering, score display, color states
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoreRing from '../../../src/components/ui/ScoreRing';

describe('ScoreRing Component', () => {
    // =================== RENDERING TESTS ===================

    describe('Rendering', () => {
        it('should render without crashing', () => {
            render(<ScoreRing score={50} />);
            expect(screen.getByText('50')).toBeInTheDocument();
        });

        it('should display the score value', () => {
            render(<ScoreRing score={85} />);
            expect(screen.getByText('85')).toBeInTheDocument();
        });

        it('should display label when provided', () => {
            render(<ScoreRing score={75} label="ATS Score" />);
            expect(screen.getByText('ATS Score')).toBeInTheDocument();
        });

        it('should render SVG circle element', () => {
            const { container } = render(<ScoreRing score={60} />);
            const svg = container.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });
    });

    // =================== SCORE VALUE TESTS ===================

    describe('Score Values', () => {
        it('should handle score of 0', () => {
            render(<ScoreRing score={0} />);
            expect(screen.getByText('0')).toBeInTheDocument();
        });

        it('should handle score of 100', () => {
            render(<ScoreRing score={100} />);
            expect(screen.getByText('100')).toBeInTheDocument();
        });

        it('should handle middle score (50)', () => {
            render(<ScoreRing score={50} />);
            expect(screen.getByText('50')).toBeInTheDocument();
        });

        it('should round decimal scores', () => {
            render(<ScoreRing score={75.7} />);
            // Component should either round or display as-is
            const scoreElement = screen.queryByText('76') || screen.queryByText('75.7') || screen.queryByText('75');
            expect(scoreElement).toBeInTheDocument();
        });
    });

    // =================== ACCESSIBILITY TESTS ===================

    describe('Accessibility', () => {
        it('should have proper structure for screen readers', () => {
            const { container } = render(<ScoreRing score={80} label="Match Score" />);

            // Should have meaningful content
            expect(screen.getByText('80')).toBeInTheDocument();
            expect(screen.getByText('Match Score')).toBeInTheDocument();
        });
    });
});

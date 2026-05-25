import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import styles from './ScoreRing.module.css';

/**
 * ScoreRing Component
 * Animated circular progress indicator for ATS score with color interpolation
 *
 * @param {number} score - 0 to 100
 * @param {number} size - pixel size
 * @param {number} strokeWidth - stroke width
 * @param {boolean} animateOnLoad - whether to animate from 0
 * @param {string} label - Override label (e.g. "ATS Score")
 */
export default function ScoreRing({
    score,
    size = 160,
    strokeWidth = 12,
    className = '',
    animateOnLoad = true,
    label
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Motion Values
    const progress = useMotionValue(animateOnLoad ? 0 : score);
    const roundedScore = useTransform(progress, value => Math.round(value));
    const dashOffset = useTransform(progress, value =>
        circumference - (value / 100) * circumference
    );

    // Color Interpolation: 0-40 (Red), 41-70 (Amber), 71-100 (Green)
    // Using Tailwind default hex values for better interpolation
    const color = useTransform(
        progress,
        [0, 40, 70, 100],
        ['#ef4444', '#ef4444', '#f59e0b', '#22c55e']
    );

    const labelText = useTransform(progress, (v) => {
        if (v >= 80) return 'Excellent';
        if (v >= 60) return 'Good';
        if (v >= 40) return 'Fair';
        return 'Needs Work';
    });

    useEffect(() => {
        if (animateOnLoad) {
            const controls = animate(progress, score, {
                duration: 1.5,
                ease: "easeOut"
            });
            return controls.stop;
        }
    }, [score, animateOnLoad, progress]);

    return (
        <div className={`${styles.container} ${className}`} style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className={styles.svg}
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--border-default)"
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    style={{
                        stroke: color,
                        strokeDasharray: circumference,
                        strokeDashoffset: dashOffset
                    }}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>

            <div className={styles.content}>
                <motion.span className={styles.score} style={{ color }}>
                    {roundedScore}
                </motion.span>
                <motion.span className={styles.label} style={{ color }}>
                    {label || labelText}
                </motion.span>
            </div>
        </div>
    );
}

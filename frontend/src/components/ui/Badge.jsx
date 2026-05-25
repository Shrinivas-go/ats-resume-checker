import styles from './Badge.module.css';

/**
 * Badge Component
 * Variants: default, success, warning, error, purple
 */
export default function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = '',
}) {
    const classNames = [
        styles.badge,
        styles[variant],
        styles[size],
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classNames}>
            {children}
        </span>
    );
}

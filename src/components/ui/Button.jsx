import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import styles from './Button.module.css';

/**
 * Button Component
 * Variants: primary, secondary, ghost, danger
 * Sizes: sm, md, lg
 */
const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon: Icon,
    iconPosition = 'left',
    type = 'button',
    className = '',
    onClick,
    ...props
}, ref) => {
    const classNames = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
    ].filter(Boolean).join(' ');

    return (
        <motion.button
            ref={ref}
            type={type}
            className={classNames}
            disabled={disabled || loading}
            onClick={onClick}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            transition={{ duration: 0.1 }}
            {...props}
        >
            {loading && (
                <span className={styles.spinner} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" className={styles.spinnerIcon}>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="12" />
                    </svg>
                </span>
            )}
            {Icon && iconPosition === 'left' && !loading && (
                <Icon className={styles.icon} size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
            )}
            <span className={styles.label}>{children}</span>
            {Icon && iconPosition === 'right' && !loading && (
                <Icon className={styles.icon} size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
            )}
        </motion.button>
    );
});

Button.displayName = 'Button';

export default Button;

import { forwardRef } from 'react';
import styles from './Textarea.module.css';

/**
 * Textarea Component
 */
const Textarea = forwardRef(({
    label,
    error,
    hint,
    disabled = false,
    required = false,
    fullWidth = true,
    rows = 4,
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const containerClasses = [
        styles.container,
        fullWidth && styles.fullWidth,
        className,
    ].filter(Boolean).join(' ');

    const textareaClasses = [
        styles.textarea,
        error && styles.error,
        disabled && styles.disabled,
    ].filter(Boolean).join(' ');

    return (
        <div className={containerClasses}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}

            <textarea
                ref={ref}
                id={inputId}
                rows={rows}
                disabled={disabled}
                className={textareaClasses}
                aria-invalid={!!error}
                {...props}
            />

            {error && (
                <p className={styles.errorText} role="alert">
                    {error}
                </p>
            )}

            {hint && !error && (
                <p className={styles.hint}>
                    {hint}
                </p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;

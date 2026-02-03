import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Input.module.css';

/**
 * Input Component
 * Supports text, email, password with toggle, textarea
 */
const Input = forwardRef(({
    label,
    error,
    hint,
    icon: Icon,
    type = 'text',
    disabled = false,
    required = false,
    fullWidth = true,
    className = '',
    id,
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputType = type === 'password' && showPassword ? 'text' : type;

    const containerClasses = [
        styles.container,
        fullWidth && styles.fullWidth,
        className,
    ].filter(Boolean).join(' ');

    const inputClasses = [
        styles.input,
        Icon && styles.hasIcon,
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

            <div className={styles.inputWrapper}>
                {Icon && (
                    <span className={styles.iconLeft}>
                        <Icon size={18} />
                    </span>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    type={inputType}
                    disabled={disabled}
                    className={inputClasses}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    {...props}
                />

                {type === 'password' && (
                    <button
                        type="button"
                        className={styles.togglePassword}
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>

            {error && (
                <p id={`${inputId}-error`} className={styles.errorText} role="alert">
                    {error}
                </p>
            )}

            {hint && !error && (
                <p id={`${inputId}-hint`} className={styles.hint}>
                    {hint}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;

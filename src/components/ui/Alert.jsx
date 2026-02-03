import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import styles from './Alert.module.css';

const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
};

/**
 * Alert Component
 * For feedback messages
 */
export default function Alert({
    children,
    variant = 'info',
    title,
    className = '',
    onClose,
}) {
    const Icon = icons[variant];

    const classNames = [
        styles.alert,
        styles[variant],
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={classNames} role="alert">
            <Icon className={styles.icon} size={20} />
            <div className={styles.content}>
                {title && <p className={styles.title}>{title}</p>}
                <p className={styles.message}>{children}</p>
            </div>
            {onClose && (
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Dismiss"
                >
                    ×
                </button>
            )}
        </div>
    );
}

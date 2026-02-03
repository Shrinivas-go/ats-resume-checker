import { motion } from 'framer-motion';
import styles from './Card.module.css';

/**
 * Card Component
 * Container with subtle shadow and hover effect
 */
export default function Card({
    children,
    padding = 'md',
    hoverable = false,
    className = '',
    onClick,
    ...props
}) {
    const classNames = [
        styles.card,
        styles[`padding-${padding}`],
        hoverable && styles.hoverable,
        onClick && styles.clickable,
        className,
    ].filter(Boolean).join(' ');

    return (
        <motion.div
            className={classNames}
            onClick={onClick}
            whileHover={hoverable ? { y: -2 } : undefined}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Card Header
 */
Card.Header = function CardHeader({ children, className = '' }) {
    return (
        <div className={`${styles.header} ${className}`}>
            {children}
        </div>
    );
};

/**
 * Card Title
 */
Card.Title = function CardTitle({ children, className = '' }) {
    return (
        <h3 className={`${styles.title} ${className}`}>
            {children}
        </h3>
    );
};

/**
 * Card Description
 */
Card.Description = function CardDescription({ children, className = '' }) {
    return (
        <p className={`${styles.description} ${className}`}>
            {children}
        </p>
    );
};

/**
 * Card Content
 */
Card.Content = function CardContent({ children, className = '' }) {
    return (
        <div className={`${styles.content} ${className}`}>
            {children}
        </div>
    );
};

/**
 * Card Footer
 */
Card.Footer = function CardFooter({ children, className = '' }) {
    return (
        <div className={`${styles.footer} ${className}`}>
            {children}
        </div>
    );
};

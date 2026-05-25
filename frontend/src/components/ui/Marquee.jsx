import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Marquee.module.css';

/**
 * Marquee Component
 * Infinite horizontal scroll with pause on hover, gradient fade edges
 */
export default function Marquee({
    items,
    speed = 30,
    pauseOnHover = true,
    className = ''
}) {
    const containerRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const [contentWidth, setContentWidth] = useState(0);

    useEffect(() => {
        if (containerRef.current) {
            const firstChild = containerRef.current.querySelector('[data-marquee-content]');
            if (firstChild) {
                setContentWidth(firstChild.offsetWidth);
            }
        }
    }, [items]);

    const duration = contentWidth / speed;

    return (
        <div
            className={`${styles.marqueeWrapper} ${className}`}
            onMouseEnter={() => pauseOnHover && setIsPaused(true)}
            onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        >
            {/* Left gradient fade */}
            <div className={`${styles.gradientFade} ${styles.fadeLeft}`} />

            {/* Right gradient fade */}
            <div className={`${styles.gradientFade} ${styles.fadeRight}`} />

            <div className={styles.marqueeTrack} ref={containerRef}>
                {/* First copy */}
                <motion.div
                    className={styles.marqueeContent}
                    data-marquee-content
                    animate={{
                        x: isPaused ? 0 : -contentWidth,
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: 'loop',
                            duration: duration,
                            ease: 'linear',
                        },
                    }}
                    style={{ x: 0 }}
                >
                    {items.map((item, index) => (
                        <div key={index} className={styles.marqueeItem}>
                            {item.icon && (
                                <div className={styles.itemIcon}>
                                    <item.icon size={18} />
                                </div>
                            )}
                            <span className={styles.itemText}>{item.text}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Duplicate for seamless loop */}
                <motion.div
                    className={styles.marqueeContent}
                    animate={{
                        x: isPaused ? contentWidth : 0,
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: 'loop',
                            duration: duration,
                            ease: 'linear',
                        },
                    }}
                    style={{ x: contentWidth }}
                >
                    {items.map((item, index) => (
                        <div key={`dup-${index}`} className={styles.marqueeItem}>
                            {item.icon && (
                                <div className={styles.itemIcon}>
                                    <item.icon size={18} />
                                </div>
                            )}
                            <span className={styles.itemText}>{item.text}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import styles from './FeatureShowcase.module.css';

export default function FeatureShowcase({
    title,
    description,
    features = [],
    imagePosition = 'left',
    imageSrc, // Placeholder for now, can be replaced with actual image or component
    imageAlt = 'Feature illustration',
    color = 'purple'
}) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

    const isLeft = imagePosition === 'left';

    return (
        <section className={styles.section} ref={ref}>
            <div className={`${styles.container} ${!isLeft ? styles.reverse : ''}`}>

                {/* Visual Side */}
                <motion.div
                    className={styles.visualColumn}
                    style={{ y, opacity }}
                >
                    <div className={styles.visualWrapper}>
                        <div className={styles.blob} style={{ '--blob-color': `var(--${color}-500)` }} />
                        <Card className={styles.visualCard} padding="none">
                            {imageSrc ? (
                                <img src={imageSrc} alt={imageAlt} className={styles.image} />
                            ) : (
                                <div className={styles.placeholderVisual}>
                                    <div className={styles.placeholderContent}>
                                        <div className={styles.placeholderIcon}>
                                            {/* Icon based on title logic could go here */}
                                        </div>
                                        <p className={styles.placeholderText}>{imageAlt}</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </motion.div>

                {/* Text Side */}
                <motion.div
                    className={styles.textColumn}
                    initial={{ opacity: 0, x: isLeft ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.description}>{description}</p>

                    <ul className={styles.featureList}>
                        {features.map((feature, index) => (
                            <motion.li
                                key={index}
                                className={styles.featureItem}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <CheckCircle size={20} className={styles.checkIcon} style={{ color: `var(--${color}-500)` }} />
                                <span>{feature}</span>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>

            </div>
        </section>
    );
}

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Upload, FileText, CheckCircle, Search, BarChart } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import styles from './ExperienceHero.module.css';

export default function ExperienceHero() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section className={styles.section} ref={containerRef}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <motion.div
                        className={styles.textContent}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className={styles.title}>
                            See how your resume <br />
                            <span className={styles.highlight}>stacks up instantly</span>
                        </h2>
                        <p className={styles.description}>
                            Stop guessing what recruiters want. Our AI analyzes your resume against
                            real job descriptions to give you concrete, actionable feedback in seconds.
                        </p>

                        <div className={styles.features}>
                            {[
                                "Instant ATS Score",
                                "Keyword Gap Analysis",
                                "Formatting Check"
                            ].map((item, i) => (
                                <div key={i} className={styles.featureItem}>
                                    <CheckCircle size={20} className={styles.checkIcon} />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>

                        <Button size="lg" className={styles.ctaButton}>
                            Try It For Free
                        </Button>
                    </motion.div>

                    <div className={styles.visualWrapper}>
                        <motion.div
                            className={styles.visualContainer}
                            style={{ y, opacity }}
                        >
                            <Card className={styles.demoCard} padding="none">
                                <div className={styles.demoHeader}>
                                    <div className={styles.dot} />
                                    <div className={styles.dot} />
                                    <div className={styles.dot} />
                                </div>

                                <div className={styles.demoContent}>
                                    {/* Scanning Animation */}
                                    <div className={styles.scanLine} />

                                    <div className={styles.resumePreview}>
                                        <div className={styles.resumeHeader} />
                                        <div className={styles.resumeBlock} style={{ width: '80%' }} />
                                        <div className={styles.resumeBlock} style={{ width: '90%' }} />
                                        <div className={styles.resumeBlock} style={{ width: '60%' }} />
                                        <div className={styles.resumeSeparator} />
                                        <div className={styles.resumeBlock} style={{ width: '70%' }} />
                                        <div className={styles.resumeBlock} style={{ width: '85%' }} />
                                    </div>

                                    {/* Popups */}
                                    <motion.div
                                        className={styles.popup}
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        viewport={{ amount: 0.5 }}
                                        transition={{ delay: 0.5, type: 'spring' }}
                                        style={{ top: '20%', right: '-20px' }}
                                    >
                                        <Search size={16} color="#6366f1" />
                                        <span>Keywords Found</span>
                                    </motion.div>

                                    <motion.div
                                        className={styles.popup}
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        viewport={{ amount: 0.5 }}
                                        transition={{ delay: 1, type: 'spring' }}
                                        style={{ bottom: '30%', left: '-20px' }}
                                    >
                                        <BarChart size={16} color="#10b981" />
                                        <span>High Impact</span>
                                    </motion.div>

                                    <motion.div
                                        className={styles.scoreBadge}
                                        initial={{ scale: 0, rotate: -20 }}
                                        whileInView={{ scale: 1, rotate: 0 }}
                                        viewport={{ amount: 0.5 }}
                                        transition={{ delay: 1.5, type: 'spring' }}
                                    >
                                        <span className={styles.scoreLabel}>ATS Score</span>
                                        <span className={styles.scoreValue}>92</span>
                                    </motion.div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

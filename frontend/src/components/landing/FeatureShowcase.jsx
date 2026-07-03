import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle, BarChart3, Layout, Sparkles, FileText, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import styles from './FeatureShowcase.module.css';

export default function FeatureShowcase({
    title,
    description,
    features = [],
    imagePosition = 'left',
    imageSrc,
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

    // Premium interactive mockup visuals corresponding to different feature titles
    const renderMockup = () => {
        if (title.includes("Score")) {
            return (
                <div className={`${styles.mockupContainer} ${styles.scoreMockup}`}>
                    <div className={styles.mockupHeader}>
                        <BarChart3 size={18} />
                        <span>Analysis Result</span>
                    </div>
                    <div className={styles.mockupBody}>
                        <div className={styles.mockupRing}>
                            <svg viewBox="0 0 100 100" className={styles.svgRing}>
                                <circle cx="50" cy="50" r="40" className={styles.ringTrack} />
                                <motion.circle 
                                    cx="50" cy="50" r="40" 
                                    className={styles.ringFill} 
                                    style={{ strokeDasharray: "251.2", strokeDashoffset: "50" }}
                                    animate={{ strokeDashoffset: [251.2, 50] }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </svg>
                            <div className={styles.ringText}>
                                <span className={styles.ringValue}>82</span>
                                <span className={styles.ringLabel}>ATS Score</span>
                            </div>
                        </div>
                        <div className={styles.mockupStats}>
                            <div className={styles.statRow}>
                                <span>Core Skills</span>
                                <div className={styles.barContainer}><div className={styles.barFill} style={{ width: '85%', background: 'var(--purple-500)' }} /></div>
                            </div>
                            <div className={styles.statRow}>
                                <span>Experience</span>
                                <div className={styles.barContainer}><div className={styles.barFill} style={{ width: '70%', background: 'var(--pink-500)' }} /></div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (title.includes("Structure")) {
            return (
                <div className={`${styles.mockupContainer} ${styles.structureMockup}`}>
                    <div className={styles.mockupHeader}>
                        <Layout size={18} />
                        <span>Structure & Format Check</span>
                    </div>
                    <div className={styles.mockupBody}>
                        <div className={styles.resumePageMock}>
                            <div className={styles.resumeHeaderMock} />
                            <div className={`${styles.resumeSectionMock} ${styles.successSection}`}>
                                <div className={styles.sectionLabel}>Contact Information</div>
                                <span className={styles.badgeSuccess}>Parsed ✓</span>
                            </div>
                            <div className={`${styles.resumeSectionMock} ${styles.successSection}`}>
                                <div className={styles.sectionLabel}>Work History</div>
                                <span className={styles.badgeSuccess}>Parsed ✓</span>
                            </div>
                            <div className={`${styles.resumeSectionMock} ${styles.warningSection}`}>
                                <div className={styles.sectionLabel}>Skills</div>
                                <span className={styles.badgeWarning}>Format Issue ⚠️</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (title.includes("Verb")) {
            return (
                <div className={`${styles.mockupContainer} ${styles.verbMockup}`}>
                    <div className={styles.mockupHeader}>
                        <Sparkles size={18} />
                        <span>Verb Improver</span>
                    </div>
                    <div className={styles.mockupBody}>
                        <div className={styles.verbCard}>
                            <div className={styles.verbBadgeOriginal}>Original Text</div>
                            <p className={styles.verbTextOriginal}>"I <strong>worked</strong> on the web interface and <strong>helped</strong> the database team."</p>
                            <div className={styles.verbArrow}><ArrowRight size={16} /></div>
                            <div className={styles.verbBadgeNew}>Optimized Suggestion</div>
                            <p className={styles.verbTextNew}>"<strong>Engineered</strong> the web interface and <strong>architected</strong> database optimizations."</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={`${styles.mockupContainer} ${styles.formatMockup}`}>
                <div className={styles.mockupHeader}>
                    <FileText size={18} />
                    <span>Recruiter Skim Simulation</span>
                </div>
                <div className={styles.mockupBody}>
                    <div className={styles.skimPreview}>
                        <div className={styles.skimHeatmap}>
                            <div className={styles.heatPeak} />
                            <span className={styles.skimTimer}>6s Read Time Peak</span>
                        </div>
                        <div className={styles.skimDetails}>
                            <div><strong>Summary Presence:</strong> Strong</div>
                            <div><strong>Formatting Check:</strong> Passing</div>
                            <div><strong>Readability Level:</strong> Professional</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                                renderMockup()
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

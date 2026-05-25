import { motion } from 'framer-motion';
import {
    Zap, Target, FileCheck, MessageSquare,
    BarChart3, ShieldCheck, Sparkles, Clock
} from 'lucide-react';
import styles from './FeatureMarquee.module.css';

const FEATURES = [
    { icon: Zap, label: 'Real-time Algorithm Matching', color: '#f59e0b' },
    { icon: Target, label: 'Keyword Gap Analysis', color: '#10b981' },
    { icon: FileCheck, label: 'Resume Structure Validation', color: '#6366f1' },
    { icon: MessageSquare, label: 'Instant Actionable Feedback', color: '#ec4899' },
    { icon: BarChart3, label: 'ATS Score Breakdown', color: '#8b5cf6' },
    { icon: ShieldCheck, label: 'Recruiter-Friendly Check', color: '#14b8a6' },
    { icon: Sparkles, label: 'Action Verb Intelligence', color: '#f97316' },
    { icon: Clock, label: 'Quick 30-Second Analysis', color: '#3b82f6' },
];

// Duplicate for seamless loop
const MARQUEE_ITEMS = [...FEATURES, ...FEATURES];

export default function FeatureMarquee() {
    return (
        <section className={styles.marqueeSection}>
            <div className={styles.marqueeContainer}>
                {/* Gradient overlays for smooth fade effect */}
                <div className={styles.fadeLeft} />
                <div className={styles.fadeRight} />

                <motion.div
                    className={styles.marqueeTrack}
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: 'loop',
                            duration: 30,
                            ease: 'linear',
                        }
                    }}
                    whileHover={{ animationPlayState: 'paused' }}
                >
                    {MARQUEE_ITEMS.map((feature, index) => (
                        <div
                            key={index}
                            className={styles.featureItem}
                            style={{ '--feature-color': feature.color }}
                        >
                            <div className={styles.iconWrapper}>
                                <feature.icon size={20} />
                            </div>
                            <span className={styles.label}>{feature.label}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

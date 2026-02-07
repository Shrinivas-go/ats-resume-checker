import { motion } from 'framer-motion';
import { FileText, Zap } from 'lucide-react';
import styles from './ScanningAnimation.module.css';

/**
 * ScanningAnimation - Premium animated scanning effect
 * Shows during resume analysis to provide visual feedback
 */
export default function ScanningAnimation({ fileName = 'Resume', stage = 'scanning' }) {
    const stages = {
        scanning: { text: 'Scanning document...', progress: 25 },
        parsing: { text: 'Extracting sections...', progress: 50 },
        matching: { text: 'Matching skills...', progress: 75 },
        finalizing: { text: 'Generating report...', progress: 90 },
    };

    const currentStage = stages[stage] || stages.scanning;

    return (
        <div className={styles.container}>
            {/* Animated Document */}
            <motion.div
                className={styles.documentWrapper}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <div className={styles.document}>
                    {/* Scan line animation */}
                    <motion.div
                        className={styles.scanLine}
                        animate={{
                            y: [0, 140, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />

                    {/* Document content placeholder */}
                    <div className={styles.docContent}>
                        <div className={styles.docLine} style={{ width: '70%' }} />
                        <div className={styles.docLine} style={{ width: '100%' }} />
                        <div className={styles.docLine} style={{ width: '85%' }} />
                        <div className={styles.docLine} style={{ width: '60%' }} />
                        <div className={styles.docLine} style={{ width: '90%' }} />
                        <div className={styles.docLine} style={{ width: '75%' }} />
                        <div className={styles.docLine} style={{ width: '80%' }} />
                    </div>

                    {/* File icon overlay */}
                    <div className={styles.fileOverlay}>
                        <FileText size={24} />
                    </div>
                </div>
            </motion.div>

            {/* Status */}
            <div className={styles.status}>
                <motion.div
                    key={stage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.statusText}
                >
                    <Zap size={16} className={styles.zapIcon} />
                    <span>{currentStage.text}</span>
                </motion.div>

                {/* Progress bar */}
                <div className={styles.progressTrack}>
                    <motion.div
                        className={styles.progressBar}
                        initial={{ width: 0 }}
                        animate={{ width: `${currentStage.progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <p className={styles.fileName}>{fileName}</p>
            </div>

            {/* Floating particles */}
            <div className={styles.particles}>
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={styles.particle}
                        animate={{
                            y: [-20, -60, -20],
                            x: [0, (i % 2 === 0 ? 10 : -10), 0],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 2 + i * 0.3,
                            repeat: Infinity,
                            delay: i * 0.2,
                        }}
                        style={{ left: `${15 + i * 14}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

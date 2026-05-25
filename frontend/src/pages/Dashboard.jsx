import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Zap, Clock, Coins, FileText, TrendingUp, RefreshCw, ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Dashboard - Dynamic hub with scan history, credits, and stats
 */
export default function Dashboard() {
    const { user } = useAuth();
    const [credits, setCredits] = useState(null);
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalScans: 0, avgScore: 0 });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch credits and scans in parallel
            const [creditsRes, scansRes] = await Promise.all([
                fetch(`${API_URL}/credits/balance`, { credentials: 'include' }),
                fetch(`${API_URL}/credits/scans?limit=10`, { credentials: 'include' }),
            ]);

            const creditsData = await creditsRes.json();
            const scansData = await scansRes.json();

            if (creditsData.success) {
                setCredits(creditsData.credits);
            }

            if (scansData.success && scansData.scans) {
                setScans(scansData.scans);
                // Calculate stats
                const validScores = scansData.scans.filter(s => s.score != null);
                const avgScore = validScores.length > 0
                    ? Math.round(validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length)
                    : 0;
                setStats({
                    totalScans: scansData.scans.length,
                    avgScore,
                });
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--success)';
        if (score >= 60) return 'var(--warning)';
        return 'var(--error)';
    };

    return (
        <>
            <Navbar />
            <main className={styles.dashboard}>
                {/* Welcome Section */}
                <motion.section className={styles.welcome} {...fadeIn}>
                    <h1 className={styles.welcomeTitle}>
                        Welcome, <span className={styles.userName}>{user?.name || 'there'}</span>! 👋
                    </h1>
                    <p className={styles.welcomeSubtitle}>
                        {scans.length > 0
                            ? `You've analyzed ${stats.totalScans} resume${stats.totalScans !== 1 ? 's' : ''}.`
                            : "Upload your resume to get started."}
                    </p>
                </motion.section>

                {/* Stats Cards */}
                <section className={styles.cardsSection}>
                    <div className={styles.cardsGrid}>
                        <motion.div className={styles.card} {...fadeIn} transition={{ delay: 0.1 }}>
                            <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                                <Coins size={24} />
                            </div>
                            <div className={styles.cardContent}>
                                <span className={styles.cardLabel}>Credits</span>
                                <span className={styles.cardValue}>
                                    {loading ? '...' : credits ?? 0}
                                </span>
                            </div>
                            {credits !== null && credits < 3 && (
                                <Link to="/pricing" className={styles.cardLink}>
                                    Get more <ArrowRight size={14} />
                                </Link>
                            )}
                        </motion.div>

                        <motion.div className={styles.card} {...fadeIn} transition={{ delay: 0.2 }}>
                            <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
                                <FileText size={24} />
                            </div>
                            <div className={styles.cardContent}>
                                <span className={styles.cardLabel}>Total Scans</span>
                                <span className={styles.cardValue}>
                                    {loading ? '...' : stats.totalScans}
                                </span>
                            </div>
                        </motion.div>

                        <motion.div className={styles.card} {...fadeIn} transition={{ delay: 0.3 }}>
                            <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                                <TrendingUp size={24} />
                            </div>
                            <div className={styles.cardContent}>
                                <span className={styles.cardLabel}>Avg Score</span>
                                <span className={styles.cardValue}>
                                    {loading ? '...' : stats.avgScore > 0 ? `${stats.avgScore}%` : '--'}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className={styles.ctaSection}>
                    <Link to="/analyze" className={styles.ctaButton}>
                        <RefreshCw size={20} />
                        <span>{scans.length > 0 ? 'Analyze New Resume' : 'Analyze Your Resume'}</span>
                    </Link>
                </section>

                {/* Scan History */}
                {scans.length > 0 && (
                    <motion.section
                        className={styles.historySection}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className={styles.sectionTitle}>Recent Scans</h2>
                        <div className={styles.historyList}>
                            {scans.map((scan, index) => (
                                <motion.div
                                    key={scan._id || index}
                                    className={styles.historyItem}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    <div className={styles.historyIcon}>
                                        <FileText size={18} />
                                    </div>
                                    <div className={styles.historyDetails}>
                                        <span className={styles.historyFilename}>
                                            {scan.filename || 'Resume'}
                                        </span>
                                        <span className={styles.historyDate}>
                                            <Clock size={12} /> {formatDate(scan.createdAt)}
                                        </span>
                                    </div>
                                    <div
                                        className={styles.historyScore}
                                        style={{ color: getScoreColor(scan.score) }}
                                    >
                                        {scan.score != null ? (
                                            <>
                                                <PieChart size={16} />
                                                {scan.score}%
                                            </>
                                        ) : '--'}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Empty State */}
                {!loading && scans.length === 0 && (
                    <section className={styles.emptySection}>
                        <Zap size={48} className={styles.emptyIcon} />
                        <h3>No scans yet</h3>
                        <p>Upload your resume to see your ATS score and improvement suggestions.</p>
                    </section>
                )}
            </main>
        </>
    );
}

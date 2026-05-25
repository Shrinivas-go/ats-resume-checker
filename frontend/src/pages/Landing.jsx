import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileCheck, Target, Zap, Shield, ArrowRight, CheckCircle, Layout,
    PieChart, MousePointer, Search, FileText, Star, ChevronDown,
    BarChart3, Edit3, Users, Sparkles, BookOpen, MessageSquare, Briefcase
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ScoreRing from '../components/ui/ScoreRing';
import FeatureMarquee from '../components/landing/FeatureMarquee';
import ExperienceHero from '../components/landing/ExperienceHero';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FAQSection from '../components/landing/FAQSection';
import { useAuth } from '../context/AuthContext';
import styles from './Landing.module.css';

const features = [
    {
        icon: PieChart,
        title: 'ATS Score Analysis',
        description: 'Get a precise match score based on core and optional skills found in the job description.',
    },
    {
        icon: MousePointer,
        title: 'Smart Calibration',
        description: 'Identify exactly which keywords are missing and where to add them for maximum impact.',
    },
    {
        icon: Shield,
        title: 'Parsing Validation',
        description: 'Ensure your resume is readable by Applicant Tracking Systems before a human ever sees it.',
    },
    {
        icon: FileCheck,
        title: 'Professional PDFs',
        description: 'Generate and download detailed reports to track your improvements over time.',
    },
];

// Alternating feature showcase data
const showcaseFeatures = [
    {
        title: "ATS Score Breakdown",
        description: "Get a comprehensive breakdown of how your resume scores against job requirements. See core skills, optional skills, and keyword density in one unified view.",
        features: ["Core skill matching", "Optional skill detection", "Keyword density analysis"],
        imagePosition: "left",
        color: "purple",
        imageAlt: "Detailed score breakdown visualization"
    },
    {
        title: "Resume Structure Analysis",
        description: "Our parser validates your resume structure to ensure ATS systems can read every section correctly. No more missing information due to formatting issues.",
        features: ["Section detection", "Header validation", "Contact info check"],
        imagePosition: "right",
        color: "pink",
        imageAlt: "Structure validation check"
    },
    {
        title: "Action Verb Intelligence",
        description: "Replace weak verbs with powerful action words that recruiters love. Our engine suggests impactful alternatives to make your experience shine.",
        features: ["Verb strength scoring", "Industry-specific suggestions", "Impact-focused rewrites"],
        imagePosition: "left",
        color: "orange",
        imageAlt: "Action verb suggestions"
    },
    {
        title: "Recruiter-Friendly Formatting",
        description: "Recruiters spend an average of 6 seconds on a resume. We help you optimize layout and hierarchy so key information stands out immediately.",
        features: ["Visual hierarchy check", "Skim-time estimation", "Highlight placement"],
        imagePosition: "right",
        color: "blue",
        imageAlt: "Recruiter view simulation"
    }
];

// Blog/Learn preview data with real images
const blogPreviews = [
    {
        title: "10 ATS-Friendly Resume Tips for 2026",
        excerpt: "Learn the latest strategies to ensure your resume passes automated screening systems.",
        category: "Resume Tips",
        readTime: "5 min read",
        image: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        title: "Keywords That Get You Hired",
        excerpt: "Discover which action verbs and industry terms make the biggest impact.",
        category: "Career Advice",
        readTime: "4 min read",
        image: "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
        title: "Common Resume Mistakes to Avoid",
        excerpt: "Stop making these formatting errors that get resumes instantly rejected.",
        category: "Best Practices",
        readTime: "6 min read",
        image: "https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
];

// Stagger animation variants
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className={styles.page}>
            <Navbar />

            <main>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className={styles.container}>
                        <motion.div
                            className={styles.heroContent}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className={styles.badge}>
                                <CheckCircle size={14} />
                                Validated by Recruiter Logic
                            </span>
                            <h1 className={styles.heroTitle}>
                                Beat the ATS. <br />
                                <span className={styles.highlight}>Land the Interview.</span>
                            </h1>
                            <p className={styles.heroDescription}>
                                Don't let automated systems reject your resume. Get a detailed analysis,
                                find missing keywords, and optimize your application in seconds.
                            </p>

                            <div className={styles.heroCta}>
                                {user ? (
                                    <Link to="/analyze">
                                        <Button size="lg" icon={ArrowRight} iconPosition="right">
                                            Analyze Your Resume
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/register">
                                            <Button size="lg" icon={ArrowRight} iconPosition="right">
                                                Optimize My Resume
                                            </Button>
                                        </Link>
                                        <Link to="/login">
                                            <Button variant="secondary" size="lg">
                                                Login
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            className={styles.heroVisual}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {/* Floating Decorators */}
                            <div className={`${styles.floatCard} ${styles.floatTopRight}`}>
                                <CheckCircle size={16} className={styles.floatIcon} />
                                <span>Format Valid</span>
                            </div>
                            <div className={`${styles.floatCard} ${styles.floatBottomLeft}`}>
                                <Target size={16} className={styles.floatIcon} />
                                <span>Keywords Found</span>
                            </div>

                            {/* Main Score Card */}
                            <div className={styles.heroVisualCard}>
                                <ScoreRing
                                    score={82}
                                    size={160}
                                    strokeWidth={12}
                                    animateOnLoad={true}
                                />

                                <div className={styles.heroStats}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Keyword Match</span>
                                        <span className={`${styles.statValue} ${styles.good}`}>Strong</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Formatting</span>
                                        <span className={`${styles.statValue} ${styles.fair}`}>Good</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Animated Feature Marquee (REPLACED) */}
                <FeatureMarquee />

                {/* Features Section with Enhanced Animations (KEPT BUT POLISHED) */}
                <section className={styles.features}>
                    <div className={styles.container}>
                        <motion.div
                            className={styles.sectionHeader}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className={styles.sectionTitle}>Review. Optimize. Succeed.</h2>
                            <p className={styles.sectionDescription}>
                                Our advanced algorithm scans your resume against job descriptions to assist you in getting past the initial screening.
                            </p>
                        </motion.div>

                        <motion.div
                            className={styles.featureGrid}
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    variants={staggerItem}
                                >
                                    <Card hoverable padding="lg" className={styles.featureCard}>
                                        <div className={styles.featureIcon}>
                                            <feature.icon size={24} />
                                        </div>
                                        <Card.Title>{feature.title}</Card.Title>
                                        <Card.Description>{feature.description}</Card.Description>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Mid-Page Experience Hero (NEW) */}
                <ExperienceHero />

                {/* Alternating Feature Showcase Sections (NEW) */}
                <div className={styles.showcaseWrapper}>
                    {showcaseFeatures.map((feature, index) => (
                        <FeatureShowcase
                            key={index}
                            title={feature.title}
                            description={feature.description}
                            features={feature.features}
                            imagePosition={feature.imagePosition}
                            color={feature.color}
                            imageAlt={feature.imageAlt}
                        />
                    ))}
                </div>

                {/* Testimonials (NEW) */}
                <TestimonialsSection />

                {/* FAQ (NEW) */}
                <FAQSection />

                {/* Blog/Learn Section (KEPT) */}
                <section className={styles.blog}>
                    <div className={styles.container}>
                        <motion.div
                            className={styles.sectionHeaderRow}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div>
                                <h2 className={styles.sectionTitle}>Learn & Improve</h2>
                                <p className={styles.sectionDescription}>
                                    Expert tips to boost your job search success.
                                </p>
                            </div>
                            <Link to="/blog">
                                <Button variant="secondary" icon={BookOpen}>
                                    View All Articles
                                </Button>
                            </Link>
                        </motion.div>

                        <motion.div
                            className={styles.blogGrid}
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {blogPreviews.map((post, index) => (
                                <motion.article
                                    key={index}
                                    className={styles.blogCard}
                                    variants={staggerItem}
                                >
                                    <Link to="/blog" className={styles.blogImageWrapper}>
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className={styles.blogImage}
                                        />
                                    </Link>
                                    <div className={styles.blogContent}>
                                        <div className={styles.blogMeta}>
                                            <span className={styles.blogCategory}>{post.category}</span>
                                            <span className={styles.blogReadTime}>{post.readTime}</span>
                                        </div>
                                        <h3 className={styles.blogTitle}>{post.title}</h3>
                                        <p className={styles.blogExcerpt}>{post.excerpt}</p>
                                        <Link to="/blog" className={styles.blogLink}>
                                            Read more <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </motion.article>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className={styles.cta}>
                    <div className={styles.ctaContent}>
                        <h2 className={styles.ctaTitle}>Ready to improve your application?</h2>
                        <p className={styles.ctaDescription}>
                            Sign up today and start optimizing your resume for the jobs you want.
                        </p>
                        <Link to={user ? "/analyze" : "/register"}>
                            <Button size="lg" icon={ArrowRight} iconPosition="right">
                                {user ? "Go to Dashboard" : "Get Started for Free"}
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

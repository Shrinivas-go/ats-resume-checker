import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Check, AlertCircle, BookOpen, FileText,
    Target, Zap, HelpCircle, Mail, User, MessageSquare,
    Loader2, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import styles from './Help.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Help & Support Page
 * 
 * Features:
 * - Contact support form with email submission
 * - Help articles/guides
 * - FAQ section
 */

// Help articles data
const HELP_ARTICLES = [
    {
        id: 'ats-scoring',
        icon: Target,
        title: 'Understanding ATS Scores',
        description: 'Learn how ATS scoring works and what factors affect your resume\'s compatibility.',
        content: `
            <h3>What is an ATS Score?</h3>
            <p>An ATS (Applicant Tracking System) score measures how well your resume matches a job description. Most companies use ATS software to filter resumes before a human ever sees them.</p>
            
            <h3>How We Calculate Your Score</h3>
            <ul>
                <li><strong>Core Skills Match (70%)</strong> - How many required skills from the job description appear in your resume</li>
                <li><strong>Optional Skills Match (30%)</strong> - Additional skills that boost your candidacy</li>
                <li><strong>Keyword Density</strong> - Proper use of relevant keywords</li>
            </ul>
            
            <h3>What's a Good Score?</h3>
            <ul>
                <li><strong>80-100%</strong> - Excellent match, high chance of passing ATS</li>
                <li><strong>60-79%</strong> - Good match, consider adding missing skills</li>
                <li><strong>40-59%</strong> - Fair match, significant improvements needed</li>
                <li><strong>Below 40%</strong> - Poor match, major revision recommended</li>
            </ul>
        `,
        image: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: 'resume-tips',
        icon: FileText,
        title: 'Resume Writing Best Practices',
        description: 'Expert tips to create a resume that gets past ATS and impresses recruiters.',
        content: `
            <h3>Format for Success</h3>
            <ul>
                <li>Use a clean, simple format - avoid tables, graphics, and headers/footers</li>
                <li>Stick to standard fonts like Arial, Calibri, or Times New Roman</li>
                <li>Use .docx or .pdf format (check job posting requirements)</li>
            </ul>
            
            <h3>Content Strategy</h3>
            <ul>
                <li><strong>Tailor for each job</strong> - Customize your resume for every application</li>
                <li><strong>Use exact keywords</strong> - Mirror the language from the job description</li>
                <li><strong>Quantify achievements</strong> - Use numbers and percentages where possible</li>
                <li><strong>Include a skills section</strong> - List technical and soft skills clearly</li>
            </ul>
            
            <h3>Common Mistakes to Avoid</h3>
            <ul>
                <li>Using images or graphics (ATS can't read them)</li>
                <li>Stuffing keywords unnaturally</li>
                <li>Using creative job titles instead of standard ones</li>
                <li>Submitting without proofreading</li>
            </ul>
        `,
        image: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: 'using-scanner',
        icon: Zap,
        title: 'How to Use the ATS Scanner',
        description: 'Step-by-step guide to analyzing your resume with our ATS scanning tool.',
        content: `
            <h3>Getting Started</h3>
            <ol>
                <li>Navigate to the <strong>Analyze</strong> page</li>
                <li>Upload your resume (PDF format recommended)</li>
                <li>Paste the job description you're targeting</li>
                <li>Click <strong>Analyze Resume</strong></li>
            </ol>
            
            <h3>Understanding Your Results</h3>
            <ul>
                <li><strong>Overall Score</strong> - Your resume's compatibility percentage</li>
                <li><strong>Matched Skills</strong> - Skills found in both your resume and the JD</li>
                <li><strong>Missing Skills</strong> - Important skills you should consider adding</li>
                <li><strong>Recommendations</strong> - Specific suggestions for improvement</li>
            </ul>
            
            <h3>Pro Tips</h3>
            <ul>
                <li>Run multiple scans with different versions of your resume</li>
                <li>Focus on adding missing core skills first</li>
                <li>Use the exact terminology from the job description</li>
            </ul>
        `,
        image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
];

// FAQ data
const FAQ_ITEMS = [
    {
        question: 'Is my resume data secure?',
        answer: 'Yes, we take security seriously. Your resume is only used for analysis and is not stored permanently. We use encrypted connections and never share your data with third parties.',
    },
    {
        question: 'How many free scans do I get?',
        answer: 'New users receive 3 free resume scans. After that, you can purchase credit packages to continue using the service.',
    },
    {
        question: 'Can I use this for any job type?',
        answer: 'Absolutely! Our ATS scanner works for all industries and job types. The analysis is based on matching your resume content with the specific job description you provide.',
    },
    {
        question: 'Why is my score low even with matching skills?',
        answer: 'The score considers multiple factors including skill density, context, and how prominently skills appear. Try placing important skills in your summary and skills section for better results.',
    },
];

export default function Help() {
    const [activeArticle, setActiveArticle] = useState(null);
    const [expandedFaq, setExpandedFaq] = useState(null);

    // Contact form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [formStatus, setFormStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormStatus({ type: '', message: '' });

        try {
            const response = await axios.post(`${API_URL}/support/contact`, formData);

            if (response.data.success) {
                setFormStatus({
                    type: 'success',
                    message: response.data.message || 'Message sent successfully!',
                });
                setFormData({ name: '', email: '', subject: '', message: '' });
            }
        } catch (error) {
            setFormStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to send message. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
    };

    return (
        <>
            <Navbar />
            <main className={styles.help}>
                <div className={styles.container}>
                    {/* Hero */}
                    <motion.section className={styles.hero} {...fadeIn}>
                        <HelpCircle size={48} className={styles.heroIcon} />
                        <h1>Help & Support</h1>
                        <p>Find answers, learn best practices, or get in touch with our team.</p>
                    </motion.section>

                    {/* Help Articles */}
                    <motion.section
                        className={styles.section}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className={styles.sectionTitle}>
                            <BookOpen size={24} />
                            Help Articles
                        </h2>

                        <div className={styles.articlesGrid}>
                            {HELP_ARTICLES.map((article) => (
                                <motion.article
                                    key={article.id}
                                    className={styles.articleCard}
                                    whileHover={{ y: -4 }}
                                    onClick={() => setActiveArticle(article)}
                                >
                                    <div
                                        className={styles.articleImage}
                                        style={{ backgroundImage: `url(${article.image})` }}
                                    />
                                    <div className={styles.articleContent}>
                                        <article.icon size={24} className={styles.articleIcon} />
                                        <h3>{article.title}</h3>
                                        <p>{article.description}</p>
                                        <span className={styles.readMore}>
                                            Read more <ChevronRight size={16} />
                                        </span>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </motion.section>

                    {/* FAQ Section */}
                    <motion.section
                        className={styles.section}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className={styles.sectionTitle}>
                            <MessageSquare size={24} />
                            Frequently Asked Questions
                        </h2>

                        <div className={styles.faqList}>
                            {FAQ_ITEMS.map((faq, index) => (
                                <div
                                    key={index}
                                    className={`${styles.faqItem} ${expandedFaq === index ? styles.expanded : ''}`}
                                >
                                    <button
                                        className={styles.faqQuestion}
                                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                    >
                                        <span>{faq.question}</span>
                                        <ChevronRight size={20} />
                                    </button>
                                    <AnimatePresence>
                                        {expandedFaq === index && (
                                            <motion.div
                                                className={styles.faqAnswer}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <p>{faq.answer}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Contact Form */}
                    <motion.section
                        className={styles.section}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className={styles.sectionTitle}>
                            <Mail size={24} />
                            Contact Support
                        </h2>

                        <form className={styles.contactForm} onSubmit={handleSubmit}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">
                                        <User size={16} />
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email">
                                        <Mail size={16} />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="subject">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="message">
                                    <MessageSquare size={16} />
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows={5}
                                    placeholder="Describe your issue or question..."
                                    minLength={10}
                                    maxLength={5000}
                                />
                            </div>

                            {/* Status Message */}
                            <AnimatePresence>
                                {formStatus.message && (
                                    <motion.div
                                        className={`${styles.statusMessage} ${styles[formStatus.type]}`}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {formStatus.type === 'success' ? (
                                            <Check size={18} />
                                        ) : (
                                            <AlertCircle size={18} />
                                        )}
                                        {formStatus.message}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className={styles.spinner} />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.section>
                </div>

                {/* Article Modal */}
                <AnimatePresence>
                    {activeArticle && (
                        <motion.div
                            className={styles.modalOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveArticle(null)}
                        >
                            <motion.div
                                className={styles.modalContent}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className={styles.modalClose}
                                    onClick={() => setActiveArticle(null)}
                                >
                                    ×
                                </button>
                                <div
                                    className={styles.modalImage}
                                    style={{ backgroundImage: `url(${activeArticle.image})` }}
                                />
                                <div className={styles.modalBody}>
                                    <h2>{activeArticle.title}</h2>
                                    <div
                                        className={styles.articleHtml}
                                        dangerouslySetInnerHTML={{ __html: activeArticle.content }}
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </>
    );
}

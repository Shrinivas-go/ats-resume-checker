import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import styles from './FAQSection.module.css';

const FAQS = [
    {
        question: "How does the ATS scoring algorithm work?",
        answer: "Our algorithm simulates modern Applicant Tracking Systems by analyzing your resume for keyword relevance, formatting readability, and section completeness against thousands of job descriptions."
    },
    {
        question: "Is my data secure?",
        answer: "Yes, absolutely. We use industry-standard encryption to protect your data. We do not sell your personal information to third parties, and you can delete your data at any time."
    },
    {
        question: "Can I download my resume in different formats?",
        answer: "Yes! The resume builder supports exporting to PDF currently, with DOCX support coming soon. The export is clean, ATS-friendly, and watermark-free."
    },
    {
        question: "How is this different from other resume checkers?",
        answer: "Unlike basic checkers that just count keywords, we provide deep structural analysis, actionable improvement suggestions, and a built-in recruiter-friendly check to ensure humans love your resume too."
    },
    {
        question: "Is the basic version free forever?",
        answer: "Yes, you can use the basic resume analysis and builder features for free. We also offer premium features for advanced insights and power users."
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Frequently Asked Questions</h2>
                    <p className={styles.subtitle}>
                        Everything you need to know about getting your resume ATS-ready.
                    </p>
                </div>

                <div className={styles.faqList}>
                    {FAQS.map((faq, index) => (
                        <div key={index} className={styles.faqItem}>
                            <button
                                className={`${styles.questionButton} ${openIndex === index ? styles.active : ''}`}
                                onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
                            >
                                <span className={styles.questionText}>{faq.question}</span>
                                <ChevronDown
                                    className={`${styles.icon} ${openIndex === index ? styles.rotate : ''}`}
                                    size={20}
                                />
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div className={styles.answer}>
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Quote, ArrowRight, PenLine } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import styles from './TestimonialsSection.module.css';

const TESTIMONIALS = [
    {
        name: "Sarah Jenkins",
        role: "Software Engineer @ Google",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        content: "I applied to 50+ jobs with no response. After using ATS Checker, I fixed my keyword gaps and got 3 interviews in a week!",
        rating: 5
    },
    {
        name: "Michael Chen",
        role: "Product Manager @ Amazon",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
        content: "The recruiter-friendly check is a game changer. It helped me simplify my resume layout and focus on impact metrics.",
        rating: 5
    },
    {
        name: "Jessica Williams",
        role: "Marketing Director",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
        content: "Finally a tool that gives actual actionable feedback instead of just a random score. Highly recommended!",
        rating: 5
    }
];

export default function TestimonialsSection() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Trusted by Job Seekers</h2>
                    <p className={styles.subtitle}>
                        Join thousands of professionals who have landed their dream jobs.
                    </p>
                </div>

                <div className={styles.grid}>
                    {TESTIMONIALS.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.rating}>
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                                        ))}
                                    </div>
                                    <Quote size={24} className={styles.quoteIcon} />
                                </div>
                                <p className={styles.content}>"{testimonial.content}"</p>
                                <div className={styles.author}>
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className={styles.avatar}
                                    />
                                    <div className={styles.info}>
                                        <h4 className={styles.name}>{testimonial.name}</h4>
                                        <p className={styles.role}>{testimonial.role}</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Review Action Buttons */}
                <div className={styles.actions}>
                    <Link to="/blog">
                        <Button variant="secondary" icon={ArrowRight} iconPosition="right">
                            View More Reviews
                        </Button>
                    </Link>
                    <Button variant="outline" icon={PenLine}>
                        Write a Review
                    </Button>
                </div>
            </div>
        </section>
    );
}

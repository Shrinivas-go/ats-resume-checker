import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Check, Code, Database, Brain, Palette, Server, Smartphone } from 'lucide-react';
import Button from '../ui/Button';
import styles from './DescriptionGenerator.module.css';

// Pre-written role-based descriptions (no AI needed)
const ROLE_TEMPLATES = {
    'full-stack': {
        icon: Code,
        label: 'Full Stack Developer',
        descriptions: [
            'Designed and developed full-stack web applications using React, Node.js, and MongoDB, serving 10,000+ monthly active users.',
            'Built RESTful APIs and integrated third-party services, reducing data processing time by 40%.',
            'Implemented responsive UI components and optimized frontend performance, achieving 95+ Lighthouse scores.',
            'Collaborated with cross-functional teams to deliver features on time, participating in agile sprints and code reviews.',
            'Maintained CI/CD pipelines and deployed applications to AWS, ensuring 99.9% uptime.',
        ]
    },
    'frontend': {
        icon: Palette,
        label: 'Frontend Developer',
        descriptions: [
            'Developed responsive, accessible web interfaces using React and TypeScript, improving user engagement by 35%.',
            'Implemented complex UI animations and micro-interactions using Framer Motion and CSS animations.',
            'Optimized application bundle size and lazy loading, reducing initial load time by 50%.',
            'Created reusable component libraries with Storybook, accelerating development velocity across teams.',
            'Integrated state management solutions (Redux/Zustand) and handled complex application state.',
        ]
    },
    'backend': {
        icon: Server,
        label: 'Backend Developer',
        descriptions: [
            'Architected and implemented scalable backend services using Node.js and Express, handling 1M+ daily requests.',
            'Designed and optimized database schemas in PostgreSQL and MongoDB, improving query performance by 60%.',
            'Built secure authentication systems with JWT, OAuth 2.0, and role-based access control.',
            'Implemented caching strategies using Redis, reducing API response times by 70%.',
            'Developed comprehensive API documentation and integration tests with 90%+ code coverage.',
        ]
    },
    'python': {
        icon: Database,
        label: 'Python Developer',
        descriptions: [
            'Developed data processing pipelines using Python, Pandas, and NumPy, processing 100GB+ datasets daily.',
            'Built and deployed Django/Flask web applications with PostgreSQL backend.',
            'Created automation scripts and CLI tools, reducing manual tasks by 80%.',
            'Implemented data visualization dashboards using Matplotlib and Plotly.',
            'Optimized Python code performance and memory usage through profiling and refactoring.',
        ]
    },
    'ai-ml': {
        icon: Brain,
        label: 'AI / ML Engineer',
        descriptions: [
            'Developed and deployed machine learning models using TensorFlow and PyTorch, achieving 95% accuracy.',
            'Built NLP pipelines for text classification and sentiment analysis using transformers and BERT.',
            'Implemented computer vision solutions for image recognition and object detection.',
            'Created MLOps pipelines for model training, versioning, and deployment using MLflow and Docker.',
            'Conducted A/B testing and model performance analysis to optimize business KPIs.',
        ]
    },
    'mobile': {
        icon: Smartphone,
        label: 'Mobile Developer',
        descriptions: [
            'Developed cross-platform mobile applications using React Native, reaching 100K+ downloads.',
            'Implemented native modules and optimized app performance for iOS and Android.',
            'Integrated push notifications, analytics, and crash reporting systems.',
            'Built offline-first features with local storage and data synchronization.',
            'Published and maintained apps on App Store and Google Play with 4.5+ ratings.',
        ]
    },
    'devops': {
        icon: Server,
        label: 'DevOps Engineer',
        descriptions: [
            'Implemented CI/CD pipelines using Jenkins/GitHub Actions, reducing deployment time by 60%.',
            'Managed cloud infrastructure on AWS using Terraform and CloudFormation.',
            'Orchestrated containerized applications with Kubernetes and Docker Swarm.',
            'Configured monitoring and alerting systems using Prometheus and Grafana.',
            'Automated server provisioning and configuration management with Ansible.',
        ]
    },
    'data-science': {
        icon: Database,
        label: 'Data Scientist',
        descriptions: [
            'Analyzed large datasets to uncover trends and insights, driving 20% growth in user retention.',
            'Built predictive models using Scikit-learn and XGBoost for customer churn prediction.',
            'Cleaned and preprocessed complex datasets using SQL and Python.',
            'Visualized findings using Tableau and PowerBI for executive stakeholders.',
            'Designed and executed A/B tests to validate product hypotheses.',
        ]
    },
    'product': {
        icon: Sparkles,
        label: 'Product Manager',
        descriptions: [
            'Led cross-functional teams to launch key product features affecting 1M+ users.',
            'Defined product roadmap and strategy based on user research and market analysis.',
            'Prioritized backlog items and managed sprint planning in Agile/Scrum environment.',
            'Conducted user interviews and usability testing to iterate on product design.',
            'Analyzed product metrics (Mixpanel/Amplitude) to track success and identify improvement areas.',
        ]
    },
    'designer': {
        icon: Palette,
        label: 'UI/UX Designer',
        descriptions: [
            'Designed intuitive user interfaces for web and mobile applications using Figma.',
            'Created low-fidelity wireframes and high-fidelity interactive prototypes.',
            'Conducted user research and created personas to inform design decisions.',
            'Developed comprehensive design systems to ensure consistency across products.',
            'Collaborated with developers to ensure accurate implementation of designs.',
        ]
    },
};

export default function DescriptionGenerator({ onApply, onClose }) {
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedDescription, setSelectedDescription] = useState(null);

    const handleApply = () => {
        if (selectedDescription !== null && selectedRole) {
            onApply(ROLE_TEMPLATES[selectedRole].descriptions[selectedDescription]);
        }
    };

    return (
        <motion.div
            className={styles.panel}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
        >
            <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>
                    <Sparkles size={18} />
                    <span>Description Generator</span>
                </div>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            <div className={styles.panelContent}>
                <div className={styles.section}>
                    <label className={styles.label}>Select Your Role</label>
                    <div className={styles.roleGrid}>
                        {Object.entries(ROLE_TEMPLATES).map(([key, role]) => (
                            <button
                                key={key}
                                className={`${styles.roleBtn} ${selectedRole === key ? styles.active : ''}`}
                                onClick={() => {
                                    setSelectedRole(key);
                                    setSelectedDescription(null);
                                }}
                            >
                                <role.icon size={18} />
                                <span>{role.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {selectedRole && (
                    <motion.div
                        className={styles.section}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <label className={styles.label}>Choose a Description</label>
                        <div className={styles.descriptionList}>
                            {ROLE_TEMPLATES[selectedRole].descriptions.map((desc, index) => (
                                <button
                                    key={index}
                                    className={`${styles.descriptionItem} ${selectedDescription === index ? styles.selected : ''}`}
                                    onClick={() => setSelectedDescription(index)}
                                >
                                    <div className={styles.descriptionCheck}>
                                        {selectedDescription === index ? (
                                            <Check size={14} />
                                        ) : (
                                            <span className={styles.checkPlaceholder} />
                                        )}
                                    </div>
                                    <p className={styles.descriptionText}>{desc}</p>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            <div className={styles.panelFooter}>
                <Button
                    variant="secondary"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    disabled={selectedDescription === null}
                    onClick={handleApply}
                >
                    Apply Description
                </Button>
            </div>
        </motion.div>
    );
}

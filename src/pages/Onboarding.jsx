import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import styles from './Onboarding.module.css';

const steps = [
    {
        id: 1,
        title: "Upload Your Resume",
        description: "Start by uploading your current resume in PDF or DOCX format. We'll parse it instantly.",
        icon: Upload
    },
    {
        id: 2,
        title: "Get Instant Feedback",
        description: "Our AI analyzes your resume against 50+ ATS checks and gives you a score out of 100.",
        icon: FileText
    },
    {
        id: 3,
        title: "Optimize & Apply",
        description: "Follow our step-by-step suggestions to fix issues and triple your interview chances.",
        icon: CheckCircle
    }
];

export default function Onboarding() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Mark onboarding as seen
        localStorage.setItem('hasSeenOnboarding', 'true');
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(curr => curr + 1);
        } else {
            navigate('/analyze');
        }
    };

    const handleSkip = () => {
        navigate('/analyze');
    };

    const CurrentIcon = steps[currentStep].icon;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.card}>
                    {/* Progress Dots */}
                    <div className={styles.progress}>
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`${styles.stepDot} ${index === currentStep ? styles.active : ''} ${index < currentStep ? styles.completed : ''}`}
                            />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className={styles.content}
                        >
                            <div className={styles.iconBox}>
                                <CurrentIcon size={40} />
                            </div>

                            <h2 className={styles.title}>{steps[currentStep].title}</h2>
                            <p className={styles.description}>{steps[currentStep].description}</p>
                        </motion.div>
                    </AnimatePresence>

                    <div className={styles.actions}>
                        <Button
                            onClick={handleNext}
                            size="lg"
                            fullWidth
                            icon={currentStep === steps.length - 1 ? null : ArrowRight}
                            iconPosition="right"
                        >
                            {currentStep === steps.length - 1 ? "Start Analyzing" : "Next"}
                        </Button>

                        <button onClick={handleSkip} className={styles.skipButton}>
                            Skip to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

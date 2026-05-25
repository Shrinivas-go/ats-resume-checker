import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, FileText, Star, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import styles from './Auth.module.css';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        if (!validate()) return;

        setIsLoading(true);

        try {
            const result = await register(formData.name, formData.email, formData.password);

            if (result.success) {
                navigate('/onboarding');
            } else {
                setServerError(result.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setServerError('Unable to connect to server. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            {/* Animated Background */}
            <div className={styles.background}>
                <div className={`${styles.blob} ${styles.blob1}`} />
                <div className={`${styles.blob} ${styles.blob2}`} />
                <div className={`${styles.blob} ${styles.blob3}`} />
            </div>
            <div className={styles.noise} />

            <div className={styles.container}>
                {/* Left Side: Form */}
                <div className={styles.formSection}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={styles.authCard}
                    >
                        {/* Logo */}
                        <Link to="/" className={styles.logo}>
                            <FileText size={28} className={styles.logoIcon} />
                            <span className={styles.logoText}>ATS Checker</span>
                        </Link>

                        <div className={styles.header}>
                            <h1 className={styles.title}>Create your account</h1>
                            <p className={styles.subtitle}>Start optimizing your resume today</p>
                        </div>

                        {serverError && (
                            <Alert variant="error" className={styles.alert}>
                                {serverError}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <Input
                                label="Full Name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                icon={User}
                                error={errors.name}
                                required
                            />

                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                icon={Mail}
                                error={errors.email}
                                required
                            />

                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="At least 6 characters"
                                icon={Lock}
                                error={errors.password}
                                required
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                icon={Lock}
                                error={errors.confirmPassword}
                                required
                            />

                            <Button
                                type="submit"
                                fullWidth
                                loading={isLoading}
                                size="lg"
                            >
                                Create Account
                            </Button>
                        </form>

                        <div className={styles.divider}>
                            <span>or sign up with</span>
                        </div>

                        <GoogleLoginButton
                            text="signup_with"
                            onError={(msg) => setServerError(msg)}
                        />

                        <p className={styles.footer}>
                            Already have an account?{' '}
                            <Link to="/login" className={styles.link}>
                                Sign in
                            </Link>
                        </p>
                    </motion.div>
                </div>

                {/* Right Side: Feature Showcase */}
                <div className={styles.featureSection}>
                    <div className={styles.featureContent}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h2 className={styles.featureTitle}>
                                Join 50,000+<br />
                                Professionals.
                            </h2>

                            <div className={styles.valueList}>
                                <div className={styles.valueItem}>
                                    <div className={styles.valueIconBox}>
                                        <Zap size={24} />
                                    </div>
                                    <div className={styles.valueContent}>
                                        <h3 className={styles.valueTitle}>3x Interview Rate</h3>
                                        <p className={styles.valueText}>Users of our platform report a significant increase in callback rates.</p>
                                    </div>
                                </div>

                                <div className={styles.valueItem}>
                                    <div className={styles.valueIconBox}>
                                        <FileText size={24} />
                                    </div>
                                    <div className={styles.valueContent}>
                                        <h3 className={styles.valueTitle}>Premium Templates</h3>
                                        <p className={styles.valueText}>Access ATS-friendly resume templates used by top career coaches.</p>
                                    </div>
                                </div>

                                <div className={styles.valueItem}>
                                    <div className={styles.valueIconBox}>
                                        <Star size={24} />
                                    </div>
                                    <div className={styles.valueContent}>
                                        <h3 className={styles.valueTitle}>Trusted Analysis</h3>
                                        <p className={styles.valueText}>Our algorithms are calibrated against industry-standard ATS systems.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

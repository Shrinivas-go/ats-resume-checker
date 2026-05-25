import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, FileText, Star, Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import styles from './Auth.module.css';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                navigate('/analyze');
            } else {
                setError(result.message || 'Invalid email or password');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
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
                            <h1 className={styles.title}>Welcome back</h1>
                            <p className={styles.subtitle}>Sign in to access your dashboard</p>
                        </div>

                        {error && (
                            <Alert variant="error" className={styles.alert}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                icon={Mail}
                                required
                                className={styles.inputGroup}
                            />

                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                icon={Lock}
                                required
                                className={styles.inputGroup}
                            />

                            <div className={styles.actions}>
                                <label className={styles.remember}>
                                    <input type="checkbox" />
                                    <span>Remember me</span>
                                </label>
                                <Link to="/forgot-password" className={styles.forgotLink}>
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                loading={isLoading}
                                size="lg"
                            >
                                Sign In
                            </Button>
                        </form>

                        <div className={styles.divider}>
                            <span>or continue with</span>
                        </div>

                        <GoogleLoginButton
                            text="signin_with"
                            onError={(msg) => setError(msg)}
                        />

                        <p className={styles.footer}>
                            Don't have an account?{' '}
                            <Link to="/register" className={styles.link}>
                                Create one
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
                                Beat the ATS.<br />
                                Land the Job.
                            </h2>

                            <div className={styles.valueList}>
                                <div className={styles.valueItem}>
                                    <div className={styles.valueIconBox}>
                                        <Zap size={24} />
                                    </div>
                                    <div className={styles.valueContent}>
                                        <h3 className={styles.valueTitle}>Instant ATS Scoring</h3>
                                        <p className={styles.valueText}>Get instant feedback on how well your resume matches the job description.</p>
                                    </div>
                                </div>

                                <div className={styles.valueItem}>
                                    <div className={styles.valueIconBox}>
                                        <Shield size={24} />
                                    </div>
                                    <div className={styles.valueContent}>
                                        <h3 className={styles.valueTitle}>Formatting Validation</h3>
                                        <p className={styles.valueText}>Ensure your resume is readable by all major Applicant Tracking Systems.</p>
                                    </div>
                                </div>

                                <div className={styles.valueItem}>
                                    <div className={styles.valueIconBox}>
                                        <Star size={24} />
                                    </div>
                                    <div className={styles.valueContent}>
                                        <h3 className={styles.valueTitle}>Keyword Optimization</h3>
                                        <p className={styles.valueText}>Identify missing skills and keywords to boost your ranking.</p>
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

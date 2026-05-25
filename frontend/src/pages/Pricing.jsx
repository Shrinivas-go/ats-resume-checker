import { useState, useEffect } from 'react';
import { Check, Zap, Star, Crown, CreditCard, Globe } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import styles from './Pricing.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Default packages (used as fallback)
const DEFAULT_PACKAGES = [
    { id: 'starter', credits: 10, price: 99, currency: 'INR', label: 'Starter', icon: Zap },
    { id: 'popular', credits: 50, price: 399, currency: 'INR', label: 'Popular', recommended: true, icon: Star },
    { id: 'pro', credits: 100, price: 699, currency: 'INR', label: 'Pro', icon: Crown },
];

// Load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

/**
 * Pricing Page - Credit Packages with Razorpay & Stripe
 */
export default function Pricing() {
    const { user } = useAuth();
    const [packages, setPackages] = useState(DEFAULT_PACKAGES);
    const [loading, setLoading] = useState(null); // Track which package is loading
    const [userCredits, setUserCredits] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        // Check for payment status in URL
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment') === 'success') {
            setPaymentStatus({ type: 'success', message: 'Payment successful! Credits added to your account.' });
            window.history.replaceState({}, '', '/pricing');
        } else if (params.get('payment') === 'cancelled') {
            setPaymentStatus({ type: 'error', message: 'Payment was cancelled.' });
            window.history.replaceState({}, '', '/pricing');
        }

        // Fetch packages from API
        fetch(`${API_URL}/credits/packages`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.packages) {
                    // Add icons based on package id
                    const packagesWithIcons = data.packages.map(pkg => ({
                        ...pkg,
                        icon: pkg.id === 'starter' ? Zap : pkg.id === 'popular' ? Star : Crown,
                    }));
                    setPackages(packagesWithIcons);
                }
            })
            .catch(err => console.error('Error fetching packages:', err));

        // Fetch user credits if logged in
        if (user) {
            fetchUserCredits();
        }
    }, [user]);

    const fetchUserCredits = async () => {
        try {
            const res = await fetch(`${API_URL}/credits/balance`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setUserCredits(data.credits);
            }
        } catch (err) {
            console.error('Error fetching balance:', err);
        }
    };

    const handleRazorpayPayment = async (packageId, selectedPackage, orderData) => {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            alert('Failed to load payment gateway. Please try again.');
            setLoading(null);
            return;
        }

        const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'ATS Resume Checker',
            description: `${selectedPackage.credits} Credits`,
            order_id: orderData.orderId,
            handler: async (response) => {
                // Verify payment on server
                try {
                    const verifyRes = await fetch(`${API_URL}/credits/verify-razorpay`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            packageId,
                        }),
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        setPaymentStatus({ type: 'success', message: `Payment successful! ${selectedPackage.credits} credits added.` });
                        fetchUserCredits();
                    } else {
                        setPaymentStatus({ type: 'error', message: verifyData.message || 'Payment verification failed.' });
                    }
                } catch (err) {
                    console.error('Verification error:', err);
                    setPaymentStatus({ type: 'error', message: 'Payment verification failed. Please contact support.' });
                }
                setLoading(null);
            },
            modal: {
                ondismiss: () => setLoading(null),
            },
            prefill: {
                email: user?.email || '',
            },
            theme: {
                color: '#8B5CF6',
            },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    const handlePurchase = async (packageId, gateway = 'razorpay') => {
        if (!user) {
            // Redirect to login
            window.location.href = '/login?redirect=/pricing';
            return;
        }

        setLoading(packageId);
        setPaymentStatus(null);

        try {
            const response = await fetch(`${API_URL}/credits/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ packageId, gateway }),
            });
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Purchase failed');
            }

            if (data.gateway === 'stripe' && data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
                return;
            }

            if (data.gateway === 'razorpay') {
                // Open Razorpay modal
                const selectedPackage = packages.find(p => p.id === packageId);
                await handleRazorpayPayment(packageId, selectedPackage, data);
                return;
            }

        } catch (error) {
            console.error('Purchase error:', error);
            setPaymentStatus({ type: 'error', message: error.message || 'Error initiating purchase. Please try again.' });
            setLoading(null);
        }
    };

    return (
        <>
            <Navbar />
            <main className={styles.page}>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <h1 className={styles.title}>Simple, Transparent Pricing</h1>
                        <p className={styles.subtitle}>
                            Pay only for what you use. No subscriptions, no hidden fees.
                        </p>
                        {userCredits !== null && (
                            <div className={styles.balance}>
                                <span>Your Balance:</span>
                                <strong>{userCredits} credits</strong>
                            </div>
                        )}
                    </div>

                    {/* Payment Status */}
                    {paymentStatus && (
                        <div className={`${styles.alert} ${styles[paymentStatus.type]}`}>
                            {paymentStatus.message}
                        </div>
                    )}

                    {/* Packages Grid */}
                    <div className={styles.grid}>
                        {packages.map((pkg) => {
                            const Icon = pkg.icon || Zap;
                            const isLoading = loading === pkg.id;
                            return (
                                <Card
                                    key={pkg.id}
                                    className={`${styles.card} ${pkg.recommended ? styles.recommended : ''}`}
                                >
                                    {pkg.recommended && (
                                        <div className={styles.badge}>Most Popular</div>
                                    )}
                                    <div className={styles.cardHeader}>
                                        <div className={styles.iconBox}>
                                            <Icon size={24} />
                                        </div>
                                        <h3 className={styles.label}>{pkg.label}</h3>
                                    </div>
                                    <div className={styles.price}>
                                        <span className={styles.currency}>₹</span>
                                        <span className={styles.amount}>{pkg.price}</span>
                                    </div>
                                    <div className={styles.credits}>
                                        <strong>{pkg.credits}</strong> credits
                                    </div>
                                    <p className={styles.perScan}>
                                        ₹{(pkg.price / pkg.credits).toFixed(1)} per scan
                                    </p>
                                    <ul className={styles.features}>
                                        <li><Check size={16} /> ATS Resume Analysis</li>
                                        <li><Check size={16} /> Detailed Feedback</li>
                                        <li><Check size={16} /> Skill Gap Analysis</li>
                                        <li><Check size={16} /> Never Expires</li>
                                    </ul>
                                    <div className={styles.buttons}>
                                        <Button
                                            variant={pkg.recommended ? 'primary' : 'secondary'}
                                            className={styles.button}
                                            onClick={() => handlePurchase(pkg.id, 'razorpay')}
                                            disabled={loading !== null}
                                        >
                                            <CreditCard size={16} />
                                            {isLoading ? 'Processing...' : 'Pay with Razorpay'}
                                        </Button>
                                        <button
                                            className={styles.stripeButton}
                                            onClick={() => handlePurchase(pkg.id, 'stripe')}
                                            disabled={loading !== null}
                                        >
                                            <Globe size={14} />
                                            International (Stripe)
                                        </button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Features */}
                    <div className={styles.features_section}>
                        <h2>What's Included</h2>
                        <div className={styles.featuresGrid}>
                            <div className={styles.feature}>
                                <h4>🔍 ATS Analysis</h4>
                                <p>Compare your resume against job descriptions with AI-powered scoring.</p>
                            </div>
                            <div className={styles.feature}>
                                <h4>📊 Detailed Reports</h4>
                                <p>Get actionable feedback on skills, keywords, and formatting.</p>
                            </div>
                            <div className={styles.feature}>
                                <h4>🚀 Improvement Tips</h4>
                                <p>Specific suggestions to increase your ATS score.</p>
                            </div>
                            <div className={styles.feature}>
                                <h4>♾️ No Expiry</h4>
                                <p>Your credits never expire. Use them whenever you need.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
